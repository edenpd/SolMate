import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { Bubble, Composer, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import { io } from 'socket.io-client';
import { IMessage, IChat } from '../util/Types';

const Chat = (props) => {

    // TODO: Switch to actual user id.
    const USER_ID = '604639ae4ad4fa1dcc6822e5';

    // State Declaration
    const [messages, setMessages] = useState<Array<any>>([]);
    const [chatId, setChatId] = useState(props.route.params.chatId);
    const [user, setUser] = useState({
        _id: USER_ID,
    });
    const [chat, setChat] = useState({ Messages: [] } as IChat);

    const socket = io('http://10.0.0.6:8999?_id=' + USER_ID, {
        transports: [ 'websocket' ],
	    upgrade: false,
        rejectUnauthorized: false
    });

    socket.on('chat_message', () => {
        console.log("Received message on single chat client");
        getChat();
        // props.route.params.getChats();
    });

    const getChat = () => {
        axios.get('http://10.0.0.6:3001/chat/single?chatId=' + chatId)
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
        axios.put("http://10.0.0.6:3001/chat", {
            ...chat,
            Messages: GiftedChat.append(messages, newMessages.map(msg => ({
                ...msg,
                msgDate: new Date()
            }))).map((msg: any, index: any) => ({
                MsgId: index + "",
                msgDate: msg.msgDate,
                text: msg.text,
                user: USER_ID
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
            messages={messages}
            onSend={onSend}
            user={user}
            renderBubble={renderBubble}
            renderSend={renderSend}
            renderComposer={renderComposer} />
    );
}

export default Chat;