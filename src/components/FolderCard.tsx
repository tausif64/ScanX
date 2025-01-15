import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Folder } from '../interface';

interface FolderCardProps {
    folder: Folder;
    onPress?: () => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <View style={styles.content}>
                <MaterialIcons name="folder" size={24} color="#333" style={styles.icon} />
                <Text style={styles.title}>{folder.name}</Text>
                <Ionicons name="ellipsis-vertical" size={24} color="#333" style={styles.dots} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // For Android shadow
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    icon: {
        marginRight: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    dots: {
        marginLeft: 16,
    },
});

export default FolderCard;
