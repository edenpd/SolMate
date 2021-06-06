import React, { useCallback, useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";
import {
  CheckBox,
  Image,
  Input,
  ListItem,
  Avatar,
  SearchBar,
  Divider,
} from "react-native-elements";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import useDate, { LOCALE } from "../hooks/useDate";
import {
  SERVER_ADDRESS,
  SERVER_PORT,
  EXPO_ADDRESS,
  EXPO_PORT,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_CLIENT_ID,
} from "@env";
import axios from "axios";
//import { Label } from "react-native-clean-form";
import * as ImagePicker from "expo-image-picker";
import RangeSlider from "rn-range-slider";
import Label from "../components/RangeSlider/Label";
import Thumb from "../components/RangeSlider/Thumb";
import Rail from "../components/RangeSlider/Rail";
import RailSelected from "../components/RangeSlider/RailSelected";
import Notch from "../components/RangeSlider/Notch";
import { userContext } from "../contexts/userContext";
import { tokenContext } from "../contexts/tokenContext";
import { IUser } from "../util/Types";
import { Container } from "../styles/ChatStyles";
import { Restart } from "fiction-expo-restart";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest, ResponseType } from "expo-auth-session";
import { encode as btoa } from "base-64";

const settings = StyleSheet.create({
  userImage: {
    alignSelf: "center",
  },
  Title: {
    alignItems: "center",
    alignContent: "center",
    color: "#8860D0",
    textAlign: "center",
    alignSelf: "center",
    fontSize: 20,
  },
  input: {
    fontSize: 12,
  },
  label: {
    color: "#8860D0",
    fontSize: 12,
  },
  SettingsContainer: {
    width: "92%",
    color: "#fff",
    alignItems: "center",
    alignContent: "center",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  button: {
    width: 200,
    backgroundColor: "#8860D0",
    fontFamily: "Poppins_300Light",
    marginVertical: 10,
    alignSelf: "center",
  },
  logOutButton: {
    width: 200,
    backgroundColor: "#d8664d",
    fontFamily: "Poppins_300Light",
    marginVertical: 10,
    alignSelf: "center",
  },
  media: {
    width: 180,
    height: 180,
  },
  mediaView: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  SpotifyButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1ed65f",
    opacity: 0.3,
    alignSelf: "center",
    paddingHorizontal: 10,
    justifyContent: "space-between",
    width: 280,
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
  noSpotifyButton: {
    fontFamily: "Poppins_500Medium_Italic",
    fontSize: 17,
    marginTop: 10,
  },
  buttonImageIconStyle: {
    marginRight: 18,
    height: 30,
    width: 30,
    backgroundColor: "transparent",
    alignSelf: "center",
    borderRadius: 200,
  },
});

export interface IUserForm {
  email: string;
  firstName: string;
  lastName: string;
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
  Media: Array<string>;
  connectSpotify: boolean;
  connectWithoutSpotify: boolean;
}

const SettingsRout = () => {
  const { date, show, showDatepicker, onChangeDate, setShow } = useDate();
  const { dispatch } = useContext(userContext);
  const { dispatchToken } = useContext(tokenContext);
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback((value) => <Label text={value} />, []);
  const renderNotch = useCallback(() => <Notch />, []);
  //const [user, setUser] = useState();
  const { state } = useContext(userContext);
  const [formData, setFormData] = useState<IUserForm>();
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [media, setMedia] = useState([]);
  const [mediaArr, setMediaArr] = useState([]);
  const [errors, setErrors] = useState({});
  const { token } = useContext(tokenContext);
  const [useSpotify, setUseSpotify] = useState(false);
  const [artistList, setArtistList] = useState([]);
  const [checkedArtistList, setCheckedArtistList] = useState([
    { id: "", name: "", images: [{ url: "" }] },
  ]);
  const [search, setSearch] = useState("");

  // connect to spotify functions
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

  // Artists Search functions
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
            padding: 5
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

  useEffect(() => {
    const loadUser = async () => {
      await fetchUser();
      renderMedia();
    };
    loadUser();
  }, [isLoading]);

  const fetchUser = async () => {
    axios
      .get(
        `${SERVER_ADDRESS}:${SERVER_PORT}/user/getuser?userId=${state.user._id}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      )
      .then((res) => {
        setFormData(res.data.user);
        if (res.data.user.spotifyAccessToken !== "") {
          setUseSpotify(true);
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Error");
        console.log(err);
      });
  };

  function validate() {
    let input = formData;
    let errors = {};
    let isValid = true;

    if (!input["firstName"]) {
      isValid = false;
      errors["firstName"] = "Please enter your first name.";
    }
    if (!input["lastName"]) {
      isValid = false;
      errors["lastName"] = "Please enter your last name.";
    }

    if (!input["email"]) {
      isValid = false;
      errors["email"] = "Please enter your email Address.";
    }

    if (typeof input["email"] !== "undefined") {
      var pattern = new RegExp(
        /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
      );
      if (!pattern.test(input["email"])) {
        isValid = false;
        errors["email"] = "Please enter valid email address.";
      }
    }

    console.log(errors);

    setErrors(errors);

    return isValid;
  }

  const handleValueChange = useCallback((low, high) => {
    setFormData((prevstate) => {
      return {
        ...prevstate,
        interestedAgeMin: low,
        interestedAgeMax: high,
      };
    });
  }, []);

  const onSave = async () => {
    if (validate()) {
      console.log(checkedArtistList + " " + search + " " + artistList);

      if (checkedArtistList.length > 0) formData.Artists = [];
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
        .put(`${SERVER_ADDRESS}:${SERVER_PORT}/user`, formData, {
          headers: { "Content-Type": "application/json" },
        })
        .then(async (response) => {
          dispatch({ type: "SET_USER", payload: response.data.user });

          if (image != null) {
            await uploadPic({
              email: response.data.user.email,
              pictureFile: image,
            });
          }
          if (media != []) {
            for (let index = 0; index < media.length; index++) {
              await uploadMedia({
                email: response.data.user.email,
                pictureFile: media[index],
              });
            }
          }
        })
        .then((res) => {
          Alert.alert("Success", "Changes Saved Successfully", [
            { text: "OK", onPress: () => console.log("OK Pressed") },
          ]);
          setIsLoading(true);
        })
        .catch((err) => {
          console.log(err);

          Alert.alert("Error", "error", [
            { text: "OK", onPress: () => console.log("OK Pressed") },
          ]);
        });
    }
  };
  const handleChange = (name, value) => {
    setFormData((prevstate) => {
      return {
        ...prevstate,
        [name]: value as Pick<IUserForm, keyof IUserForm>,
      };
    });
  };

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

  // Media functions
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

  async function uploadPic(credentials) {
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
    axios.defaults.headers.common["Authorization"] = "Bearer " + token.token;
    axios
      .post(
        `${SERVER_ADDRESS}:${SERVER_PORT}/user/uploadProfile`,
        formData,
        config
      )
      .then((response) => {
        return response;
      })
      .catch((error) => {
        Alert.alert(JSON.stringify(error));
        return error;
      });
  }

  async function uploadMedia(credentials) {
    const formData = new FormData();
    let filename = credentials.pictureFile.split("/").pop();

    // Infer the type of the image
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    formData.append("userId", credentials.email);

    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };

    axios.defaults.headers.common["Authorization"] = "Bearer " + token.token;

    formData.append("myImage", {
      uri: credentials.pictureFile,
      name: filename,
      type,
    });

    axios
      .post(
        `${SERVER_ADDRESS}:${SERVER_PORT}/user/uploadMedia`,
        formData,
        config
      )
      .then((response) => {
        setMedia([]);
        return response;
      })
      .catch((error) => {
        Alert.alert(JSON.stringify(error));
        console.log(error);
      });
  }

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      let newMedia = media;
      newMedia.push(result.uri);
      await setMedia(newMedia);
      renderMedia();
    }
  };

  const renderMedia = () => {
    const mediaDOM = [];

    for (let i = 0; i < formData.Media.length; i++) {
      mediaDOM.push(
        <View key={"media" + i}>
          <Image
            style={settings.media}
            source={{
              uri: `${SERVER_ADDRESS}:${SERVER_PORT}/static/${formData.Media[i]}`,
            }}
          />
        </View>
      );
    }
    if (media.length !== 0) {
      for (let i = 0; i < media.length; i++) {
        mediaDOM.push(
          <View key={"uploadMedia" + i}>
            <Image style={settings.media} source={{ uri: media[i] }} />
          </View>
        );
      }
    }
    setMediaArr(mediaDOM);
  };

  var currentDateMoreThan18 = new Date();
  currentDateMoreThan18.setFullYear(new Date().getFullYear() - 18);

  return (
    <Container>
      {isLoading ? (
        <ActivityIndicator size='small' color='#dee2ff' />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            display: "flex",
            paddingTop: 30,
          }}
        >
          <View style={settings.SettingsContainer}>
            <View
              style={{
                width: "100%",
                display: "flex",
                flex: 1,
                alignItems: "center",
                //marginTop: 10,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.5}
                style={{
                  borderRadius: 30,
                }}
                //check this
                disabled={image}
                onPress={pickImage}
              >
                {image && (
                  <Image
                    source={{ uri: image }}
                    style={{ width: 200, height: 200, borderRadius: 100 }}
                  />
                )}
                {!image && (
                  <Image
                    source={{
                      uri: `${SERVER_ADDRESS}:${SERVER_PORT}/static/${formData.picture}`,
                    }}
                    style={{ width: 200, height: 200, borderRadius: 100 }}
                  />
                )}
              </TouchableOpacity>
              <Input
                label='First Name'
                value={formData.firstName}
                onChangeText={(value) => handleChange("firstName", value)}
                errorMessage={errors["firstName"]}
              />
              <Input
                label='Last Name'
                value={formData.lastName}
                onChangeText={(value) => handleChange("lastName", value)}
                errorMessage={errors["lastName"]}
              />
              <Input
                label='Description'
                value={formData.description}
                onChangeText={(value) => handleChange("description", value)}
              />
              <Input
                label='Email'
                value={formData.email}
                onChangeText={(value) => handleChange("email", value)}
                errorMessage={errors["email"]}
              />
              <Input
                label='Birthday'
                value={date.toLocaleDateString(LOCALE)}
                onTouchStart={showDatepicker}
                errorMessage={errors["birthday"]}
              />
              {show && (
                <DateTimePickerModal
                  maximumDate={currentDateMoreThan18}
                  testID='dateTimePicker'
                  date={currentDateMoreThan18}
                  isVisible={show}
                  mode={"date"}
                  display='spinner'
                  onCancel={() => {
                    setShow(false);
                  }}
                  onConfirm={onChangeDateInput}
                />
              )}
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
                  title='Male'
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  checkedColor='#8860D0'
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
                  title='Female'
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  checkedColor='#8860D0'
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
                  title='Male'
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  checkedColor='#8860D0'
                  onPress={(value) => handleChange("interestedSex", 0)}
                  checked={formData.interestedSex == 0}
                  containerStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    borderColor: "rgba(0, 0, 0, 0)",
                  }}
                />
                <CheckBox
                  center
                  title='Female'
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  checkedColor='#8860D0'
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
              <Divider style={{ backgroundColor: "#8860D0", width: "100%" }} />
              <View
                style={{
                  marginVertical: 10,
                  width: "100%",
                  alignSelf: "center",
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
                  Media
                </Text>
                <ScrollView>
                  <View style={settings.mediaView}>{mediaArr}</View>
                </ScrollView>
                <Button onPress={pickMedia}>Upload Media</Button>
              </View>
              <Divider style={{ backgroundColor: "#8860D0", width: "100%" }} />
              <View>
                {useSpotify ? (
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        formData.connectWithoutSpotify = true;
                        setUseSpotify(false);
                      }}
                    >
                      <Text style={settings.noSpotifyButton}>
                        connect without spotify
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity
                      style={settings.SpotifyButton}
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
                                    "Content-Type":
                                      "application/x-www-form-urlencoded",
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
                        setUseSpotify(true);
                        formData.connectSpotify = true;
                      }}
                    >
                      <Text style={settings.noSpotifyButton}>
                        connect with Spotify
                      </Text>
                      <Image
                        source={require("../assets/spotify-logo-black.png")}
                        containerStyle={settings.buttonImageIconStyle}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View>
                {!useSpotify && (
                  <View style={{ padding: 20 }}>
                    <Text
                      style={{
                        width: "77%",
                        //alignSelf: "center",
                        textAlign: "left",
                        color: "#87949f",
                        fontWeight: "bold",
                        fontSize: 17,
                        marginTop: 20,
                      }}
                    >
                      Change Favorite Artists:
                    </Text>
                    <SearchBar
                      platform='default'
                      inputContainerStyle={{
                        borderRadius: 40,
                        backgroundColor: "#8860D0",
                        width: 300,
                        height: 50
                      }}
                      inputStyle={{
                        borderRadius: 20,
                        color: 'white'
                      }}
                      containerStyle={{
                        borderRadius: 20,
                        backgroundColor: "#8860D0",
                        marginTop: 20
                      }}
                      searchIcon={{color: 'white'}}
                      clearIcon={{color: 'white'}}
                      onChangeText={updateSearch}
                      value={search}
                    />
                    <View
                      style={{
                        width: "100%",
                      }}
                    >
                      <FlatList
                        keyExtractor={keyExtractor}
                        data={checkedArtistList.concat(
                          artistList.filter(
                            (item) =>
                              !checkedArtistList.find((x) => x.id == item.id)
                          )
                        )}
                        renderItem={renderItem}
                        style={{marginTop: 5}}
                      />
                    </View>
                  </View>
                )}
              </View>

              <View
                style={{
                  marginVertical: 10,
                  width: "100%",
                  alignSelf: "center",
                  marginTop: 30,
                }}
              >
                <Button
                  style={settings.button}
                  mode='contained'
                  onPress={() => onSave()}
                >
                  save
                </Button>
                <Button
                  onPress={() => {
                    dispatchToken({ type: "LOGOUT" });
                    dispatch({ type: "LOGOUT" });
                    // DevSettings.reload();
                    Restart();
                  }}
                  style={settings.logOutButton}
                  mode='contained'
                >
                  Log Out
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </Container>
  );
};

export default SettingsRout;
