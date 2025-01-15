import React from 'react';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { StyleSheet, Image, TouchableOpacity, View, Text } from 'react-native';


export default function Card() {
    // Demo data
    const document = {
        name: 'Sample Document',
        pages: '5',
        date: '5 Jan 2025',
        size: '2.5 MB',
        image: require('../assets/sample-image.png'),
    };

    return (
        <ThemedView style={styles.container}>
            {/* Image on the left */}
            <Image source={document.image} style={styles.image} />

            {/* Document details in the middle */}
            <View style={styles.detailsContainer}>
                <Text style={styles.documentName}>{document.name}</Text>
                <Text style={styles.documentInfo}>
                    {document.pages} pages • {document.size}
                </Text>
                <Text style={styles.documentInfo}>
                    {document.date}
                </Text>
            </View>

            {/* Three dots on the right */}
            <TouchableOpacity style={styles.menuButton}>
                <ThemedText style={styles.menuIcon}>•••</ThemedText>
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
    menuButton: {
        padding: 10,
    },
    menuIcon: {
        fontSize: 20,
        color: '#000',
    },
});
