import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Card, Paragraph, Title, Avatar, Button } from 'react-native-paper';
import { IMatch, IUser } from '../util/Types';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, IconButton } from 'react-native-paper';
import { TouchableHighlight } from 'react-native-gesture-handler';
import axios from 'axios';
import NewMatchDialog from './NewMatchDialog';

interface MatchCardProps {
    match: IMatch;
    user: IUser;
    onAfterRespond: () => void;
};

const MatchCard = ({ match, user, onAfterRespond }: MatchCardProps) => {

    // TODO: Switch to actual user id.
    const USER_ID = '604639ae4ad4fa1dcc6822e5';

    const [showNames, setShowNames] = useState<Boolean>(false);
    const [isDialogVisible, setIsDialogVisible] = useState<Boolean>(false);
    const appbarStyle = StyleSheet.create({
        userImage: {
            alignSelf: 'center',
            width: 200,
            height: 200
        },
        card: {
            alignItems: 'center',
            alignContent: 'center',
            borderBottomLeftRadius: 100,
            borderBottomRightRadius: 30,
            borderTopRightRadius: 100,
            borderTopLeftRadius: 30
        },
        cardTitle: {
            alignItems: 'center',
            alignContent: 'center',
            color: 'white',
            textAlign: 'center',
            alignSelf: 'center',
            fontSize: 24,
            fontFamily: 'Poppins_500Medium_Italic'
        },
        artistList: {
            display: 'flex',
            flexDirection: 'column',
            // position: 'absolute',
            // left: 0,
            // top: '20%'
        },
        artist: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        },
        artistName: {
            color: 'white',
            fontFamily: 'Poppins_100Thin'
        },
        artistImage: {
            margin: 10,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,
            elevation: 10,
        },
        ImageBackground: {
            width: '100%',
            height: '100%',
            flex: 1,
            borderBottomLeftRadius: 100,
            borderBottomRightRadius: 30,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 100
        },
        linearGradientContainer: {
            position: 'absolute',
            width: "100%",
            height: "50%",
            bottom: 80,
            // borderBottomLeftRadius: 100
        },
    });

  const calcAge = (date: Date) => {
    return new Number(
      (new Date().getTime() - new Date(date).getTime()) / 31536000000
    ).toFixed(0);
  };

    const respondToMatch = (resp: String) => {
        const uMatch = {
            matchId: match['_id'],
            userId: USER_ID,
            approve: resp
        };

        axios.put('http://10.0.0.6:3001/match', uMatch)
            .then((res) => {
                console.log("The res is:");
                console.log(res.data);
                const match = res.data.match;
                // setMatches(res.data);
                if (match.Approve1 === 'accepted' && match.Approve2 === 'accepted') {
                    // TODO: Show dialog.
                    setIsDialogVisible(true);
                }

                // TODO: Remove the card.
                onAfterRespond();
            })
            .catch((err) => {
                console.log("Error");
                console.log(err);

                // TODO: Show error message.
            });
    };

    return (
        <Card style={appbarStyle.card} elevation={5}>
            <ImageBackground
                style={appbarStyle.ImageBackground}
                imageStyle={appbarStyle.ImageBackground}
                resizeMode='cover'
                source={{ uri: user.picture }} >
                <Card.Title style={appbarStyle.cardTitle} title={<Text></Text>} />
                <TouchableHighlight underlayColor={'transparent'} onPress={() => setShowNames(!showNames)}>
                    <View style={appbarStyle.artistList}>
                        <View style={appbarStyle.artist}>
                            <Avatar.Image style={appbarStyle.artistImage} source={{ uri: 'https://assets.vogue.com/photos/5e40a77f89bdc90008ecc389/master/pass/billie-eilish-promo.jpg' }} />
                            {showNames && <Text style={appbarStyle.artistName}>Billie Eillish</Text>}
                        </View>
                        <View style={appbarStyle.artist}>
                            <Avatar.Image style={appbarStyle.artistImage} source={{ uri: 'https://i.guim.co.uk/img/media/c001a1444cc7dc29768ff55dfa283d0ea25651e1/0_312_3000_1800/master/3000.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=f2f5d6e805577a64dd67472affba629a' }} />
                            {showNames && <Text style={appbarStyle.artistName}>Mac Miller</Text>}
                        </View>
                        <View style={appbarStyle.artist}>
                            <Avatar.Image style={appbarStyle.artistImage} source={{ uri: 'https://anothermanimg-dazedgroup.netdna-ssl.com/640/azure/anotherman-prod/360/6/366567.jpg' }} />
                            {showNames && <Text style={appbarStyle.artistName}>Arctic Monkeys</Text>}
                        </View>
                    </View>
                </TouchableHighlight>
                <View style={appbarStyle.linearGradientContainer}>
                    <Card.Content style={{ position: 'absolute', bottom: 20, zIndex: 5 }}>
                        <Text style={appbarStyle.cardTitle}>{`${user.firstName} ${user.lastName}, ${calcAge(user.birthday)}`}</Text>
                        <Text style={{ color: 'white', fontSize: 15, fontFamily: 'Poppins_300Light' }}>{user.description}</Text>
                    </Card.Content>
                    <LinearGradient
                        style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 4 }}
                        start={{ y: 0.3, x: 0 }}
                        colors={[
                            'transparent',
                            '#8860D0'
                        ]} />
                </View>

                <View style={{ position: "absolute", width: '100%', height: 80, backgroundColor: '#8860D0', bottom: 0, borderBottomLeftRadius: 100, borderBottomRightRadius: 30, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ display: 'flex', flexDirection: "row", justifyContent: 'space-around', alignItems: 'center', width: '60%' }}>
                        <IconButton
                            icon="alpha-x-circle-outline"
                            color={Colors.white}
                            size={65}
                            onPress={() => respondToMatch('declined')}
                        />
                        <IconButton
                            icon="check-circle-outline"
                            color={Colors.white}
                            size={65}
                            onPress={() => respondToMatch('accepted')}
                        />
                    </View>
                </View>
            </ImageBackground>
            <NewMatchDialog visible={isDialogVisible} setIsVisible={setIsDialogVisible} />
        </Card >
    );
}

export default MatchCard;
