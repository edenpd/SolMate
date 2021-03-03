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
            color: 'purple',
            alignItems: 'center',
            textAlign: 'center',
        }
    })

    return (
        <Appbar.Header style={styles.appbar}>
            <Appbar.Content title={<Text style={styles.appbarContent}>SolMate</Text>} />
            <Appbar.Action icon="music-note-eighth" color='purple' />
        </Appbar.Header>
    )
}

export default Header;