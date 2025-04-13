import React, { useContext, useState } from 'react';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import Card from '../components/Card';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View, TouchableWithoutFeedback, Text } from 'react-native';
import { SQLiteContext } from '../context/AppContext';
import { NavigationProp } from '@react-navigation/native';
import  MaterialCommunityIcon  from 'react-native-vector-icons/MaterialCommunityIcons';
import EmptyComponent from '../components/EmptyComponent';
import { FlatList } from 'react-native';
import { Document } from '../interface';

interface ViewAllScreenProps {
    navigation: NavigationProp<any>;
}

interface ItemProps {
    item: Document;
    navigation: NavigationProp<any>;
}

const Item = ({ item, navigation }: ItemProps) => {
    return (
        <Pressable onPress={() => navigation.navigate('Details',
            { id: item?.id, name: item?.name, folderId: item.folder_id },
        )}
            key={item?.id}>
            <Card document={item} />
        </Pressable>
    );
};

const ViewAllScreen: React.FC<ViewAllScreenProps> = ({ navigation }) => {
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [sortOption, setSortOption] = useState('name-asc');

    const context = useContext(SQLiteContext);

    if (!context) {
        return <ThemedText>Loading...</ThemedText>;
    }

    const { documents } = context;

    const sortedDocuments = [...documents].sort((a, b) => {
        switch(sortOption) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'date-newest':
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'date-oldest':
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            default:
                return 0;
        }
    });

    if (documents.length === 0) {
        return (<EmptyComponent />);
    }

    return (
        <ThemedView style={styles.container}>

            <FlatList
            style={styles.list}
                data={sortedDocuments}
                renderItem={({ item }) => <Item item={item} navigation={navigation} />}
                ListHeaderComponent={<ThemedView style={styles.topBar}>
                    <ThemedText style={styles.header}>All</ThemedText>
                    <TouchableOpacity onPress={() => setSortModalVisible(true)}>
                        <MaterialCommunityIcon name="sort" size={24} color={'#fff'} />
                    </TouchableOpacity>
                </ThemedView>}
                 />
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={sortModalVisible}
                        onRequestClose={() => setSortModalVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
                            <View style={styles.modalContainer}>
                                <TouchableWithoutFeedback>
                                    <View style={styles.modalContent}>
                                        <Text style={styles.modalHeading}>Sort By</Text>
                                        <TouchableOpacity
                                            style={[styles.sortOption, sortOption === 'name-asc' && styles.selectedOption]}
                                            onPress={() => {
                                                setSortOption('name-asc');
                                                setSortModalVisible(false);
                                            }}
                                        >
                                            <Text>Name (A-Z)</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.sortOption, sortOption === 'name-desc' && styles.selectedOption]}
                                            onPress={() => {
                                                setSortOption('name-desc');
                                                setSortModalVisible(false);
                                            }}
                                        >
                                            <Text>Name (Z-A)</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.sortOption, sortOption === 'date-newest' && styles.selectedOption]}
                                            onPress={() => {
                                                setSortOption('date-newest');
                                                setSortModalVisible(false);
                                            }}
                                        >
                                            <Text>Date (Newest)</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.sortOption, sortOption === 'date-oldest' && styles.selectedOption]}
                                            onPress={() => {
                                                setSortOption('date-oldest');
                                                setSortModalVisible(false);
                                            }}
                                        >
                                            <Text>Date (Oldest)</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    bottom: {
        height: 20,
        flex: 1,
    },
    topBar:{
        display: 'flex',
        flexDirection: 'row',
        paddingEnd: 5,
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
        height: 40,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    modalHeading: {
        fontSize: 18,
        fontWeight: '600',
        borderColor: '#000',
        borderBottomWidth: 1,
        marginBottom: 15,
        paddingBottom: 5,
    },
    sortOption: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedOption: {
        backgroundColor: '#f0f0f0',
    },
    list:{
        height: '100%',
    },
});

export default ViewAllScreen;
