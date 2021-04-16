import { model, Schema, Document, Mongoose, Types } from "mongoose";

export interface IMatch {
  firstUser: String;
  secondUser: String;
  Approve1: String;
  Approve2: String;
  grade: Number;
}
export interface IMatchModel extends Document, IMatch {}

const schema = new Schema({
  // UserId1: {
  //   type: String,
  //   required: true,
  //   unique: true,
  // },
  // UserId2: {
  //   type: String,
  //   required: true,
  //   unique: true,
  // },
  firstUser: {
    type: String,
    ref: "users",
  },
  secondUser: {
    type: String,
    ref: "users",
  },
  Approve1: {
    type: String,
  },
  Approve2: {
    type: String,
  },
  grade: {
    type: Number,
  },
});

export default model<IMatchModel>("matches", schema);
