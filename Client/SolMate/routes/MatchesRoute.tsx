import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';
import MatchCard from '../components/MatchCard';
import Carousel from 'react-native-snap-carousel';
import { Colors, IconButton } from 'react-native-paper';

const MatchesRoute = () => {
    const [matches, setMatches] = useState([1, 2, 3]);

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

    const renderCard = (item) => {
        return (
            <MatchCard />
        )
    }

    return (
        <View>
            <View style={appbarStyle.matchesContainer}>
                <Carousel
                style={{marginBottom: 0, paddingBottom: 0}}
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
            <Text>Matches Route</Text>
        </View>
    );
}

export default MatchesRoute;