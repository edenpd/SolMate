import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Avatar, TextInput } from "react-native-paper";
import {
  ActionsContainer,
  Button,
  FieldsContainer,
  Fieldset,
  Form,
  FormGroup,
  Input,
  Label,
  Switch,
} from "react-native-clean-form";
import RangeSlider from "rn-range-slider";

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
    height: 40,
    margin: 12,
    borderWidth: 1,
  },
  row: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",
  },
  inputWrap: {
    flex: 1,
    borderColor: "#cccccc",
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  label: {
    color: "purple",
    // flex: 1,
    // fontWeight: "bold",
  },
  card: {
    marginBottom: "78",
  },
});

const SettingRoute = () => {
  return (
    <View>
      <Avatar.Image
        style={settings.userImage}
        source={{ uri: "https://picsum.photos/700" }}
      />
      <Text style={settings.Title}>Adi Bigler</Text>
      <FieldsContainer style={settings.card}>
        {/* <Fieldset label="Personal Details" style={settings.card}> */}
        <FormGroup>
          <Label>
            <Text style={settings.label}>First name</Text>
          </Label>
          <Input placeholder="Adi" />

          <Label>
            <Text style={settings.label}>Last name</Text>
          </Label>
          <Input placeholder="Bigler" />
        </FormGroup>
        <FormGroup>
          <Label>
            <Text style={settings.label}>Email</Text>
          </Label>
          <Input placeholder="esbenspetersen@gmail.com" />
        </FormGroup>
        <FormGroup>
          <Label>
            <Text style={settings.label}>Description</Text>
          </Label>
          <Input placeholder="music is my life!" />
        </FormGroup>
        <FormGroup>
          <Text style={settings.label}>Radius Search</Text>
        </FormGroup>
        <FormGroup></FormGroup>
        {/* </Fieldset> */}
      </FieldsContainer>
    </View>
  );
};

export default SettingRoute;
