import React, {useState, useContext} from 'react';
import { StyleSheet, View, Image, Text, ScrollView } from 'react-native';
import {  Paragraph, Title, Avatar, Button, IconButton, BottomNavigation } from 'react-native-paper';
import { userContext } from "../contexts/userContext";
import { IUser } from '../util/Types';
import { SERVER_ADDRESS, SERVER_PORT } from '@env';
import axios from "axios";


interface ProfileProps {
    user: IUser;
};

const Profile = ({ user }: ProfileProps) => {
    const [index,setIndex] = useState(0);
  
    const topArtists = () => {
        renderArtists();
    }

    const Media = (style) => {
        
      return (<ScrollView>
      <View style={style}>{renderMedia()}</View>
      </ScrollView>)
    }
    

  const renderArtists = () => {
    const artistsDOM = [];
    for (let i = 0; i < 3 && i < user.Artists.length; i++) {
        artistsDOM.push(
            <View key={"artist" + i}>
            {/* <Avatar.Image source={{ uri: user.Artists[i].images[0].url }} /> */}
             
            </View>
        );
    }

    return artistsDOM;
};

const renderMedia = () => {
    const mediaDOM = [];
    for (let i = 0;  i < user.Media.length; i++) {
        mediaDOM.push(
            <View key={"media" + i}>
            <Image style={styles.image} source={{ uri: user.Media[i] }} />
            </View>
        );
    }

    return mediaDOM;
};

    const styles = StyleSheet.create({
        root:{
            alignItems: 'center',
            alignContent: 'center'
        },
        avatar:{
            marginTop: 40,
            alignSelf: 'center',
            width: 150,
            height: 150,
            borderRadius: 100
        },
        title:{
            marginTop: 30,
            alignItems: 'center',
            alignContent: 'center',
            textAlign: 'center',
            fontFamily: 'Poppins_500Medium_Italic',
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
            //paddingTop: 50,
        },
          image: {
            width: 180,
            height: 180,
          },
          Title: {
            alignItems: 'center',
            alignContent: 'center',
            color: 'white',
            textAlign: 'center',
            alignSelf: 'center',
            fontSize: 24,
            fontFamily: 'Poppins_500Medium_Italic'
        },
    });
    
    let content = null;
    console.log("hey" + " " + user.description);

    index === 0 ? content = topArtists() : content = Media(styles.content)

    return (
        <View style={styles.root}>

            <Avatar.Image size = {180} source={{ uri: user.picture }} />
            <Title style={styles.title}>{user.firstName + " " + user.lastName}</Title>
            <Paragraph style={styles.description}>{user.description}</Paragraph>

            <View style={styles.tabs}>
                <Button mode="contained" onPress={()=>setIndex(0)}>Top Artists</Button>
                <Button mode="contained" onPress={()=>setIndex(1)}>Media</Button>
            </View>

            {content}
        </View>
    );
}

export default Profile;



