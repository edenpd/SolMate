import React, { useState, useEffect, useContext } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import Profile from "../components/Profile";
import axios from "axios";
import { Container } from "../styles/ChatStyles";
import { SERVER_ADDRESS, SERVER_PORT } from "@env";
import { userContext } from "../contexts/userContext";
import { IUser } from "../util/Types";

const ProfileRoute = (props) => {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const { state } = useContext(userContext);
  let userId = undefined;

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    if (userId === undefined) {
      if (props.route.params === undefined) {
        userId = state.user._id;
      } else {
        userId = props.route.params.user;
      }

      await axios
        .get(`${SERVER_ADDRESS}:${SERVER_PORT}/user/getuser?userId=${userId}`, {
          headers: { "Content-Type": "application/json" },
        })
        .then((res) => {
          setUser(res.data);
          setLoading(false);
          // console.log(user);
        })
        .catch((err) => {
          console.log("Error");
          console.log(err);
        });
    }
  };

  return (
    <Container>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View>{<Profile user={user} />}</View>
      )}
    </Container>
  );
};
export default ProfileRoute;
