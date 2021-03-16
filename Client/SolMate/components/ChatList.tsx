import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Container, Card, MessageText, PostTime, TextSection, UserImg, UserImgWrapper, UserInfo, UserInfoText, UserName } from '../styles/ChatStyles';
import { io } from 'socket.io-client';
import axios from 'axios';
import { IChat, IUser, IMessage } from '../util/Types';

const ChatList = ({navigation}) => {

    // TODO: Switch to actual user id.
    const USER_ID = '604639ae4ad4fa1dcc6822e5';
    const [chats, setChats] = useState<IChat[]>([])

    // This works when connected via the QR code in LAN mode.
    // Find your local IP address.
    const socket = io('http://10.0.0.6:8999?_id=' + USER_ID, {
        transports: [ 'websocket' ],
	    upgrade: false,
        rejectUnauthorized: false
    });
    socket.on('connect', () => {
        console.log("The socket is connected");
        console.log(socket.connected);
    });

    socket.on('chat_message', () => {
        console.log("Received message on client");
        getChats();
    });

    socket.on("reconnection_attempt", () => {
        console.log("Attempting connection.");
      });

      socket.on("connect_error", (err) => {
        console.log(err);
      });

    useEffect(() => {
        getChats();
        navigation.addListener('focus', () => {
            console.log("focus");
            getChats();
        });
    }, []);

    // useFocusEffect(() => {
    //     console.log("UseFocusEffect");
    //     getChats();
    // });


    const getChats = () => {
        console.log("Getting multiple chats");
        axios.get('http://10.0.0.6:3001/chat?UserId=' + USER_ID)
            .then((res) => {
                setChats(res.data);
            })
            .catch((err) => {
                console.log("Error");
                console.log(err);
            });
    };

    /* TODO: Switch the chats nav param to chat id and use it in single chat screen(also make a request for receiving a single chat on server side using the chat _id). */
    return (
        <Container>
            <FlatList
                data={chats}
                keyExtractor={(item) => (item.userName)}
                renderItem={({item, index}) => {
                    const otherUser: IUser = (item as IChat).UserId1['_id'] === "604639ae4ad4fa1dcc6822e5" ? (item as IChat).UserId2 : (item as IChat).UserId1;;
                    const lastMessage: IMessage | undefined = (item as IChat).Messages[0];
                    return (
                    <Card onPress={() => navigation.navigate('Chat', { userName: item.userName, index: index, chatId: chats[index]['_id'] })}>
                        <UserInfo>
                            <UserImgWrapper>
                                <UserImg source={{uri: otherUser.picture}} />
                            </UserImgWrapper>
                            <TextSection>
                                <UserInfoText>
                                    <UserName>{`${otherUser.firstName} ${otherUser.lastName}`}</UserName>
                                    <PostTime>{lastMessage?.msgDate}</PostTime>
                                </UserInfoText>
                                <MessageText>{lastMessage?.text }</MessageText>
                            </TextSection>
                        </UserInfo>
                    </Card>
                )}} />
        </Container>
    );
};

export default ChatList;