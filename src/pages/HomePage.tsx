import React, { useCallback, useContext, useState } from 'react';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import Card from '../components/Card';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SQLiteContext } from '../context/AppContext';
import { NavigationProp } from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<any>;
}

const HomePage = ({ navigation }: Props) => {
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
          { id: item?.id },
        )}
          key={item?.id}>
          <Card document={item} />
        </TouchableOpacity>
        )}

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
});

export default HomePage;
