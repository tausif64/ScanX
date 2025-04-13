import { View, Text, Modal, TextInput, StyleSheet, Alert, TouchableOpacity, ToastAndroid, Platform } from 'react-native';
import React, { useContext, useState } from 'react';
import { SQLiteContext } from '../context/AppContext';

interface RenameModalProps {
    visible: boolean;
    onClose: () => void;
    id: number;
    name: string;
    setName?: (newName: string) => void;
}

const RenameModal: React.FC<RenameModalProps> = ({ visible, onClose, id, name, setName }) => {
    const [newName, setNewName] = useState<string>(name);

    const context = useContext(SQLiteContext);
    const documnets = context!.documents.filter(item => item.id !== id);

    const handleNameSave = () => {
        const exists = documnets.some(item => item.name.toLowerCase() === newName.toLowerCase());
        if (exists) {
            Alert.alert('Document already exists', 'Please choose a different name.');
        } else {
            const data = { id, name: newName };
            context!.updateDocumentData(data);
            context!.updateDocName(id, newName);
            onClose();
            if(setName){
                setName!(newName);
            }
            if (Platform.OS === 'android') {
                ToastAndroid.show('Renamed successfully!', ToastAndroid.SHORT);
            }
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalText}>Rename Document</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Documnet Name"
                        value={newName}
                        onChangeText={setNewName}
                        autoFocus
                    />
                    <View style={styles.buttonArea}>
                        <TouchableOpacity style={styles.buttonCancle} onPress={() => { onClose(); setNewName(name); }}>
                            <Text style={styles.buttonText}>Cancle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonSuccess} onPress={handleNameSave} disabled={!newName.trim()}>
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
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: '#33cc33',
    },
    buttonText:{
        fontSize: 15,
        fontWeight: 600,
    },
});

export default RenameModal;
