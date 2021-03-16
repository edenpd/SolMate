import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BottomNavigation, Appbar } from "react-native-paper";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import ChatRoute from "./routes/ChatRoute";
import EventsRoute from "./routes/EventsRoute";
import ProfileRoute from "./routes/ProfileRoute";
import MatchesRoute from "./routes/MatchesRoute";
import LoginRoute from "./routes/LoginRoute";
import useToken from "./hooks/useToken";
import Register from "./routes/RegisterRoute";

const RootStack = createStackNavigator(
  {
    Register: Register,
    Login: LoginRoute,
  },
  {
    initialRouteName: "Login",
  }
);
const AppContainer = createAppContainer(RootStack);

export default function App() {
  const [index, setIndex] = React.useState(0);
  const { token, setToken, isTokenSet } = useToken();
  const [routes] = React.useState([
    { key: "matches", title: "Matches", icon: "account-multiple" },
    { key: "events", title: "Events", icon: "calendar-blank" },
    { key: "chat", title: "Chat", icon: "chat" },
    { key: "profile", title: "Profile", icon: "account" },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    login: LoginRoute,
    matches: MatchesRoute,
    events: EventsRoute,
    chat: ChatRoute,
    profile: ProfileRoute,
  });

  const navigationStyle = {
    backgroundColor: "white",
  };
  if (isTokenSet) {
    return (
      <View
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <BottomNavigation
          activeColor={"purple"}
          barStyle={navigationStyle}
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
        />
      </View>
    );
  } else {
    return (
      <View style={{ flex: 1 }}>
        <AppContainer  style={{ flex: 1 }}>
          </AppContainer>
      </View>
    );
  }
}
