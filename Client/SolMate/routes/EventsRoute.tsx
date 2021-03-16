import { Text, StyleSheet, Linking } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import React, { } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Container } from '../styles/ChatStyles';
import { Card, Paragraph } from 'react-native-paper';

const EventsRoute = ({ Linking }) => {

    const appbarStyle = StyleSheet.create({
        card: {
            alignItems: 'center',
            alignContent: 'center',
            width: 340,
            margin: 20
        },
        cardTitle: {
            alignItems: 'center',
            alignContent: 'center',
            color: 'purple',
            textAlign: 'center',
            alignSelf: 'center',
            fontSize: 25,
        },
        artistName: {
            alignItems: 'center',
            alignContent: 'center',
            color: 'purple',
            textAlign: 'center',
            alignSelf: 'center',
            fontSize: 20
        },
        cardContent: {
            alignItems: 'center',
            alignContent: 'center',
            width: 340,
            margin: 10,
            justifyContent: 'space-between',

        },
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
            id: 11129121,
            eventName: "Wild Flag at The Fillmore",
            startDateTime: '2012-04-18T20:00:00-0800',
            artistName: 'Wild Flag',
            cityName: 'San Francisco, CA, US',
            venueName: 'The Fillmore',
            eventUrl: 'http://www.songkick.com/concerts/11129128-wild-flag-at-fillmore?utm_source=PARTNER_ID&utm_medium=partner'
        },
        {
            id: 11129122,
            eventName: "Wild Flag at The Fillmore",
            startDateTime: '2012-04-18T20:00:00-0800',
            artistName: 'Wild Flag',
            cityName: 'San Francisco, CA, US',
            venueName: 'The Fillmore',
            eventUrl: 'http://www.songkick.com/concerts/11129128-wild-flag-at-fillmore?utm_source=PARTNER_ID&utm_medium=partner'
        },
        {
            id: 11129123,
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
                showsHorizontalScrollIndicator={false}

                data={events}
                keyExtractor={(item) => (item.id)}
                renderItem={({ item, index }) => {
                    return (
                        <Card style={appbarStyle.card} elevation={5}>
                            <Card.Title style={appbarStyle.cardTitle} title={<Text style={appbarStyle.cardTitle}>{item.eventName}</Text>} />
                            <Paragraph style={appbarStyle.artistName}>{item.artistName}</Paragraph>

                            <Card.Content style={appbarStyle.cardContent}>
                                <Text>{item.cityName}</Text>
                                <Text>{item.venueName}</Text>
                                <Text>{item.startDateTime}</Text>
                            </Card.Content>
                        </Card>
                    )
                }} />
        </Container>
    );
}

export default EventsRoute;