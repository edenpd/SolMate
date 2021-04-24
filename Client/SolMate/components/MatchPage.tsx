import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import MatchCard from "../components/MatchCard";
import Carousel from "react-native-snap-carousel";
import axios from "axios";
import { IMatch } from "../util/Types";
import { userContext } from "../contexts/userContext";
import { SERVER_ADDRESS, SERVER_PORT } from "@env";
import NewMatchDialog from "./NewMatchDialog";

const MatchPage = ({ navigation }) => {
  const [matches, setMatches] = useState<IMatch[]>([]);
  const { state } = useContext(userContext);
  const [isDialogVisible, setIsDialogVisible] = useState<Boolean>(false);

  useEffect(() => {
    getMatches();
  }, []);

  const getMatches = () => {
    console.log("Getting multiple matches");
    console.log(state);
    console.log(
      `${SERVER_ADDRESS}:${SERVER_PORT}/match?userId=${state.user._id}`
    );
    axios
      .get(`${SERVER_ADDRESS}:${SERVER_PORT}/match?userId=${state.user._id}`)
      .then((res) => {
        setMatches(res.data);
      })
      .catch((err) => {
        console.log("Error");
        console.log(err);
      });
  };

  const appbarStyle = StyleSheet.create({
    matchesContainer: {
      paddingTop: 20,
      paddingBottom: 20,
      alignContent: "center",
      alignSelf: "center",
      alignItems: "center",
      flexDirection: "column",
      maxHeight: 700,
      backgroundColor: "#f6f6f6",
    },
  });

  const onAfterRespond = () => {
    getMatches();
  };

  const renderCard = ({ item, index }) => {
    const otherUser =
      (item as IMatch).firstUser["_id"] === state.user._id + ""
        ? item.secondUser
        : item.firstUser;

    return (
      <MatchCard
        user={otherUser}
        match={item}
        onAfterRespond={onAfterRespond}
        onProfileClick={onProfileClick}
        setIsDialogVisible={setIsDialogVisible}
      />
    );
  };

  const onProfileClick = (userId: string) => {
    navigation.navigate("Profile", { user: userId });
  };

  return (
    <View
      style={{ height: "100%", width: "100%", backgroundColor: "transparent" }}
    >
      <View style={appbarStyle.matchesContainer}>
        <Carousel
          style={{ marginBottom: 0, paddingBottom: 0 }}
          layout={"tinder"}
          data={matches}
          renderItem={renderCard}
          itemWidth={350}
          sliderWidth={400}
          layoutCardOffset={9}
        />
      </View>
      <NewMatchDialog setIsVisible={setIsDialogVisible} visible={isDialogVisible} />
    </View>
  );
};

export default MatchPage;
