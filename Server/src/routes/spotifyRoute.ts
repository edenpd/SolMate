import { NextFunction, Request, Response, Router } from "express";
import {
  authorizeSpotify,
  searchSong,
  getTopTracks,
  getTopArtists,
  searchArtist,
} from "../controllers/spotifyController";
import { encode as btoa } from "base-64";
import fetch from "node-fetch";
import {
  updateUser,
  updateUserSpotifyToken,
} from "../controllers/userController";
import { decrypt } from "../Util/spotifyAccess";

export const checkAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.spotifyRefreshToken) {
    if (req.body.spotifyTokenExpiryDate < new Date()) {
      const spotifyRefreshToken = decrypt(
        req.body.spotifyRefreshToken,
        req.body.iv
      );

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
        const responseJson = await response.json();
        if (responseJson.error) {
          return res.status(401).json({
            status: "error",
            code: "You don't have autorization to spotify",
          });
        } else {
          const { access_token: newAccessToken, expires_in: expiresIn } =
            responseJson;

          const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
          );
          let user = req.body.user;
          user.spotifyRefreshToken = spotifyRefreshToken;
          user.spotifyAccessToken = newAccessToken;
          user.spotifyTokenExpiryDate = expirationDate;
          const userupdRes = await updateUserSpotifyToken(user, res);
          req.body.token = newAccessToken;
          next(req);
        }
      });
      return response;
    } else {
      next();
    }
  } else {
    return res.status(401).json({
      status: "error",
      code: "You don't have autorization to spotify",
    });
  }
};

const router = Router();

router.post("/auth", authorizeSpotify);
router.post("/search", checkAccessToken, authorizeSpotify);
router.post("/search/song", searchSong);
router.post("/search/artist", searchArtist);
router.post("/toptracks", checkAccessToken, getTopTracks);
router.post("/topartists", checkAccessToken, getTopArtists);

export default router;
