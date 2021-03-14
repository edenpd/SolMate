import { Request, Response } from "express";
import Message, { IMessage } from "../modules/messageModel";
import { CallbackError } from "mongoose";
import { IChat } from "../modules/chatModel";

export const addMsg = async (req: Request, res: Response) => {
  try {
    const userBody: IMessage = req.body;
    const toAdd: IMessage = {
      MsgId: userBody.MsgId,
      msgDate: userBody.msgDate,
      text: userBody.text,
      sender: userBody.sender,
    };
    const chatMsg = await Message.create(toAdd);
    res.status(200).json({ message: "message added", ...chatMsg });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};
export const getMessagesById = async (req: Request, res: Response) => {
  const chatBody: IChat = req.body;

  await Message.find(
    { sender: req.body.sender },
    (err: CallbackError, message: IMessage[]) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(message);
      }
    }
  );
};
