import { Request, Response } from "express";
import { CallbackError } from "mongoose";
import Match, { IMatch, IMatchModel } from "../modules/matchModel";
import { IChat } from "../modules/chatModel";
import { addChatAfterMatch } from "../controllers/chatController";
import { decrypt, spotifyApi } from "../Util/spotifyAccess";
import User, { IArtist, IUser, IUserModel } from "../modules/userModel";
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
      .sort({ grade: -1 })
      .limit(50)
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
    // let curr_Songs: string[];
    let curr_Artists: IArtist[];
    let currentUserSavedSongs: string[] = [];
    let currentUserTopSongs: string[] = [];
    let currentUserFollowArtists: IArtist[] = [];
    let currentUserRelatedArtists: IArtist[] = [];
    let currentUserAlbums: string[] = [];

    if (users && currentUser) {
      if (currentUser.spotifyAccessToken) {
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
            currentUserFollowArtists.push({
              id: item.id,
              name: item.name,
              images: item.images,
            });
            await (
              await spotifyApi.getArtistRelatedArtists(item.id)
            ).body.artists.forEach((item) => {
              currentUserRelatedArtists.push({
                id: item.id,
                name: item.name,
                images: item.images,
              });
            });
          });
        }
      }

      // cuurent user is without spotify
      else {
        // curr_Songs = currentUser.Songs;
        curr_Artists = currentUser.Artists;
      }

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
            let userSavedSongs: string[] = [];
            let userTopSongs: string[] = [];
            let userFollowArtists: IArtist[] = [];
            let userRelatedArtists: IArtist[] = [];
            let userAlbums: string[] = [];
            // let userSongs: string[] = user.Songs;
            let userArtists: IArtist[] = user.Artists;
            var finalGrade = 0;

            if (user.spotifyAccessToken) {
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
                  userFollowArtists.push({
                    id: item.id,
                    name: item.name,
                    images: item.images,
                  });
                  await (
                    await spotifyApi.getArtistRelatedArtists(item.id)
                  ).body.artists.forEach((item) => {
                    userRelatedArtists.push({
                      id: item.id,
                      name: item.name,
                      images: item.images,
                    });
                  });
                });
                if (currentUser?.spotifyAccessToken) {
                  // both with Spotify
                  finalGrade = bothWithSpotify(
                    currentUserSavedSongs,
                    currentUserTopSongs,
                    currentUserFollowArtists,
                    currentUserRelatedArtists,
                    currentUserAlbums,
                    userSavedSongs,
                    userTopSongs,
                    userFollowArtists,
                    userRelatedArtists,
                    userAlbums
                  );
                } else {
                  // with Spotify VS without Spotify
                  finalGrade = withVsWithoutSpotify(
                    // userSavedSongs,
                    // userTopSongs,
                    userFollowArtists,
                    userRelatedArtists,
                    // userAlbums,
                    // curr_Songs,
                    curr_Artists
                  );
                }
              }
            } //  user is without spotify
            else {
              // userSongs = user.Songs;
              userArtists = user.Artists;
              if (currentUser) {
                if (currentUser.spotifyAccessToken) {
                  finalGrade = withVsWithoutSpotify(
                    // currentUserSavedSongs,
                    // currentUserTopSongs,
                    currentUserFollowArtists,
                    currentUserRelatedArtists,
                    // currentUserAlbums,
                    // userSongs,
                    userArtists
                  );
                } else {
                  // both without Spotify
                  finalGrade = bothWithoutSpotify(
                    // curr_Songs,
                    curr_Artists,
                    // userSongs,
                    userArtists
                  );
                }
              }
            }

            // similar songs amount

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
          } catch (e) {
            return undefined;
          }
        })
      );

      console.log("insert matchs");
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
  } catch (e) {
    console.log(e);
  }
};

const bothWithoutSpotify = (
  // user1Songs: string[],
  user1Artists: IArtist[],
  // user2Songs: string[],
  user2Artists: IArtist[]
) => {
  var finalGrade = 0;

  // var songGrade = 0;
  var artistsGrade = 0;

  // var similarSongs = 0;
  var similarArtists = 0;

  // if (user1Songs) {
  //   similarSongs = user1Songs.filter(
  //     (item) =>
  //       user2Songs.findIndex((song) => {
  //         return song === item;
  //       }) !== -1
  //   ).length;
  // }

  // // calc songs match grade
  // if (user1Songs.length + user2Songs.length !== 0) {
  //   songGrade = similarSongs / (user1Songs.length + user2Songs.length);
  // }

  // similar  artists amount
  if (user1Artists) {
    similarArtists = user1Artists.filter(
      (item) =>
        user2Artists.findIndex((artist) => {
          return artist.id === item.id;
        }) !== -1
    ).length;
  }

  // calc artists match grade
  if (user1Artists.length + user2Artists.length !== 0) {
    artistsGrade = similarArtists / (user1Artists.length + user2Artists.length);
  }

  // finalGrade = (songGrade + artistsGrade) / 2;
  finalGrade = artistsGrade;

  return finalGrade;
};

