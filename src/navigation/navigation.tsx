/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, StyleSheet } from 'react-native';
import EmptyComponent from '../components/EmptyComponent';
import { FilesIcon, HomeIcon, PhotoIcon, ScanIcon } from './navIcons';
import HomePage from '../pages/HomePage';
import Header from '../components/Header';
import NotesScreen from '../pages/NotesScreen';
import FolderScreen from '../pages/FolderScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const FileStack = () => {
    return (
        <Stack.Navigator screenOptions={{
            // tabBarShowLabel: false,
            header: () => <Header />,
        }}>
            <Stack.Screen name="Folders" component={FolderScreen}  />
            <Stack.Screen name="Files" component={EmptyComponent} />
            <Stack.Screen name="Details" component={EmptyComponent} options={{
                headerShown: false,
            }} />
        </Stack.Navigator>
    );
};

const TabLayout = ({ openDrawer, scanDocument }: { openDrawer: () => void, scanDocument: () => void }) => {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{
            // tabBarShowLabel: false,
            header: () => <Header onMenuPress={openDrawer} />,
            tabBarStyle: {
                height: 60,
                ...styles.shadow,
            },
        }}>
            <Tab.Screen name="Home" component={HomePage}
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <HomeIcon color={color} />,
                }} />

            <Tab.Screen name="Scan" component={EmptyComponent}
            options={{
                headerShown: false,
                title: 'Scan',
                tabBarIcon: ({ color }) =>
                    <ScanIcon color={color} scanDocument={scanDocument} />,
                headerLeft: () => (
                    <Button
                        onPress={() => console.log('This is a button!')}
                        title="Info"
                        color="#000"
                    />
                ),
            }}
            />

            <Tab.Screen name="Notes" component={NotesScreen}
                options={{
                    title: 'Notes',
                    tabBarIcon: ({ color }) => <PhotoIcon color={color} />,
                }} />

            <Tab.Screen name="Folder" component={FileStack}
                options={{
                    title: 'Folder',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FilesIcon color={color} />,
                }} />

        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#7f5df0',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
});

export default TabLayout;
