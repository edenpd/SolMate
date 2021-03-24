export interface IChat {
  ChatId: number;
  Messages: Array<IMessage>;
  UserId1: IUser;
  UserId2: IUser;
}

export interface IMessage {
  MsgId: number;
  msgDate: string;
  text: string;
  sender: string;
}

export interface IMatch {
  firstUser: IUser;
  secondUser: IUser;
  Approve1: MatchStatus;
  Approve2: MatchStatus;
}

export type MatchStatus = "waiting" | "accepted" | "declined";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  description: string;
  sex: number;
  birthday: Date;
  picture: string;
  youtubeSong: string;
  radiusSearch: number;
  interestedSex: number;
  interestedAgeMin: number;
  interestedAgeMax: number;
  Genre: Array<string>;
  Artists: Array<string>;
  Chats: Array<number>;
  Songs: Array<string>;
  Media: Array<string>;
}

export interface UserContextState {
  user: {
    _id: String;
    email: String;
  };
}