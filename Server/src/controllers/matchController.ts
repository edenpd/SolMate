import { Request, Response } from "express";
import { CallbackError } from "mongoose";
import Match, { IMatch, IMatchModel } from "../modules/matchModel";
import Chat, { IChatModel } from "../modules/chatModel";
import { IUser } from "../modules/userModel";
import { Types, ObjectId } from "mongoose";
import { IChat } from "../modules/chatModel";
import { getUsersForMatches } from "../controllers/userController";
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

export const calcMatchesForUser = async (req: Request, res: Response) => {
  
  let userId = req.query.userId?.toString();
  console.log("Calculating matches for : " + userId);
  let users = await getUsersForMatches();
  let currentUser = users.find((user) => user._id == userId);

  if (currentUser !== undefined) {
    users = users.filter((user) => user._id != currentUser?._id);
    var newMatches = 0;

    const existsMatches = await Match.find(
      {
        $or: [
          { firstUser: currentUser?._id },
          { secondUser: currentUser?._id },
        ],
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

    let potentialUsers = [];

    //  Passes on exsiting matches
    for (let match of existsMatches) {
      try {
        const chatDeleted = await Match.findOneAndDelete({ _id: match._id });
        console.log("Match deleted: " + chatDeleted?._id);
      } catch (e) {
        console.log(e);
        res.status(500).send(e);
      }
    }

    // Passes on user
    for (let user of users) {
      var ageDifMs = Date.now() - user.birthday.getTime();
      var ageDate = new Date(ageDifMs); // miliseconds from epoch
      var age = Math.abs(ageDate.getUTCFullYear() - 1970);

      var ageDifMs = Date.now() - currentUser.birthday.getTime();
      var ageDate = new Date(ageDifMs); // miliseconds from epoch
      var currentUserAge = Math.abs(ageDate.getUTCFullYear() - 1970);

      //  If there isn't match with current user
      if (
        age >= currentUser.interestedAgeMin &&
        age <= currentUser.interestedAgeMax &&
        user.sex == currentUser.interestedSex &&
        currentUserAge >= user.interestedAgeMin &&
        currentUserAge <= user.interestedAgeMax &&
        currentUser.sex == user.interestedSex
      ) {
        potentialUsers.push(user);
      }
    }
    for (let matchedUser of potentialUsers) {
      try {
        const toAdd: IMatch = {
          firstUser: currentUser._id,
          secondUser: matchedUser._id,
          Approve1: "waiting",
          Approve2: "waiting",
        };

        for (let match of existsMatches) {
          if (
            match.firstUser == toAdd.firstUser &&
            match.secondUser == toAdd.secondUser
          ) {
            toAdd.Approve1 = match.Approve1;
            toAdd.Approve2 = match.Approve2;
            break;
          } else if (
            match.secondUser == toAdd.firstUser &&
            match.firstUser == toAdd.secondUser
          ) {
            toAdd.Approve2 = match.Approve1;
            toAdd.Approve1 = match.Approve2;
            break;
          }
        }

        const matchAdded = await Match.create(toAdd);
        console.log("Match added: " + matchAdded);
        newMatches += 1;
      } catch (e) {
        console.log(e);
        res.status(500).send(e);
      }
    }
    res.status(200).send(newMatches + " Matches were added for user " + userId);
  } else res.status(500).send("User " + userId + " not found");
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
