import { Request, Response } from "express";
import { CallbackError } from "mongoose";
import Chat, { IChat } from "../modules/chatModel";
import { IUser } from "../modules/userModel";
import express from "express";
import * as http from "http";
import * as WebSocket from "ws";

const app = express();

const server = http.createServer(express());

const wss = new WebSocket.Server({ server });
let clients = new Map<string, WebSocket>();

wss.on("connection", (ws: WebSocket, incoming_request) => {

  var email = incoming_request.url?.substr(1, incoming_request.url.length);
  if (email != undefined) {
    console.log("connection is established with user : " + email);
    clients.set(email.toString(), ws);
  }

  ws.on("message", (data) => {
    console.log(`received: ${data}`);
    var json = JSON.parse(data.toString())
    if (clients.has(json.reciver)) {
      var currWs = clients.get(json.reciver) as WebSocket;
      currWs.send(json.ChatId)
    }
  })
});

// Start server
server.listen(process.env.PORT || 8999, () => {
  console.log(
    `Server started on port ${(<WebSocket.AddressInfo>server.address()).port}`
  );
});

export const addChatAfterMatch = async (req: Request, res: Response, newChat: IChat) => {
  try {
    const maxChat = await Chat.findOne().sort({ ChatId: -1 }) as IChat
    let chatId = 1;
    if (maxChat != null)
      chatId = maxChat.ChatId + 1;

    newChat.ChatId = chatId;
    const chatAdded = await Chat.create(newChat);
    console.log("chat added :" + chatAdded)

    if (clients.has(newChat.UserId1)) {
      var currWs = clients.get(newChat.UserId1) as WebSocket;
      currWs.send(newChat.ChatId)
    }
    if (clients.has(newChat.UserId2)) {
      var currWs = clients.get(newChat.UserId2) as WebSocket;
      currWs.send(newChat.ChatId)
    }
    res.status(200).json({ message: "Match created and chat added" })
  } catch (e) {
    console.log(e);
    res.status(500).send("ERROR: Unable to create chat");
  }
};

export const addChat = async (req: Request, res: Response) => {
  try {
    const userBody: IChat = req.body;
    const maxChat = await Chat.findOne().sort({ ChatId: -1 }) as IChat
    let chatId = 1;
    if (maxChat != null)
      chatId = maxChat.ChatId + 1;

    const toAdd: IChat = {
      ChatId: chatId,
      Messages: userBody.Messages,
      UserId1: userBody.UserId1,
      UserId2: userBody.UserId2,
    };
    const chatAdded = await Chat.create(toAdd);
    res.status(200).json({ message: "chat added", ...chatAdded });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

export const updateChat = async (req: Request, res: Response) => {
  try {
    const userBody: IChat = req.body;
    const toUpdate: IChat = {
      ChatId: userBody.ChatId,
      Messages: userBody.Messages,
      UserId1: userBody.UserId1,
      UserId2: userBody.UserId2,
    };
    var query = { ChatId: userBody.ChatId };
    const chatUpdated = await Chat.findOneAndUpdate(query, toUpdate);
    res.status(200).json({ message: "chat updated", ...chatUpdated });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

export const getChatsByUser = async (req: Request, res: Response) => {
  var userID = req.query.UserId?.toString();

  await Chat.find({ $or: [{ UserId1: userID }, { UserId2: userID }] })
    .populate("UserId1")
    .populate("UserId2")
    .populate({
      path: 'Messages',
      populate: {
        path: 'sender',
        model: 'users'
      }
    })
    .exec((err: CallbackError, user: any) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(user);
      }
    });
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    console.log(req.query.ChatId);
    var query = { 'ChatId': Number(req.query.ChatId) };
    const chatDeleted = await Chat.findOneAndDelete(query);
    res.status(200).json({ message: "chat deleted", ...chatDeleted });

  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

export const deleteChatsOfUser = async (req: Request, res: Response) => {

  var userID = req.query.userId?.toString();

  const existsChats = await Chat.find(
    {
      $or: [
        { UserId1: userID },
        { UserId2: userID },
      ],
    },
    (err: CallbackError, matches: IChat[]) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        return matches;
      }
    }
  );

  for (let chat of existsChats) {
    try {
      const chatDeleted = await Chat.findOneAndDelete({ 'ChatId': Number(chat.ChatId) });
      if (clients.has(chat.UserId1)) {
        var currWs = clients.get(chat.UserId1) as WebSocket;
        currWs.send(chat.ChatId)
      }
      if (clients.has(chat.UserId2)) {
        var currWs = clients.get(chat.UserId2) as WebSocket;
        currWs.send(chat.ChatId)
      }
      console.log("chat deleted " + chatDeleted);

    } catch (e) {
      console.log(e);
    }
  }
};
