import axios from 'axios';
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text } from 'react-native';
import { Bubble, Composer, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import { io } from 'socket.io-client';
import { IMessage, IChat } from '../util/Types';
import { SERVER_ADDRESS, SERVER_PORT, CHAT_SOCKET_ADDRESS, CHAT_SOCKET_PORT } from '@env';
import { userContext } from '../contexts/userContext';

const Chat = (props) => {

    // State Declaration
    const {state} = useContext(userContext);
    const [messages, setMessages] = useState<Array<any>>([]);
    const [chatId, setChatId] = useState(props.route.params.chatId);
    const [user, setUser] = useState({
        _id: state.user._id + "",
    });
    const [chat, setChat] = useState({ Messages: [] } as IChat);

    const socket = io(`${CHAT_SOCKET_ADDRESS}:${CHAT_SOCKET_PORT}?_id=${state.user._id}`, {
        transports: ['websocket'],
        upgrade: false,
        rejectUnauthorized: false
    });

    socket.on('chat_message', () => {
        console.log("Received message on single chat client");
        getChat();
        // props.route.params.getChats();
    });

    const getChat = () => {
        console.log("Getting messages");
        console.log(`${SERVER_ADDRESS}:${SERVER_PORT}/chat/single?chatId=${chatId}`);
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
            createdAt: msg.msgDate
        })));
        setMessages(newMsg);
    }, [chat]);

    const onSend = useCallback((newMessages = []) => {
        axios.put(`${SERVER_ADDRESS}:${SERVER_PORT}/chat`, {
            ...chat,
            Messages: GiftedChat.append(messages, newMessages.map(msg => ({
                ...msg,
                msgDate: new Date()
            }))).map((msg: any, index: any) => ({
                MsgId: index + "",
                msgDate: msg.msgDate,
                text: msg.text,
                user: state.user._id
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
            listViewProps={{style: { backgroundColor: '#f6f6f6' }}}
            renderComposer={renderComposer} />
    );
}

export default Chat;