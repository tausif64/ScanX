/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { ThemedView } from './ThemedView';
import { StyleSheet, Image, TouchableOpacity, View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Document } from '../interface';
import { formatFileSize, getFileSize } from '../utils/utils';

interface CardProps {
    document: Document;
}
export default function Card({ document }: CardProps) {
    // console.log(document);
    const [fileSize, setFileSize] = useState<string>('');
    const totalImageSize = async () => {
        let totalSize = 0;
        if (document && document.images) {
            for (let i = 0; i < document.images.length; i++) {
                const uri: any = document?.images[i].path;
                const size = await getFileSize(uri);
                totalSize += Number(size);
            }
        }
        // console.log('size');
        // console.log(formatFileSize(size));
        return formatFileSize(totalSize);
    };

    useEffect(() => {
        const fetchFileSize = async () => {
            const size = await totalImageSize();
            setFileSize(size);
        };

        fetchFileSize();
    }, []);

    return (
        <ThemedView style={styles.container}>
            {/* Image on the left */}
            {document?.images && document.images[0] && (
                <Image source={{ uri: `file:///${document.images[0].path}` }} style={styles.image} />
            )}

            {/* Document details in the middle */}
            <View style={styles.detailsContainer}>
                <Text style={styles.documentName}>{document?.name}</Text>
                <Text style={styles.documentInfo}>
                    {
                        document?.images?.length === 1
                            ?
                            `${document?.images?.length} page`
                            :
                            `${document?.images?.length} pages`
                    }
                    • {fileSize}
                </Text>
                <Text style={styles.documentInfo}>
                    {new Date(document.created_at).toDateString()}
                </Text>
                <Text style={styles.documentInfo}>
                    {document?.folder_name}
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
        padding: 15,
        borderRadius: 4,
        backgroundColor: '#f5f5f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 5,
        height: 120,
    },
    image: {
        width: 70,
        height: 90,
        borderRadius: 3,
        marginRight: 15,
    },
    detailsContainer: {
        flex: 1,
        // justifyContent: 'center',
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
