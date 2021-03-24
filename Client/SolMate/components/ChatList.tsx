import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Container, Card, MessageText, PostTime, TextSection, UserImg, UserImgWrapper, UserInfo, UserInfoText, UserName } from '../styles/ChatStyles';
import { io } from 'socket.io-client';
import axios from 'axios';
import { IChat, IUser, IMessage } from '../util/Types';
import { SERVER_ADDRESS, SERVER_PORT } from "@env";

const ChatList = ({navigation}) => {

    const {state} = useContext(userContext);
    const [chats, setChats] = useState<IChat[]>([])

    // This works when connected via the QR code in LAN mode.
    // Find your local IP address.
    const socket = io(`${SERVER_ADDRESS}:${SERVER_PORT}?_id=${state.user._id}`, {
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

    const getChats = () => {
        console.log("Getting multiple chats");
        axios.get(`${SERVER_ADDRESS}:${SERVER_PORT}/chat?UserId=${USER_ID}`)
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
                keyExtractor={(item, index) => (index + "")}
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

function useContext(userContext: any): { state: any; } {
    throw new Error('Function not implemented.');
}


function userContext(userContext: any): { state: any; } {
    throw new Error('Function not implemented.');
}
