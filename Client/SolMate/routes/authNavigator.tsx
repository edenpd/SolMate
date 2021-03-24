import React, { useContext, useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import LoginRoute from "../routes/LoginRoute";
import useToken from "../hooks/useToken";
import Register from "../routes/RegisterRoute";
import { userContext } from "../contexts/userContext";
import { tokenContext } from "../contexts/tokenContext";

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
  const token = useContext(tokenContext);
  useEffect(() => {
    if (token.token) {
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
