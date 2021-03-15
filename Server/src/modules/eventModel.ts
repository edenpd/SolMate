import { model, Schema, Document } from "mongoose";

interface Location {
  xScale: number;
  yScale: number;
}

export interface IEvent {
  EventId: number;
  // location: Location;
  UserId1: string;
  UserId2: string;
}
export interface IEventModel extends Document, IEvent {}

const schema = new Schema({
  EventId: {
    type: Number,
    required: true,
    unique: true,
  },
  // location: {
  //   type: Location,
  //   require: true,
  // },
  UserId1: {
    type: String,
    required: true,
  },
  UserId2: {
    type: String,
    required: true,
  },
});

export default model<IEventModel>("events", schema);
