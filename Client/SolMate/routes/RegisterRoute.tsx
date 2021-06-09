import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  Input,
  CheckBox,
  Divider,
  Image,
  SearchBar,
  Button,
  ListItem,
  Avatar,
} from "react-native-elements";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest, ResponseType } from "expo-auth-session";
import useToken from "../hooks/useToken";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import RangeSlider from "rn-range-slider";
import Label from "../components/RangeSlider/Label";
import Rail from "../components/RangeSlider/Rail";
import Notch from "../components/RangeSlider/Notch";
import Thumb from "../components/RangeSlider/Thumb";
import RailSelected from "../components/RangeSlider/RailSelected";
import useDate, { LOCALE } from "../hooks/useDate";
import { userContext } from "../contexts/userContext";
import { tokenContext } from "../contexts/tokenContext";
import { SERVER_ADDRESS, SERVER_PORT } from "@env";
import {
  EXPO_ADDRESS,
  EXPO_PORT,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_CLIENT_ID,
} from "@env";
import * as ImagePicker from "expo-image-picker";
import { encode as btoa } from "base-64";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import Slider from "@react-native-community/slider";

WebBrowser.maybeCompleteAuthSession();

export interface IUserForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  fullName: string;
  spotifyAccessToken: string;
  spotifyRefreshToken: string;
  expiresIn: number;
  description: string;
  sex: number;
  birthday: Date;
  picture: string;
  interestedSex: number;
  interestedAgeMin: number;
  interestedAgeMax: number;
  Artists: Array<Object>;
  location: Object;
  radiusSearch: number;
}

