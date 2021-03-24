import { Request, Response } from "express";
import { CallbackError } from "mongoose";
import Match, { IMatch, IMatchModel } from "../modules/matchModel";
import Chat, { IChatModel } from "../modules/chatModel";
import { IUser } from "../modules/userModel";
import { Types, ObjectId } from "mongoose";
import { IChat } from "../modules/chatModel";
import {
  getUserByEmail,
  getUsersForMatches,
} from "../controllers/userController";
import { addChatAfterMatch } from "../controllers/chatController";

export const addMatch = async (req: Request, res: Response) => {
  try {
    const userBody: IMatch = req.body;
    const toAdd: IMatch = {
      firstUser: userBody.firstUser,
      secondUser: userBody.secondUser,
      Approve1: userBody.Approve1,
      Approve2: userBody.Approve2,
    };
    const matchAdded = await Match.create(toAdd);
    res.status(200).json({ message: "Match added", ...matchAdded });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

export const updateMatch = async (req: Request, res: Response) => {
  let isApprove1 = req.body.Approve1;
  let isApprove2 = req.body.Approve2;
  let matchId = req.body._id;

  await Match.updateOne(
    { _id: matchId },
    { $set: { Approve1: isApprove1, Approve2: isApprove2 } }
  ).then((value: { ok: number; n: number; nModified: number }) => {
    // Check if the update was successful and return an erorr if it wasn't
    if (value.nModified < 1) {
      res.status(500).send("ERROR: Unable to update match.");

      return;
    }
  });

  // if both users approved, create a chat.
  if (isApprove1 === "accepted" && isApprove2 === "accepted") {
    // Prepare the chat parameters.
    const chat: IChat = {
      ChatId: 1,
      Messages: [],
      UserId1: req.body.firstUser._id,
      UserId2: req.body.secondUser._id,
    };

    await addChatAfterMatch(req, res, chat);

    // // Send a creation request to the database.
    // await Chat.create(chat)
    //   .then((val: IChatModel) => {
    //     res.status(200).json({ message: "Match created and chat added" });
    //   })
    //   .catch((err) => {
    //     res.status(500).json(err);
    //   });
  } else res.status(200).json({ message: "Match updated" });
};

export const getMatchesById = async (req: Request, res: Response) => {
  let userID = req.query.userId?.toString();
  console.log("The user id is: " + userID);

  // Find matches in
  if (userID !== undefined) {
    await Match.find({
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
      // .populate("firstUser")
      // .populate("secondUser")
      .populate({
        path: "firstUser",
        model: "users",
        populate: {
          path: "Songs",
          model: "songs",
        },
      })
      .populate({
        path: "secondUser",
        model: "users",
        populate: {
          path: "Songs",
          model: "songs",
        },
      })
      .exec((err: CallbackError, user: any) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json(user);
        }
      });
  }
};

export const MatcheAlgorithm = async (req: Request, res: Response) => {
  // TODO- location radius
  let userId = req.query.userId?.toString();
  console.log("Calculating matches for : " + userId);

  // basic filter
  let users = await getUsersForMatches(userId as String);
  let currentUser = users.find((user) => user._id == userId);
  let currentUserSavedSongs: String[] = [];
  let currentUserFollowArtists: String[] = [];
  let currentUserAlbums: String[] = [];
  let currentUserGenre: String[] = [];

  if (users && currentUser != undefined) {
    users.filter((user) => {
      var age = Date.now() - user.birthday.getTime();
      let userSavedSongs: String[] = [];
      let userFollowArtists: String[] = [];
      let userAlbums: String[] = [];
      let userGenre: String[] = [];
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
          // @ts-ignore
          similarArtists / (currentUser?.Artists.length + user.Artists.length) +
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

      return (
        // @ts-ignore
        currentUser?.interestedAgeMin >= age &&
        // @ts-ignore
        currentUser?.interestedAgeMax <= age
      );
    });
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
