import React, { useState } from "react";
import { StyleSheet, Text, View, I18nManager } from "react-native";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import AuthNavigator from "./routes/authNavigator";
import BottomNavigator from "./routes/bottomNavigator";
import { StateProvider } from "./contexts/userContext";
import { TokenStateProvider } from "./contexts/tokenContext";
import { BottomNavigation } from "react-native-paper";
import { LogBox } from 'react-native';

export default function App() {
  LogBox.ignoreAllLogs();

  const [initialRoute, setInitialRoute] = useState("AuthNavigator");
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

  I18nManager.allowRTL(false);
  
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
