import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Input, Button } from "react-native-elements";
import axios from "axios";
import useToken from "../hooks/useToken";
import { userContext } from "../contexts/userContext";
import { tokenContext } from "../contexts/tokenContext";
import { SERVER_ADDRESS, SERVER_PORT } from '@env';

export default function LoginRoute({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { spotifyToken, isSpotifyTokenSet, setToken, token } = useToken();
  const { dispatch } = useContext(userContext);
  const { dispatchToken } = useContext(tokenContext);

  useEffect(() => {
    navigation.popToTop();
  }, [token]);

  async function loginUser(credentials) {
    return axios
      .post(`${SERVER_ADDRESS}:${SERVER_PORT}/user/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      })
      .then(async (response) => {
        dispatch({ type: "SET_USER", payload: response.data.user });
        dispatchToken({ type: "SET_TOKEN", payload: response.data.token });
      })
      .catch((error) => Alert.alert(error.message));
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await loginUser({
      email,
      password,
    });
  };

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
          paddingTop: 50,
          paddingBottom: 20,
          display: "flex",
          alignItems: "center",
          width: "80%",
        }}
      >
        <Input
          placeholder="Enter your Email"
          errorStyle={{ color: "red" }}
          onChangeText={setEmail}
          value={email}
          leftIcon={<Icon name="user" size={24} color="black" />}
        />
        <Input
          placeholder="Enter your password"
          errorStyle={{ color: "red" }}
          secureTextEntry={true}
          onChangeText={setPassword}
          value={password}
          leftIcon={<Icon name="lock" size={24} color="black" />}
        />
      </View>
      <View style={{ width: "60%", minWidth: 200 }}>
        <Button
          title="Login"
          titleStyle={{ fontSize: 20 }}
          loading={isLoading}
          onPress={handleSubmit}
          buttonStyle={{ backgroundColor: "purple", borderRadius: 50 }}
        />
        <View style={{ flexDirection: "row", marginVertical: 20 }}>
          <Text style={{ paddingHorizontal: 10, fontSize: 16 }}>
            I don't have a user -
          </Text>
          <Text
            style={{ color: "blue", fontSize: 16 }}
            onPress={() => {
              navigation.navigate("Register");
            }}
          >
            Register now !
          </Text>
        </View>
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
