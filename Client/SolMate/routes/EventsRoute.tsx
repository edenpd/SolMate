import { Text, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import React from "react";
import { Container } from "../styles/ChatStyles";
import { Card, Paragraph } from "react-native-paper";
import A from "react-native-a";
import Moment from "moment";

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
      margin: 10,
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

    text: {
      marginTop: 10,
    },
  });

  interface Event {
    id: String;
    eventName: String;
    startDateTime: String;
    artistName: String;
    cityName: String;
    venueName: String;
    eventUrl: String;
  }
  const events: Event[] = [
    {
      id: "11129128",
      eventName: "Wild Flag at The Fillmore",
      startDateTime: "2012-04-18T20:00:00",
      artistName: "Wild Flag",
      cityName: "San Francisco, CA, US",
      venueName: "The Fillmore",
      eventUrl:
        "http://www.songkick.com/concerts/11129128-wild-flag-at-fillmore?utm_source=PARTNER_ID&utm_medium=partner",
    },
    {
      id: "11129121",
      eventName: "Wild Flag at The Fillmore",
      startDateTime: "2012-04-18T20:00:00",
      artistName: "Wild Flag",
      cityName: "San Francisco, CA, US",
      venueName: "The Fillmore",
      eventUrl:
        "http://www.songkick.com/concerts/11129128-wild-flag-at-fillmore?utm_source=PARTNER_ID&utm_medium=partner",
    },
    {
      id: "11129122",
      eventName: "Wild Flag at The Fillmore",
      startDateTime: "2012-04-18T20:00:00",
      artistName: "Wild Flag",
      cityName: "San Francisco, CA, US",
      venueName: "The Fillmore",
      eventUrl:
        "http://www.songkick.com/concerts/11129128-wild-flag-at-fillmore?utm_source=PARTNER_ID&utm_medium=partner",
    },
    {
      id: "11129123",
      eventName: "Wild Flag at The Fillmore",
      startDateTime: "2012-04-18T20:00:00",
      artistName: "Wild Flag",
      cityName: "San Francisco, CA, US",
      venueName: "The Fillmore",
      eventUrl:
        "http://www.songkick.com/concerts/11129128-wild-flag-at-fillmore?utm_source=PARTNER_ID&utm_medium=partner",
    },
  ];

  return (
    <Container>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <A href={item.eventUrl} style={appbarStyle.card}>
              <Card elevation={5}>
                <Card.Title
                  style={appbarStyle.cardTitle}
                  title={
                    <Text style={appbarStyle.cardTitle}>{item.eventName}</Text>
                  }
                />
                <Paragraph style={appbarStyle.artistName}>
                  {item.artistName}
                </Paragraph>

                <Card.Content style={appbarStyle.cardContent}>
                  <Text style={appbarStyle.text}>{item.cityName}</Text>
                  <Text style={appbarStyle.text}>{item.venueName}</Text>
                  <Text style={appbarStyle.text}>
                    {Moment(item.startDateTime).format("DD/MM/YYYY hh:mm A")}
                  </Text>
                </Card.Content>
              </Card>
            </A>
          );
        }}
      />
    </Container>
  );
};

export default EventsRoute;
