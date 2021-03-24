import SpotifyWebApi from "spotify-web-api-node";
import { Request, Response } from "express";

var scopes = [
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
  ],
  redirectUri = "com.solmate://oauthredirect",
  state = "some-state-of-my-choice";

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
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
