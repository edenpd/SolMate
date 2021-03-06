import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import {
  Container,
  Card,
  MessageText,
  PostTime,
  TextSection,
  UserImg,
  UserImgWrapper,
  UserInfo,
  UserInfoText,
  UserName,
} from "../styles/ChatStyles";
import { io } from "socket.io-client";
import axios from "axios";
import { IChat, IUser, IMessage } from "../util/Types";
import {
  SERVER_PORT,
  SERVER_ADDRESS,
  CHAT_SOCKET_PORT,
  CHAT_SOCKET_ADDRESS,
} from "@env";
import { userContext } from "../contexts/userContext";
import moment from "moment";

const ChatList = ({ navigation }) => {
  const { state } = useContext(userContext);
  const [chats, setChats] = useState<IChat[]>([]);

  // This works when connected via the QR code in LAN mode.
  // Find your local IP address.
  console.log("The web socket is:");
  console.log(
    `${CHAT_SOCKET_ADDRESS}:${CHAT_SOCKET_PORT}?_id=${state.user._id}`
  );
  const socket = io(
    `${CHAT_SOCKET_ADDRESS}:${CHAT_SOCKET_PORT}?_id=${state.user._id}`,
    {
      transports: ["websocket"],
      upgrade: false,
      rejectUnauthorized: false,
    }
  );
  socket.on("connect", () => {
    console.log("The socket is connected");
    console.log(socket.connected);
  });

  socket.on("chat_message", () => {
    console.log("Received message on client");
    getChats();
  });

  socket.on("reconnection_attempt", () => {
    console.log("Attempting connection.");
  });

  socket.on("connect_error", (err) => {
    // console.log(err);
  });

  useEffect(() => {
    getChats();
    navigation.addListener("focus", () => {
      console.log("focus");
      getChats();
    });
  }, []);

  const getChats = () => {
    console.log("Getting multiple chats");
    axios
      .get(`${SERVER_ADDRESS}:${SERVER_PORT}/chat?UserId=${state.user._id}`)
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
      {chats.length === 0 && (
        <Container
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: '100%'
          }}
        >
          <Text
            style={{
              fontFamily: "Poppins_300Light",
              color: "#8860D0",
              marginBottom: 20,
              fontSize: 25,
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              flexDirection: 'column',
              alignItems: 'center',
              alignSelf: 'center',
              alignContent: 'center',
              textAlign: 'center'

            }}>
            No chats found yet...{'\n'}
            Waiting for your first match. 😍
          </Text>
        </Container>
      )}

      <FlatList
        data={chats}
        keyExtractor={(item, index) => index + ""}
        renderItem={({ item, index }) => {
          const otherUser: IUser =
            (item as IChat).UserId1["_id"] === state.user._id
              ? (item as IChat).UserId2
              : (item as IChat).UserId1;
          const lastMessage: IMessage | undefined = (item as IChat).Messages[0];
          return (
            <Card
              onPress={() =>
                navigation.navigate("Chat", {
                  userName: `${otherUser.firstName} ${otherUser.lastName}`,
                  index: index,
                  chatId: chats[index]["_id"],
                })
              }
            >
              <UserInfo>
                <UserImgWrapper>
                  <UserImg
                    source={{
                      uri: `${SERVER_ADDRESS}:${SERVER_PORT}/static/${otherUser.picture}`,
                    }}
                  />
                </UserImgWrapper>
                <TextSection>
                  <UserInfoText>
                    <UserName>{`${otherUser.firstName} ${otherUser.lastName}`}</UserName>
                    <PostTime>
                      {moment(lastMessage?.msgDate).calendar()}
                    </PostTime>
                  </UserInfoText>
                  <MessageText>{lastMessage?.text}</MessageText>
                </TextSection>
              </UserInfo>
            </Card>
          );
        }}
      />
    </Container>
  );
};

export default ChatList;