export default function Register({ navigation }): JSX.Element {
  const { date, show, showDatepicker, onChangeDate, setShow } = useDate();
  var currentDateMoreThan18 = new Date();
  currentDateMoreThan18.setFullYear(new Date().getFullYear() - 18);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [noSpotify, setNoSpotify] = useState(false);
  const [errors, setErrors] = useState({});
  const { dispatch } = useContext(userContext);
  const { dispatchToken } = useContext(tokenContext);
  const [image, setImage] = useState(null);
  const [artistList, setArtistList] = useState([]);
  const [checkedArtistList, setCheckedArtistList] = useState([
    { id: "", name: "", images: [{ url: "" }] },
  ]);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [formData, setFormData] = useState<IUserForm>({
    email: "",
    password: "",
    confirmPassword: "",
    spotifyAccessToken: "",
    spotifyRefreshToken: "",
    expiresIn: 0,
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
    Artists: [],
    location: "",
    radiusSearch: 1,
  });

  WebBrowser.maybeCompleteAuthSession();
  // Endpoint
  const discovery = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
  };
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: [
        "user-read-private",
        "user-read-email",
        "user-top-read",
        "user-read-recently-played",
        "user-follow-read",
        "user-library-read",
        "playlist-modify",
        "user-read-private",
      ],
      // responseType: ResponseType.Token,
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      // For usage in managed apps using the proxy
      redirectUri: `exp://${EXPO_ADDRESS}:${EXPO_PORT}`,
    },
    discovery
  );
  function validate() {
    let input = formData;
    let errors = {};
    let isValid = true;

    if (!input["fullName"]) {
      isValid = false;
      errors["name"] = "Please enter your name.";
    }
    var pattern = new RegExp(/\b\D*?\b(?:\s+\b\D*?\b)+/);
    if (!pattern.test(input["fullName"])) {
      isValid = false;
      errors["name"] = "Please enter valid full name .";
    }

    if (!input["email"]) {
      isValid = false;
      errors["email"] = "Please enter your email Address.";
    }

    if (typeof input["email"] !== "undefined") {
      pattern = new RegExp(
        /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
      );
      if (!pattern.test(input["email"])) {
        isValid = false;
        errors["email"] = "Please enter valid email address.";
      }
    }
    if (!input["password"]) {
      isValid = false;
      errors["password"] = "Please enter your password.";
    }

    if (!input["confirmPassword"]) {
      isValid = false;
      errors["confirm_password"] = "Please enter your confirm password.";
    }

    if (!input["birthday"]) {
      isValid = false;
      errors["birthday"] = "Please enter your birthday.";
    }

    // if (!input["picture"]) {
    //   isValid = false;
    //   errors["picture"] = "Please choose profile pic.";
    // }
    if (!acceptTerms) {
      isValid = false;
      errors["acceptTerms"] = "Please accept our terms to register.";
    }

    if (!checkedArtistList[1] && !response) {
      errors["SpotifyOrArtist"] =
        "Please connect to spotify or Choose your favorite artists";
    }

    if (
      typeof input["password"] !== "undefined" &&
      typeof input["confirmPassword"] !== "undefined"
    ) {
      if (input["password"] !== input["confirmPassword"]) {
        isValid = false;
        errors["password"] = "Passwords don't match.";
        errors["confirm_password"] = "Passwords don't match.";
      }
    }
    setErrors(errors);

    return isValid;
  }

  const handleChange = (name, value) => {
    setFormData((prevstate) => {
      return {
        ...prevstate,
        [name]: value as Pick<IUserForm, keyof IUserForm>,
      };
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  async function uploadPic(credentials, token) {
    const formData = new FormData();
    let filename = credentials.pictureFile.split("/").pop();

    // Infer the type of the image
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    formData.append("myImage", {
      uri: credentials.pictureFile,
      name: filename,
      type,
    });
    formData.append("userId", credentials.email);

    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    axios
      .post(
        `${SERVER_ADDRESS}:${SERVER_PORT}/user/uploadProfile`,
        formData,
        config
      )
      .then((response) => {
        return response;
      })
      .catch((error) => Alert.alert(JSON.stringify(error)));
  }

  const onChangeDateInput = (selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    onChangeDate(currentDate);
    setFormData((prevstate) => {
      return {
        ...prevstate,
        birthday: currentDate,
      };
    });
  };

  const onSubmit = async () => {
    if (validate()) {
      formData.firstName = formData.fullName.split(" ").slice(0, -1).join(" ");
      formData.lastName = formData.fullName.split(" ").slice(-1).join(" ");
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status != "granted") {
        console.log("PERMISSION NOT GRANRED");
      }
      const location = await Location.getCurrentPositionAsync();
      console.log("location is ", location);
      formData.location = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      for (var i = 0; i < checkedArtistList.length; i++) {
        if (checkedArtistList[i].id) {
          formData.Artists.push({
            id: checkedArtistList[i].id,
            name: checkedArtistList[i].name,
            images: checkedArtistList[i].images,
          });
        }
      }

      await axios
        .post(`${SERVER_ADDRESS}:${SERVER_PORT}/user/register`, formData, {
          headers: { "Content-Type": "application/json" },
        })
        .then(async (response) => {
          // var res = uploadPic(formData, response.data.token);
          dispatch({ type: "SET_USER", payload: response.data.user });
          dispatchToken({ type: "SET_TOKEN", payload: response.data.token });
          await uploadPic(
            { email: response.data.user.email, pictureFile: image },
            response.data.token
          );
          navigation.navigate("Login");
        })
        .catch((err) => {
          Alert.alert(JSON.stringify(err));
        });
    }
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

  const updateSearch = async (search) => {
    setSearch(search);
    if (search !== "") {
      await axios
        .post(
          `${SERVER_ADDRESS}:${SERVER_PORT}/spotify/search/artist`,
          { artistName: search },
          {
            headers: { "Content-Type": "application/json" },
          }
        )
        .then((response) => {
          setArtistList(response.data.items);
        })
        .catch((err) => {
          Alert.alert(JSON.stringify(err));
        });
    } else {
      setArtistList([]);
    }
  };

  const updateChecked = (item) => {
    if (checkedArtistList.find((x) => x.id == item.id) == undefined) {
      setCheckedArtistList((state) => {
        return [...state, item];
      });
    } else {
      setCheckedArtistList((state) =>
        state.filter((item2) => item2.id !== item.id)
      );
    }
  };

  const keyExtractor = (item, index) => index.toString();

  const renderItem = ({ item }) => {
    if (item && item.images && item.name) {
      return (
        <ListItem
          bottomDivider
          containerStyle={{
            borderRadius: 20,
            backgroundColor: "#8860D0",
            marginBottom: 5,
            padding: 5,
          }}
        >
          <CheckBox
            onPress={() => updateChecked(item)}
            checkedColor={"white"}
            checked={
              checkedArtistList.find((x) => x.id == item.id) ? true : false
            }
          />
          {item.images[0] && (
            <Avatar rounded source={{ uri: item.images[0].url }} />
          )}
          <ListItem.Content>
            <ListItem.Title style={{ color: "white", fontWeight: "bold" }}>
              {item.name}
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: 10,
      }}
      scrollEnabled={true}
    >
      <View style={registerStyle.registerContainer}>
        <DateTimePickerModal
          maximumDate={currentDateMoreThan18}
          testID="dateTimePicker"
          date={currentDateMoreThan18}
          isVisible={show}
          mode={"date"}
          display="spinner"
          onCancel={() => {
            setShow(false);
          }}
          onConfirm={onChangeDateInput}
        />
        <View
          style={{
            width: "80%",
            display: "flex",
            flex: 1,
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.5}
            style={{
              borderRadius: 30,
            }}
            onPress={pickImage}
          >
            <View
              style={{
                flexDirection: "row",
                marginVertical: 20,
                display: "flex",
                alignItems: "center",
              }}
            >
              {image && (
                <Image
                  source={{ uri: image }}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                    display: "flex",
                  }}
                >
                  <Image
                    source={require("../assets/plus.png")}
                    style={{ width: 50, height: 50 }}
                  />
                </Image>
              )}
              {!image && (
                <Image
                  source={require("../assets/user-icon-no-plus.png")}
                  style={{
                    width: 200,
                    height: 200,
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                    display: "flex",
                  }}
                >
                  <Image
                    source={require("../assets/plus.png")}
                    style={{ width: 50, height: 50 }}
                  />
                </Image>
              )}
            </View>
          </TouchableOpacity>
          <Input
            label="Email"
            onChangeText={(value) => handleChange("email", value)}
            errorStyle={{ color: "red" }}
            errorMessage={errors["email"]}
          />
          <Input
            label="Password"
            onChangeText={(value) => handleChange("password", value)}
            secureTextEntry={true}
            errorStyle={{ color: "red" }}
            errorMessage={errors["password"]}
          />
          <Input
            onChangeText={(value) => handleChange("confirmPassword", value)}
            value={formData.confirmPassword}
            label="Confirm Password"
            errorStyle={{ color: "red" }}
            errorMessage={errors["confirm_password"]}
            secureTextEntry={true}
          />
          <Input
            label="Full Name"
            value={formData.fullName}
            onChangeText={(value) => handleChange("fullName", value)}
            errorStyle={{ color: "red" }}
            errorMessage={errors["name"]}
            labelStyle={{}}
          />
          <Input
            label="Date"
            value={date.toLocaleDateString(LOCALE)}
            // editable={false}
            style={{ padding: 0 }}
            errorStyle={{ color: "red" }}
            errorMessage={errors["birthday"]}
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
            checkedColor="#8860D0"
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
            checkedColor="#8860D0"
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
          Interested Sex
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
            checkedColor="#8860D0"
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
            checkedColor="#8860D0"
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
            What ages are you looking for?
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
            How far should we search for you?
          </Text>
          <Slider
            style={{ width: "80%", marginVertical: 20 }}
            thumbTintColor="#8860D0"
            minimumTrackTintColor="#8860D0"
            minimumValue={0}
            maximumValue={120}
            step={1}
            value={formData.radiusSearch}
            onValueChange={(value) =>
              setFormData((prevstate) => {
                return {
                  ...prevstate,
                  radiusSearch: value,
                };
              })
            }
          />
        </View>
        <View style={{ marginVertical: 8, width: "100%" }}>
          <TouchableOpacity
            style={[
              registerStyle.SpotifyButton,
              response || noSpotify || checkedArtistList[1]
                ? { opacity: 0.3 }
                : { opacity: 1 },
            ]}
            activeOpacity={
              response || noSpotify || checkedArtistList[1] ? 0.5 : 1
            }
            disabled={
              response !== null ||
              noSpotify ||
              checkedArtistList[1] !== undefined
            }
            onPress={() => {
              promptAsync().then(async (response) => {
                if (response) {
                  if (response?.type === "success") {
                    const { code } = response.params;
                    const credsB64 = btoa(
                      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
                    );
                    const tokenResponse = await fetch(
                      "https://accounts.spotify.com/api/token",
                      {
                        method: "POST",
                        headers: {
                          Authorization: `Basic ${credsB64}`,
                          "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: `grant_type=authorization_code&code=${code}&redirect_uri=${`exp://${EXPO_ADDRESS}:${EXPO_PORT}`}`,
                      }
                    );
                    const responseJson = await tokenResponse.json();
                    // destructure the response and rename the properties to be in camelCase to satisfy my linter ;)
                    const {
                      access_token: accessToken,
                      refresh_token: refreshToken,
                      expires_in: expiresIn,
                    } = responseJson;

                    formData.spotifyAccessToken = accessToken;
                    formData.spotifyRefreshToken = refreshToken;
                    formData.expiresIn = expiresIn;
                  }
                }
              });
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
                      Search your favorite artists:
                    </Text>
                    <SearchBar
                      platform="default"
                      inputContainerStyle={{
                        borderRadius: 40,
                        backgroundColor: "#8860D0",
                      }}
                      inputStyle={{
                        borderRadius: 20,
                        color: "white",
                      }}
                      containerStyle={{
                        borderRadius: 20,
                        backgroundColor: "#8860D0",
                        marginTop: 20,
                      }}
                      searchIcon={{ color: "white" }}
                      clearIcon={{ color: "white" }}
                      onChangeText={updateSearch}
                      value={search}
                    />
                    <View
                      style={{
                        width: "100%",
                      }}
                    >
                      <FlatList
                        style={{ marginTop: 5 }}
                        keyExtractor={keyExtractor}
                        data={checkedArtistList.concat(
                          artistList.filter(
                            (item) =>
                              !checkedArtistList.find((x) => x.id == item.id)
                          )
                        )}
                        renderItem={renderItem}
                      />
                    </View>
                  </View>
                )}
              </View>
            </>
          )}
          <Text style={{ color: "red", paddingHorizontal: 40, paddingTop: 20 }}>
            {errors["SpotifyOrArtist"]}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 40,
              paddingTop: 20,
            }}
          >
            <CheckBox
              onPress={() => setAcceptTerms((prev) => !prev)}
              checkedColor={"#8860D0"}
              containerStyle={{ paddingHorizontal: 0 }}
              checked={acceptTerms}
            />
            <Text numberOfLines={1}>
              I accept to share my personal information on "SolMate" app
            </Text>
          </View>
          <Text style={{ color: "red", paddingHorizontal: 40 }}>
            {errors["acceptTerms"]}
          </Text>

          <View
            style={{ marginVertical: 20, width: "70%", alignSelf: "center" }}
          >
            <Button
              title="Submit"
              titleStyle={{ fontSize: 20 }}
              loading={isLoading}
              onPress={() => onSubmit()}
              buttonStyle={{
                backgroundColor: "#8860D0",
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
    color: "#fff",
    flex: 1,
    alignItems: "center",
    alignContent: "center",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  SpotifyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1ed65f",
    opacity: 0.3,
    alignSelf: "center",
    paddingHorizontal: 10,
    justifyContent: "space-between",
    width: 300,
    borderColor: "#fff",
    height: 50,
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
