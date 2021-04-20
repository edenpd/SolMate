import React, { useContext, useState } from 'react';
import { GestureResponderEvent, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Card, Paragraph, Title, Avatar, Button, TouchableRipple } from 'react-native-paper';
import { IMatch, IUser } from '../util/Types';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, IconButton } from 'react-native-paper';
import { TouchableHighlight } from 'react-native-gesture-handler';
import axios from 'axios';
import NewMatchDialog from './NewMatchDialog';
import { userContext } from '../contexts/userContext';
import { SERVER_ADDRESS, SERVER_PORT } from '@env';

interface MatchCardProps {
    match: IMatch;
    user: IUser;
    onAfterRespond: () => void;
    onProfileClick: () => void;
};

const MatchCard = ({ match, user, onAfterRespond, onProfileClick }: MatchCardProps) => {
    const PICS = [user.picture, ...user.Media];
    const [showNames, setShowNames] = useState<Boolean>(false);
    const [isDialogVisible, setIsDialogVisible] = useState<Boolean>(false);
    const { state } = useContext(userContext);
    const [picIndex, setPicIndex] = useState(0);

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
            zIndex: 10,
            flexWrap: 'wrap'
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
        profileButton: {
            alignSelf: 'center',
            position: 'absolute',
            zIndex: 2
        },
        artistListRipple: {
            borderRadius: 50,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            flexWrap: 'wrap'
        }
    });

    const calcAge = (date: Date) => {
        return new Number(
            (new Date().getTime() - new Date(date).getTime()) / 31536000000
        ).toFixed(0);
    };

    const respondToMatch = (resp: String) => {
        const uMatch = {
            matchId: match['_id'],
            userId: state.user._id,
            approve: resp
        };

        axios.put(`${SERVER_ADDRESS}:${SERVER_PORT}/match`, uMatch)
            .then((res) => {
                console.log("The res is:");
                console.log(res.data);
                const match = res.data.match;

                if (match.Approve1 === 'accepted' && match.Approve2 === 'accepted') {

                    // Show dialog.
                    setIsDialogVisible(true);
                }

                onAfterRespond();
            })
            .catch((err) => {
                console.log("Error");
                console.log(err);

                // TODO: Show error message.
            });
    };

    const renderArtists = () => {
        const artistsDOM = [];
        for (let i = 0; i < 3 && i < user.Artists.length; i++) {
            artistsDOM.push(
                <View key={"artist" + i} style={appbarStyle.artist}>
                    <Avatar.Image style={appbarStyle.artistImage} source={{ uri: user.Artists[i].images[0].url }} />
                    {showNames && <Text style={appbarStyle.artistName}>{user.Artists[i].name}</Text>}
                </View>
            );
        }

        return artistsDOM;
    };

    const switchPic = () => {
        setPicIndex(picIndex + 1 < PICS.length ? picIndex + 1 : 0);
    };

    const onPressArtists = (e: GestureResponderEvent) => {
        setShowNames(!showNames)
    };

    return (
        <Card onPress={switchPic} style={appbarStyle.card} elevation={5}>
            <ImageBackground
                style={appbarStyle.ImageBackground}
                imageStyle={appbarStyle.ImageBackground}
                resizeMode='cover'
                source={{ uri: PICS[picIndex] }} >
                <View
                    style={appbarStyle.profileButton}>
                    <IconButton
                        icon="account"
                        color={Colors.white}
                        size={35}
                        onPress={() => onProfileClick()}
                    />
                </View>
                <Card.Title style={appbarStyle.cardTitle} title={<Text></Text>} />
                <TouchableRipple borderless={true} style={appbarStyle.artistListRipple} underlayColor={'transparent'} onPress={onPressArtists}>
                    <View style={appbarStyle.artistList}>
                        {renderArtists()}
                    </View>
                </TouchableRipple>
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
