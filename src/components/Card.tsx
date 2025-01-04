import React from 'react';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function Card() {
    // Demo data
    const document = {
        name: 'Sample Document',
        pages: '5',
        size: '2.5 MB',
        image: require('./assets/sample-image.jpg'),
    };

    return (
        <ThemedView style={styles.container}>
            {/* Image on the left */}
            <Image source={document.image} style={styles.image} />

            {/* Document details in the middle */}
            <ThemedView style={styles.detailsContainer}>
                <ThemedText style={styles.documentName}>{document.name}</ThemedText>
                <ThemedText style={styles.documentInfo}>
                    {document.pages} pages • {document.size}
                </ThemedText>
            </ThemedView>

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
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 10,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
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
