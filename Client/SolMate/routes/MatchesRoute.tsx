import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';
import MatchCard from '../components/MatchCard';
import Carousel from 'react-native-snap-carousel';
import { Colors, IconButton } from 'react-native-paper';
import axios from 'axios';
import { IMatch } from '../util/Types';
import Svg, { Path } from 'react-native-svg';

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
            paddingTop: 50,
            marginBottom: 50,
            alignContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            maxHeight: 700
        }
    });

    const renderCard = ({ item, index }) => {
        const otherUser = (item as IMatch).firstUser['_id'] === USER_ID ? item.secondUser : item.firstUser;

        return (
            <MatchCard user={otherUser} />
        );
    }

    return (
        <View style={{height: '100%', width: '100%'}}>
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
                <View style={{ flexDirection: "row", justifyContent: 'space-around', width: 250 }}>
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
                </View>

            </View>
            <Svg height="100%"
                width="100%"
                viewBox="0 0 1440 320"
                style={{ position: 'relative', width: '100%', height: '100%', zIndex: -3, bottom: 0 }}>
                <Path fill="#5000ca" fill-opacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></Path>
            </Svg>
        </View>
    );
}

export default MatchesRoute;