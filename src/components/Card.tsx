import React from 'react';
import { ThemedView } from './ThemedView';
import { StyleSheet, Image, TouchableOpacity, View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Document } from '../interface';

interface CardProps {
    document: Document;
}
export default function Card({ document }: CardProps) {
    // console.log(document);
    // Demo data
    const docu = {
        name: 'Sample Document',
        pages: '5',
        date: '5 Jan 2025',
        size: '2.5 MB',
        image: require('../assets/sample-image.png'),
    };

    return (
        <ThemedView style={styles.container}>
            {/* Image on the left */}
            {document?.images && document.images[0] && (
                <Image source={{ uri: document.images[0].path }} style={styles.image} />
            )}

            {/* Document details in the middle */}
            <View style={styles.detailsContainer}>
                <Text style={styles.documentName}>{document?.name}</Text>
                <Text style={styles.documentInfo}>
                    {document?.images?.length} pages • {docu.size}
                </Text>
                <Text style={styles.documentInfo}>
                    {new Date(document.created_at).toDateString()}
                </Text>
            </View>

            {/* Three dots on the right */}
            <TouchableOpacity>
               <Ionicons name="ellipsis-vertical" size={24} color="#333" />
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical:5,
        borderRadius: 4,
        backgroundColor: '#f5f5f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 5,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 3,
        marginRight: 15,
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    documentName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    documentInfo: {
        fontSize: 14,
        color: '#888',
    },
    menuIcon: {
        fontSize: 20,
        color: '#000',
    },
});
