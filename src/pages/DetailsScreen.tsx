/* eslint-disable react-native/no-inline-styles */
import { Text, StyleSheet, Image, Dimensions, TouchableOpacity, BackHandler, ScrollView, Modal, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ThemedView } from '../components/ThemedView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DragSortableView from '../drag-sort';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { db } from '../db/db';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const childrenWidth = (width / 2) - 15;
const childrenHeight = 260;

const DetailsScreen = ({ navigation, route }: any) => {
    const [isEnterEdit, setisEnterEdit] = useState<boolean>(false);
    const [selected, setSelected] = useState<any[]>([]);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [images, setImages] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const fetchImages = async (id: number) => {
        await db.transaction(tx => {
            tx.executeSql('SELECT * FROM images WHERE document_id = ? ', [id], (_tx, results) => {
                const image: Image[] = [];
                for (let i = 0; i < results.rows.length; i++) {
                    const row = results.rows.item(i);
                    image.push(row);
                }
                setImages(image);
            });
        });
    };

    useEffect(() => {
        if (images?.length === 0) {
            fetchImages(route.params.id);
        }
    }, [images, route.params.id]);

    const handleBackPress = () => {
        if (isEnterEdit) {
            setisEnterEdit(false);
        } else {
            navigation.goBack();
        }
        return true;
    };

    const handleSelectChange = (id: number) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((itemId) => itemId !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    useEffect(() => {
        const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandlerSubscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnterEdit]);

    const reorderArray = (array: any[], fromIndex: number, toIndex: number) => {
        const newArray = [...array];
        const [removedItem] = newArray.splice(fromIndex, 1);
        newArray.splice(toIndex, 0, removedItem);
        return newArray;
    };

    const toggleEditMode = () => {
        setisEnterEdit(prev => !prev);
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Icon name="menu" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles?.name}>{route.params.id}</Text>
                </TouchableOpacity>
                {isEnterEdit ? (
                    <TouchableOpacity onPress={toggleEditMode}>
                        <Text style={styles?.name}>Done</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#333" />
                    </TouchableOpacity>
                )}
            </ThemedView>
            <ScrollView scrollEnabled={!isDragging}>
                <ThemedView style={styles.imageContainer}>
                    <DragSortableView
                        key={isEnterEdit ? 'edit' : 'view'} // Change key based on isEnterEdit
                        dataSource={images}
                        isDragFreely={true}
                        renderItem={(item: any, index) => (
                            <ThemedView style={styles.imageView}>
                                <Image style={styles.image} source={{ uri: 'file:///' + item.path }} />
                                <View style={styles.bottomContainer}>
                                    <View>
                                        <Text>{index + 1}</Text>
                                    </View>
                                    {isEnterEdit && (
                                        <View style={styles.checkboxContainer}>
                                            <BouncyCheckbox
                                                style={styles.checkbox}
                                                fillColor="red"
                                                unFillColor="#FFFFFF"
                                                iconStyle={{ borderColor: 'red' }}
                                                innerIconStyle={{ borderWidth: 2 }}
                                                onPress={() => {
                                                    handleSelectChange(item.id);
                                                }}
                                            />
                                        </View>
                                    )}
                                </View>
                            </ThemedView>
                        )}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={(fromIndex: number, toIndex: number) => {
                            console.log(fromIndex,toIndex);
                            const updatedData = reorderArray(images, fromIndex, toIndex);
                            console.log(updatedData);
                            setImages(updatedData);
                            setIsDragging(false);
                        }}
                        parentWidth={width}
                        childrenHeight={childrenHeight}
                        childrenWidth={childrenWidth}
                        dragStart={isEnterEdit}
                    />
                </ThemedView>
            </ScrollView>

            {/* Modal for Menu Options */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                    <TouchableOpacity onPress={() => { toggleEditMode(); setModalVisible(false); }} style={styles.menuItem}>
                        <Text>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text>Export PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text>Share as PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text>Share as JPG</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    header: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 60,
        backgroundColor: 'steelblue',
        flexDirection: 'row',
        paddingEnd: 15,
        paddingStart: 10,
    },
    back: {
        flex: 1,
        height: '100%',
        width: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    name: {
        width: 260,
        paddingHorizontal: 5,
    },
    container: {
        flex: 1,
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 5,
    },
    imageView: {
        width: childrenWidth,
        height: childrenHeight,
        paddingVertical: 20,
        paddingHorizontal: 8,
        margin: 2,
    },
    image: {
        width: '100%',
        height: childrenHeight - 60,
        resizeMode: 'cover',
    },
    bottomContainer: {
        backgroundColor: 'gray',
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
        paddingEnd: 2,
        paddingStart: 8,
    },
    checkboxContainer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        height: 30,
        width: childrenWidth - 8,
    },
    checkbox: {
        width: 30,
        height: 30,
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
    menuItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default DetailsScreen;
