import User, { IUser } from "../modules/userModel";

export const getUsersDistance = (
  userLocation_1: IUser["location"],
  userLocation_2: IUser["location"]
) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(userLocation_2.latitude - userLocation_1.latitude); // deg2rad below
  var dLon = deg2rad(userLocation_2.longitude - userLocation_1.longitude);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(userLocation_1.latitude)) *
      Math.cos(deg2rad(userLocation_2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
};
const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};
