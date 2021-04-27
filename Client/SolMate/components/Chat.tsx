import axios from 'axios';
import React, { useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { Bubble, Composer, GiftedChat, Send } from 'react-native-gifted-chat';
import { io } from 'socket.io-client';
import { IChat } from '../util/Types';
import { SERVER_ADDRESS, SERVER_PORT, CHAT_SOCKET_ADDRESS, CHAT_SOCKET_PORT } from '@env';
import { userContext } from '../contexts/userContext';
import { Text } from 'react-native-elements';
import { Animated, Linking, StyleSheet, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';

const Chat = (props) => {

    // State Declaration
    const { state } = useContext(userContext);
    const [messages, setMessages] = useState<Array<any>>([]);
    const [chat, setChat] = useState({ Messages: [] } as IChat);
    const [recEvents, setRecEvents] = useState([]);
    const [recAreOpen, setRecAreOpen] = useState(false);
    const [bounceValue, setBounceValue] = useState(new Animated.Value(0));

    const chatId = props.route.params.chatId;
    const user = {
        _id: state.user._id,
        // avatar: "http://10.0.0.4:3001/static/IMAGE-1619268114468.jpg"
    };

    const socket = io(`${CHAT_SOCKET_ADDRESS}:${CHAT_SOCKET_PORT}?_id=${state.user._id}`, {
        transports: ['websocket'],
        upgrade: false,
        rejectUnauthorized: false
    });

    socket.on('chat_message', () => {
        getChat();
    });

    const getChat = () => {
        axios.get(`${SERVER_ADDRESS}:${SERVER_PORT}/chat/single?chatId=${chatId}`)
            .then((res) => {
                setChat(res.data);
                getDateRecommendation(res.data);
            })
            .catch((err) => {
                console.log("Error");
                console.log(err);
            });
    };

    useEffect(() => {
        getChat();
    }, []);

    useEffect(() => {
        let newMsg = Array.from(chat.Messages.map(msg => ({
            ...msg,
            createdAt: msg.msgDate,
            user: {
                ...msg.user,
                name: msg.user.firstName + " " + msg.user.lastName,
                avatar: `${SERVER_ADDRESS}:${SERVER_PORT}/static/${msg.user._id === chat.UserId1._id ? chat.UserId1.picture : chat.UserId2.picture}`,
            }
        })));

        setMessages(newMsg);
    }, [chat]);

    useEffect(() => {
        let toValue = 100;

        if (recAreOpen)
            toValue = 0;

        //This will animate the transalteY of the subview between 0 & 100 depending on its current state
        //100 comes from the style below, which is the height of the subview.
        Animated.spring(
            bounceValue,
            {
                toValue: toValue,
                velocity: 3,
                tension: 2,
                friction: 8,
                useNativeDriver: true
            }
        ).start();
    }, [recAreOpen]);

    const getDateRecommendation = (chatData: IChat) => {
        axios.get(`${SERVER_ADDRESS}:${SERVER_PORT}/event/shared?userId1=${chatData.UserId1._id}&userId2=${chatData.UserId2._id}`)
            .then((res) => {
                console.log(res.data);
                setRecEvents(res.data);
            })
            .catch((err) => {
                console.log("Error");
                console.log(err);
            });
    };

    const onSend = useCallback((newMessages = []) => {
        axios.put(`${SERVER_ADDRESS}:${SERVER_PORT}/chat`, {
            ...chat,
            Messages: GiftedChat.append(messages, newMessages.map(msg => ({
                ...msg,
                msgDate: new Date(),
                user: state.user._id
            }))).map((msg: any, index: any) => ({
                MsgId: index + "",
                msgDate: msg.msgDate,
                text: msg.text,
                user: msg.user
            }))
        })
            .then(res => {
                console.log("Success");
            })
            .catch(err => {
                console.log("Error");
            });
    }, [messages]);

    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                textStyle={{
                    left: {
                        color: 'white'
                    },
                    right: {
                        color: 'black'
                    }
                }}
                wrapperStyle={{
                    left: {
                        backgroundColor: '#8860D0'
                    },
                    right: {
                        backgroundColor: 'lightgrey',
                    },
                }}
            />
        );
    };

    const renderSend = (props) => {
        return (
            <Send
                {...props}
                textStyle={{
                    color: '#8860D0'
                }} />
        );
    };

    const renderComposer = (props) => {
        return (
            <Composer
                {...props}
                textInputStyle={{
                    color: 'black'
                }} />
        );
    }

    const style = StyleSheet.create({
        footer: {
            width: '100%',
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        footerText: {
            color: 'lightgrey'
        },
        event: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
        },
        eventImage: {
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
        eventsContainer: {
            display: 'flex',
            flexDirection: 'row'
        }
    });

    const renderFooter = () => {
        const eventsDOM = [];
        for (let i = 0; i < 3 && i < recEvents.length; i++) {
            eventsDOM.push(
                <View key={"artist" + i} style={style.event}>
                    <TouchableOpacity onPress={() => { Linking.openURL(recEvents[i].EventUrl) }}>
                        <Avatar.Image
                            style={style.eventImage}
                            source={{ uri: recEvents[i].Image }}
                        />
                    </TouchableOpacity>
                </View>
            );
        }

        let text = "";

        if (recEvents.length === 0) {
            text = "No Matching Events Found Yet...";
        } else {
            text = recAreOpen ? 'Recommended Events' : `Need date ideas? Click Me!`;
        }

        return (
            <View style={style.footer}>
                <View>
                    <Text style={style.footerText} onPress={() => setRecAreOpen(!recAreOpen)}>
                        {text}
                    </Text>
                </View>
                <Animated.View style={[style.eventsContainer, { transform: [{ translateY: bounceValue }] }]}>
                    {eventsDOM}

                </Animated.View>
            </View>
        );
    };

    return (
        <GiftedChat
            // showUserAvatar={true}
            // renderAvatarOnTop={true}
            messages={messages}
            onSend={onSend}
            user={user}
            renderBubble={renderBubble}
            renderSend={renderSend}
            listViewProps={{ style: { backgroundColor: '#f6f6f6' } }}
            renderComposer={renderComposer}
            renderFooter={renderFooter}
        />
    );
}

export default Chat;