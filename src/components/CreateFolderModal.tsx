import React, { useState } from 'react';
import { Modal, View, TextInput, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';

interface CreateFolderModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (folder: { name: string }) => void;
    checkFolderExists: (folderName: string) => boolean; // Function to check if folder exists
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ visible, onClose, onCreate, checkFolderExists }) => {
    const [folderName, setFolderName] = useState('');

    const handleCreate = () => {
        if (folderName.trim()) {
            if (checkFolderExists(folderName)) {
                Alert.alert('Folder already exists', 'Please choose a different name.');
            } else {
                const folder: { name: string } = { name: folderName };
                onCreate(folder);
                setFolderName('');
                onClose();
            }
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text>Create a New Folder</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Folder Name"
                        value={folderName}
                        onChangeText={setFolderName}
                        autoFocus
                    />
                    <View style={styles.buttonArea}>
                        <TouchableOpacity style={styles.buttonCancle} onPress={() => { onClose(); }}>
                            <Text style={styles.buttonText}>Cancle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonSuccess} onPress={handleCreate} disabled={!folderName.trim()}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
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
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    input: {
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
    },
    buttonArea: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        width: '100%',
    },
    buttonCancle: {
        backgroundColor: '#ff0000',
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 5,
    },
    buttonSuccess: {
        paddingHorizontal: 28,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: '#33cc33',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: 600,
    },
});

export default CreateFolderModal;
