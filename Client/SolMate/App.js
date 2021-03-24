import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import AuthNavigator from "./routes/authNavigator";
import BottomNavigator from "./routes/bottomNavigator";
import { StateProvider } from "./contexts/userContext";
import {TokenStateProvider} from './contexts/tokenContext'
const RootStack = createStackNavigator(
  {
    AuthNavigator: AuthNavigator,
    BottomNavigator: BottomNavigator,
  },

  {
    initialRouteName: "AuthNavigator",
    headerMode: "none",
  }
);
const AppContainer = createAppContainer(RootStack);

export default function App() {
  return (
    <TokenStateProvider>
      <StateProvider>
        <View
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <AppContainer style={{ flex: 1 }}></AppContainer>
        </View>
      </StateProvider>
    </TokenStateProvider>
  );
}
