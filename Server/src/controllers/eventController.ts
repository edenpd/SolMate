import { Request, Response } from "express";
import { CallbackError } from "mongoose";
import Event, { IEvent } from "../modules/eventModel";

const Songkick = require('songkick-api-node');
const songkickApi = new Songkick('YourApiKey');

export const addEvent = async (req: Request, res: Response) => {
  try {
    const eventBody: IEvent = req.body;
    const toAdd: IEvent = {
      EventId: eventBody.EventId,
      // location: eventBody.location,
      UserId1: eventBody.UserId1,
      UserId2: eventBody.UserId2,
    };
    const event = await Event.create(toAdd);
    res.status(200).json({ event: "event added" });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};
export const getEventById = async (req: Request, res: Response) => {
  const eventBody: IEvent = req.body;

  await Event.find(
    { sender: req.body.sender },
    (err: CallbackError, event: IEvent[]) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(event);
      }
    }
  );
};
