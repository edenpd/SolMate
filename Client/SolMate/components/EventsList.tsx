import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { View, Text, Button, StyleSheet, Linking } from 'react-native';
// import { FlatList } from 'react-native-gesture-handler';
import { FlatList } from 'react-native-gesture-handler';
import { Container, Card, MessageText, PostTime, TextSection, UserImg, UserImgWrapper, UserInfo, UserInfoText, UserName } from '../styles/ChatStyles';

const EventsList = ({ Linking }) => {

    const appbarStyle = StyleSheet.create({
        userImage: {
            alignSelf: 'center',
            width: 200,
            height: 200,
            borderRadius: 100
        },
        card: {
            alignItems: 'center',
            alignContent: 'center'
        },
        cardTitle: {
            alignItems: 'center',
            alignContent: 'center',
            color: 'purple',
            textAlign: 'center',
            alignSelf: 'center',
        },
        artistList: {
            flexDirection: 'row'
        },
        artist: {
            margin: 10
        }
    });

    interface Event {
        id: Number
        eventName: String;
        startDateTime: String;
        artistName: String
        cityName: String
        venueName: String
        eventUrl: String
    }
    const events: Event[] = [
        {
            id: 11129128,
            eventName: "Wild Flag at The Fillmore",
            startDateTime: '2012-04-18T20:00:00-0800',
            artistName: 'Wild Flag',
            cityName: 'San Francisco, CA, US',
            venueName: 'The Fillmore',
            eventUrl: 'http://www.songkick.com/concerts/11129128-wild-flag-at-fillmore?utm_source=PARTNER_ID&utm_medium=partner'
        },
        {
            id: 11129128,
            eventName: "Wild Flag at The Fillmore",
            startDateTime: '2012-04-18T20:00:00-0800',
            artistName: 'Wild Flag',
            cityName: 'San Francisco, CA, US',
            venueName: 'The Fillmore',
            eventUrl: 'http://www.songkick.com/concerts/11129128-wild-flag-at-fillmore?utm_source=PARTNER_ID&utm_medium=partner'
        },
        {
            id: 11129128,
            eventName: "Wild Flag at The Fillmore",
            startDateTime: '2012-04-18T20:00:00-0800',
            artistName: 'Wild Flag',
            cityName: 'San Francisco, CA, US',
            venueName: 'The Fillmore',
            eventUrl: 'http://www.songkick.com/concerts/11129128-wild-flag-at-fillmore?utm_source=PARTNER_ID&utm_medium=partner'
        },
    ];

    return (
        <Container>
            <FlatList
                data={events}
                keyExtractor={(item) => (item.id)}
                renderItem={({ item }) => (
                    <Card style={appbarStyle.card} elevation={5} onPress={() => Linking.openURL(item.eventUrl)}>
                        <Card.Title style={appbarStyle.cardTitle} title={<Text style={appbarStyle.cardTitle}>{item.eventName}</Text>} />
                    </Card>
                )} />
        </Container>
    );
};

export default EventsList;