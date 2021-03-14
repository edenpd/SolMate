import { useState } from "react";
import AsyncStorage  from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export default function useToken() {
  const initialTokenState = () => {
    const tokenString = AsyncStorage.getItem("token");
    Alert.alert(JSON.stringify(tokenString));
    if (tokenString) {
      return true;
    } else {
      return false;
    }
  };
  const [isTokenSet, setIsTokenSet] = useState(initialTokenState);

  const getToken = async () => {
    const tokenString = await AsyncStorage.getItem("token");
    if (tokenString) {
      const userToken = JSON.parse(tokenString);
      return userToken;
    }
  };

  const saveToken = (userToken) => {
    AsyncStorage.setItem("token", JSON.stringify(userToken));
    setIsTokenSet(true);
  };

  const clearToken = () => {
    AsyncStorage.removeItem("token");
    setIsTokenSet(false);
  };

  return {
    setToken: saveToken,
    token: getToken(),
    isTokenSet,
    clearToken,
  };
}
