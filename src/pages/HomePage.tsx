import React, { useCallback, useContext, useState } from 'react';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import Card from '../components/Card';
import { Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SQLiteContext } from '../context/AppContext';
import { NavigationProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EmptyComponent from '../components/EmptyComponent';

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

  const { recentDocuments } = context;

  if(recentDocuments.length === 0){
    return ( <EmptyComponent />);
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.container2} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <ThemedText style={styles.header}>Recently Viewed</ThemedText>
        {recentDocuments.map((item) =>
          <Pressable onPress={() => navigation.navigate('Details',
            { id: item?.id, name: item?.name, folderId: item.folder_id })} key={item?.id}>
            <Card document={item} />
          </Pressable>
        )}
        <View style={styles.bottom}>
          {recentDocuments?.length > 4 &&
          <TouchableOpacity onPress={() => navigation.navigate('ViewAll')}>
            <View style={styles.viewAll}>
              <ThemedText>View All</ThemedText>
              <MaterialIcons name="keyboard-arrow-down" size={24} color={'#fff'}  />
            </View>
          </TouchableOpacity>
          }
        </View>
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
  bottom: {
    height: 30,
    flex: 1,
    width: '100%',
    marginBottom: 20,
    marginTop: 5,
  },
  viewAll:{
    alignItems: 'center',
    padding: 2,
  },
});

export default HomePage;
