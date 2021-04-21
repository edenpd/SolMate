import bcrypt from "bcrypt";
import { NextFunction, Request, response, Response } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import User, { IUser, IUserModel } from "../modules/userModel";
import * as config from "../config/config.json";
import { CallbackError, MapReduceOptions } from "mongoose";
import { deleteChatsOfUser } from "../controllers/chatController";
import { deleteMatchesOfUser } from "../controllers/matchController";
import crypto from "crypto";

export const registerUser = async (req: Request, res: Response) => {
  const hashedPassword = bcrypt.hashSync(
    req.body.password,
    bcrypt.genSaltSync(10)
  );
  var secretKey;

  const algorithm = "aes-256-ctr";
  if (process.env.SPOTIFY_SECRET_KEY_TOKEN) {
    secretKey = process.env.SPOTIFY_SECRET_KEY_TOKEN;
  } else {
    secretKey = "";
  }
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  console.log(req.body.spotifyAccessToken);
  const encryptedToken = Buffer.concat([
    cipher.update(req.body.spotifyAccessToken),
    cipher.final(),
  ]);

  const encryptedSpotifyToken = encryptedToken.toString("hex");

  // const encryptedRefToken = Buffer.concat([
  //   cipher.update(req.body.spotifyRefreshToken),
  //   cipher.final(),
  // ]);

  // const encryptedRefreshToken = encryptedRefToken.toString("hex");

  var userBody: IUser = req.body;
  const user = await User.create({
    email: userBody.email,
    password: hashedPassword,
    iv: iv.toString("hex"),
    spotifyAccessToken: encryptedSpotifyToken,
    // spotifyRefreshToken: encryptedRefreshToken,
    firstName: userBody.firstName,
    lastName: userBody.lastName,
    description: userBody.description,
    sex: userBody.sex,
    birthday: userBody.birthday,
    picture: userBody.picture,
    youtubeSong: userBody.youtubeSong,
    radiusSearch: userBody.radiusSearch,
    interestedSex: userBody.interestedSex,
    interestedAgeMin: userBody.interestedAgeMin,
    interestedAgeMax: userBody.interestedAgeMax,
    Genre: userBody.Genre,
    Artists: userBody.Artists,
    Chats: userBody.Chats,
    Media: userBody.Media,
    Songs: userBody.Songs,
  });

  const token = jwt.sign({ email: userBody.email }, config.secret, {
    expiresIn: 86400, // expires in 24 hours
  });

  res.status(200).send({ token: token, user: user });
};

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "local",
    { session: false },
    function (err: any, user: any, info) {
      console.log(user);

      // no async/await because passport works only with callback ..
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ status: "error", code: "unauthorized" });
      } else {
        const token = jwt.sign({ email: user.email }, config.secret);
        res.status(200).send({ user: user, token: token });
      }
    }
  )(req, res, next);
};

export const uploadMedia = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const pic = req.file.filename;
  console.log("try", pic, userId);
  await User.updateOne(
    {
      email: userId,
    },
    {
      $push: { Media: { $each: [pic] } },
    }
  ).exec((err: CallbackError, user: any) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(user);
    }
  });
};

export const uploadProfile = async (req: Request, res: Response) => {
  // try {
  // const userId = req.body._id;
  // const picture = req.body.picture;
  const pic = req.body.myImage;
  const userEmail = req.body.userId;
  console.log("here", req, req.file, req.body);
  await User.updateOne(
    {
      // _id: userId,
      email: userEmail,
    },
    {
      $set: {
        picture: req.file.filename,
      },
    }
  ).exec((err: CallbackError, user: any) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(user);
    }
  });

  //   console.log("Check");
  //   res.status(200).send(true);
  // } catch (e) {
  //   res.sendStatus(500);
  // }
};

export const updateUser = async (req: Request, res: Response) => {
  console.log(req.body);
  const userId = req.body._id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const Songs = req.body.Songs;
  const description = req.body.description;
  const interestedAgeMin = req.body.interestedAgeMin;
  const interestedAgeMax = req.body.interestedAgeMax;
  const radiusSearch = req.body.radiusSearch;
  const sex = req.body.sex;
  const birthday = req.body.birthday;
  const interestedSex = req.body.interestedSex;
  try {
    await User.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
          Songs: Songs,
          description: description,
          interestedAgeMin: interestedAgeMin,
          interestedAgeMax: interestedAgeMax,
          radiusSearch: radiusSearch,
          sex: sex,
          birthday: birthday,
          interestedSex: interestedSex,
        },
      }
    ).exec((err: CallbackError, user: any) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(user);
      }
    });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  let userEmail = req.query.UserEmail?.toString();
  await User.find({ email: userEmail }, (err: CallbackError, user: IUser) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(user);
    }
  }).populate("Songs");
};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.query.userId;
  console.log("Deleting user " + userId + " and dependencies");

  try {
    // Delete all user chats
    deleteChatsOfUser(req, res);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }

  try {
    // Delete all user chats
    deleteMatchesOfUser(req, res);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }

  try {
    await User.findOneAndDelete({ _id: userId }).exec(
      (err: CallbackError, user: any) => {
        if (err) {
          res.status(500).send(err);
        } else {
          console.log("User, chats and matches deleted for user : " + userId);
          res.status(200).json({
            message: "User, chats and matches deleted for user : " + userId,
          });
        }
      }
    );
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

export const getUserByid = async (req: Request, res: Response) => {
  // const userId = "60796738b87efd2d3471f026";
  const userId = req.query.userId;
  await User.find({ _id: userId }, (err: CallbackError, user: IUser) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(user);
    }
  });
};
