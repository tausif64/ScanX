import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';

const DrawerContent = (props) => {
    return (
        <DrawerContentScrollView {...props}>
            <View style={styles.drawerContent}>
                <DrawerItem
                    label="Dashboard"
                    onPress={() => props.navigation.navigate('Dashboard')}
                />
                <DrawerItem
                    label="Settings"
                    onPress={() => props.navigation.navigate('Settings')}
                />
                <DrawerItem
                    label="Privacy Policy"
                    onPress={() => props.navigation.navigate('PrivacyPolicy')}
                />
            </View>
        </DrawerContentScrollView>
    );
};

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
        paddingTop: 20,
    },
});

export default DrawerContent;