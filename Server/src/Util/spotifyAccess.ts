import SpotifyWebApi from "spotify-web-api-node";
import crypto from "crypto";

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
export const spotifyApi = new SpotifyWebApi({
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  clientId: process.env.SPOTIFY_CLIENT_ID,
});

export const decrypt = (token: string, iv: string) => {
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

  const spotifyToken = Buffer.concat([
    decipher.update(Buffer.from(token, "hex")),
    decipher.final(),
  ]);
  return spotifyToken.toString();
};

export const encryptTokens = (
  spotifyAccessToken: string,
  spotifyRefreshToken: string
) => {
  var secretKey;

  const algorithm = "aes-256-ctr";
  if (process.env.SPOTIFY_SECRET_KEY_TOKEN) {
    secretKey = process.env.SPOTIFY_SECRET_KEY_TOKEN;
  } else {
    secretKey = "";
  }
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encryptedToken = Buffer.concat([
    cipher.update(spotifyAccessToken),
    cipher.final(),
  ]);

  const encryptedSpotifyToken = encryptedToken.toString("hex");

  const cipherRefresh = crypto.createCipheriv(algorithm, secretKey, iv);

  const encryptedRefToken = Buffer.concat([
    cipherRefresh.update(spotifyRefreshToken, "utf8"),
    cipherRefresh.final(),
  ]);

  const encryptedRefreshToken = encryptedRefToken.toString("hex");

  return {
    encryptedAccessToken: encryptedSpotifyToken,
    encryptedRefreshToken,
    iv,
  };
};
