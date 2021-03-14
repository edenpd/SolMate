import { model, Schema, Document } from "mongoose";

export interface ISong {
  songId: number;
  songName: string;
  artistName: string;
  albumName: string;
  imgUrl: string;
}
export interface ISongModel extends Document, ISong {}

const schema = new Schema({
  songId: {
    type: Number,
    required: true,
    unique: true,
  },
  songName: {
    type: String,
    required: true,
  },
  artistName: {
    type: String,
    required: true,
  },
  albumName: {
    type: String,
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
});

export default model<ISongModel>("songs", schema);
