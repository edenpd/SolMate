import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
// import { FlatList } from 'react-native-gesture-handler';
import { FlatList } from 'react-native-gesture-handler';
import { Container, Card, MessageText, PostTime, TextSection, UserImg, UserImgWrapper, UserInfo, UserInfoText, UserName } from '../styles/ChatStyles';

const ChatList = ({navigation}) => {

    interface Chat {
        userName: String;
        userImg: String;
        messageTime: String;
        messageText: String
    }
    const chats: Chat[] = [
        {
            userName: "Tomer",
            userImg: 'https://api.time.com/wp-content/uploads/2017/12/terry-crews-person-of-year-2017-time-magazine-facebook-1.jpg?quality=85',
            messageTime: '13:30',
            messageText: 'Hello'
        },
        {
            userName: "Adi",
            userImg: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Sara_Netanyahu_%2840345853590%29_%28cropped%29.jpg',
            messageTime: '13:30',
            messageText: 'Hello'
        },
        {
            userName: "Ron",
            userImg: 'https://www.indiewire.com/wp-content/uploads/2015/04/dakota-fanning-by-daniel-bergeron.jpg?w=780',
            messageTime: '13:30',
            messageText: 'Hello'
        },
        {
            userName: "Shiri",
            userImg: 'https://caricom.org/wp-content/uploads/Floyd-Morris-Remake-1024x879-1.jpg',
            messageTime: '13:30',
            messageText: 'Hello'
        },
        {
            userName: "Eden",
            userImg: 'https://americanindependent.com/wp-content/uploads/2019/01/AP_19014569142266-1068x721.jpg',
            messageTime: '13:30',
            messageText: 'Hello'
        }
    ];

    return (
        <Container>
            <FlatList
                data={chats}
                keyExtractor={(item) => (item.userName)}
                renderItem={({item}) => (
                    <Card onPress={() => navigation.navigate('Chat', { userName: item.userName })}>
                        <UserInfo>
                            <UserImgWrapper>
                                <UserImg source={{uri: item.userImg}} />
                            </UserImgWrapper>
                            <TextSection>
                                <UserInfoText>
                                    <UserName>{item.userName}</UserName>
                                    <PostTime>{item.messageTime}</PostTime>
                                </UserInfoText>
                                <MessageText>{item.messageText}</MessageText>
                            </TextSection>
                        </UserInfo>
                    </Card>
                )} />
        </Container>
    );
};

export default ChatList;