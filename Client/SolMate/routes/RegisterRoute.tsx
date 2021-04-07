import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  Input,
  CheckBox,
  Divider,
  Image,
  SearchBar,
  Button,
} from "react-native-elements";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  ResponseType,
} from "expo-auth-session";
import useToken from "../hooks/useToken";
import DateTimePicker from "@react-native-community/datetimepicker";
import { IconButton } from "react-native-paper";
import Slider from "@react-native-community/slider";
import MultiSlider from "react-native-multi-slider";
import RangeSlider from "rn-range-slider";
import Label from "../components/RangeSlider/Label";
import Rail from "../components/RangeSlider/Rail";
import Notch from "../components/RangeSlider/Notch";
import Thumb from "../components/RangeSlider/Thumb";
import RailSelected from "../components/RangeSlider/RailSelected";
import useDate, { LOCALE } from "../hooks/useDate";
import { userContext } from "../contexts/userContext";
import { tokenContext } from "../contexts/tokenContext";
import { SERVER_ADDRESS, SERVER_PORT } from '@env';
import { EXPO_ADDRESS , EXPO_PORT} from "@env";

export interface IUserForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  fullName: string;
  description: string;
  sex: number;
  birthday: Date;
  picture: string;
  interestedSex: number;
  interestedAgeMin: number;
  interestedAgeMax: number;
  Songs: Array<string>;
}

