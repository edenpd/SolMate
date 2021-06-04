import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Input, Button } from "react-native-elements";
import axios from "axios";
import useToken from "../hooks/useToken";
import { userContext } from "../contexts/userContext";
import { tokenContext } from "../contexts/tokenContext";
import { SERVER_ADDRESS, SERVER_PORT } from "@env";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";

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
    // formData.location = {
    //   latitude: location.coords.latitude,
    //   longitude: location.coords.longitude,
    // };
    return axios
      .post(`${SERVER_ADDRESS}:${SERVER_PORT}/user/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      })
      .then(async (response) => {
        dispatch({ type: "SET_USER", payload: response.data.user });
        dispatchToken({ type: "SET_TOKEN", payload: response.data.token });

        // // update location
        // console.log("permmision!");
        // const { status } = await Permissions.askAsync(Permissions.LOCATION);
        // if (status != "granted") {
        //   console.log("PERMISSION NOT GRANRED");
        // }
        // const location = await Location.getCurrentPositionAsync();
        // console.log("location is ", location);

        // // const userLocation = {
        // //   email: email,
        // //   location: location,
        // // };
        // response.data.user.location = location;
        // axios.put(
        //   `${SERVER_ADDRESS}:${SERVER_PORT}/user/updateUser`,
        //   response.data.user,
        //   {
        //     headers: { "Content-Type": "application/json" },
        //   }
        // );
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
        marginTop: 80,
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
      <View style={{ width: "60%", minWidth: 200, marginTop: 10 }}>
        <Button
          title="Login"
          titleStyle={{ fontSize: 20 }}
          loading={isLoading}
          onPress={handleSubmit}
          containerStyle={{ borderRadius: 50 }}
          buttonStyle={{
            backgroundColor: "purple",
            borderRadius: 50,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 6,
            },
            shadowOpacity: 0.37,
            shadowRadius: 7.49,
          }}
        />
        <View style={{ marginVertical: 20, width: "100%" }}>
          <Button
            title="Register"
            titleStyle={{ fontSize: 20, color: "purple" }}
            loading={isLoading}
            onPress={() => {
              navigation.navigate("Register");
            }}
            containerStyle={{ borderRadius: 50 }}
            buttonStyle={{
              backgroundColor: "white",
              borderColor: "purple",
              borderWidth: 1,
              borderRadius: 50,
            }}
          />
        </View>
      </View>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          
        }}
      >
        <Image
          style={{
            width: "40%",
            height: undefined,
            aspectRatio: 1,
            marginHorizontal: "1%",
          }}
          source={require("../assets/giphy.gif")}
        />
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
