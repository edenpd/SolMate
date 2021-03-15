import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Input, Button } from "react-native-elements";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from "expo-auth-session";
import useToken from "../hooks/useToken";

export default function LoginRoute({navigation}) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    spotifyToken,
    isSpotifyTokenSet,
    setToken,
    token,
  } = useToken();

  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        // alignContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ height: "40%", width: "100%" }}>
        <Image
          style={{ flex: 1, width: null, height: null, resizeMode: "contain" }}
          source={require("../assets/solmate_logo.png")}
        />
      </View>
      <View
        style={{
          paddingVertical: 50,
          display: "flex",
          alignItems: "center",
          width: "80%",
        }}
      >
        <Input
          placeholder="Enter your Email"
          errorStyle={{ color: "red" }}
          leftIcon={<Icon name="user" size={24} color="black" />}
        />
        <Input
          placeholder="Enter your password"
          errorStyle={{ color: "red" }}
          secureTextEntry={true}
          leftIcon={<Icon name="lock" size={24} color="black" />}
        />
      </View>
      <View style={{ width: "70%", minWidth: 200 }}>
        <Button
          title="Login"
          loading={isLoading}
          buttonStyle={{ backgroundColor: "purple", borderRadius: 50 }}
        />
        <Text style={{color: 'blue'}}
      onPress={()=>{navigation.navigate('Register')}}>
  Register now !
</Text>
      </View>
    </View>
  );
}
const loginStyle = StyleSheet.create({
  loginContainer: {
    width: "100%",
    height: 100,
    color: "#fff",
    alignItems: "center",
    flexDirection: "column",
    maxHeight: 700,
  },
});
