/* eslint-disable react-native/no-inline-styles */
import { Text, StyleSheet, Image, Dimensions, TouchableOpacity, BackHandler, ScrollView, Modal, TouchableWithoutFeedback, View, useColorScheme } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { ThemedView } from '../components/ThemedView';
import DragSortableView from '../drag-sort';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { db } from '../db/db';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import FloatingActionButton from '../components/FloatingActionButton';
import { SQLiteContext } from '../context/AppContext';
import Swiper from 'react-native-swiper';
import ImageZoom from '@synconset/react-native-image-zoom';
import { Colors } from '../constants/Colors';
import { shortenText } from '../utils/utils';
import Share from 'react-native-share';
import { ImageProps } from '../interface';
import { ThemedText } from '../components/ThemedText';
import RenameModal from '../components/RenameModal';

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
    const [activeImage, setAvtiveImage] = useState<ImageProps | null>(null);
    const [renameVisible, setRenameVisible] = useState<boolean>(route.params.id);
    const [name, setName] = useState<string>(route.params.name);
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

    const handleRetakeImage = async (id: number, old_path: string) => {
        await context!.retakeImage(id, route.params.id, old_path);
        return await fetchImages(route.params.id);
    };

    const handleAdd = async () => {
        await context!.addDocument(route.params.id, route.params.folderId, images?.length);
        return await fetchImages(route.params.id);
    };

    const handleDelete = async (id:number, path:string) => {
        await context!.deleteDocImage(id, path);
        return await fetchImages(route.params.id);
    };

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

    const handleSelectChange = (id: number, path: string) => {
        if (selected.some((item) => item.id === id)) {
            setSelected(selected.filter((item) => item.id !== id));
        } else {
            setSelected([...selected, {id,path}]);
        }
    };

    const handleSelectedDelete = async () =>{
        selected.forEach(async (item) => {
            await context!.deleteDocImage(item.id, item.path);
        });
        setSelected([]);
        toggleEditMode();
        await fetchImages(route.params.id);
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
            context!.reOrderDocImages((index + 1), item.document_id, item.id);
        });
        toggleEditMode();
        setImages(updateImages);
    };

    const shareImage = async (uri: string) => {

        const shareOptions = {
            title: 'Share Image',
            url: uri,
        };

        await Share.open(shareOptions);
    };

    const handelShare = () => {
        const uri = activeImage && activeImage?.path;
        shareImage('file:///' + uri);
    };

    const handleImagesShare = async () => {
        const imageUrls = images.map((item) => 'file:///' + item.path);
        const shareOptions = {
            title: 'Share Image',
            urls: imageUrls,
        };

        await Share.open(shareOptions);
    };

    const handleShare = async () => {
        const pdfUrl = await context!.generatePDF(images, route.params.name);
        setModalVisible(false);
        await context!.shareDocument(pdfUrl);
    };

    const handelSave = async () => {
        const pdfUrl = await context!.generatePDF(images, route.params.name);
        await context!.saveDocument(pdfUrl, route.params.name + '.pdf');
        setModalVisible(false);
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
    }, [context, images?.length, route.params.id]);

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
                    onIndexChanged={(index) => setAvtiveImage(images[index])}
                    style={{ height: Dimensions.get('window').height - 60 }}
                >
                    {images.map((item) => (
                        <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} key={item.id}>
                            <ImageZoom cropWidth={Dimensions.get('window').width}
                                cropHeight={Dimensions.get('window').height}
                                imageWidth={Dimensions.get('window').width}
                                imageHeight={Dimensions.get('window').height}
                            >
                                <Image style={{ height: '100%', width: Dimensions.get('window').width, resizeMode: 'contain' }}
                                    source={{ uri: 'file:///' + item.path }} />
                            </ImageZoom>
                        </ThemedView>
                    ))}
                </Swiper>
                <ThemedView style={styles.bottomFooter}>
                    <ThemedView style={styles.swipperBox}>
                        <TouchableOpacity style={styles.swipperButton} onPress={() => handleRetakeImage(activeImage!.id, 'file:///' + activeImage!.path)}>
                            <Icon name="flip-camera-ios" size={24} color={theme === 'light' ? Colors.light.icon : Colors.dark.icon} />
                            <ThemedText style={{ fontSize: 9 }}>Retake</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                    <ThemedView style={styles.swipperBox}>
                        <TouchableOpacity style={styles.swipperButton} onPress={handelShare}>
                            <Ionicons name="share-social-outline" size={24} color={theme === 'light' ? Colors.light.icon : Colors.dark.icon} />
                            <ThemedText style={{ fontSize: 9 }}>Share</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                    <ThemedView style={styles.swipperBox}>
                        <TouchableOpacity style={styles.swipperButton}>
                            <Octicons name="download" size={24} color={theme === 'light' ? Colors.light.icon : Colors.dark.icon} />
                            <ThemedText style={{ fontSize: 9 }}>Download</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                    <ThemedView style={styles.swipperBox}>
                        <TouchableOpacity style={styles.swipperButton} onPress={() => handleDelete(activeImage!.id, activeImage!.path)}>
                            <Icon name="delete" size={24} color={theme === 'light' ? Colors.light.icon : Colors.dark.icon} />
                            <ThemedText style={{ fontSize: 9 }}>Delete</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </View>
        ) :
            (
                <ThemedView style={styles.container}>
                    <ThemedView style={styles.header}>
                        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=> setRenameVisible(true)}>
                            <Text style={styles.name}>{shortenText(name, 30)}</Text>
                        </TouchableOpacity>
                        {isEnterEdit ? (
                            <>
                                <TouchableOpacity style={styles.deleteIcon} onPress={handleSelectedDelete}>
                                    <Icon name="delete" size={24} color="red" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDone}>
                                    <Text style={styles?.name}>Done</Text>
                                </TouchableOpacity>
                            </>
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
                                        <TouchableWithoutFeedback onPress={() => { if (!isEnterEdit) { setDetailVeiwVisible(true); setSelectedIndex(index); setAvtiveImage(item); } }}>
                                            <Image style={styles.image} source={{ uri: 'file:///' + item.path }} />
                                        </TouchableWithoutFeedback>
                                        {isEnterEdit && (<View style={styles.imageOverlay} />)}
                                        <View style={styles.bottomContainer}>
                                            <View>
                                                <Text>{index + 1}</Text>
                                            </View>
                                            <>{isEnterEdit && (
                                                <View style={styles.checkboxContainer}>
                                                    <BouncyCheckbox
                                                        style={styles.checkbox}
                                                        fillColor="red"
                                                        unFillColor="#FFFFFF"
                                                        iconStyle={{ borderColor: 'red' }}
                                                        innerIconStyle={{ borderWidth: 2 }}
                                                        onPress={() => {
                                                            handleSelectChange(item.id, item.path);
                                                        }}
                                                    />
                                                </View>
                                            )}</>
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
                            <TouchableOpacity style={styles.menuItem} onPress={handelSave}>
                                <Text>Save as PDF</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
                                <Text>Share as PDF</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={handleImagesShare}>
                                <Text>Share All Images</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setRenameVisible(true); setModalVisible(false); }} style={styles.lastMenuItem}>
                                <Text>Rename</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    <RenameModal visible={renameVisible} onClose={() => setRenameVisible(false)} id={route.params.id} name={route.params.name} setName={setName} />
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
    deleteIcon: {
        width: 30,
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
    lastMenuItem: {
        paddingVertical: 15,
    },
    imageOverlay: {
        width: '100%',
        height: childrenHeight - 60,
        position: 'absolute',
        top: 20,
        left: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.01)',
    },
    bottomFooter: {
        width: '100%',
        height: 60,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 5,
        borderTopColor: '#e6e6e6',
        borderWidth: 1,
    },
    swipperBox: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 25,
        paddingHorizontal: 11,
        borderRadius: 50,
        marginTop: 10,
    },
    swipperButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DetailsScreen;
