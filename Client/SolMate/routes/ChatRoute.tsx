import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { Bubble, Composer, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import Chat from '../components/Chat';
import ChatList from '../components/ChatList';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createStackNavigator();

const ChatRoute = () => {    
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="ChatList"
                component={ChatList}
                options={({route}) => ({
                    headerShown: false
                 })} />
                <Stack.Screen name="Chat"
                    component={Chat}
                    options={({route}) => ({
                        title: (route.params as { userName: string}).userName
                })} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default ChatRoute;