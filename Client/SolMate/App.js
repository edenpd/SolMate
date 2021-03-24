import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BottomNavigation, Appbar } from "react-native-paper";
import ChatRoute from "./routes/ChatRoute";
import EventsRoute from "./routes/EventsRoute";
import ProfileRoute from "./routes/ProfileRoute";
import MatchesRoute from "./routes/MatchesRoute";
import Header from "./components/Header";
import SettingRoute from "./routes/SettingsRoute";

export default function App() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "matches", title: "Matches", icon: "account-multiple" },
    { key: "events", title: "Events", icon: "calendar-blank" },
    { key: "chat", title: "Chat", icon: "chat" },
    { key: "profile", title: "Profile", icon: "account" },
    { key: "setting", title: "Setting", icon: "cog" },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    matches: MatchesRoute,
    events: EventsRoute,
    chat: ChatRoute,
    profile: ProfileRoute,
    setting: SettingRoute,
  });

  const navigationStyle = {
    backgroundColor: "white",
  };

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <Header />
      <BottomNavigation
        activeColor={"purple"}
        barStyle={navigationStyle}
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    </View>
  );
}
