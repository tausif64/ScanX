import React, { useContext } from 'react';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import Card from '../components/Card';
import { ScrollView, StyleSheet } from 'react-native';
import { SQLiteContext } from '../context/AppContext';

const HomePage = () => {
  const context = useContext(SQLiteContext);

  if (!context) {
    return <ThemedText>Loading...</ThemedText>;
  }

  const { documents } = context;
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.container2}>
      <ThemedText style={styles.header}>Recently Viewed</ThemedText>
      {documents.map((item)=><Card key={item.id} document={item} />)}

      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container2:{
    paddingHorizontal:10,
    paddingVertical:5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default HomePage;
