import { model, Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
export interface IArtist {
  id: string;
  name: string;
  image: string;
}
export interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  description: string;
  sex: number;
  birthday: Date;
  iv: string;
  picture: string;
  spotifyAccessToken: string;
  spotifyRefreshToken: string;
  spotifyTokenExpiryDate: Date;
  youtubeSong: string;
  radiusSearch: number;
  interestedSex: number;
  interestedAgeMin: number;
  interestedAgeMax: number;
  Genre: Array<string>;
  Artists: Array<IArtist>;
  Chats: Array<number>;
  Songs: Array<string>;
  Media: Array<string>;
  meeting_purpose: number;
  location: { latitude: number; longitude: number };
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
  spotifyAccessToken: {
    type: String,
  },
  spotifyRefreshToken: {
    type: String,
  },
  iv: {
    type: String,
  },
  spotifyTokenExpiryDate: {
    type: Date,
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
      id: {
        type: String,
        required: true,
        unique: true,
      },
      name: {
        type: String,
      },
      image: {
        type: String,
      },
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
  meeting_purpose: {
    type: Number,
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    // required: true,
  },
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
