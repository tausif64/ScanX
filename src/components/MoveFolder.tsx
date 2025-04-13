import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ToastAndroid, Platform } from 'react-native';
import React, { useContext, useState } from 'react';
import { Folder } from '../interface';
import { SQLiteContext } from '../context/AppContext';

interface MoveFolderProps {
    id: number;
    docId: number;
    visible: boolean;
    onClose: () => void;
    setFolderName: (name: string) => void;
}

const MoveFolder: React.FC<MoveFolderProps> = ({ id, docId, visible, onClose, setFolderName }) => {
    const [query, setQuery] = useState<string>();
    const context = useContext(SQLiteContext);
    const folders = context!.folders.filter((item) => item.id !== id);
    const [filteredResults, setFilteredResults] = useState<Folder[]>(folders);
    const handleSearch = (text: string) => {
        setQuery(text);
        if (text === '') {
            setFilteredResults(folders);
        } else {
            const results = folders.filter((item: Folder) =>
                item.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredResults(results);
        }
    };

    const handleMove = (selected: number, name: string) => {
        const data = { id: docId, folder_id: selected };
        context!.updateDocumentData(data);
        setFolderName(name);
        onClose();
        if (Platform.OS === 'android') {
            ToastAndroid.show('Document Moved Successfully', ToastAndroid.LONG);
        }
    };

    if (visible && folders.length === 1) {
        if (Platform.OS === 'android') {
            ToastAndroid.show('Only Default Folder exists', ToastAndroid.LONG);
        }
        onClose();
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalText}>Select A Folder</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Search..."
                        placeholderTextColor={'#000'}
                        value={query}
                        onChangeText={handleSearch}
                    />
                    <ScrollView>
                        {filteredResults.map((item) => (
                            <TouchableOpacity key={item.id} onPress={() => handleMove(item.id, item.name)}>
                                <Text style={styles.folderName}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalText: {
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 5,
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        height: 250,
    },
    input: {
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        borderRadius: 10,
        color: '#000',
    },
    folderName: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        textAlign: 'center',
        backgroundColor: 'gray',
        marginTop: 1,
    },
});

export default MoveFolder;
