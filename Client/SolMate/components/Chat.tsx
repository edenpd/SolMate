import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { Bubble, Composer, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';

const Chat = () => {

    // State Declaration
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState({
        _id: 1,
      });

    useEffect(() => {
        setMessages([
          {
            _id: 1,
            text: 'Hello developer',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'React Native',
              avatar: 'https://placeimg.com/140/140/any',
            },
          },
        ]);
      }, []);
    
    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    }, []);

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
                        backgroundColor: 'purple'
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
                    color: 'purple'
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