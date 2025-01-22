/* eslint-disable react/no-unstable-nested-components */
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, StyleSheet } from 'react-native';
import EmptyComponent from '../components/EmptyComponent';
import { FilesIcon, HomeIcon, PhotoIcon, ScanIcon } from './navIcons';
import HomePage from '../pages/HomePage';
import Header from '../components/Header';
import NotesScreen from '../pages/NotesScreen';
import FolderScreen from '../pages/FolderScreen';
import { SQLiteContext } from '../context/AppContext';
import DetailsScreen from '../pages/DetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const FileStack = ({ openDrawer }: { openDrawer: ()=> void}) => {
    return (
        <Stack.Navigator initialRouteName="Main" screenOptions={{
            // tabBarShowLabel: false,
            header: () => <Header onMenuPress={openDrawer} />,
        }}>
            <Stack.Screen name="Main" component={TabLayout}  />
            <Stack.Screen name="Folders" component={FolderScreen}  />
            <Stack.Screen name="Files" component={EmptyComponent} />
            <Stack.Screen name="Details" component={DetailsScreen} options={{
                headerShown: false,
            }} />
        </Stack.Navigator>
    );
};

const TabLayout = () => {
    const context = useContext(SQLiteContext);
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{
            headerShown:false,
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
                    <ScanIcon color={color} scanDocument={() => context!.scanDocument(null)} />,
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

            <Tab.Screen name="Folder" component={FolderScreen}
                options={{
                    title: 'Folder',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FilesIcon color={color} />,
                }} />
            {/* <Tab.Screen  name="Details" component={DetailsScreen}
                options={{
                    title: 'Details',
                    headerShown: false,
                    tabBarStyle:{display:'none'},
                    tabBarIcon: ({ color }) => <FilesIcon color={color} />,
                }} /> */}

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
