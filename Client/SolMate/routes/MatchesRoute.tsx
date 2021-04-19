import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import MatchPage from '../components/MatchPage';
import ProfileRoute from './ProfileRoute';

const Stack = createStackNavigator();

const MatchRoute = () => {    
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="MatchPage"
                component={MatchPage}
                options={({route}) => ({
                    headerShown: false
                 })} />
                <Stack.Screen name="Profile"
                    component={ProfileRoute}
                    options={({route}) => ({
                        headerShown: false
                })} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default MatchRoute;