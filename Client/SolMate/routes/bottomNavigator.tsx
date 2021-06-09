import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, Dimensions, BackHandler } from "react-native";
import BottomNavigation, {
  FullTab,
} from "react-native-material-bottom-navigation";
import ChatRoute from "../routes/ChatRoute";
import EventsRoute from "../routes/EventsRoute";
import ProfileRoute from "../routes/ProfileRoute";
import MatchesRoute from "../routes/MatchesRoute";
import SettingRoute from "../routes/SettingsRoute";
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
import { Image } from "react-native-elements/dist/image/Image";
import { tokenContext } from "../contexts/tokenContext";
import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from "expo-auth-session";
import { EXPO_ADDRESS, EXPO_PORT } from "@env";
import { Icon } from "react-native-elements";

const customFonts = {
  Poppins_100Thin,
  Poppins_700Bold,
  Poppins_500Medium_Italic,
  Poppins_300Light,
};

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const { token } = useContext(tokenContext);
  const [activeTab, setActiveTab] = useState<number | string>("matches");
  // the same as Font.loadAsync , the hook returns  true | error

  const renderPage = (key: string | number) => {
    switch (key) {
      case "matches":
        return <MatchesRoute></MatchesRoute>;
      case "events":
        return <EventsRoute></EventsRoute>;
      case "chat":
        return <ChatRoute></ChatRoute>;
      case "profile":
        return <ProfileRoute></ProfileRoute>;
      case "settings":
        return <SettingRoute></SettingRoute>;
    }
  };

  const tabs = [
    {
      key: "matches",
      icon: "favorite",
      label: "Matches",
      barColor: "white",
      pressColor: "rgba(255, 255, 255, 0.16)",
    },
    {
      key: "events",
      icon: "event",
      label: "Events",
      barColor: "white",
      pressColor: "rgba(255, 255, 255, 0.16)",
    },
    {
      key: "chat",
      icon: "chat",
      label: "Chat",
      barColor: "white",
      pressColor: "rgba(255, 255, 255, 0.16)",
    },
    {
      key: "profile",
      icon: "person",
      label: "Profile",
      barColor: "white",
      pressColor: "rgba(255, 255, 255, 0.16)",
    },
    {
      key: "settings",
      icon: "settings",
      label: "Settings",
      barColor: "white",
      pressColor: "rgba(255, 255, 255, 0.16)",
    },
  ];

  const renderIcon =
    (icon) =>
    ({ isActive }) =>
      <Icon size={24} color={isActive ? "#8860D0" : "grey"} name={icon} />;

  const renderTab = ({ tab, isActive }) => (
    <FullTab
      labelStyle={{ color: isActive ? "#8860D0" : "grey" }}
      isActive={isActive}
      key={tab.key}
      label={tab.label}
      renderIcon={renderIcon(tab.icon)}
    />
  );

  const [isLoaded] = useFonts(customFonts);
  const discovery = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
  };
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: "b5497b2f8f6441fa8449f7a108920552",
      scopes: [
        "user-read-private",
        "user-read-email",
        "user-top-read",
        "user-read-recently-played",
      ],
      responseType: ResponseType.Token,
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        native: `exp://${EXPO_ADDRESS}:${EXPO_PORT}`,
      }),
    },
    discovery
  );

  const handleBackButton = () => {
    return token.token;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackButton);
  }, []);

  const navigationStyle = {
    backgroundColor: "white",
  };

  if (!isLoaded) {
    return <AppLoading />;
  }

  const styles = StyleSheet.create({
    svgCurve: {
      position: "relative",
      top: 0,
      width: Dimensions.get("window").width,
      height: 140,
      backgroundColor: "#f6f6f6",
    },
    headerText: {
      fontSize: 30,
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
    logoImage: {
      alignSelf: "center",
      marginTop: 20,
      zIndex: 1000,
      position: "relative",
      width: 180,
      height: 100,
    },
  });

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <WavyHeader
        customStyles={styles.svgCurve}
        customHeight={100}
        customTop={70}
        customBgColor="#8860D0"
        customWavePattern="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      />
      <View style={styles.headerContainer}>
        {/* <Text style={styles.headerText}>SolMate</Text> */}
        <Image
          resizeMode="contain"
          source={require("../assets/solmate_white.png")}
          style={styles.logoImage}
        />
      </View>
      <View style={{ flex: 1 }}>{renderPage(activeTab)}</View>
      <BottomNavigation
        activeTab={activeTab}
        onTabPress={(newTab) => setActiveTab(newTab.key)}
        renderTab={renderTab}
        tabs={tabs}
      />
    </View>
  );
}
