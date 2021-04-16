import { model, Schema, Document } from "mongoose";

interface Location {
  xScale: number;
  yScale: number;
}

export interface IEvent {
  EventId: number;
  EventName: String;
  StartDateTime: String;
  ArtistName: String
  CityName: String
  VenueName: String
  EventUrl: String
  Image: String,
  IsRecommended: boolean
}
export interface IEventModel extends Document, IEvent { }

const schema = new Schema({
  EventId: {
    type: Number,
    required: true,
    unique: true,
  },
  EventName: {
    type: String,
    required: true,
  },
  StartDateTime: {
    type: String,
    required: true,
  },
  ArtistName: {
    type: String,
    required: true,
  },
  CityName: {
    type: String,
    required: true,
  },
  VenueName: {
    type: String,
    required: true,
  },
  EventUrl: {
    type: String,
    required: true,
  },
  Image: {
    type: String,
    required: true,
  },
  IsRecommended: {
    type: Boolean,
    required: true,
  },
});

export default model<IEventModel>("events", schema);