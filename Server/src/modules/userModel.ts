import { model, Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  description: string;
  sex: number;
  birthday: Date;
  picture: string;
  youtubeSong: string;
  radiusSearch: number;
  interestedSex: number;
  interestedAgeMin: number;
  interestedAgeMax: number;
  Genre: Array<string>;
  Artists: Array<string>;
  Chats: Array<number>;
  Songs: Array<string>;
  Media: Array<string>;
}
export interface IUserModel extends IUser, Document {}
const schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  sex: {
    type: Number,
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  picture: {
    type: String,
  },
  youtubeSong: {
    type: String,
  },
  radiusSearch: {
    type: Number,
  },
  interestedSex: {
    type: Number,
  },
  interestedAgeMin: {
    type: Number,
  },
  interestedAgeMax: {
    type: Number,
  },
  Genre: [
    {
      type: String,
    },
  ],
  Artists: [
    {
      type: String,
    },
  ],
  Chats: [
    {
      type: Number,
    },
  ],
  Songs: [
    {
      type: String,
      ref: "songs",
    },
  ],
  Media: [
    {
      type: String,
    },
  ],
});

// schema.pre<IUser>("save", function save(next) {
//   const user = this;

//   bcrypt.genSalt(10, (err, salt) => {
//     if (err) { return next(err); }
//     bcrypt.hash(this.password, salt, (err: Error, hash: string) => {
//       if (err) { return next(err); }
//       user.password = hash;
//     });
//   });
// });
export default model<IUserModel>("users", schema);
