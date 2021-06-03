import bcrypt from "bcrypt";
import { NextFunction, Request, response, Response } from "express";
import jwt from "jsonwebtoken";
import passport, { use } from "passport";
import User, { IUser, IUserModel } from "../modules/userModel";
import * as config from "../config/config.json";
import { CallbackError, MapReduceOptions } from "mongoose";
import { deleteChatsOfUser } from "../controllers/chatController";
import { deleteMatchesOfUser } from "../controllers/matchController";
import crypto from "crypto";
import { decrypt, spotifyApi, encryptTokens } from "../Util/spotifyAccess";
import { checkAccessToken } from "../controllers/spotifyController";

export const registerUser = async (req: Request, res: Response) => {
  const hashedPassword = bcrypt.hashSync(
    req.body.password,
    bcrypt.genSaltSync(10)
  );

  const { encryptedAccessToken, encryptedRefreshToken, iv } = encryptTokens(
    req.body.spotifyAccessToken,
    req.body.spotifyRefreshToken
  );
  const expirationDate = new Date(
    new Date().getTime() + req.body.expiresIn * 1000
  );

  var userBody: IUser = req.body;
  console.log(userBody.Artists);
  const user = await User.create({
    email: userBody.email,
    password: hashedPassword,
    iv: iv.toString("hex"),
    spotifyAccessToken: encryptedAccessToken,
    spotifyRefreshToken: encryptedRefreshToken,
    spotifyTokenExpiryDate: expirationDate,
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
    location: userBody.location,
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
export const updateLocation = async (req: Request, res: Response) => {
  const userId = req.body._id;
  const email = req.body.email;
  const location = req.body.location;
  try {
    await User.updateOne(
      {
        _id: userId,
        email: email,
      },
      {
        $set: {
          location: location,
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
export const updateUser = async (req: Request, res: Response) => {
  console.log(req.body);
  const userId = req.body._id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const Songs = req.body.Songs;
  const description = req.body.description;
  const interestedAgeMin = req.body.interestedAgeMin;
  const interestedAgeMax = req.body.interestedAgeMax;
  const radiusSearch = req.body.radiusSearch;
  const sex = req.body.sex;
  const birthday = req.body.birthday;
  const interestedSex = req.body.interestedSex;
  // const { encryptedAccessToken, encryptedRefreshToken, iv } = encryptTokens(
  //   req.body.spotifyAccessToken,
  //   req.body.spotifyRefreshToken
  // );
  try {
    await User.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          Songs: Songs,
          description: description,
          interestedAgeMin: interestedAgeMin,
          interestedAgeMax: interestedAgeMax,
          radiusSearch: radiusSearch,
          sex: sex,
          birthday: birthday,
          interestedSex: interestedSex,
          // spotifyAccessToken: encryptedAccessToken,
          // spotifyRefreshToken: encryptedRefreshToken,
          // iv: iv?.toString("hex"),
          // spotifyTokenExpiryDate: req.body.spotifyTokenExpiryDate,
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

export const updateUserWithNoResponse = async (req: Request) => {
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
  const { encryptedAccessToken, encryptedRefreshToken, iv } = encryptTokens(
    req.body.spotifyAccessToken,
    req.body.spotifyRefreshToken
  );

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
          spotifyAccessToken: encryptedAccessToken,
          spotifyRefreshToken: encryptedRefreshToken,
          iv: iv?.toString("hex"),
          spotifyTokenExpiryDate: req.body.spotifyTokenExpiryDate,
        },
      }
    ).exec((err: CallbackError, user: any) => {
      if (err) {
        return err;
      } else {
        return user;
      }
    });
  } catch (e) {
    console.log(e);
    return e;
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

export const getUserByid2 = async (req: Request, res: Response) => {
  const userId = req.query.userId?.toString();

  await User.find({ _id: userId }, async (err: CallbackError, user: any) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const iv = user[0].iv;
      const spotifyAccessToken = user[0].spotifyAccessToken;

      spotifyApi.setAccessToken(decrypt(spotifyAccessToken, iv));

      if (spotifyApi.getAccessToken())
        try {
          const artists = await spotifyApi.getMyTopArtists({ limit: 6 });
          let newUser = { Artists: artists, user: user[0]._doc };
          console.log(newUser.user);
          res.status(200).json(newUser);
        } catch (e) {
          // TODO: Implement error handling.
          console.log("[getUserByid2] oops");
          res.status(500).send(e);
        }
    }
  });
};

export const getUserByid = async (req: Request, res: Response) => {
  const userId = req.query.userId?.toString();

  await User.find({ _id: userId }, async (err: CallbackError, user: any) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const currUser = user[0];
      let newUser = { Artists: currUser.Artists, user: currUser._doc };
      try {
        spotifyApi.setAccessToken(
          decrypt(currUser.spotifyAccessToken, currUser.iv)
        );

        if (spotifyApi.getAccessToken()) {
          const token = await checkAccessToken(currUser);

          if (token) {
            spotifyApi.setAccessToken(token);
          }
          const artists = await spotifyApi.getMyTopArtists({ limit: 10 });
          newUser = { Artists: artists.body.items, user: currUser._doc };
        }
      } catch (e) {
        console.log(e);
      }
      res.status(200).json(newUser);
    }
  });
};
