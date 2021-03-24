import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { BottomNavigation, Appbar } from "react-native-paper";
import ChatRoute from "../routes/ChatRoute";
import EventsRoute from "../routes/EventsRoute";
import ProfileRoute from "../routes/ProfileRoute";
import MatchesRoute from "../routes/MatchesRoute";
import SettingRoute from "../routes/SettingsRoute";
import Header from "../components/Header";
import AppLoading from "expo-app-loading";

// import useFonts hook
import {
  useFonts,
  Poppins_100Thin,
  Poppins_700Bold,
  Poppins_500Medium_Italic,
  Poppins_300Light,
} from "@expo-google-fonts/poppins";
import WavyHeader from "../components/WavyHeader";

const customFonts = {
  Poppins_100Thin,
  Poppins_700Bold,
  Poppins_500Medium_Italic,
  Poppins_300Light,
};

export default function App() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "matches", title: "Matches", icon: "account-multiple" },
    { key: "events", title: "Events", icon: "calendar-blank" },
    { key: "chat", title: "Chat", icon: "chat" },
    { key: "profile", title: "Profile", icon: "account" },
    { key: "setting", title: "Setting", icon: "cog" },
  ]);

  // the same as Font.loadAsync , the hook returns  true | error
  const [isLoaded] = useFonts(customFonts);

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

  if (!isLoaded) {
    return <AppLoading />;
  }

  const styles = StyleSheet.create({
    // rest of the styles
    svgCurve: {
      position: "relative",
      top: 0,
      width: Dimensions.get("window").width,
      height: 140,
      backgroundColor: "#f6f6f6",
    },
    headerText: {
      fontSize: 30,
      // fontWeight: 'bold',
      // change the color property for better output
      color: "#fff",
      textAlign: "center",
      marginTop: 40,
      zIndex: 1000,
      fontFamily: "Poppins_500Medium_Italic",
    },
    headerContainer: {
      position: "absolute",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
  });

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {/* <StatusBar hidden={true} /> */}
      {/* <Header /> */}
      <WavyHeader
        customStyles={styles.svgCurve}
        customHeight={100}
        customTop={70}
        customBgColor="#8860D0"
        customWavePattern="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>SolMate</Text>
      </View>
      <BottomNavigation
        activeColor={"#8860D0"}
        barStyle={navigationStyle}
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    </View>
  );
}
