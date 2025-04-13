import { StyleSheet } from 'react-native';
import React from 'react';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const SettingScreen = () => {
    return (
        <ThemedView style={styles.container}>
           <ThemedView style={styles.userProfile}>
                <ThemedView style={{borderWidth:1, borderColor: '#000', borderRadius: '50%', padding: 14}}>
                    <FontAwesome6 name="user-large" size={48} />
                </ThemedView>
                <ThemedView>
                    <ThemedText style={styles.userName}>Tausif Ansari</ThemedText>
                    <ThemedText>example@gmail.com</ThemedText>
                </ThemedView>
           </ThemedView>
        </ThemedView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    userProfile: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        elevation: 3,
        padding: 16,
    },
    userName:{
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default SettingScreen;
