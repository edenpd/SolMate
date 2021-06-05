import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  Paragraph,
  Title,
  Avatar,
  Button,
  IconButton,
  BottomNavigation,
  Dialog,
  Card,
} from "react-native-paper";
import { userContext } from "../contexts/userContext";
import { IUser } from "../util/Types";
import { SERVER_ADDRESS, SERVER_PORT } from "@env";
import { Divider, ListItem } from "react-native-elements";

interface ProfileProps {
  user: any;
}

const Profile = (props) => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [image, setImage] = useState();

  const styles = StyleSheet.create({
    root: {
      alignItems: "center",
      alignContent: "center",
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
    },
    image: {
      width: 180,
      height: 180,
    },
    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    card: {
      alignItems: "center",
      alignContent: "center",
      width: 350,
      margin: 15,
      borderRadius: 20,
      paddingTop: 15,
      position: "absolute",
      top: "20%",
      bottom: "12%",
      left: "4%",
      right: "3%",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    cardCover: {
      width: 340,
      height: 430,
      borderRadius: 20,
    },
    button: {
      width: 200,
      backgroundColor: "#8860D0",
      fontFamily: "Poppins_300Light",
    },
  });

  const renderArtists = () => {
    const artistsDOM = [];
    if (props.user.Artists.length === 0) {
      artistsDOM.push(
        <Paragraph key={0} style={styles.description}>
          No artists found ☹
        </Paragraph>
      );
    } else {
      for (let i = 0; i < props.user.Artists.length; i++) {
        let img = null;
        if (props.user.Artists[i].images.length !== 0)
          img = props.user.Artists[i].images[0].url;

        artistsDOM.push(
          <ListItem key={i} bottomDivider style={{ width: 380, height: 120 }}>
            <Avatar.Image source={{ uri: img }} size={80} />
            <ListItem.Content>
              <ListItem.Title>{props.user.Artists[i].name}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        );
      }
    }
    //}
    return artistsDOM;
  };

  const renderMedia = () => {
    const mediaDOM = [];

    for (let i = 0; i < props.user.user.Media.length; i++) {
      mediaDOM.push(
        <View key={"media" + i}>
          <TouchableOpacity
            onPress={() => onImagePress(props.user.user.Media[i])}
          >
            <Image
              style={styles.image}
              source={{
                uri: `${SERVER_ADDRESS}:${SERVER_PORT}/static/${props.user.user.Media[i]}`,
              }}
            />
          </TouchableOpacity>
        </View>
      );
    }

    return mediaDOM;
  };

  const calcAge = (date: Date) => {
    return new Number(
      (new Date().getTime() - new Date(date).getTime()) / 31536000000
    ).toFixed(0);
  };

  const onImagePress = (i) => {
    setIsVisible(true);
    setImage(i);
  };

  let content = null;

  index === 0 ? (content = renderArtists()) : (content = renderMedia());

  return (
    <View style={styles.root}>
      <Modal visible={isVisible} transparent={true}>
        <Card style={styles.card}>
          <Card.Cover
            style={styles.cardCover}
            source={{
              uri: `${SERVER_ADDRESS}:${SERVER_PORT}/static/${image}`,
            }}
          ></Card.Cover>
          <Card.Actions>
            <Button
              onPress={() => {
                setIsVisible(false);
              }}
            >
              Close
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
      <Avatar.Image
        size={120}
        source={{
          uri: `${SERVER_ADDRESS}:${SERVER_PORT}/static/${props.user.user.picture}`,
        }}
      />
      <Title style={styles.title}>
        {props.user.user.firstName +
          " " +
          props.user.user.lastName +
          ", " +
          calcAge(props.user.user.birthday)}
      </Title>
      <Paragraph style={styles.description}>
        {props.user.user.description}
      </Paragraph>

      <View style={styles.tabs}>
        <Button
          style={styles.button}
          mode='contained'
          onPress={() => setIndex(0)}
        >
          Top Artists
        </Button>
        <Button
          style={styles.button}
          mode='contained'
          onPress={() => setIndex(1)}
        >
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
