import { Request, Response } from "express";
import Song, { ISong } from "../modules/songModel";
import { CallbackError } from "mongoose";

export const getSongs = async (req: Request, res: Response) => {
  let name = req.query.name?.toString();
  let artist = req.query.artist?.toString();
  let album = req.query.album?.toString();
  await Song.find(
    { 
      songName: { "$regex": name, "$options": "i" },
      artistName: { "$regex": artist, "$options": "i" },
      albumName: { "$regex": album, "$options": "i" }
    },
    (err: CallbackError, message: ISong[]) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(message);
      }
    }
  );
};
