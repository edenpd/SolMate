import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';
import MatchCard from '../components/MatchCard';
import Carousel from 'react-native-snap-carousel';
import { Colors, IconButton } from 'react-native-paper';
import axios from 'axios';
import { IMatch } from '../util/Types';

const MatchesRoute = () => {

    // TODO: Switch to actual user id.
    const USER_ID = '604639ae4ad4fa1dcc6822e5';

    const [matches, setMatches] = useState<IMatch[]>([]);

    useEffect(() => {
        getMatches();
    }, []);

    const getMatches = () => {
        console.log("Getting multiple matches");
        axios.get('http://10.0.0.6:3001/match?userId=' + USER_ID)
            .then((res) => {
                setMatches(res.data);
            })
            .catch((err) => {
                console.log("Error");
                console.log(err);
            });
    };

    const appbarStyle = StyleSheet.create({
        matchesContainer: {
            paddingTop: 20,
            paddingBottom: 20,
            alignContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            maxHeight: 700,
            backgroundColor: "#f6f6f6"
        }
    });

    const onAfterRespond = () => {
        getMatches();
    };

    const renderCard = ({ item, index }) => {
        const otherUser = (item as IMatch).firstUser['_id'] === USER_ID ? item.secondUser : item.firstUser;

        return (
            <MatchCard user={otherUser} match={item} onAfterRespond={onAfterRespond} />
        );
    }

    return (
        <View style={{height: '100%', width: '100%', backgroundColor: 'transparent'}}>
            <View style={appbarStyle.matchesContainer}>
                <Carousel
                    style={{ marginBottom: 0, paddingBottom: 0 }}
                    layout={'tinder'}
                    data={matches}
                    renderItem={renderCard}
                    itemWidth={350}
                    sliderWidth={400}
                    layoutCardOffset={9}
                />
                {/* <View style={{ flexDirection: "row", justifyContent: 'space-around', width: 250 }}>
                    <IconButton
                        icon="alpha-x-circle-outline"
                        color={Colors.red500}
                        size={70}
                        onPress={() => console.log('Pressed')}
                    />
                    <IconButton
                        icon="check-circle-outline"
                        color={Colors.green500}
                        size={70}
                        onPress={() => console.log('Pressed')}
                    />
                </View> */}

            </View>
        </View>
    );
}

export default MatchesRoute;