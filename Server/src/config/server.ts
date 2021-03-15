import express from "express";
import * as bodyParser from "body-parser";
import { connect } from "mongoose";
import passport from "passport";
import "../auth/passportConfig";
import { authenticateJWT } from "../controllers/authController";

// Routes
import userRouter from "../routes/userRoute";
import matchRouter from "../routes/matchRoute";
import chatRouter from "../routes/chatRoute";
import messageRouter from "../routes/messageRoute";
import songRouter from "../routes/songRoute";
import eventRouter from "../routes/eventRoute";
import spotifyRouter from '../routes/spotifyRoute';
import cors from "cors";

const app = express();

export const startServer = async () => {
  // support application/json type post data
  app.use(bodyParser.json());
  //support application/x-www-form-urlencoded post data
  app.use(bodyParser.urlencoded({ extended: false }));
  passport.initialize();
  passport.session();
  app.use(cors());

  // Routes
  app.use("/static", express.static("uploads"));
  app.use("/user", userRouter);
  app.use("/match", matchRouter);
  app.use("/chat", chatRouter);
  app.use("/message", messageRouter);
  app.use("/song", songRouter);
  app.use("/event", eventRouter);
  app.use("/spotify",spotifyRouter)

  await new Promise((resolve, reject) => {
    const PORT = 3001;
    app.listen(PORT, () => {
      console.log("Express server listening on port " + PORT);
      resolve(true);
    });
  });
};

export const mongoSetup = async () => {
  await connect("mongodb://localhost/solmate", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    loggerLevel: "debug",
  });

  console.log("Connected to db!");
};
