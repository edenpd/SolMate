import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Appbar } from 'react-native-paper';

const Header = () => {

    const styles = StyleSheet.create({
        appbar: {
            backgroundColor: 'white',
            tintColor: 'black',
            color: 'white'
        },
        appbarContent: {
            color: '#8860D0',
            alignItems: 'center',
            textAlign: 'center',
            fontFamily: 'Poppins_500Medium_Italic'
        }
    })

    return (
        <Appbar.Header style={styles.appbar}>
            <Appbar.Content title={<Text style={styles.appbarContent}>SolMate</Text>} />
            <Appbar.Action icon="music-note-eighth" color='#8860D0' />
        </Appbar.Header>
    )
}

export default Header;