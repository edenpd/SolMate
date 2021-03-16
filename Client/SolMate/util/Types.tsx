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

export interface IUser {
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