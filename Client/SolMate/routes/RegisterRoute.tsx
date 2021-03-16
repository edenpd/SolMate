import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Input, Button, CheckBox } from "react-native-elements";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from "expo-auth-session";
import useToken from "../hooks/useToken";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    spotifyToken,
    setSpotifyToken,
    isSpotifyTokenSet,
    setToken,
    token,
  } = useToken();

  WebBrowser.maybeCompleteAuthSession();

  // Endpoint
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
        native: "exp://10.100.102.3:19000",
      }),
    },
    discovery
  );

  useEffect(() => {
    return () => {
      if (response) {
        if (response?.type === "success") {
          const { access_token } = response.params;
          setSpotifyToken(access_token);
          if (access_token) {
            axios
              .post(
                "http://10.100.102.3:3001/spotify/auth",
                { token: access_token },
                {
                  headers: { "Content-Type": "application/json" },
                }
              )
              .then(async (response) => {
                console.log(JSON.stringify(await response.data.body));
              })
              .catch((error) => Alert.alert(error.message));
          }
        }
      }
    };
  }, [response]);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, display: 'flex', }}
    >
      <View style={registerStyle.registerContainer}>
        <View style={{ width: "80%", display:"flex",flex:1,alignItems: "center",marginTop:50 }}>
          <Input
            label="Email"
            errorStyle={{ color: "red" }}
          />
          <Input
            label="Password"
            secureTextEntry={true}
            errorStyle={{ color: "red" }}
          />
          <Input
            label="Confirm Password"
            errorStyle={{ color: "red" }}
            secureTextEntry={true}
          />
          <Input
            label="Full Name"
            errorStyle={{ color: "red" }}
          />
        </View>
        <Text style={{ width: "100%", alignSelf: "center", textAlign: "center" }}>Sex</Text>

        <View style={{ flexDirection: "row" }}>
          <CheckBox
            center
            title='Male'
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            // checked={this.state.checked}
            containerStyle={{ backgroundColor: "rgba(0, 0, 0, 0)", borderColor: "rgba(0, 0, 0, 0)" }}

          />
          <CheckBox
            center
            title='Female'
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            // checked={this.state.checked}
            containerStyle={{ backgroundColor: "rgba(0, 0, 0, 0)", borderColor: "rgba(0, 0, 0, 0)" }}
          />
        </View>

        <Text style={{ width: "100%", alignSelf: "center", textAlign: "center" }}>Intrested Sex</Text>

        <View style={{ flexDirection: "row" }}>
          <CheckBox
            center
            title='Male'
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            // checked={this.state.checked}
            containerStyle={{ backgroundColor: "rgba(0, 0, 0, 0)", borderColor: "rgba(0, 0, 0, 0)" }}

          />
          <CheckBox
            center
            title='Female'
            checkedIcon='dot-circle-o'
            uncheckedIcon='circle-o'
            // checked={this.state.checked}
            containerStyle={{ backgroundColor: "rgba(0, 0, 0, 0)", borderColor: "rgba(0, 0, 0, 0)" }}
          />
        </View>
        <View style={{ width: "80%" }}>

        </View>
        <TouchableOpacity
          style={registerStyle.SpotifyButton}
          activeOpacity={0.5}
          onPress={() => {
            promptAsync();
          }}
        >
          <Image
            source={require("../assets/spotify-logo-white.png")}
            style={registerStyle.buttonImageIconStyle}
          />
          <Text style={registerStyle.buttonTextStyle}> Login Using Spotify </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const registerStyle = StyleSheet.create({
  registerContainer: {
    width: "100%",
    // height: 100,
    color: "#fff",

    alignItems: "center",
    alignContent: "center",
    display: "flex",
    flex: 1,
    justifyContent: "center",
    flexDirection: "column",
    // maxHeight: 700,
  },
  SpotifyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1ed65f",
    borderWidth: 0.5,
    borderColor: "#fff",
    height: 40,
    borderRadius: 50,
    margin: 5,
  },
  buttonImageIconStyle: {
    padding: 10,
    margin: 5,
    height: 25,
    width: 25,
    resizeMode: "stretch",
  },
  buttonTextStyle: {
    color: "#fff",
    marginBottom: 4,
    marginLeft: 10,
  },
});
