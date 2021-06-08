import { Request, Response } from "express";
import { decrypt, spotifyApi, encryptTokens } from "../Util/spotifyAccess";
import { encode as btoa } from "base-64";
import fetch from "node-fetch";
import {
  updateUser,
  updateUserSpotifyTokenNoResponse,
  updateUserWithNoResponse,
} from "../controllers/userController";

export const checkAccessToken = async (user: any) => {
  if (user.spotifyRefreshToken) {
    if (user.spotifyTokenExpiryDate < new Date()) {
      const spotifyRefreshToken = decrypt(user.spotifyRefreshToken, user.iv);
      const credsB64 = btoa(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      );
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credsB64}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=refresh_token&refresh_token=${spotifyRefreshToken}`,
      }).then(async (response) => {
        if (response.status != 200) {
          console.log(response);
        } else {
          const responseJson = await response.json();

          const { access_token: newAccessToken, expires_in: expiresIn } =
            responseJson;

          const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
          );
          user.spotifyRefreshToken = spotifyRefreshToken;
          user.spotifyAccessToken = newAccessToken;
          user.spotifyTokenExpiryDate = expirationDate;
          user.token = newAccessToken;
          let userBody: any = {};
          userBody.body = user;
          const userupdRes = await updateUserSpotifyTokenNoResponse(userBody);
          return newAccessToken;
        }
      });
      return response;
      //     // fetch()
    }
  }
};

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
  // spotifyApi.setAccessToken(decrypt(req.body.token, req.body.iv));
  //   console.log('asd')
  // console.log(spotifyApi.getAccessToken())
  //   if (!spotifyApi.getAccessToken()) {
  const credsB64 = btoa(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  );
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credsB64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials`,
  });
  const responseJson = await response.json();
  if (responseJson.error) {
    return res.status(401).json({
      status: "error",
      code: "You don't have autorization to spotify",
    });
  } else {
    const { access_token: newAccessToken, expires_in: expiresIn } =
      responseJson;
    spotifyApi.setAccessToken(newAccessToken);
  }
  await spotifyApi.searchTracks(req.body.songName).then(
    function (data) {
      return res.status(200).json(data.body.tracks);
    },
    function (err) {
      return res.status(403).json(err);
    }
  );
};

export const searchArtist = async (req: Request, res: Response) => {
  // spotifyApi.setAccessToken(decrypt(req.body.token, req.body.iv));
  //   console.log('asd')
  // console.log(spotifyApi.getAccessToken())
  //   if (!spotifyApi.getAccessToken()) {
  const credsB64 = btoa(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  );
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credsB64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials`,
  });
  const responseJson = await response.json();
  if (responseJson.error) {
    return res.status(401).json({
      status: "error",
      code: "You don't have autorization to spotify",
    });
  } else {
    const { access_token: newAccessToken, expires_in: expiresIn } =
      responseJson;
    spotifyApi.setAccessToken(newAccessToken);
  }
  await spotifyApi
    .searchArtists(req.body.artistName, { limit: 20, market: "IL" })
    .then(
      function (data) {
        return res.status(200).json(data.body.artists);
      },
      function (err) {
        return res.status(403).json(err);
      }
    );
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
