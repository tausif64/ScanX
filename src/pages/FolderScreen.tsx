// FolderScreen.tsx
import React, { useContext, useState } from 'react';
import { SQLiteContext } from '../context/AppContext';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { ScrollView, StyleSheet, View } from 'react-native';
import FolderCard from '../components/FolderCard';
import FloatingActionButton from '../components/FloatingActionButton';
import CreateFolderModal from '../components/CreateFolderModal';

const FolderScreen = ({ navigation }: any) => {
  const context = useContext(SQLiteContext);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  if (!context) {
    return <ThemedText>Loading...</ThemedText>;
  }

  const { folders, createFolder, fetchFolders } = context;

  const handleCreateFolder = (folder: { name: string }) => {
    createFolder(folder);
    fetchFolders();
  };

  // Function to check if the folder name already exists
  const checkFolderExists = (folderName: string): boolean => {
    return folders.some(folder => folder.name.toLowerCase() === folderName.toLowerCase());
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {folders.map((item) => (
          <FolderCard
            key={item.id}
            folder={item}
            onPress={() => navigation.navigate('FoldersDoc', { id: item?.id, name: item.name })}
          />
        ))}
        <View style={styles.bottom} />
      </ScrollView>
      <FloatingActionButton onPress={() => setModalVisible(true)} />
      <CreateFolderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateFolder}
        checkFolderExists={checkFolderExists} // Pass the check function
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottom: {
    height: 20,
    flex: 1,
  },
});

export default FolderScreen;
