import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Paragraph, Title, Avatar, Button, IconButton } from 'react-native-paper';
import { IUser } from '../util/Types';

interface MatchCardProps {
    user: IUser;
};

const MatchCard = ({ user }: MatchCardProps) => {
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

    const calcAge = (date: Date) => {
        return new Number((new Date().getTime() - new Date(date).getTime()) / 31536000000).toFixed(0);
    }

    return (
        <Card style={appbarStyle.card} elevation={5}>
            <Card.Title style={appbarStyle.cardTitle} title={<Text style={appbarStyle.cardTitle}>{`${user.firstName} ${user.lastName}`}</Text>} />
            <Card.Cover style={appbarStyle.userImage} source={{ uri: user.picture }} />
            <Card.Content style={appbarStyle.card}>
                <Paragraph>{user.description}</Paragraph>
                <Paragraph>
                    <Text>Age: {calcAge(user.birthday)}</Text></Paragraph>
                <Paragraph>
                    <Text>Distance: 3km</Text>
                </Paragraph>
                <View>
                    <Title style={appbarStyle.cardTitle}>Mutual Artists:</Title>
                    <View style={appbarStyle.artistList}>
                        <Avatar.Image style={appbarStyle.artist} source={{ uri: 'https://picsum.photos/700' }} />
                        <Avatar.Image style={appbarStyle.artist} source={{ uri: 'https://picsum.photos/700' }} />
                        <Avatar.Image style={appbarStyle.artist} source={{ uri: 'https://picsum.photos/700' }} />
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

export default MatchCard;