import React, { useContext, useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import LoginRoute from "../routes/LoginRoute";
import useToken from "../hooks/useToken";
import Register from "../routes/RegisterRoute";
import { userContext } from "../contexts/userContext";
import { tokenContext } from "../contexts/tokenContext";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import axios from "axios";
import { SERVER_ADDRESS, SERVER_PORT } from "@env";

const RootStack = createStackNavigator(
  {
    Register: Register,
    Login: LoginRoute,
  },
  {
    headerMode: "none",

    initialRouteName: "Login",
  }
);
const AppContainer = createAppContainer(RootStack);

export default function authNavigator({ navigation }) {
  const { token } = useContext(tokenContext);
  const { state } = useContext(userContext);
  useEffect(() => {
    const fetch = async () => {
      console.log(state.user);
      // update location
      console.log("permmision!");
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status != "granted") {
        console.log("PERMISSION NOT GRANRED");
      }
      const location = await Location.getCurrentPositionAsync();
      console.log("location is ", location);
      //  response.data.user.location = location;
      const cuur_location = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      axios.put(
        `${SERVER_ADDRESS}:${SERVER_PORT}/user/updateLocation`,
        { ...state.user, location: cuur_location },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    };

    if (token.token) {
      fetch();

      navigation.navigate("BottomNavigator");
    }
  }, [token]);

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <AppContainer style={{ flex: 1 }}></AppContainer>
    </View>
  );
}
