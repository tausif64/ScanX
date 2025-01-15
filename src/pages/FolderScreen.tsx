import React, { useContext } from 'react';
import { SQLiteContext } from '../context/AppContext';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { ScrollView, StyleSheet } from 'react-native';
import FolderCard from '../components/FolderCard';
import FloatingActionButton from '../components/FloatingActionButton';


const FolderScreen = () => {
  const context = useContext(SQLiteContext);

  if (!context) {
    return <ThemedText>Loading...</ThemedText>;
  }

  const { folders } = context;
  // console.log(folders[0].id);
  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {
        folders.map((item) =>
          <FolderCard key={item.id} folder={item} />)
        }
      </ScrollView>
      <FloatingActionButton onPress={function (): void {
        throw new Error('Function not implemented.');
      } } />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default FolderScreen;
