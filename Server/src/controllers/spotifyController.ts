import { Request, Response } from "express";
import { decrypt, spotifyApi,encryptTokens } from "../Util/spotifyAccess";
import { encode as btoa } from "base-64";
import fetch from 'node-fetch';
import { updateUser, updateUserWithNoResponse } from "../controllers/userController";

export const checkAccessToken = async (
  user: any,
) => {
  if (user.spotifyRefreshToken) {
    if (user.spotifyTokenExpiryDate < new Date()) {
      const spotifyRefreshToken = decrypt(user.spotifyRefreshToken,user.iv);
      try {
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
        });
        const responseJson = await response.json();
        if (responseJson.error) {
          console.log(responseJson)
        } else {
          const {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expires_in: expiresIn,
          } = responseJson;

          const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
          if (newRefreshToken) {
            user.spotifyRefreshToken = newRefreshToken;
          }
          user.spotifyAccessToken = newAccessToken;
          user.spotifyTokenExpiryDate = expirationDate;
          user.token = newAccessToken;
          let userBody : any = {};
          userBody.body = user;
          const userupdRes = await updateUserWithNoResponse(userBody);
          return newAccessToken;
        }
      } catch (err) {
        console.error(err);
      }
      // fetch()
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
