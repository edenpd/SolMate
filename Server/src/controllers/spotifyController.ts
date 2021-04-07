import SpotifyWebApi from "spotify-web-api-node";
import { Request, Response } from "express";

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  clientSecret: "0cbde209fec24b03bfddf4a7c4515e30",
  clientId: "b5497b2f8f6441fa8449f7a108920552",
});

// Create the authorization URL
export const authorizeSpotify = async (req: Request, res: Response) => {
  const token: string = req.body.token;
  spotifyApi.setAccessToken(token);
  spotifyApi.getMe().then(
    function (data) {
      return res.status(200).json(data);
    },
    function (err) {
      return res.status(403).json(err);
    }
  );
};

export const getUserInfo = async (req: Request, res: Response) => {
  if (spotifyApi.getAccessToken()) {
    spotifyApi.getMe().then(
      function (data) {
        return res.status(200).json(data);
      },
      function (err) {
        return res.status(403).json(err);
      }
    );
  }
  return res.status(403).json("No auth");
};

export const searchSong = async (req: Request, res: Response) => {
  if (spotifyApi.getAccessToken()) {
    spotifyApi.searchTracks(req.body.songName).then(
      function (data) {
        return res.status(200).json(data);
      },
      function (err) {
        return res.status(403).json(err);
      }
    );
  }
  return res.status(403).json("No auth");
};

export const getTopTracks = async (req: Request, res: Response) => {
  if (spotifyApi.getAccessToken()) {
    spotifyApi.getMyTopTracks().then(
      function (data) {
        return res.status(200).json(data);
      },
      function (err) {
        return res.status(403).json(err);
      }
    );
  }
  return res.status(403).json("No auth");
};


export const getTopArtists = async (req: Request, res: Response) => {
  if (spotifyApi.getAccessToken()) {
    spotifyApi.getMyTopArtists().then(
      function (data) {
        return res.status(200).json(data);
      },
      function (err) {
        return res.status(403).json(err);
      }
    );
  }
  return res.status(403).json("No auth");
};