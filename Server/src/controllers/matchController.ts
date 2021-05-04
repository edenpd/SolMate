import { Request, Response } from "express";
import { CallbackError } from "mongoose";
import Match, { IMatch, IMatchModel } from "../modules/matchModel";
import { IChat } from "../modules/chatModel";
import { addChatAfterMatch } from "../controllers/chatController";
import { decrypt, spotifyApi } from "../Util/spotifyAccess";
import User, { IUser, IUserModel } from "../modules/userModel";
import { getUsersDistance } from "../Util/general";
import { checkAccessToken } from "../controllers/spotifyController";
export const addMatch = async (req: Request, res: Response) => {
  try {
    const userBody: IMatch = req.body;
    const toAdd: IMatch = {
      firstUser: userBody.firstUser,
      secondUser: userBody.secondUser,
      Approve1: userBody.Approve1,
      Approve2: userBody.Approve2,
      grade: userBody.grade,
    };
    const matchAdded = await Match.create(toAdd);
    res.status(200).json({ message: "Match added", ...matchAdded });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

export const updateMatch = async (req: Request, res: Response) => {
  const matchId = req.body.matchId;
  const userId = req.body.userId;
  const approve = req.body.approve;

  let modCount = 0;
  let updatedValue: IMatchModel | null = null;

  await Match.findOneAndUpdate(
    { _id: matchId, firstUser: userId },
    { $set: { Approve1: approve } },
    { new: true }
  ).then((val) => {
    if (val) {
      modCount++;
      updatedValue = val;
    }
  });

  await Match.findOneAndUpdate(
    { _id: matchId, secondUser: userId },
    { $set: { Approve2: approve } },
    { new: true }
  ).then((val) => {
    // Check if the update was successful and return an erorr if it wasn't
    if (val) {
      modCount++;
      updatedValue = val;
    }
  });

  if (modCount < 1) {
    res.status(500).send("ERROR: Unable to update match.");

    return;
  }

  // if both users approved, create a chat.
  if (
    updatedValue!.Approve1 === "accepted" &&
    updatedValue!.Approve2 === "accepted"
  ) {
    // Prepare the chat parameters.
    const chat: IChat = {
      ChatId: 1,
      Messages: [],
      UserId1: updatedValue!.firstUser + "",
      UserId2: updatedValue!.secondUser + "",
    };

    await addChatAfterMatch(req, res, chat, updatedValue! as IMatch);
  } else {
    res.status(200).json({ message: "Match updated", match: updatedValue });
  }
};

export const getMatchesById = async (req: Request, res: Response) => {
  let userID = req.query.userId?.toString();

  // Find matches in
  if (userID !== undefined) {
    Match.find({
      $or: [
        {
          $and: [
            {
              firstUser: userID,
            },
            {
              Approve1: "waiting",
            },
          ],
        },
        {
          $and: [
            {
              secondUser: userID,
            },
            {
              Approve2: "waiting",
            },
          ],
        },
      ],
    })
      .populate({
        path: "firstUser",
        model: "users",
      })
      .populate({
        path: "secondUser",
        model: "users",
      })
      .exec(async (err: CallbackError, matches: any) => {
        if (err) {
          res.status(500).send(err);
        } else {
          const matchesData = [];

          for (let i = 0; i < matches.length; i++) {
            const otherUser =
              matches[i].firstUser._id === userID
                ? matches[i]._doc.secondUser
                : matches[i]._doc.firstUser;

            // Get the matches from spotify.
            spotifyApi.setAccessToken(
              decrypt(otherUser.spotifyAccessToken, otherUser.iv)
            );

            // Try accessing the spotify API only if there is an access token.
            if (spotifyApi.getAccessToken()) {
              try {
                const token = await checkAccessToken(otherUser);

                if (token) {
                  spotifyApi.setAccessToken(token);
                }

                const artists = await spotifyApi.getMyTopArtists({ limit: 3 });

                // Check which user made the request, and get the top artists of the other use.
                if (matches[i]._doc.firstUser._id.toString() === userID) {
                  matchesData.push({
                    ...matches[i]._doc,
                    secondUser: {
                      ...matches[i].secondUser._doc,
                      Artists: artists.body.items,
                    },
                  });
                } else {
                  console.log(artists);
                  matchesData.push({
                    ...matches[i]._doc,
                    firstUser: {
                      ...matches[i]._doc.firstUser._doc,
                      Artists: artists.body.items,
                    },
                  });
                }
              } catch (e) {
                // TODO: Implement error handling.
                console.log("Oops");
                // Check which user made the request, and get the top artists of the other use.
                if (matches[i]._doc.firstUser._id.toString() === userID) {
                  matchesData.push({
                    ...matches[i]._doc,
                    secondUser: {
                      ...matches[i].secondUser._doc,
                      Artists: [],
                    },
                  });
                } else {
                  matchesData.push({
                    ...matches[i]._doc,
                    firstUser: {
                      ...matches[i]._doc.firstUser._doc,
                      Artists: [],
                    },
                  });
                }
              }
            } else {
              // If there is no token, return the mataches without the users' top artists.
              matchesData.push(matches[i]);
            }
          }

          console.log("Sending Matches");
          console.log(matchesData);
          res.status(200).json(matchesData);
        }
      });
  }
};
export const getUsersForMatches = async (user_email: String) => {
  let usersToRet: IUserModel[] = [];
  const cuurentUser = await User.findOne({ email: user_email.toString() });
  if (cuurentUser) {
    // let startDate = new Date();
    // let endDate = new Date();
    // startDate.setFullYear(startDate.getFullYear() - 20);
    // endDate.setFullYear(startDate.getFullYear() - 30);

    const users = await User.find({
      // email: { $ne: cuurentUser.email },
      sex: cuurentUser.interestedSex,
      interestedSex: cuurentUser.sex,
      meeting_purpose: cuurentUser.meeting_purpose,
    });
    return [...users, cuurentUser];
  }

  return usersToRet;
};

export const MatchAlgoForAll = async () => {
  const allUsers = await User.find();
  for (const user of allUsers) {
    await MatchAlgorithm(user.email);
  }
  // allUsers.forEach((user) => {
  //   MatchAlgorithm(user._id);
  // });
};

export const MatchAlgorithmAfterReg = async (req: Request, res: Response) => {
  let userEmail = req.query.email?.toString();
  if (userEmail) {
    MatchAlgorithm(userEmail);
  }
};

export const MatchAlgorithm = async (email: String) => {
  // TODO- location radius
  //  let userId = req.query.userId?.toString();
  console.log("Calculating matches for : " + email);

  // basic filter
  try {
    let users = await getUsersForMatches(email as string);
    let currentUser = users.find((user) => user.email === email);
    users = users.filter((user) => user.email !== email);

    let currentUserSavedSongs: string[] = [];
    let currentUserTopSongs: string[] = [];
    let currentUserFollowArtists: string[] = [];
    let currentUserRelatedArtists: string[] = [];
    let currentUserAlbums: string[] = [];

    if (users && currentUser) {
      // Get the matches from spotify.
      spotifyApi.setAccessToken(
        decrypt(currentUser.spotifyAccessToken, currentUser.iv)
      );
      if (spotifyApi.getAccessToken()) {
        const token = await checkAccessToken(currentUser);

        if (token) {
          spotifyApi.setAccessToken(token);
        }

        const cuur_artists = await spotifyApi.getFollowedArtists();
        const curr_SavedSongs = await spotifyApi.getMySavedTracks();
        const curr_TopSongs = await spotifyApi.getMyTopTracks();
        const curr_Albums = await spotifyApi.getMySavedAlbums();

        curr_SavedSongs.body.items.forEach((item) => {
          currentUserSavedSongs.push(item.track.name);
        });

        curr_TopSongs.body.items.forEach((item) => {
          currentUserTopSongs.push(item.name);
        });

        curr_Albums.body.items.forEach((item) => {
          currentUserAlbums.push(item.album.name);
        });

        cuur_artists.body.artists.items.forEach(async (item) => {
          currentUserFollowArtists.push(item.name);
          await (
            await spotifyApi.getArtistRelatedArtists(item.id)
          ).body.artists.forEach((item) => {
            currentUserRelatedArtists.push(item.name);
          });
        });

        users = users.filter((user) => {
          const ageDifMs = Date.now() - user.birthday.getTime();
          const ageDate = new Date(ageDifMs);
          const age = Math.abs(ageDate.getUTCFullYear() - 1970);

          const distance = getUsersDistance(
            // @ts-ignore
            currentUser?.location,
            user.location
          );
          return (
            // @ts-ignore
            currentUser?.interestedAgeMin <= age &&
            // @ts-ignore
            currentUser?.interestedAgeMax >= age &&
            // @ts-ignore
            currentUser?.radiusSearch <= distance
          );
        });

        const matchesToInsert = await Promise.all(
          users.map(async (user) => {
            try {
              let matchFound: IMatch;
              // var age = Date.now() - user.birthday.getTime();
              let userSavedSongs: string[] = [];
              let userTopSongs: string[] = [];
              let userFollowArtists: string[] = [];
              let userRelatedArtists: string[] = [];
              let userAlbums: string[] = [];
              // let userGenre: string[] = [];
              var songGrade = 0;
              var artistsGrade = 0;
              var albumGrade = 0;
              var genereGrade = 0;
              var finalGrade = 0;

              // Get the user data from spotify.
              spotifyApi.setAccessToken(
                decrypt(user.spotifyAccessToken, user.iv)
              );

              if (spotifyApi.getAccessToken()) {
                const token = await checkAccessToken(user);

                if (token) {
                  spotifyApi.setAccessToken(token);
                }

                const user_artists = await spotifyApi.getFollowedArtists();
                const user_SavedSongs = await spotifyApi.getMySavedTracks();
                const user_TopSongs = await spotifyApi.getMyTopTracks();
                const user_Albums = await spotifyApi.getMySavedAlbums();
                // const user_Genre = await spotifyApi.getAvailableGenreSeeds();

                user_SavedSongs.body.items.forEach((item) => {
                  userSavedSongs.push(item.track.name);
                });
                user_TopSongs.body.items.forEach((item) => {
                  userTopSongs.push(item.name);
                });
                user_Albums.body.items.forEach((item) => {
                  userAlbums.push(item.album.name);
                });

                user_artists.body.artists.items.forEach(async (item) => {
                  userFollowArtists.push(item.name);
                  await (
                    await spotifyApi.getArtistRelatedArtists(item.id)
                  ).body.artists.forEach((item) => {
                    userRelatedArtists.push(item.name);
                  });
                });

                // similar songs amount
                var similarSongs = 0;
                if (currentUserTopSongs) {
                  similarSongs = currentUserTopSongs.filter(
                    (item) =>
                      userTopSongs.findIndex((song) => {
                        return song === item;
                      }) !== -1
                  ).length;
                }

                // similar saved songs amount
                var similarSavedSongs = 0;
                if (currentUserSavedSongs) {
                  similarSavedSongs = currentUserSavedSongs.filter(
                    (item) =>
                      userSavedSongs.findIndex((song) => {
                        return song === item;
                      }) !== -1
                  ).length;
                }

                // calc songs match grade
                if (
                  currentUserTopSongs.length + userTopSongs.length !== 0 &&
                  currentUserSavedSongs.length + userSavedSongs.length !== 0
                ) {
                  songGrade =
                    similarSongs /
                    (currentUserTopSongs.length + userTopSongs.length) +
                    similarSavedSongs /
                    (currentUserSavedSongs.length + userSavedSongs.length);
                }

                // similar related artists amount
                var similarArtists = 0;
                if (currentUserRelatedArtists) {
                  similarArtists = currentUserRelatedArtists.filter(
                    (item) =>
                      userRelatedArtists.findIndex((artist) => {
                        return artist === item;
                      }) !== -1
                  ).length;
                }

                // similar artists follow amount
                var similarFollowArtists = 0;
                if (currentUserFollowArtists) {
                  similarFollowArtists = currentUserFollowArtists.filter(
                    (item) =>
                      userFollowArtists.findIndex((artist) => {
                        return artist === item;
                      }) !== -1
                  ).length;
                }

                // calc artists match grade
                if (
                  currentUserRelatedArtists.length +
                  userRelatedArtists.length !==
                  0 &&
                  currentUserFollowArtists.length + userFollowArtists.length !==
                  0
                ) {
                  artistsGrade =
                    similarArtists /
                    (currentUserRelatedArtists.length +
                      userRelatedArtists.length) +
                    similarFollowArtists /
                    (currentUserFollowArtists.length +
                      userFollowArtists.length);
                }

                // similar album amount
                var similarAlbums = 0;
                if (currentUserAlbums) {
                  similarAlbums = currentUserAlbums.filter(
                    (item) =>
                      userAlbums.findIndex((album) => {
                        return album === item;
                      }) !== -1
                  ).length;
                }

                // calc album match grade
                if (currentUserAlbums.length + userAlbums.length !== 0) {
                  albumGrade =
                    similarAlbums /
                    (currentUserAlbums.length + userAlbums.length);
                }

                finalGrade =
                  (2 * songGrade + 2 * artistsGrade + albumGrade) /
                  // + genereGrade
                  5;

                if (currentUser) {
                  matchFound = {
                    firstUser: currentUser?._id,
                    secondUser: user._id,
                    Approve1: "waiting",
                    Approve2: "waiting",
                    grade: finalGrade,
                  };

                  return matchFound;
                }
              }
            } catch (e) {
              return undefined;
            }
          })
        );

        matchesToInsert
          .filter((match) => match !== undefined)
          .forEach(async (match) => {
            if (match) {
              const matchExist = await Match.findOne({
                $or: [
                  {
                    firstUser: match.firstUser,
                    secondUser: match.secondUser,
                  },
                  {
                    firstUser: match.secondUser,
                    secondUser: match.firstUser,
                  },
                ],
              });

              if (matchExist?.firstUser && matchExist.secondUser) {
                if (
                  matchExist.firstUser === match.firstUser &&
                  matchExist.secondUser === match.secondUser
                ) {
                  Match.updateOne(
                    {
                      firstUser: match.firstUser,
                      secondUser: match.secondUser,
                    },
                    {
                      $set: {
                        grade: match.grade,
                      },
                    }
                  );
                } else {
                  Match.updateOne(
                    {
                      firstUser: match.secondUser,
                      secondUser: match.firstUser,
                    },
                    {
                      $set: {
                        grade: match.grade,
                      },
                    }
                  );
                }
              }
              // insert new row
              else {
                try {
                  const toAdd: IMatch = {
                    firstUser: match.firstUser,
                    secondUser: match.secondUser,
                    Approve1: match.Approve1,
                    Approve2: match.Approve2,
                    grade: match.grade,
                  };
                  const matchAdded = await Match.create(toAdd);

                  console.log({ message: "new match added", ...matchAdded });
                } catch (e) {
                  console.log(e);
                }
              }
            }
          });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

export const deleteMatchesOfUser = async (req: Request, res: Response) => {
  let userId = req.query.userId?.toString();
  const existsMatches = await Match.find(
    {
      $or: [{ firstUser: userId }, { secondUser: userId }],
    },
    (err: CallbackError, matches: IMatch[]) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        return matches;
      }
    }
  );

  //  Passes on exsiting matches
  for (let match of existsMatches) {
    try {
      const chatDeleted = await Match.findOneAndDelete({ _id: match._id });
      console.log("Match deleted: " + chatDeleted?._id);
    } catch (e) {
      console.log(e);
    }
  }
};
