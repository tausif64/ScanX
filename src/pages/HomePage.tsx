import React, { useCallback, useContext, useState } from 'react';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import Card from '../components/Card';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SQLiteContext } from '../context/AppContext';
import { NavigationProp } from '@react-navigation/native';

interface HomePageProps {
  navigation: NavigationProp<any>;
}

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  const context = useContext(SQLiteContext);

  if (!context) {
    return <ThemedText>Loading...</ThemedText>;
  }

  const { documents } = context;
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.container2} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <ThemedText style={styles.header}>Recently Viewed</ThemedText>
        {documents.map((item) => <TouchableOpacity onPress={() => navigation.navigate('Details',
          { id: item?.id, name: item?.name, folderId: item.folder_id },
        )}
          key={item?.id}>
          <Card document={item} />
        </TouchableOpacity>
        )}
        <View style={styles.bottom} />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container2: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  bottom:{
    height: 20,
    flex:1,
  },
});

export default HomePage;
