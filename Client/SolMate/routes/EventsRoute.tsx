import { Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import React, { useState, useEffect, useContext } from "react";
import { Container } from "../styles/ChatStyles";
import { Card, Paragraph } from "react-native-paper";
import A from "react-native-a";
import Moment from "moment";
import axios from "axios";
import { userContext } from "../contexts/userContext";
import { SERVER_PORT, SERVER_ADDRESS } from '@env';

const EventsRoute = () => {
  const appbarStyle = StyleSheet.create({
    card: {
      alignItems: "center",
      alignContent: "center",
      width: 340,
      margin: 15,
    },
    cardTitle: {
      alignItems: "center",
      alignContent: "center",
      color: "purple",
      textAlign: "center",
      alignSelf: "center",
      fontSize: 25,
      padding: 30,
      fontWeight: "bold"
    },
    artistName: {
      alignItems: "center",
      alignContent: "center",
      color: "purple",
      textAlign: "center",
      alignSelf: "center",
      fontSize: 20,
    },
    cardContent: {
      alignItems: "center",
      alignContent: "center",
      width: 340,
      marginTop: 20,
    },

    image: {
      width: 250,
      height: 250,
      borderRadius: 10,
      margin: 20,
    },

    text: {
      marginTop: 10,
    },
  });

  interface IEvent {
    EventId: number;
    EventName: String;
    StartDateTime: String;
    ArtistName: String
    CityName: String
    VenueName: String
    EventUrl: String
    Image: String,
    IsRecommended: boolean
  }

  const [events, setEvents] = useState<IEvent[]>([]);
  const { state } = useContext(userContext);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Getting multiple events");

    getEvents();
  }, []);

  const getEvents = async () => {
    console.log("Getting multiple events");
    await axios
      .get(`${SERVER_ADDRESS}:${SERVER_PORT}/event?artists=maroon 5,Harry Styles`, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        console.log(res.data)
        setEvents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error");
        console.log(err);
      });
  };
  // let events: IEvent[] = [];

  return (
    <Container>
      {isLoading ? <ActivityIndicator /> : (
        <FlatList
          showsHorizontalScrollIndicator={false}
          data={events}
          keyExtractor={(item) => item.EventId.toString()}
          renderItem={({ item }) => {
            return (
              <A href={item.EventUrl} style={appbarStyle.card}>
                <Card elevation={5}>

                  <Paragraph style={appbarStyle.cardTitle}>
                    {item.EventName}
                  </Paragraph>
                  <Paragraph style={appbarStyle.artistName}>
                    {item.ArtistName}
                  </Paragraph>

                  <Card.Content style={appbarStyle.cardContent}>
                    <Text style={appbarStyle.text}>{item.CityName}</Text>
                    <Text style={appbarStyle.text}>{item.VenueName}</Text>
                    <Text style={appbarStyle.text}>
                      {Moment(item.StartDateTime.toString()).format("DD/MM/YYYY hh:mm A")}
                    </Text>

                    <Image
                      style={appbarStyle.image}
                      source={{ uri: item.Image.toString() }}
                    />

                  </Card.Content>
                </Card>
              </A>
            );
          }}
        />
      )}
    </Container>
  )
};

export default EventsRoute;
function render() {
  throw new Error("Function not implemented.");
}

function componentDidMount() {
  throw new Error("Function not implemented.");
}

