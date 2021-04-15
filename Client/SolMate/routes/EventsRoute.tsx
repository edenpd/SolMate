import { Text, StyleSheet, ActivityIndicator, Image, ScrollView, Platform, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import React, { useState, useEffect, useContext } from "react";
import { Container } from "../styles/ChatStyles";
import { Card, Paragraph } from "react-native-paper";
import A from "react-native-a";
import Moment from "moment";
import axios from "axios";
import { userContext } from "../contexts/userContext";
import { SERVER_PORT, SERVER_ADDRESS } from '@env';
import { Searchbar } from 'react-native-paper';

const EventsRoute = () => {
  const appbarStyle = StyleSheet.create({
    searchBar: {
      alignItems: "center",
      alignContent: "center",
      width: 350,
      margin: 15,
      borderRadius: 20,
    },
    card: {
      alignItems: "center",
      alignContent: "center",
      width: 350,
      margin: 15,
      borderRadius: 20
    },
    recommendedCard: {
      alignItems: "center",
      alignContent: "center",
      width: 350,
      margin: 15,
      borderRadius: 100,
      backgroundColor: "#8860D0",
    },
    cardTitle: {
      alignItems: "center",
      alignContent: "center",
      color: "#8860D0",
      textAlign: "center",
      alignSelf: "center",
      fontSize: 25,
      padding: 30,
      fontWeight: "bold",
      fontFamily: "Poppins_700Bold",
    },
    recommendedCardText: {
      alignItems: "center",
      alignContent: "center",
      color: "#f6f6f6",
      textAlign: "center",
      alignSelf: "center",
      fontSize: 25,
      padding: 25,
      fontFamily: "Poppins_300Light",
      marginTop: 10
    },
    artistName: {
      alignItems: "center",
      alignContent: "center",
      color: "#8860D0",
      textAlign: "center",
      alignSelf: "center",
      fontSize: 20,
      padding: 5,
      fontFamily: "Poppins_300Light",
    },
    cardContent: {
      alignItems: "center",
      alignContent: "center",
      width: 340,
      fontFamily: "Poppins_500Medium",
      color: "#8860D0"
    },

    image: {
      width: 260,
      height: 260,
      borderRadius: 10,
      marginTop: 20,
    },

    text: {
      fontFamily: "Poppins_300Light",
      color: "#8860D0",
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
  const [myEvents, setMyEvents] = useState<IEvent[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<IEvent[]>([]);
  const { state } = useContext(userContext);
  const [isLoading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = React.useState('');
  const onChangeSearch = query => {
    setMyEvents([]);
    let myEvents = [];

    events.forEach(event => {
      if (event.ArtistName.includes(query) ||
        event.EventName.includes(query) ||
        event.StartDateTime.includes(query) ||
        event.CityName.includes(query))
        myEvents.push(event);
    });

    setMyEvents(myEvents);
    setSearchQuery(query);
  };

  useEffect(() => {
    getEvents();
  }, []);

  const getEvents = async () => {

    await axios
      .get(`${SERVER_ADDRESS}:${SERVER_PORT}/event?userId=${state.user._id}`, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        console.log("Got " + res.data.length + " events");
        // console.log(res.data)
        let events = [];
        let recommendedEvents = [];
        res.data.forEach(event => {
          event.StartDateTime = Moment(event.StartDateTime.toString()).format("DD/MM/YYYY hh:mm A");
          if (event.IsRecommended)
            recommendedEvents.push(event);
          else events.push(event);
        });
        events.sort((a: IEvent, b: IEvent) => {
          return new Date(a.StartDateTime.toString()).getTime() - new Date(b.StartDateTime.toString()).getTime();
        });
        recommendedEvents.sort((a: IEvent, b: IEvent) => {
          return new Date(a.StartDateTime.toString()).getTime() - new Date(b.StartDateTime.toString()).getTime();
        });
        setEvents(events);
        setMyEvents(events);
        setRecommendedEvents(recommendedEvents);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error");
        console.log(err);
      });

  };

  const getEventsaa = async () => {
    console.log("Getting multiple events for user " + state.user._id);

    await axios
      .get(`${SERVER_ADDRESS}:${SERVER_PORT}/spotify/topartists`, {
        headers: { "Content-Type": "application/json" },
        data: {
          // iv: state.user.iv,
          // token: state.user.spotifyAccessToken
        }
      })
      .then((res) => {
        // getEventsByArtists();
      })
      .catch((err) => {
        console.log("Error");
        console.log(err);
      });

  };


  return (
    <Container>

      {isLoading ? <ActivityIndicator /> : (
        <View>
          <Searchbar
            style={appbarStyle.searchBar}
            placeholder="Search"
            onChangeText={onChangeSearch}
            value={searchQuery}
          />
          <ScrollView>
            <FlatList
              showsHorizontalScrollIndicator={false}
              data={myEvents}
              keyExtractor={(item) => item.EventId.toString()}
              renderItem={({ item }) => {
                return (
                  <A href={item.EventUrl} style={appbarStyle.card}>
                    <Card elevation={5} style={appbarStyle.card}>

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
                          {item.StartDateTime}
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
            <Card elevation={5} style={appbarStyle.recommendedCard}>
              <Paragraph style={appbarStyle.recommendedCardText}>
                Recommended for you
            </Paragraph>
            </Card>

            <FlatList
              showsHorizontalScrollIndicator={false}
              data={recommendedEvents}
              keyExtractor={(item) => item.EventId.toString()}
              renderItem={({ item }) => {
                return (
                  <A href={item.EventUrl} style={appbarStyle.card}>
                    <Card elevation={5} style={appbarStyle.card}>

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

          </ScrollView>
        </View>
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

