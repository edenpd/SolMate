import React, { useCallback, useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  DevSettings,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  TextInput,
  Button,
} from "react-native-paper";
import {
  CheckBox,
  Image,
  SearchBar,
  Input,
  Divider,
  ListItem,
} from "react-native-elements";
import DateTimePicker from "@react-native-community/datetimepicker";
import useDate, { LOCALE } from "../hooks/useDate";
import { SERVER_ADDRESS, SERVER_PORT } from "@env";
import axios from "axios";
import useToken from "../hooks/useToken";

import {
  FieldsContainer,
  FormGroup,
  //Input,
  Label,
} from "react-native-clean-form";
import * as ImagePicker from "expo-image-picker";

import RangeSlider from "rn-range-slider";
import Thumb from "../components/RangeSlider/Thumb";
import Rail from "../components/RangeSlider/Rail";
import RailSelected from "../components/RangeSlider/RailSelected";
import Notch from "../components/RangeSlider/Notch";
import { userContext } from "../contexts/userContext";
import { tokenContext } from "../contexts/tokenContext";
import { IUser } from "../util/Types";
import { Container } from "../styles/ChatStyles";
//import { ListItem } from "react-native-elements/dist/list/ListItem";
import { black } from "react-native-paper/lib/typescript/styles/colors";
import { Tile } from "react-native-elements/dist/tile/Tile";
import { NavigationContainer } from "@react-navigation/native";
import { Restart } from 'fiction-expo-restart';

const settings = StyleSheet.create({
  userImage: {
    alignSelf: "center",
  },
  Title: {
    alignItems: "center",
    alignContent: "center",
    color: "purple",
    textAlign: "center",
    alignSelf: "center",
    fontSize: 20,
  },
  input: {
    fontSize: 12,
  },
  label: {
    color: "purple",
    fontSize: 12,
  },
  SettingsContainer: {
    // width: "100%",
    // color: "#fff",
    // //paddingTop: 50,
    // alignItems: "center",
    // alignContent: "center",
    // display: "flex",
    // justifyContent: "center",
    // flexDirection: "column",
    // marginTop: 30,
    // //flexDirection: "row",
    // //justifyContent: "center",
    // //alignItems: "center",
    // flexWrap: "wrap",
    width: "100%",
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
});

const SettingsRout = () => {
  const { date, show, showDatepicker, onChangeDate, setShow } = useDate();
  const { dispatch } = useContext(userContext);
  const { dispatchToken } = useContext(tokenContext);
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback((value) => <Label text={value} />, []);
  const renderNotch = useCallback(() => <Notch />, []);
  const [user, setUser] = useState();
  const { state } = useContext(userContext);
  const [formData, setFormData] = useState<IUser>();
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [media, setMedia] = useState([]);
  const [mediaArr, setMediaArr] = useState([]);
  const [errors, setErrors] = useState({});
  const { token } = useContext(tokenContext);

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
      await axios
        .put(`${SERVER_ADDRESS}:${SERVER_PORT}/user`, formData, {
          headers: { "Content-Type": "application/json" },
        })
        .then(async (response) => {
          //console.log(res);
          // Alert.alert("Success", "Changes Saved Successfully", [
          //   { text: "OK", onPress: () => console.log("OK Pressed") },
          // ]);
          dispatch({ type: "SET_USER", payload: response.data.user });
          console.log(state.user);

          // dispatchToken({ type: "SET_TOKEN", payload: response.data.token });
          if (image != null) {
            await uploadPic({
              email: response.data.user.email,
              pictureFile: image,
            });
          }
          if (media != []) {
            console.log("Save Media");
            console.log(media.length);
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
          //fetchUser();
          //renderMedia();
        })
        .catch((err) => {
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
        [name]: value as Pick<IUser, keyof IUser>,
      };
    });
    //console.log(formData);
    // console.log(value);
  };

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
    console.log("hey");

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
    console.log("hey");

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
    //return mediaDOM;
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
                <DateTimePicker
                  maximumDate={currentDateMoreThan18}
                  testID='dateTimePicker'
                  value={currentDateMoreThan18}
                  mode={"date"}
                  display='default'
                  onChange={onChangeDateInput}
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
                  checkedColor='purple'
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
                  checkedColor='purple'
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
                  checkedColor='purple'
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
                  checkedColor='purple'
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
              <View
                style={{
                  marginVertical: 10,
                  width: "100%",
                  alignSelf: "center",
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
