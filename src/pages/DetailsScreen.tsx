import { Text, StyleSheet, Image, Dimensions, TouchableOpacity, BackHandler } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { ThemedView } from '../components/ThemedView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SQLiteContext } from '../context/AppContext';
import {DragSortableView} from 'react-native-drag-sort';

const { width } = Dimensions.get('window');
const childrenWidth = (width / 2) - 20;
const childrenHeight = 200;
const DetailsScreen = ({ navigation, route }: any) => {
    const context = useContext(SQLiteContext);
    const [isEnterEdit, setisEnterEdit] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [images, setImages] = useState<{
        id: number;
        document_id: number;
        path: string;
        timestamp: number;
    }[] | undefined>([]);
    useEffect(() => {
        context?.fetchImages(route.params.id);
        setImages(context?.images);
    }, [context, route.params.id]);
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
    useEffect(() => {
        const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => backHandlerSubscription.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnterEdit]);
    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                    <Icon name="menu" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles?.name}>{route.params.id}</Text>

            </ThemedView>
            <ThemedView style={styles.imageContainer}>
                <DragSortableView
                    dataSource={[
                        { id: 1, uri: 'file:///data/user/0/com.scanx/cache/752aef40-941e-49f9-90bd-b5b0a4f082c0.jpg' },
                        { id: 2, uri: 'file:///data/user/0/com.scanx/cache/752aef40-941e-49f9-90bd-b5b0a4f082c0.jpg' },
                        { id: 3, uri: 'file:///data/user/0/com.scanx/cache/752aef40-941e-49f9-90bd-b5b0a4f082c0.jpg' },
                        { id: 4, uri: 'file:///data/user/0/com.scanx/cache/752aef40-941e-49f9-90bd-b5b0a4f082c0.jpg' },
                        { id: 5, uri: 'file:///data/user/0/com.scanx/cache/752aef40-941e-49f9-90bd-b5b0a4f082c0.jpg' },
                    ]}
                    renderItem={(item: any) => (
                        <ThemedView style={styles.imageView}>
                            <Image style={styles.image} source={{ uri: item.uri }} />
                        </ThemedView>
                    )}
                    onDragEnd={(data: any) => console.log(data)}
                />
            </ThemedView>
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
        justifyContent: 'center',
        rowGap: 8,
        columnGap: 5,
        marginTop: 10,
    },
    imageView: {
        width: childrenWidth,
        height: childrenHeight,
        borderWidth: 1,
        borderColor: '#000',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});

export default DetailsScreen;
