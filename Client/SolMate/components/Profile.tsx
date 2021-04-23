import React, { useState, useContext } from "react";
import { StyleSheet, View, Image, Text, ScrollView } from "react-native";
import {
  Paragraph,
  Title,
  Avatar,
  Button,
  IconButton,
  BottomNavigation,
} from "react-native-paper";
import { userContext } from "../contexts/userContext";
import { IUser } from "../util/Types";

interface ProfileProps {
  user: any;
}

const Profile = (props) => {
  const [index, setIndex] = useState(0);
  // console.log(props.user.Artists.body.items.images[0]);

  const styles = StyleSheet.create({
    root: {
      alignItems: "center",
      alignContent: "center",
    },
    avatar: {
      marginTop: 40,
      alignSelf: "center",
      width: 150,
      height: 150,
      borderRadius: 100,
    },
    title: {
      marginTop: 10,
      alignItems: "center",
      alignContent: "center",
      textAlign: "center",
      fontFamily: "Poppins_500Medium_Italic",
    },
    description: {
      marginTop: 1,
      fontFamily: "Poppins_500Medium_Italic",
    },
    tabs: {
      marginTop: 10,
      flexDirection: "row",
    },
    content: {
      marginTop: 30,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      //paddingTop: 50,
    },
    image: {
      width: 180,
      height: 180,
    },
    Title: {
      alignItems: "center",
      alignContent: "center",
      color: "white",
      textAlign: "center",
      alignSelf: "center",
      fontSize: 24,
      fontFamily: "Poppins_500Medium_Italic",
    },
  });

  const renderArtists = () => {
    const artistsDOM = [];

    for (let i = 0; i < 3; i++) {
      artistsDOM.push(
        <View key={i}>
          <Image
            style={styles.image}
            source={{ uri: props.user.Artists.body.items[i].images[0].url }}
          />
        </View>
      );
    }

    return artistsDOM;
  };

  const renderMedia = () => {
    const mediaDOM = [];

    for (let i = 0; i < props.user.user.Media.length; i++) {
      mediaDOM.push(
        <View key={"media" + i}>
          <Image
            style={styles.image}
            source={{ uri: props.user.user.Media[i] }}
          />
        </View>
      );
    }

    return mediaDOM;
  };

  let content = null;

  index === 0 ? (content = renderArtists()) : (content = renderMedia());

  return (
    <View style={styles.root}>
      <Avatar.Image size={180} source={{ uri: props.user.user.picture }} />
      <Title style={styles.title}>
        {props.user.user.firstName + " " + props.user.user.lastName}
      </Title>
      <Paragraph style={styles.description}>
        {props.user.user.description}
      </Paragraph>

      <View style={styles.tabs}>
        <Button mode='contained' onPress={() => setIndex(0)}>
          Top Artists
        </Button>
        <Button mode='contained' onPress={() => setIndex(1)}>
          Media
        </Button>
      </View>

      <ScrollView>
        <View style={styles.content}>{content}</View>
      </ScrollView>
    </View>
  );
};

export default Profile;
