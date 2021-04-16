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

    const spotifyAccessToken = Buffer.concat([
        decipher.update(Buffer.from(token, "hex")),
        decipher.final(),
    ]);
    return spotifyAccessToken.toString();
};