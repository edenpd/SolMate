import React, { useCallback, useEffect, useState, useContext } from "react";
import { StyleSheet, View, Text, ScrollView, Alert } from "react-native";
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

import {
  FieldsContainer,
  FormGroup,
  //Input,
  Label,
} from "react-native-clean-form";

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

  useEffect(() => {
    const loadUser = async () => {
      await fetchUser();
    };
    loadUser();
  }, []);

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
    await axios
      .put(`${SERVER_ADDRESS}:${SERVER_PORT}/user`, formData, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        //console.log(res);
        Alert.alert("Success", "Changes Saved Successfuly", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
      })
      .catch((err) => {
        Alert.alert("Error", "error", [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
      });
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
              <Avatar.Image
                style={settings.userImage}
                size={120}
                source={{
                  uri: `${SERVER_ADDRESS}:${SERVER_PORT}/static/${formData.picture}`,
                }}
              />

              <Input
                label='First Name'
                value={formData.firstName}
                onChangeText={(value) => handleChange("firstName", value)}
              />
              <Input
                label='Last Name'
                value={formData.lastName}
                onChangeText={(value) => handleChange("lastName", value)}
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
              />

              <Input
                label='Birthday'
                value={date.toLocaleDateString(LOCALE)}
                onTouchStart={showDatepicker}
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
                  }}
                  style={settings.button}
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
