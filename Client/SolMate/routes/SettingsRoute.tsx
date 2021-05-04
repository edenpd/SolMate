import React, { useCallback, useState } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { Avatar, TextInput } from "react-native-paper";
import { CheckBox, Divider, Image, SearchBar } from "react-native-elements";
import DateTimePicker from "@react-native-community/datetimepicker";
import useDate, { LOCALE } from "../hooks/useDate";

import {
  Button,
  FieldsContainer,
  FormGroup,
  Input,
  Label,
} from "react-native-clean-form";

import RangeSlider from "rn-range-slider";
import Thumb from "../components/RangeSlider/Thumb";
import Rail from "../components/RangeSlider/Rail";
import RailSelected from "../components/RangeSlider/RailSelected";
import Notch from "../components/RangeSlider/Notch";

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
  Songs: Array<string>;
  location: Object;
}

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
    width: "100%",
    color: "#fff",

    alignItems: "center",
    alignContent: "center",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
});

const SettingRoute = () => {
  const { date, show, showDatepicker, onChangeDate, setShow } = useDate();
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
    birthday: "",
    picture: "",
    interestedSex: 1,
    interestedAgeMin: 18,
    interestedAgeMax: 24,
    Songs: [""],
    location: "",
  });

  const handleChange = (name, value) => {
    setFormData((prevstate) => {
      return {
        ...prevstate,
        [name]: value as Pick<IUserForm, keyof IUserForm>,
      };
    });
    console.log(formData);
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
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        display: "flex",
        paddingTop: 30,
      }}
    >
      <View style={settings.SettingsContainer}>
        <Avatar.Image
          style={settings.userImage}
          source={{ uri: "https://picsum.photos/700" }}
        />
        <Text style={settings.Title}>Adi Bigler</Text>
        <View>
          <FieldsContainer>
            <FormGroup>
              <Label>
                <Text style={settings.label}>First name</Text>
              </Label>
              <Input
                style={settings.input}
                placeholder='Adi'
                onChangeText={(value) => handleChange("firstName", value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>
                <Text style={settings.label}>Last name</Text>
              </Label>
              <Input
                style={settings.input}
                placeholder='Bigler'
                onChangeText={(value) => handleChange("lastName", value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>
                <Text style={settings.label}>Email</Text>
              </Label>
              <Input
                style={settings.input}
                placeholder='esbenspetersen@gmail.com'
                onChangeText={(value) => handleChange("email", value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>
                <Text style={settings.label}>Birthday</Text>
              </Label>
              <View
                style={{
                  width: "50%",
                }}
              >
                <Input
                  label='Date'
                  value={date.toLocaleDateString(LOCALE)}
                  //editable={false}
                  style={{ padding: 0 }}
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

                {/* <DateTimePicker
                maximumDate={currentDateMoreThan18}
                testID='dateTimePicker'
                value={currentDateMoreThan18}
                mode={"date"}
                display='default'
                //   onChange={onChangeDateInput}
              /> */}
              </View>
            </FormGroup>
            <FormGroup>
              <Label>
                <Text style={settings.label}>Description</Text>
              </Label>
              <Input style={settings.input} placeholder='music is my life!' />
            </FormGroup>
            <FormGroup>
              <Label>
                <Text style={settings.label}>Sex</Text>
              </Label>
              <View>
                <CheckBox
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
                    marginBottom: -20,
                    marginTop: -20,
                    marginLeft: 50,
                  }}
                ></CheckBox>
              </View>
              <View>
                <CheckBox
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
                    marginBottom: -20,
                    marginTop: -20,
                  }}
                ></CheckBox>
              </View>
            </FormGroup>
            <FormGroup>
              <Text style={settings.label}>Intrested in</Text>

              <View>
                <CheckBox
                  title='Male'
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  checkedColor='purple'
                  checked={formData.interestedSex == 0}
                  onPress={(value) => handleChange("interestedSex", 0)}
                  containerStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    borderColor: "rgba(0, 0, 0, 0)",
                    justifyContent: "flex-start",
                    marginBottom: -20,
                    marginTop: -20,
                    marginLeft: 50,
                  }}
                ></CheckBox>
              </View>
              <View>
                <CheckBox
                  title='Female'
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  checkedColor='purple'
                  checked={formData.interestedSex == 1}
                  onPress={(value) => handleChange("interestedSex", 1)}
                  containerStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0)",
                    borderColor: "rgba(0, 0, 0, 0)",
                    justifyContent: "flex-start",
                    marginBottom: -20,
                    marginTop: -20,
                  }}
                ></CheckBox>
              </View>
            </FormGroup>
            <FormGroup>
              <Label>
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
                  Intrested Age
                </Text>
              </Label>
              <View
                style={{
                  width: "40%",
                  marginBottom: 10,
                }}
              >
                <RangeSlider
                  style={{ width: "80%", marginVertical: 20, height: 10 }}
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
            </FormGroup>
            <FormGroup>
              <Button>save</Button>
            </FormGroup>
          </FieldsContainer>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingRoute;
