import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { BottomNavigation, Appbar } from 'react-native-paper';
import ChatRoute from './routes/ChatRoute';
import EventsRoute from './routes/EventsRoute';
import ProfileRoute from './routes/ProfileRoute';
import MatchesRoute from './routes/MatchesRoute';
import Header from "./components/Header";
import AppLoading from 'expo-app-loading';

// import useFonts hook  
import { useFonts, Poppins_100Thin, Poppins_700Bold, Poppins_500Medium_Italic, Poppins_300Light } from '@expo-google-fonts/poppins';

const customFonts = {
  Poppins_100Thin,
  Poppins_700Bold,
  Poppins_500Medium_Italic,
  Poppins_300Light
};

export default function App() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'matches', title: 'Matches', icon: 'account-multiple' },
    { key: 'events', title: 'Events', icon: 'calendar-blank' },
    { key: 'chat', title: 'Chat', icon: 'chat' },
    { key: 'profile', title: 'Profile', icon: 'account' }
  ]);

  // the same as Font.loadAsync , the hook returns  true | error 
  const [isLoaded] = useFonts(customFonts);

  const renderScene = BottomNavigation.SceneMap({
    matches: MatchesRoute,
    events: EventsRoute,
    chat: ChatRoute,
    profile: ProfileRoute
  });

  const navigationStyle = {
    backgroundColor: 'white'
  }

  if (!isLoaded) {
    return <AppLoading />;
  }

  const styles = StyleSheet.create({
  });

  return (
    <View style={{
      width: '100%',
      height: '100%'
    }}>
      <StatusBar hidder={true} />
      <Header />
      <BottomNavigation
      backgroundColor
        activeColor={'#8860D0'}
        barStyle={navigationStyle}
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    </View>
  );
}
