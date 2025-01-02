/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Button, StyleSheet } from 'react-native';
import EmptyComponent from '../components/EmptyComponent';
import { FilesIcon, HomeIcon, PhotoIcon, ScanIcon } from './navIcons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const FileStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Folders" component={EmptyComponent} />
            <Stack.Screen name="Files" component={EmptyComponent} />
            <Stack.Screen name="Details" component={EmptyComponent} options={{
                headerShown: false,
            }} />
        </Stack.Navigator>
    );
};

const TabLayout = ({ scanDocument }: { scanDocument: () => void }) => {
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: {
                backgroundColor: '#ffffff',
                height: 75,
                ...styles.shadow,
            },
        }}>
            <Tab.Screen name="Home" component={EmptyComponent}
                options={{
                    headerShown: false,
                    title: 'Home',
                    tabBarIcon: ({ color }) => <HomeIcon color={color} />,
                }} />

            <Tab.Screen name="Scan" component={EmptyComponent}
            options={{
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

            <Tab.Screen name="Notes" component={EmptyComponent}
                options={{
                    title: 'Notes',
                    tabBarIcon: ({ color }) => <PhotoIcon color={color} />,
                }} />

            <Tab.Screen name="m" component={FileStack}
                options={{
                    title: 'm',
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
    hidden: {
        display: 'none',
    },
});

export default TabLayout;
