import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const FloatingActionButton = ({ onPress }: { onPress: () => void }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.fab}>
            <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#687076', // Purple color, you can change it
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});

export default FloatingActionButton;
