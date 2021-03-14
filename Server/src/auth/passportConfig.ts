import passport from "passport";
import passportLocal from "passport-local";
import passportJwt from "passport-jwt";
import User, { IUser, IUserModel } from "../modules/userModel";
import * as config from "../config/config.json";
import { CallbackError } from "mongoose";
import bcrypt from "bcrypt";
import e from "express";


const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

passport.use(new LocalStrategy({ usernameField: "email" ,passwordField: 'password',
}, (email, password, done) => {
  User.findOne({ email: email.toLowerCase()}, (err: any, user: any) => {
    if (err) { return done(err); }
    if (!user) {
      return done(undefined, false, { message: `email ${email} not found.` });
    }

    bcrypt.compare(password, user.password, (err: Error, isMatch: boolean) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(undefined, user);
      }
      return done(undefined, false, { message: "Invalid username or password." });
    });
  });
}));

passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secret
  }, function (jwtToken, done) {
    User.findOne({ email: jwtToken.email }, function (err: CallbackError, user: IUserModel) {
      if (err) { return done(err, false); }
      if (user) {
        return done(undefined, user , jwtToken);
      } else {
        return done(undefined, false);
      }
    });
  }));
