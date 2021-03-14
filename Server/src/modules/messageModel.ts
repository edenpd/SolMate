import { model, Schema, Document } from "mongoose";

export interface IMessage {
  MsgId: number;
  msgDate: string;
  text: string;
  sender: string;
}
export interface IMessageModel extends Document, IMessage {}

const schema = new Schema({
  MsgId: {
    type: Number,
    required: true,
    unique: true,
  },
  msgDate: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
});

export default model<IMessageModel>("messages", schema);
