import { Request, Response } from "express";
import { CallbackError } from "mongoose";
import Event, { IEvent } from "../modules/eventModel";
import axios from "axios";
import { decrypt, spotifyApi } from "../Util/spotifyAccess";
import User, { IUser, IUserModel } from "../modules/userModel";
import { checkAccessToken } from "../controllers/spotifyController";

const client_id = "MjE2NDYzNTF8MTYxNjkxOTA0OS4yODI1MjUz";

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

  console.log("Getting events for user id: " + req.query.userId);

  // if (req.query.artists == undefined) {
  //   res.status(500).send("Error");
  //   return;
  // }

  await User.find({ _id: req.query.userId }, async (err: CallbackError, userArray: IUser[]) => {
    let user = userArray[0];
    if (err) {
      res.status(500).send(err);
    } else {

      let artists: string[] = [];

      try {
        // Get the artists from spotify
        spotifyApi.setAccessToken(decrypt(user.spotifyAccessToken, user.iv));
        // Try accessing the spotify API only if there is an access token
        if (spotifyApi.getAccessToken()) {
          const token = await checkAccessToken(user);
          if (token) {
            spotifyApi.setAccessToken(token);
          }
          const artistsArray = await spotifyApi.getMyTopArtists({ limit: 5 });

          for (let item of artistsArray.body.items) {
            artists.push(item.name);
          }
        }
      } catch (error) {
        console.log("Error with spotify token");
      }
      if (artists.length == 0) {
        artists = user.Artists;
      }

      let suggestionsArtistsUrl = "";
      let events: IEvent[] = [];

      //  Gets the artists id
      for (let artist of artists) {
        await axios.get('https://api.seatgeek.com/2/performers?q=' + artist + '&client_id=' + client_id)
          .then(async function (response: any) {
            // console.log(artist + ":" + response.data.performers[0].id);
            suggestionsArtistsUrl += "&performers.id=" + response.data.performers[0].id;

            // Gets the artist's first 5 events
            await axios.get('https://api.seatgeek.com/2/events?performers.id=' + response.data.performers[0].id + '&per_page=5&client_id=' + client_id)
              .then(function (response: any) {

                response.data.events.forEach(function (event: any) {

                  let artistsNames = "";
                  event.performers.forEach(function (performer: any) {
                    artistsNames += performer.name + ", ";
                  });

                  artistsNames = artistsNames.substring(0, artistsNames.length - 2);

                  let newEvent: IEvent = {
                    EventId: event.id,
                    EventName: event.short_title,
                    StartDateTime: event.datetime_local,
                    ArtistName: artistsNames,
                    CityName: event.venue.extended_address,
                    VenueName: event.venue.name,
                    EventUrl: event.url,
                    Image: event.performers[0].image,
                    IsRecommended: false
                  }
                  events.push(newEvent);
                });

              })
              .catch(function (error: any) {
                console.log("Not found events for " + artist);
              })

          })
          .catch(function (error: any) {
            console.log("Artist " + artist + "not Found");
          })
      }

      // Gets the recommended events
      await axios.get('https://api.seatgeek.com/2/recommendations?' + suggestionsArtistsUrl + '&postal_code=10014&per_page=10&client_id=' + client_id)
        .then(function (response: any) {

          response.data.recommendations.forEach(function (recommendation: any) {

            let artistsNames = "";
            recommendation.event.performers.forEach(function (performer: any) {
              artistsNames += performer.name + ", ";
            });

            artistsNames = artistsNames.substring(0, artistsNames.length - 2);

            let newEvent: IEvent = {
              EventId: recommendation.event.id,
              EventName: recommendation.event.short_title,
              StartDateTime: recommendation.event.datetime_local,
              ArtistName: artistsNames,
              CityName: recommendation.event.venue.extended_address,
              VenueName: recommendation.event.venue.name,
              EventUrl: recommendation.event.url,
              Image: recommendation.event.performers[0].image,
              IsRecommended: true
            }
            events.push(newEvent);
          });

        })
        .catch(function (error: any) {
          console.log("ERROR with suggested events");
        })

      res.status(200).json(events);

      // } else { // If there is no token, return the mataches without the users' top artists.
      //   res.status(500).send("No aritists found");
      // }
    }
  })


};
