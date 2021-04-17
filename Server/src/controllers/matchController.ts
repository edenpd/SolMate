import { Request, Response } from "express";
import { CallbackError } from "mongoose";
import Match, { IMatch, IMatchModel } from "../modules/matchModel";
import { IChat } from "../modules/chatModel";
import { getUsersForMatches } from "../controllers/userController";
import { addChatAfterMatch } from "../controllers/chatController";
import { decrypt, spotifyApi } from "../Util/spotifyAccess";

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
    { _id: matchId, secondUser: approve },
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
            } else {
              // If there is no token, return the mataches without the users' top artists.
              matchesData.push(matches[i]);
            }
          }

          res.status(200).json(matchesData);
        }
      });
  }
};

export const MatchAlgorithm = async (req: Request, res: Response) => {
  // TODO- location radius
  let userId = req.query.userId?.toString();
  console.log("Calculating matches for : " + userId);

  // basic filter
  try {
    let users = await getUsersForMatches(userId as string);
    let currentUser = users.find((user) => user._id === userId);
    users = users.filter((user) => user._id !== userId);

    let currentUserSavedSongs: string[] = [];
    let currentUserFollowArtists: string[] = [];
    let currentUserAlbums: string[] = [];
    let currentUserGenre: string[] = [];

    if (users && currentUser) {
      // Get the matches from spotify.
      spotifyApi.setAccessToken(
        decrypt(currentUser.spotifyAccessToken, currentUser.iv)
      );
      if (spotifyApi.getAccessToken()) {
        const cuur_artists = await spotifyApi.getFollowedArtists();
        const curr_SavedSongs = await spotifyApi.getMySavedTracks();
        const curr_Albums = await spotifyApi.getMySavedAlbums();
        const curr_Genre = await spotifyApi.getAvailableGenreSeeds();
        //  currentUserFollowArtists.push({...cuur_artists.body.artists});

        users = users.filter((user) => {
          const age = Date.now() - user.birthday.getTime();
          return (
            // @ts-ignore
            currentUser?.interestedAgeMin >= age &&
            // @ts-ignore
            currentUser?.interestedAgeMax <= age
          );
        });

        const matchesToInsert = users.map((user) => {
          let matchFound: IMatch;
          // var age = Date.now() - user.birthday.getTime();
          let userSavedSongs: string[] = [];
          let userFollowArtists: string[] = [];
          let userAlbums: string[] = [];
          let userGenre: string[] = [];
          var songGrade = 0;
          var artistsGrade = 0;
          var albumGrade = 0;
          var genereGrade = 0;
          var finalGrade = 0;

          // similar songs amount
          var similarSongs = 0;
          if (currentUser?.Songs) {
            similarSongs = currentUser?.Songs.filter(
              (item) =>
                user.Songs.findIndex((song) => {
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
            // @ts-ignore
            currentUser?.Songs.length + user.Songs.length !== 0 &&
            currentUserSavedSongs.length + userSavedSongs.length !== 0
          ) {
            songGrade =
              // @ts-ignore
              similarSongs / (currentUser?.Songs.length + user.Songs.length) +
              similarSavedSongs /
                (currentUserSavedSongs.length + userSavedSongs.length);
          }

          // similar artists amount
          var similarArtists = 0;
          if (currentUser?.Artists) {
            similarArtists = currentUser?.Artists.filter(
              (item) =>
                user.Artists.findIndex((artist) => {
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
            // @ts-ignore
            currentUser?.Artists.length + user.Artists.length !== 0 &&
            currentUserFollowArtists.length + userFollowArtists.length !== 0
          ) {
            artistsGrade =
              similarArtists /
                // @ts-ignore
                (currentUser?.Artists.length + user.Artists.length) +
              similarFollowArtists /
                (currentUserFollowArtists.length + userFollowArtists.length);
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
          if (
            // @ts-ignore
            currentUserAlbums.length + userAlbums.length !==
            0
          ) {
            albumGrade =
              // @ts-ignore
              similarAlbums / (currentUserAlbums.length + userAlbums.length);
          }

          // similar genre amount
          var similarGenre = 0;
          if (currentUserGenre) {
            similarGenre = currentUserGenre.filter(
              (item) =>
                userGenre.findIndex((genre) => {
                  return genre === item;
                }) !== -1
            ).length;
          }

          // calc genre match grade
          if (
            // @ts-ignore
            currentUserGenre.length + userGenre.length !==
            0
          ) {
            genereGrade =
              // @ts-ignore
              similarGenre / (currentUserGenre.length + userGenre.length);
          }

          finalGrade =
            (2 * songGrade + 2 * artistsGrade + albumGrade + genereGrade) / 6;

          matchFound = {
            firstUser: "",
            secondUser: "",
            Approve1: "",
            Approve2: "",
            grade: finalGrade,
          };
          return matchFound;
        });

        matchesToInsert.forEach(async (match) => {
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

          if (matchExist) {
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
              res
                .status(200)
                .json({ message: "new match added", ...matchAdded });
            } catch (e) {
              console.log(e);
              res.status(500).send(e);
            }
          }
        });
      }
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
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
