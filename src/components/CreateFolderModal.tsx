import React, { useState } from 'react';
import { Modal, View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';

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
                    />
                    <Button
                        title="Create"
                        onPress={handleCreate}
                        disabled={!folderName.trim()} // Disable if input is empty
                    />
                    <Button title="Cancel" onPress={onClose} />
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
});

export default CreateFolderModal;
