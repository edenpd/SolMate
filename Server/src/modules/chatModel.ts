import { model, Schema, Document } from "mongoose";
import { IMessage } from "../modules/messageModel";

export interface IChat {
  ChatId: number;
  Messages: Array<IMessage>;
  UserId1: string;
  UserId2: string;
}
export interface IChatModel extends Document, IChat {}

const schema = new Schema({
  ChatId: {
    type: Number,
    required: true,
    unique: true,
  },
  Messages: [
    {
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
        ref: 'users'
      },
    },
  ],
  UserId1: {
    type: String,
    required: true,
    ref: 'users'

  },
  UserId2: {
    type: String,
    required: true,        
    ref: 'users'
  },
});

export default model<IChatModel>("chats", schema);
