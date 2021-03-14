import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Input, Button } from "react-native-elements";
export default function LoginRoute() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        // alignContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{height:"40%",width: "100%"}}>
        <Image
          style={{ flex: 1, width: null, height: null, resizeMode: "contain" }}
          source={require("../assets/solmate_logo.png")}
        />
      </View>
      <View
        style={{
          paddingVertical: 50,
          display: "flex",
          alignItems: "center",
          width: "80%",
        }}
      >
        <Input
          placeholder="Enter your Email"
          errorStyle={{ color: "red" }}
          leftIcon={<Icon name="user" size={24} color="black" />}
        />
        <Input
          placeholder="Enter your password"
          errorStyle={{ color: "red" }}
          secureTextEntry={true}
          leftIcon={<Icon name="lock" size={24} color="black" />}
        />
      </View>
      <View style={{width:"70%",minWidth:200}}>
      <Button
        title="Login"
        loading={isLoading}
        buttonStyle={{ backgroundColor: "purple",borderRadius:50}}
      />
      </View>
    </View>
  );
}
