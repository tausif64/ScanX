import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';

// Define components outside the TabLayout
const HomeIcon = ({ color }: { color: string }) => (
    <ThemedView style={styles.iconContainer}>
        <Icon name="home" size={18} color={color} />
        <ThemedText style={{ color }}>Home</ThemedText>
    </ThemedView>
);

const ScanIcon = ({ color, scanDocument }: { color: string, scanDocument: () => void }) => (
    <TouchableOpacity onPress={() => scanDocument()} style={styles.iconContainer}>
        <Icon name="scan1" size={18} color={color} />
        <ThemedText style={{ color }}>Scan</ThemedText>
    </TouchableOpacity>
);

const PhotoIcon = ({ color }: { color: string }) => (
    <ThemedView style={styles.iconContainer}>
        <Icon name="photo" size={18} color={color} />
        <ThemedText style={{ color }}>Photo</ThemedText>
    </ThemedView>
);

const FilesIcon = ({ color }: { color: string }) => (
    <ThemedView style={styles.iconContainer}>
        <Icon name="folder" size={18} color={color} />
        <ThemedText style={{ color }}>Files</ThemedText>
    </ThemedView>
);

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export { HomeIcon, ScanIcon, PhotoIcon, FilesIcon };