const withVsWithoutSpotify = (
  // user1SavedSongs: string[],
  // user1TopSongs: string[],
  user1FollowArtists: IArtist[],
  user1RelatedArtists: IArtist[],
  // user1Albums: string[],
  // user2Songs: string[],
  user2Artists: IArtist[]
) => {
  var finalGrade = 0;
  // var songGrade = 0;
  var artistsGrade = 0;

  // var similarSongs = 0;
  var similarArtists = 0;

  // let user1TotalSongs: string[] = [];
  let user1TotalArtists: IArtist[] = [];

  // user1TotalSongs.concat(user1TopSongs, user1SavedSongs);
  user1TotalArtists.concat(user1FollowArtists, user1RelatedArtists);
  // distinct
  // user1TotalSongs = [...new Set(user1TotalSongs)];
  user1TotalArtists = [...new Set(user1TotalArtists)];

  // if (user1TotalSongs) {
  //   similarSongs = user1TotalSongs.filter(
  //     (item) =>
  //       user2Songs.findIndex((song) => {
  //         return song === item;
  //       }) !== -1
  //   ).length;
  // }

  // // calc songs match grade
  // if (user1TotalSongs.length + user2Songs.length !== 0) {
  //   songGrade = similarSongs / (user1TotalSongs.length + user2Songs.length);
  // }

  // similar  artists amount
  if (user1TotalArtists) {
    similarArtists = user1TotalArtists.filter(
      (item) =>
        user2Artists.findIndex((artist) => {
          return artist.id === item.id;
        }) !== -1
    ).length;
  }

  // calc artists match grade
  if (user1TotalArtists.length + user2Artists.length !== 0) {
    artistsGrade =
      similarArtists / (user1TotalArtists.length + user2Artists.length);
  }

  finalGrade = artistsGrade;
  // finalGrade = (songGrade + artistsGrade) / 2;

  return finalGrade;
};

const bothWithSpotify = (
  user1SavedSongs: string[],
  user1TopSongs: string[],
  user1FollowArtists: IArtist[],
  user1RelatedArtists: IArtist[],
  user1Albums: string[],
  user2SavedSongs: string[],
  user2TopSongs: string[],
  user2FollowArtists: IArtist[],
  user2RelatedArtists: IArtist[],
  user2Albums: string[]
) => {
  var finalGrade = 0;
  var songGrade = 0;
  var artistsGrade = 0;
  var albumGrade = 0;

  var similarSongs = 0;
  if (user1TopSongs) {
    similarSongs = user1TopSongs.filter(
      (item) =>
        user2TopSongs.findIndex((song) => {
          return song === item;
        }) !== -1
    ).length;
  }

  // similar saved songs amount
  var similarSavedSongs = 0;
  if (user1SavedSongs) {
    similarSavedSongs = user1SavedSongs.filter(
      (item) =>
        user2SavedSongs.findIndex((song) => {
          return song === item;
        }) !== -1
    ).length;
  }

  // calc songs match grade
  if (
    user1TopSongs.length + user2TopSongs.length !== 0 &&
    user1SavedSongs.length + user2SavedSongs.length !== 0
  ) {
    songGrade =
      similarSongs / (user1TopSongs.length + user2TopSongs.length) +
      similarSavedSongs / (user1SavedSongs.length + user2SavedSongs.length);
  }

  // similar related artists amount
  var similarArtists = 0;
  if (user1RelatedArtists) {
    similarArtists = user1RelatedArtists.filter(
      (item) =>
        user2RelatedArtists.findIndex((artist) => {
          return artist === item;
        }) !== -1
    ).length;
  }

  // similar artists follow amount
  var similarFollowArtists = 0;
  if (user1FollowArtists) {
    similarFollowArtists = user1FollowArtists.filter(
      (item) =>
        user2FollowArtists.findIndex((artist) => {
          return artist === item;
        }) !== -1
    ).length;
  }

  // calc artists match grade
  if (
    user1RelatedArtists.length + user2RelatedArtists.length !== 0 &&
    user1FollowArtists.length + user2FollowArtists.length !== 0
  ) {
    artistsGrade =
      similarArtists /
        (user1RelatedArtists.length + user2RelatedArtists.length) +
      similarFollowArtists /
        (user1FollowArtists.length + user2FollowArtists.length);
  }

  // similar album amount
  var similarAlbums = 0;
  if (user1Albums) {
    similarAlbums = user1Albums.filter(
      (item) =>
        user2Albums.findIndex((album) => {
          return album === item;
        }) !== -1
    ).length;
  }

  // calc album match grade
  if (user1Albums.length + user2Albums.length !== 0) {
    albumGrade = similarAlbums / (user1Albums.length + user2Albums.length);
  }

  finalGrade = (2 * songGrade + 2 * artistsGrade + albumGrade) / 5;

  return finalGrade;
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
