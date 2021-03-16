import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Paragraph, Title, Avatar, Button, IconButton } from 'react-native-paper';

const EventCard = () => {
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

    return (
        <Card style={appbarStyle.card} elevation={5}>
                    <Card.Title style={appbarStyle.cardTitle} title={<Text style={appbarStyle.cardTitle}>Wild Flag at The Fillmore</Text>} />
                    <Card.Cover style={appbarStyle.userImage} source={{ uri: 'https://picsum.photos/700' }} />
                    <Card.Content style={appbarStyle.card}>
                        <Paragraph>Music is my life. looking for the one</Paragraph>
                        <Paragraph>
                            <Text>Age: 23{"\n"}</Text>
                            <Text>Distance: 3km</Text>
                        </Paragraph>
                        <View>
                            <Title style={appbarStyle.cardTitle}>Mutual Artists:</Title>
                            <View style={appbarStyle.artistList}>
                                <Avatar.Image style={appbarStyle.artist} source={{ uri: 'https://picsum.photos/700' }}/>
                                <Avatar.Image style={appbarStyle.artist} source={{ uri: 'https://picsum.photos/700' }}/>
                                <Avatar.Image style={appbarStyle.artist} source={{ uri: 'https://picsum.photos/700' }}/>
                            </View>             
                        </View>
                    </Card.Content>
                    {/* <Card.Actions>
                        <Button color="purple">Cancel</Button>
                        <Button color="purple">Ok</Button>
                    </Card.Actions> */}
                </Card>
    );
}

export default EventCard;