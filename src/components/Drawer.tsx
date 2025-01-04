import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const drawerLayout = () => {
    // const drawerRef = useRef<DrawerLayoutAndroid>(null);

    // const openDrawer = () => {
    //     drawerRef.current?.openDrawer();
    // };


        return (
            <View style={styles.drawerContainer}>
                <TouchableOpacity style={styles.drawerItem} onPress={() => console.log('Dashboard pressed')}>
                    <Text style={styles.drawerText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => console.log('Settings pressed')}>
                    <Text style={styles.drawerText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => console.log('Privacy Policy pressed')}>
                    <Text style={styles.drawerText}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => console.log('Terms of Service pressed')}>
                    <Text style={styles.drawerText}>Terms of Service</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => console.log('Help pressed')}>
                    <Text style={styles.drawerText}>Help</Text>
                </TouchableOpacity>
            </View>
        );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawerContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f0f0f0',
    },
    drawerItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    drawerText: {
        fontSize: 18,
    },
    mainText: {
        fontSize: 20,
    },
});

export default drawerLayout;
