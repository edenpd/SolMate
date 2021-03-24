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
    flex: 1,
    fontWeight: "bold",
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
      <FieldsContainer>
        {/* <Fieldset label="Contact details">
          <FormGroup>
            <Label>First name</Label>
            <Input placeholder="Esben" />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input placeholder="esbenspetersen@gmail.com" />
          </FormGroup>
        </Fieldset>
        <Fieldset label="Password" last>
          <FormGroup>
            <Label>Password</Label>
            <Input placeholder="Enter a password" />
          </FormGroup>
          <FormGroup>
            <Label>Repeat password</Label>
            <Input placeholder="Repeat your password" />
          </FormGroup>
          <FormGroup border={false}>
            <Label>Save my password</Label>
            <Switch />
          </FormGroup>
        </Fieldset> */}
      </FieldsContainer>
    </View>
  );
};

export default SettingRoute;
