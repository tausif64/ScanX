import React from 'react';
import { TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemedView } from './ThemedView';

interface HeaderProps {
    onMenuPress?: () => void;
    onThreeDotPress?: () => void;
    onChangeText?: (text: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuPress, onThreeDotPress, onChangeText }) => {
    return (
        <ThemedView style={styles.container}>
            {/* Left: Menu Icon */}
            <TouchableOpacity onPress={onMenuPress} style={styles.iconContainer}>
                <Icon name="menu" size={24} color="#000" />
            </TouchableOpacity>

            {/* Middle: TextInput */}
            <TextInput
                style={styles.textInput}
                placeholder={'Search...'}
                placeholderTextColor="#000"
                onChangeText={onChangeText}
            />

            {/* Right: Three-Dot Icon */}
            <TouchableOpacity onPress={onThreeDotPress} style={styles.iconContainer}>
                <Icon name="more-vert" size={24} color="#000" />
            </TouchableOpacity>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    iconContainer: {
        padding: 8,
    },
    textInput: {
        flex: 1,
        height: 40,
        marginHorizontal: 16,
        paddingHorizontal: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        fontSize: 16,
        color: '#000000',
    },
});

export default Header;
