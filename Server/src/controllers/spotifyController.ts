import { Request, Response } from "express";
import { decrypt, spotifyApi } from "../Util/spotifyAccess";

// Create the authorization URL
export const authorizeSpotify = async (req: Request, res: Response) => {
  spotifyApi.setAccessToken(decrypt(req.body.token, req.body.iv));
  await spotifyApi.getMe().then(
    function (data) {
      return res.status(200).json(data);
    },
    function (err) {
      return res.status(403).json(err);
    }
  );
};

export const getUserInfo = async (req: Request, res: Response) => {
  spotifyApi.setAccessToken(decrypt(req.body.token, req.body.iv));
  if (spotifyApi.getAccessToken()) {
    await spotifyApi.getMe().then(
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
  spotifyApi.setAccessToken(decrypt(req.body.token, req.body.iv));
  if (spotifyApi.getAccessToken()) {
    await spotifyApi.searchTracks(req.body.songName).then(
      function (data) {
        return res.status(200).json(data);
      },
      function (err) {
        return res.status(403).json(err);
      }
    );
  } else {
    return res.status(403).json("No auth");
  }
};

export const getTopTracks = async (req: Request, res: Response) => {
  spotifyApi.setAccessToken(decrypt(req.body.token, req.body.iv));
  if (spotifyApi.getAccessToken()) {
    await spotifyApi.getMyTopTracks().then(
      function (data) {
        return res.status(200).json(data);
      },
      function (err) {
        return res.status(403).json(err);
      }
    );
  } else {
    return res.status(403).json("No auth");
  }
};

export const getTopArtists = async (req: Request, res: Response) => {
  spotifyApi.setAccessToken(decrypt(req.body.token, req.body.iv));
  if (spotifyApi.getAccessToken()) {
    await spotifyApi.getMyTopArtists().then(
      function (data) {
        return res.status(200).json(data);
      },
      function (err) {
        return res.status(403).json(err);
      }
    );
  } else {
    return res.status(403).json("No auth");
  }
};
