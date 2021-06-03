import axios from 'axios';
import React, { useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { Bubble, Composer, GiftedChat, MessageText, Send } from 'react-native-gifted-chat';
import { io } from 'socket.io-client';
import { IChat, IUser } from '../util/Types';
import { SERVER_ADDRESS, SERVER_PORT, CHAT_SOCKET_ADDRESS, CHAT_SOCKET_PORT } from '@env';
import { userContext } from '../contexts/userContext';
import { Card, Text } from 'react-native-elements';
import { Animated, Linking, StyleSheet, Touchable, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import moment from 'moment';
import { UserInfo, UserImgWrapper, UserImg, TextSection, UserInfoText, UserName, PostTime } from '../styles/ChatStyles';

const Chat = (props) => {

    // State Declaration
    const { state } = useContext(userContext);
    const [messages, setMessages] = useState<Array<any>>([]);
    const [chat, setChat] = useState({ Messages: [] } as IChat);
    const [recEvents, setRecEvents] = useState([]);
    const [recArtists, setRecArtists] = useState([]);
    const [recAreOpen, setRecAreOpen] = useState(false);
    const [bounceValue, setBounceValue] = useState(new Animated.Value(0));
    const [otherUser, setOtherUser] = useState<IUser>({} as IUser);

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
                getArtistsRecommendation(res.data);
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
        setOtherUser(chat.UserId1 === user._id ? chat.UserId1 : chat.UserId2);
    }, [chat]);

    useEffect(() => {
        let toValue = 120;

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
                setRecEvents(res.data);
            })
            .catch((err) => {
                console.log("Error");
                console.log(err);
            });
    };

    const getArtistsRecommendation = (chatData: IChat) => {
        var chatUser = chatData.UserId1;
        if (chatUser._id == state.user._id)
            chatUser = chatData.UserId2;

        axios.get(`${SERVER_ADDRESS}:${SERVER_PORT}/user/getuser?userId=${chatUser._id}`)
            .then((res) => {
                setRecArtists(res.data.Artists);
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
        },
        headerContainer: {
            display: 'flex',
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
        },
        otherUserImage: {
        },
        otherUserName: {
            margin: 10
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
                <Animated.View style={[style.eventsContainer, { transform: [{ translateY: bounceValue }] }]}>
                    {eventsDOM}
                </Animated.View>
                <View>
                    <Text style={style.footerText} onPress={() => setRecAreOpen(!recAreOpen)}>
                        {text}
                    </Text>
                </View>
            </View>
        );
    };

    const renderChatEmpty = () => {
        var msg = "You can talk about ";

        for (let i = 0; i < 3 && i < recArtists.length; i++) {
            if (i == 2 || i == recArtists.length - 1) {
                msg = msg.slice(0, -2);
                msg = msg.concat(' and ' + recArtists[i].name)
            } else
                msg = msg.concat(recArtists[i].name + ", ")
        }
        return (
            <View
                style={{
                    flex: 1,
                    alignSelf: 'center',
                    justifyContent: 'center'

                }}
            >

                <Text style={{
                    fontFamily: "Poppins_300Light",
                    color: "#8860D0",
                    marginTop: 20,
                    textAlign: 'center',
                    transform: [{ scaleY: -1 }]
                }}>  {msg}</Text>
                <Text style={{
                    fontFamily: "Poppins_300Light",
                    color: "#8860D0",
                    marginBottom: 20,
                    fontSize: 25,
                    textAlign: 'center',
                    transform: [{ scaleY: -1 }]
                }}>New solmate was found!</Text>
            </View>
        );
    };

    const onProfilePress = () => {
        props.navigation.navigate('Profile', { user: otherUser._id });
    }

    return (
        <View>
            <TouchableOpacity style={style.headerContainer} onPress={onProfilePress}>
                <UserImgWrapper onPress style={style.otherUserImage}>
                    <UserImg source={{ uri: `${SERVER_ADDRESS}:${SERVER_PORT}/static/${otherUser?.picture}` }} />
                </UserImgWrapper>
                <UserName style={style.otherUserName}>{`${otherUser?.firstName} ${otherUser?.lastName}`}</UserName>
            </TouchableOpacity>
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
                renderChatEmpty={renderChatEmpty}
            />
        </View >
    );
}

export default Chat;