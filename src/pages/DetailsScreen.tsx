/* eslint-disable react-native/no-inline-styles */
import { Text, StyleSheet, Image, Dimensions, TouchableOpacity, BackHandler, ScrollView, Modal, TouchableWithoutFeedback, View, useColorScheme } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { ThemedView } from '../components/ThemedView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DragSortableView from '../drag-sort';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { db } from '../db/db';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FloatingActionButton from '../components/FloatingActionButton';
import { SQLiteContext } from '../context/AppContext';
import Swiper from 'react-native-swiper';
import ImageZoom from '@synconset/react-native-image-zoom';
import { Colors } from '../constants/Colors';
import { shortenText } from '../utils/utils';

const { width } = Dimensions.get('window');
const childrenWidth = (width / 2) - 15;
const childrenHeight = 260;

const DetailsScreen = ({ navigation, route }: any) => {
    const context = useContext(SQLiteContext);
    const [isEnterEdit, setisEnterEdit] = useState<boolean>(false);
    const [selected, setSelected] = useState<any[]>([]);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [images, setImages] = useState<any[]>([]);
    const [updateImages, setUpdateImages] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [detailVeiwVisible, setDetailVeiwVisible] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const theme = useColorScheme() ?? 'light';

    const fetchImages = async (id: number) => {
        await db.transaction(tx => {
            tx.executeSql('SELECT * FROM images WHERE document_id = ? ORDER BY img_order ASC', [id], (_tx, results) => {
                const image: Image[] = [];
                for (let i = 0; i < results.rows.length; i++) {
                    const row = results.rows.item(i);
                    image.push(row);
                }
                setImages(image);
            });
        });

    };

    const handleAdd = async () => {
        await context!.scanDocument(route.params.id);
        await fetchImages(route.params.id);
    };


    useEffect(() => {
        if (images?.length === 0) {
            fetchImages(route.params.id);
        }
        const updateViewedAt = async () => {
            const doc = {
                id: route.params.id,
                viewed_at: new Date().toISOString(),
            };
            context?.updateDocumentData(doc);
        };
        updateViewedAt();
    }, [context, images, route.params.id]);

    const handleBackPress = () => {
        if (detailVeiwVisible) {
            setDetailVeiwVisible(false);
        } else if (isEnterEdit) {
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
    }, [isEnterEdit, detailVeiwVisible]);

    const toggleEditMode = () => {
        setisEnterEdit(prev => !prev);
    };

    const handleDone = async () => {
        updateImages.forEach(async (item, index) => {
            await context!.reOrderDocImages((index + 1), item.document_id, item.id);
        });
        toggleEditMode();
        setImages(updateImages);
    };

    return (
        detailVeiwVisible ? (
            <View style={styles.container}>
                <TouchableOpacity style={{ position: 'absolute', top: 20, right: 15, zIndex: 100 }} onPress={() => setDetailVeiwVisible(false)}>
                    <Icon name="close" size={24} color={theme === 'light' ? Colors.light.icon : Colors.dark.icon} />
                </TouchableOpacity>
                <Swiper
                    loop={false}
                    index={selectedIndex}
                    showsButtons={false}
                    showsPagination={false}
                    onIndexChanged={(index) => console.log(images[index])}
                >
                    {images.map((item) => (
                        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} key={item.id}>
                            <ImageZoom cropWidth={Dimensions.get('window').width}
                                cropHeight={Dimensions.get('window').height}
                                imageWidth={Dimensions.get('window').width}
                                imageHeight={Dimensions.get('window').height}
                            >
                                <Image style={{ height: Dimensions.get('window').height - 60, width: Dimensions.get('window').width, resizeMode: 'contain' }}
                                    source={{ uri: 'file:///' + item.path }} />
                            </ImageZoom>
                        </ThemedView>
                    ))}
                </Swiper>
            </View>
        ) :
            (
                <ThemedView style={styles.container}>
                    <ThemedView style={styles.header}>
                        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                            <Icon name="menu" size={24} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={styles?.name}>{shortenText(route.params.name)}</Text>
                        </TouchableOpacity>
                        {isEnterEdit ? (
                            <TouchableOpacity onPress={handleDone}>
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
                                key={isEnterEdit ? 'edit' : 'view'}
                                dataSource={images}
                                isDragFreely={true}
                                renderItem={(item: any, index) => (
                                    <ThemedView style={styles.imageView}>
                                        <TouchableWithoutFeedback onPress={() => { if (!isEnterEdit) { setDetailVeiwVisible(true); setSelectedIndex(index); } }}>
                                            <Image style={styles.image} source={{ uri: 'file:///' + item.path }} />
                                        </TouchableWithoutFeedback>
                                        {isEnterEdit && (<View style={styles.imageOverlay} />)}
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
                                onDragEnd={() => {
                                    setIsDragging(false);
                                }}
                                onDataChange={(data) => setUpdateImages(data)}
                                parentWidth={width}
                                childrenHeight={childrenHeight}
                                childrenWidth={childrenWidth}
                                dragStart={isEnterEdit}
                            />
                        </ThemedView>
                    </ScrollView>
                    <FloatingActionButton onPress={handleAdd} />

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
            )
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
    imageOverlay: {
        width: '100%',
        height: childrenHeight - 60,
        position: 'absolute',
        top: 20,
        left: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.01)',
    },
});

export default DetailsScreen;