export default function Register({ navigation }) {
  const {
    date,
    mode,
    show,
    showDatepicker,
    showTimepicker,
    onChangeDate,
    setShow,
  } = useDate();
  var currentDateMoreThan18 = new Date();
  currentDateMoreThan18.setFullYear(new Date().getFullYear() - 18);
  const [isLoading, setIsLoading] = useState(false);
  const [search, updateSearch] = useState("");
  const [noSpotify, setNoSpotify] = useState(false);
  const [errors, setErrors] = useState({});
  const { dispatch } = useContext(userContext);
  const { token,dispatchToken } = useContext(tokenContext);

  const [formData, setFormData] = useState<IUserForm>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    fullName: "",
    description: "",
    sex: 0,
    birthday: date,
    picture: "",
    interestedSex: 1,
    interestedAgeMin: 18,
    interestedAgeMax: 24,
    Songs: [""],
  });

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
        native: `exp://${EXPO_ADDRESS}:${EXPO_PORT}`,
      }),
    },
    discovery
  );

  useEffect(() => {
    return () => {
      if (response) {
        if (response?.type === "success") {
          const { access_token } = response.params;
          if (access_token) {
            dispatchToken({ type: "SET_SPOTIFY_TOKEN", payload: access_token });
            axios
              .post(
                `${SERVER_ADDRESS}:${SERVER_PORT}/spotify/auth`,
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

  const handleChange = (name, value) => {
    setFormData((prevstate) => {
      return {
        ...prevstate,
        [name]: value as Pick<IUserForm, keyof IUserForm>,
      };
    });
  };
  async function uploadPic(credentials, token) {
    const formData = new FormData();

    formData.append("myImage", credentials.pictureFile);
    formData.append("userId", credentials.email);

    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    axios
      .post(`${SERVER_ADDRESS}:${SERVER_PORT}/user/uploadProfile`, formData, config)
      .then((response) => {
        return response;
      })
      .catch((error) => Alert.alert(JSON.stringify(error)));
  }

  const onChangeDateInput = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    onChangeDate(event, currentDate);
    setFormData((prevstate) => {
      return {
        ...prevstate,
        birthday: currentDate,
      };
    });
  };

  const onSubmit = async () => {
    formData.firstName = formData.fullName.split(" ").slice(0, -1).join(" ");
    formData.lastName = formData.fullName.split(" ").slice(-1).join(" ");
    // console.log(formData);

    await axios
      .post(`${SERVER_ADDRESS}:${SERVER_PORT}/user/register`, formData, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        // var res = uploadPic(formData, response.data.token);
        dispatch({ type: "SET_USER", payload: response.data.user });
        dispatchToken({ type: "SET_TOKEN", payload: response.data.token });
        navigation.navigate("Login");
      })
      .catch((err) => {
        Alert.alert(JSON.stringify(err));
      });
  };

  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback((value) => <Label text={value} />, []);
  const renderNotch = useCallback(() => <Notch />, []);

  const handleValueChange = useCallback((low, high) => {
    setFormData((prevstate) => {
      return {
        ...prevstate,
        interestedAgeMin: low,
        interestedAgeMax: high,
      };
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, display: "flex" }}>
      <View style={registerStyle.registerContainer}>
        {show && (
          <DateTimePicker
            maximumDate={currentDateMoreThan18}
            testID="dateTimePicker"
            value={currentDateMoreThan18}
            mode={"date"}
            display="default"
            onChange={onChangeDateInput}
          />
        )}
        <View
          style={{
            width: "80%",
            display: "flex",
            flex: 1,
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <Input
            label="Email"
            onChangeText={(value) => handleChange("email", value)}
            errorStyle={{ color: "red" }}
          />
          <Input
            label="Password"
            onChangeText={(value) => handleChange("password", value)}
            secureTextEntry={true}
            errorStyle={{ color: "red" }}
          />
          <Input
            onChangeText={(value) => handleChange("confirmPassword", value)}
            value={formData.confirmPassword}
            label="Confirm Password"
            errorStyle={{ color: "red" }}
            secureTextEntry={true}
          />
          <Input
            label="Full Name"
            value={formData.fullName}
            onChangeText={(value) => handleChange("fullName", value)}
            errorStyle={{ color: "red" }}
            labelStyle={{}}
          />
          <Input
            label="Date"
            value={date.toLocaleDateString(LOCALE)}
            // editable={false}
            style={{ padding: 0 }}
            onTouchStart={showDatepicker}
          />
        </View>
        <Text
          style={{
            width: "77%",
            alignSelf: "center",
            textAlign: "left",
            fontWeight: "bold",
            fontSize: 17,
            color: "#87949f",
          }}
        >
          Sex
        </Text>

        <View
          style={{
            flexDirection: "row",
            width: "80%",
            justifyContent: "flex-start",
            alignContent: "flex-start",
          }}
        >
          <CheckBox
            center
            title="Male"
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            checkedColor="purple"
            checked={formData.sex == 0}
            onPress={(value) => handleChange("sex", 0)}
            containerStyle={{
              backgroundColor: "rgba(0, 0, 0, 0)",
              borderColor: "rgba(0, 0, 0, 0)",
              justifyContent: "flex-start",
            }}
          />
          <CheckBox
            center
            title="Female"
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            checkedColor="purple"
            checked={formData.sex == 1}
            onPress={(value) => handleChange("sex", 1)}
            containerStyle={{
              backgroundColor: "rgba(0, 0, 0, 0)",
              borderColor: "rgba(0, 0, 0, 0)",
              justifyContent: "flex-start",
            }}
          />
        </View>

        <Text
          style={{
            width: "77%",
            alignSelf: "center",
            textAlign: "left",
            fontWeight: "bold",
            fontSize: 17,
            color: "#87949f",
          }}
        >
          Intrested Sex
        </Text>

        <View
          style={{
            flexDirection: "row",
            width: "80%",
            justifyContent: "flex-start",
            alignContent: "flex-start",
          }}
        >
          <CheckBox
            center
            title="Male"
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            checkedColor="purple"
            onPress={(value) => handleChange("interestedSex", 0)}
            checked={formData.interestedSex == 0}
            containerStyle={{
              backgroundColor: "rgba(0, 0, 0, 0)",
              borderColor: "rgba(0, 0, 0, 0)",
            }}
          />
          <CheckBox
            center
            title="Female"
            checkedIcon="dot-circle-o"
            uncheckedIcon="circle-o"
            checkedColor="purple"
            checked={formData.interestedSex == 1}
            onPress={(value) => handleChange("interestedSex", 1)}
            containerStyle={{
              backgroundColor: "rgba(0, 0, 0, 0)",
              borderColor: "rgba(0, 0, 0, 0)",
            }}
          />
        </View>

        <View
          style={{
            width: "100%",
            flex: 1,
            margin: 15,
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              width: "77%",
              alignSelf: "center",
              textAlign: "left",
              color: "#87949f",
              fontWeight: "bold",
              fontSize: 17,
            }}
          >
            What the range of ages you are looking for :
          </Text>
          <RangeSlider
            style={{ width: "80%", marginVertical: 20 }}
            min={18}
            max={120}
            step={1}
            floatingLabel
            low={formData.interestedAgeMin}
            high={formData.interestedAgeMax}
            renderThumb={renderThumb}
            renderRail={renderRail}
            renderRailSelected={renderRailSelected}
            renderLabel={renderLabel}
            renderNotch={renderNotch}
            onValueChanged={handleValueChange}
          />
        </View>

        <View style={{ marginVertical: 8, width: "100%" }}>
          <TouchableOpacity
            style={[
              registerStyle.SpotifyButton,
              noSpotify ? { opacity: 0.3 } : { opacity: 1 },
            ]}
            activeOpacity={0.5}
            disabled={noSpotify}
            onPress={() => {
              promptAsync();
            }}
          >
            <Text style={registerStyle.buttonTextStyle}>
              {" "}
              Login Using Spotify{" "}
            </Text>
            <Image
              source={require("../assets/spotify-logo-black.png")}
              containerStyle={registerStyle.buttonImageIconStyle}
            />
          </TouchableOpacity>
          {!response && (
            <>
              <Divider
                style={{
                  height: 2,
                  margin: 20,
                  width: "70%",
                  alignSelf: "center",
                }}
              />

              <View
                style={{
                  borderWidth: 2,
                  borderColor: "#cccccc",
                  borderRadius: 8,
                  width: "80%",
                  alignSelf: "center",
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={{
                    padding: 10,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                  onPress={() =>
                    setNoSpotify((prevState) => {
                      return !prevState;
                    })
                  }
                >
                  <Text
                    style={[
                      registerStyle.buttonTextStyle,
                      {
                        alignSelf: "flex-start",
                        fontSize: 20,
                        color: "#333333",
                      },
                    ]}
                  >
                    I don't want to use Spotify
                  </Text>
                  <Icon
                    name={noSpotify ? "arrow-up" : "arrow-down"}
                    size={20}
                    color="#333333"
                  />
                </TouchableOpacity>

                {noSpotify && (
                  <View style={{ padding: 20 }}>
                    <Text
                      style={{
                        alignSelf: "flex-start",
                        fontSize: 17,
                        color: "#333333",
                      }}
                    >
                      Search your favorite songs:
                    </Text>
                    <SearchBar
                      platform="default"
                      inputContainerStyle={{
                        borderRadius: 40,
                        backgroundColor: "#333333",
                      }}
                      inputStyle={{
                        borderRadius: 20,
                      }}
                      containerStyle={{
                        borderRadius: 20,
                        backgroundColor: "#333333",
                        marginTop: 20,
                      }}
                    />
                  </View>
                )}
              </View>
            </>
          )}
          <View
            style={{ marginVertical: 40, width: "70%", alignSelf: "center" }}
          >
            <Button
              title="Submit"
              titleStyle={{ fontSize: 20 }}
              loading={isLoading}
              onPress={() => onSubmit()}
              buttonStyle={{
                backgroundColor: "purple",
                width: "100%",
                borderRadius: 50,
              }}
            />
          </View>
        </View>
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
    justifyContent: "center",
    flexDirection: "column",
    // maxHeight: 700,
  },
  SpotifyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1ed65f",
    opacity: 0.3,
    alignSelf: "center",
    justifyContent: "space-between",
    width: "55%",
    borderColor: "#fff",
    height: "15%",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,

    elevation: 12,
    margin: 5,
  },
  buttonImageIconStyle: {
    marginRight: 18,
    height: 30,
    width: 30,
    backgroundColor: "transparent",
    alignSelf: "center",
    borderRadius: 200,
  },
  buttonTextStyle: {
    alignItems: "center",
    alignContent: "center",
    marginLeft: 10,
    fontSize: 23,
    fontWeight: "bold",
  },
});
