import React, {useState} from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import {  Paragraph, Title, Avatar, Button, IconButton, BottomNavigation } from 'react-native-paper';

import { IUser } from '../util/Types';

interface ProfileProps {
    user: IUser;
};

const Media = (style) => {
    return (
        <View style={style}>
                        <Image
                source={require('../assets/favicon.png')}
            />
                        <Image
                source={require('../assets/favicon.png')}
            />
        </View>
    )
}

const topArtists = (style) => {
    return (
        <View style={style}>
                        <Image
                source={require('../assets/favicon.png')}
            />
                        <Image
                source={require('../assets/favicon.png')}
            />
                        <Image
                source={require('../assets/favicon.png')}
            />
                        <Image
                source={require('../assets/favicon.png')}
            />
        </View>
    )

}

const Profile = ({ user }: ProfileProps) => {
    const [index,setIndex] = useState(0);

    const styles = StyleSheet.create({
        root:{
            alignItems: 'center',
            alignContent: 'center'
        },
        avatar:{
            marginTop: 40,
            alignSelf: 'center',
            width: 200,
            height: 200,
            borderRadius: 100
        },
        title:{
            marginTop: 30,
            alignItems: 'center',
            alignContent: 'center',
            textAlign: 'center',
        },
        description: {
            marginTop: 5
        },
        tabs:{
            marginTop: 30,
            flexDirection: 'row',
        },
        content:{
            marginTop: 30,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
        },
    });
    
    let content = null;

    index === 0 ? content = topArtists(styles.content) : content = Media(styles.content)

    return (
        <View style={styles.root}>

            <Avatar.Image style={styles.avatar} source={{ uri: 'https://picsum.photos/700' }} />
            <Title style={styles.title}>Shiri Mesika</Title>
            <Paragraph style={styles.description}>Dancer</Paragraph>

            <View style={styles.tabs}>
                <Button mode="contained" onPress={()=>setIndex(0)}>Top Artists</Button>
                <Button mode="contained" onPress={()=>setIndex(1)}>Media</Button>
            </View>

            {content}
        </View>
    );
}

export default Profile;



