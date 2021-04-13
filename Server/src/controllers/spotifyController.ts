import SpotifyWebApi from "spotify-web-api-node";
import { Request, Response } from "express";
import crypto from "crypto";

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  clientId: process.env.SPOTIFY_CLIENT_ID,
});

function decrypt(token: string, iv: string) {
  var secretKey: string;

  const algorithm = "aes-256-ctr";
  if (process.env.SPOTIFY_SECRET_KEY_TOKEN) {
    secretKey = process.env.SPOTIFY_SECRET_KEY_TOKEN;
  } else {
    secretKey = "";
  }
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, "hex")
  );

  const spotifyAccessToken = Buffer.concat([
    decipher.update(Buffer.from(token, "hex")),
    decipher.final(),
  ]);
  return spotifyAccessToken.toString();
}

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
