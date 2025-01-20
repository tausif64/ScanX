/* eslint-disable react-native/no-inline-styles */
import { Text, StyleSheet, Image, Dimensions, TouchableOpacity, BackHandler, ScrollView } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { ThemedView } from '../components/ThemedView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SQLiteContext } from '../context/AppContext';
import DragSortableView from '../drag-sort';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { ThemedText } from '../components/ThemedText';

const { width } = Dimensions.get('window');
const childrenWidth = (width / 2) - 15;
const childrenHeight = 260;

const DetailsScreen = ({ navigation, route }: any) => {
    // console.log(route);
    const context = useContext(SQLiteContext);
    const [isEnterEdit, setisEnterEdit] = useState<boolean>(true);
    const [selected, setSelected] = useState<any[]>([]);
    const [images, setImages] = useState<{
        id: number;
        document_id: number;
        path: string;
        timestamp: number;
    }[] | undefined>([]);

    useEffect(() => {
        if (images?.length === 0) {
            const imgs: any = context?.fetchImages(route.params.id);
            setImages(imgs);
        }
    }, [context, images?.length, route.params.id]);
    // 'file:///data/user/0/com.scanx/cache/752aef40-941e-49f9-90bd-b5b0a4f082c0.jpg'
    const handleBackPress = () => {
        if (isEnterEdit) {
            setisEnterEdit(false);
        }
        else {
            navigation.goBack();
        }
        return true;
    };

    const handleSelectChange = (id: number) => {
        if (selected.includes(id)) {
            // If the id is already in the selected array, remove it
            setSelected(selected.filter((itemId) => itemId !== id));
        } else {
            // If the id is not in the selected array, add it
            setSelected([...selected, id]);
        }
    };

    useEffect(() => {
        const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => backHandlerSubscription.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnterEdit]);
    let d: any = [
        { id: 1, path: 'file:///data/user/0/com.scanx/cache/752aef40-941e-49f9-90bd-b5b0a4f082c0.jpg' },
        { id: 2, path: 'file:///data/user/0/com.scanx/cache/752aef40-941e-49f9-90bd-b5b0a4f082c0.jpg' },
        { id: 3, path: 'file:///data/user/0/com.scanx/cache/752aef40-941e-49f9-90bd-b5b0a4f082c0.jpg' },
        { id: 4, path: 'file:///data/user/0/com.scanx/cache/752aef40-941e-49f9-90bd-b5b0a4f082c0.jpg' },
        { id: 5, path: 'file:///data/user/0/com.scanx/cache/752aef40-941e-49f9-90bd-b5b0a4f082c0.jpg' },
    ];
    const reorderArray = (array: any[], fromIndex: number, toIndex: number) => {
        const newArray = [...array]; // Create a copy of the array
        const [removedItem] = newArray.splice(fromIndex, 1); // Remove the item from its original position
        newArray.splice(toIndex, 0, removedItem); // Insert the item at the new position
        return newArray;
    };
    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Icon name="menu" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles?.name}>{route.params.id}</Text>

            </ThemedView>
            <ScrollView>
                <ThemedView style={styles.imageContainer}>
                    <DragSortableView
                        dataSource={d}
                        renderItem={(item: any, index) => (
                            <ThemedView style={styles.imageView}>
                                <Image style={styles.image} source={{ uri: item.path }} />
                                <ThemedView>
                                    <ThemedText>{index+1}</ThemedText>
                                </ThemedView>
                                {isEnterEdit && (<ThemedView style={styles.checkboxContainer}>
                                    <BouncyCheckbox
                                        style={styles.checkbox}
                                        fillColor="red"
                                        unFillColor="#FFFFFF"
                                        // text="Custom Checkbox"
                                        iconStyle={{ borderColor: 'red' }}
                                        innerIconStyle={{ borderWidth: 2 }}
                                        onPress={() => {
                                            handleSelectChange(item.id);
                                        }}
                                    />
                                </ThemedView>)}
                            </ThemedView>
                        )}
                        onDragEnd={(fromIndex: number, toIndex: number) => {
                            const updatedData = reorderArray(d, fromIndex, toIndex); // Reorder the array
                            // setData(updatedData); // Update the state with the new array
                            console.log(updatedData); // Log the full updated array
                        }}
                        parentWidth={width}
                        childrenHeight={childrenHeight}
                        childrenWidth={childrenWidth}
                        dragStart={isEnterEdit}
                    />

                </ThemedView>
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    header: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 60,
        width: '100%',
        backgroundColor: 'steelblue',
        flexDirection: 'row',
        gap: 10,
        paddingEnd: 20,
    },
    back: {
        flex: 1,
        height: '100%',
        width: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        height: 20,
        width: 11,
        tintColor: '#000000',
    },
    name: {
        width: 280,
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
        height: '100%',
        resizeMode: 'cover',
    },
    extraContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    hidden:{
        display:'none',
    },
});

export default DetailsScreen;
