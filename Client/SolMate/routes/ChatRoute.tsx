import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import { Bubble, Composer, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import Chat from '../components/Chat';
import ChatList from '../components/ChatList';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Profile from '../components/Profile';
import { IUser } from '../util/Types';
import ProfileRoute from './ProfileRoute';

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
                        title: (route.params as { userName: string}).userName,
                        headerShown: false
                })} />
                <Stack.Screen name="Profile"
                    component={ProfileRoute}
                    options={({route}) => ({
                        title: `${(route.params as { user: IUser}).user.firstName} ${(route.params as { user: IUser}).user.lastName}` ,
                        headerShown: false
                })} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default ChatRoute;