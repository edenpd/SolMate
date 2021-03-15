import { useState } from "react";
import { Alert } from "react-native";
import * as SecureStore from 'expo-secure-store';

export default function useToken() {
  // const initialTokenState = async () => {
  //   const tokenString = await SecureStore.getItemAsync("token").then(    
  //       return true      
  //       );
  //   Alert.alert(JSON.stringify(tokenString));
  //   if (tokenString) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [isSpotifyTokenSet, setIsSpotifyTokenSet] = useState(false);

  const getToken = async () => {
    const tokenString = await SecureStore.getItemAsync("token").then();
    if (tokenString) {
      const userToken = JSON.parse(tokenString);
      return userToken;
    }
  };

  const saveToken = async (userToken) => {
    await SecureStore.setItemAsync("token", JSON.stringify(userToken));
    setIsTokenSet(true);
  };

  const clearToken = () => {
    SecureStore.deleteItemAsync("token");
    setIsTokenSet(false);
  };

  const clearSpotifyToken = async () => {
    await SecureStore.deleteItemAsync("spotifyToken");
    setIsTokenSet(false);
  };

  const getSpotifyToken = async () => {
    const tokenString = await SecureStore.getItemAsync("spotifyToken");
    if (tokenString) {
      const spotifyToken = JSON.parse(tokenString);
      return spotifyToken;
    }
  };

  const saveSpotifyToken = async (spotifyToken) => {
    await SecureStore.setItemAsync("spotifyToken", JSON.stringify(spotifyToken));
    setIsSpotifyTokenSet(true);
  }

  return {
    setToken: saveToken,
    token: getToken(),
    setSpotifyToken: saveSpotifyToken,
    spotifyToken: getSpotifyToken(),
    isTokenSet,
    isSpotifyTokenSet,
    clearToken,
    clearSpotifyToken
  };
}
