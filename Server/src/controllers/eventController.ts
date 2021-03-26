import { Request, Response } from "express";
import { CallbackError } from "mongoose";
import Event, { IEvent } from "../modules/eventModel";

// const Songkick = require('songkick-api-node');
// const songkickApi = new Songkick('YourApiKey');
// const axios = require('axios');

export const addEvent = async (req: Request, res: Response) => {
  // try {
  //   const eventBody: IEvent = req.body;
  //   const toAdd: IEvent = {
  //     EventId: eventBody.EventId,
  //     // location: eventBody.location,
  //     UserId1: eventBody.UserId1,
  //     UserId2: eventBody.UserId2,
  //   };
  //   const event = await Event.create(toAdd);
  //   res.status(200).json({ event: "event added" });
  // } catch (e) {
  //   console.log(e);
  //   res.status(500).send(e);
  // }
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

export const getEvents = async (req: Request, res: Response) => {

  console.log("Getting events");

  const events: IEvent[] = [
    {
      EventId: 11129128,
      EventName: "aaaaaaaaaaaaa",
      StartDateTime: '2012-04-18T20:00:00-0800',
      ArtistName: 'Wild Flag',
      CityName: 'San Francisco, CA, US',
      VenueName: 'The Fillmore',
      EventUrl: 'http://www.songkick.com/concerts/11129128-wild-flag-at-fillmore?utm_source=PARTNER_ID&utm_medium=partner'
    },
    
  ];

  res.status(200).json(events);

  // axios.get('https://app.ticketmaster.com/discovery/v2/events?apikey=ScXzHTbNBRcdHd875uxjKAKUIbF0d9lI&locale=*&page=14')
  //   .then(function (response: any) {
  //     // handle success
  //     console.log("res:" + response);
  //     res.status(200).json(response);

  //   })
  //   .catch(function (error: any) {
  //     // handle error
  //     res.status(500).send(error);
  //   })

  // await Event.find(
  //   { sender: req.body.sender },
  //   (err: CallbackError, event: IEvent[]) => {
  //     if (err) {
  //     } else {
  //       res.status(200).json(event);
  //     }
  //   }
  // );
};
