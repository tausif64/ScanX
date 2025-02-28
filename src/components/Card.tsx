/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import { ThemedView } from './ThemedView';
import { StyleSheet, Image, TouchableOpacity, View, Text, Modal, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Document } from '../interface';
import { formatFileSize, getFileSize } from '../utils/utils';
import { SQLiteContext } from '../context/AppContext';


interface CardProps {
    document: Document;
}
export default function Card({ document }: CardProps) {
    // console.log(document);
    const [fileSize, setFileSize] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const context = useContext(SQLiteContext);
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

    const handleShare = async () => {
        const pdfUrl = await context!.generatePDF(document.images, document.name);
        await context!.shareDocument(pdfUrl);
    };

    const handelSave = async () => {
        const pdfUrl = await context!.generatePDF(document.images, document.name);
        await context!.saveDocument(pdfUrl, document.name + '.pdf');
    };

    return (
        <>
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
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#333" />
                </TouchableOpacity>
            </ThemedView>
            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <ThemedView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        {document?.images && document.images[0] && (
                            <Image source={{ uri: `file:///${document.images[0].path}` }} style={styles.image} />
                        )}
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
                    </View>
                    <View style={styles.menuItem}>
                        <TouchableOpacity style={styles.option} onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={24} color="black" />
                            <Text style={styles.optionText}>Share Document</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={handelSave}>
                            <FontAwesome name="file-pdf-o" size={24} color="black" />
                            <Text style={styles.optionText}>Save as PDF ({fileSize})</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.option}>
                        <FontAwesome name="edit" size={24} color="black" />
                        <Text style={styles.optionText}>Rename</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.option}>
                        <Ionicons name="folder-open-outline" size={24} color="black" />
                        <Text style={styles.optionText}>Move To Folder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.option}>
                        <Ionicons name="cloud-upload-outline" size={24} color="black" />
                        <Text style={styles.optionText}>Save on Your Cloud</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.option}>
                        <Icon name="delete" size={24} color="black" />
                        <Text style={styles.optionText}>Delete</Text>
                    </TouchableOpacity>
                </ThemedView>
            </Modal>
        </>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    menuItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    optionText: {
        marginLeft: 10,
        fontSize: 16,
    },
});
