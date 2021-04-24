import axios from 'axios';
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Bubble, Composer, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import { io } from 'socket.io-client';
import { IChat } from '../util/Types';
import { SERVER_ADDRESS, SERVER_PORT, CHAT_SOCKET_ADDRESS, CHAT_SOCKET_PORT } from '@env';
import { userContext } from '../contexts/userContext';

const Chat = (props) => {

    // State Declaration
    const { state } = useContext(userContext);
    const [messages, setMessages] = useState<Array<any>>([]);
    const [chat, setChat] = useState({ Messages: [] } as IChat);

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
        console.log("Received message on single chat client");
        getChat();
    });

    const getChat = () => {
        axios.get(`${SERVER_ADDRESS}:${SERVER_PORT}/chat/single?chatId=${chatId}`)
            .then((res) => {
                setChat(res.data);
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
            renderComposer={renderComposer} />
    );
}

export default Chat;