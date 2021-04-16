import React, { useCallback } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { Avatar, TextInput } from "react-native-paper";
import { CheckBox, Divider, Image, SearchBar } from "react-native-elements";
import DateTimePicker from "@react-native-community/datetimepicker";

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
    fontSize: 17,
  },
  label: {
    color: "purple",
    fontSize: 17,
  },
});

const SettingRoute = () => {
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback((value) => <Label text={value} />, []);
  const renderNotch = useCallback(() => <Notch />, []);
  const handleValueChange = useCallback((low, high) => {
    // setFormData((prevstate) => {
    //   return {
    //     ...prevstate,
    //     interestedAgeMin: low,
    //     interestedAgeMax: high,
    //   };
    // });
  }, []);
  var currentDateMoreThan18 = new Date();
  currentDateMoreThan18.setFullYear(new Date().getFullYear() - 18);
  return (
    <View>
      <Avatar.Image
        style={settings.userImage}
        source={{ uri: "https://picsum.photos/700" }}
      />
      <Text style={settings.Title}>Adi Bigler</Text>
      <View>
        <FieldsContainer>
          {/* <Fieldset label="Personal Details" style={settings.card}> */}
          <FormGroup>
            <Label>
              <Text style={settings.label}>First name</Text>
            </Label>
            <Input style={settings.input} placeholder="Adi" />
          </FormGroup>
          <FormGroup>
            <Label>
              <Text style={settings.label}>Last name</Text>
            </Label>
            <Input style={settings.input} placeholder="Bigler" />
          </FormGroup>
          <FormGroup>
            <Label>
              <Text style={settings.label}>Email</Text>
            </Label>
            <Input
              style={settings.input}
              placeholder="esbenspetersen@gmail.com"
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
              <DateTimePicker
                maximumDate={currentDateMoreThan18}
                testID="dateTimePicker"
                value={currentDateMoreThan18}
                mode={"date"}
                display="default"
                //   onChange={onChangeDateInput}
              />
            </View>
          </FormGroup>
          <FormGroup>
            <Label>
              <Text style={settings.label}>Description</Text>
            </Label>
            <Input style={settings.input} placeholder="music is my life!" />
          </FormGroup>
          <FormGroup>
            <Label>
              <Text style={settings.label}>Sex</Text>
            </Label>
            <View>
              <CheckBox
                title="Male"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="purple"
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
            {/* </Form> */}
            <View>
              <CheckBox
                title="Female"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="purple"
                checked={true}
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
                title="Male"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="purple"
                checked={true}
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
                title="Female"
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
                checkedColor="purple"
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
              <Text style={settings.label}>Intrested Age</Text>
            </Label>
            <View
              style={{
                width: "40%",
                marginBottom: 10,
              }}
            >
              <RangeSlider
                style={{ width: "80%", marginVertical: 20, height: 2 }}
                min={18}
                max={120}
                step={1}
                floatingLabel
                low={18}
                high={120}
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
  );
};

export default SettingRoute;
