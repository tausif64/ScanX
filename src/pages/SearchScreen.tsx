/* eslint-disable react-native/no-inline-styles */
// [java.lang.IllegalStateException: Tried to use permissions API while not attached to an Activity.]
import React, { useContext, useState } from 'react';
import { TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { useColorScheme } from 'react-native';
import { SQLiteContext } from '../context/AppContext';
import { Document } from '../interface';
import Card from '../components/Card';
import { NavigationProp } from '@react-navigation/native';

interface SearchScreenProps {
  navigation: NavigationProp<any>;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const context = useContext(SQLiteContext);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredResults, setFilteredResults] = useState<Document[]>([]);
  const theme = useColorScheme();

  const documents = context!.documents;

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text === '') {
      setFilteredResults([]);
    } else {
      const results = documents.filter((item: Document) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredResults(results);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setFilteredResults([]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { color: theme === 'light' ? '#000000' : '#ffffff' }]}
          placeholder="Search..."
          placeholderTextColor={theme === 'light' ? '#888888' : '#cccccc'}
          value={searchText}
          onChangeText={handleSearch}
          autoFocus
        />
        {searchText ? (
          <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
            <Icon name="close" size={24} color={theme === 'light' ? '#687076' : '#ffffff'} />
          </TouchableOpacity>
        ) : null}
      </ThemedView>

      <FlatList
        data={filteredResults}
        renderItem={({ item }) => (
                <TouchableOpacity onPress={() => navigation.navigate('Details',
                    { id: item?.id },
                  )}
                    key={item?.id}>
                    <Card document={item} />
                  </TouchableOpacity>
        )}
        ListEmptyComponent={<ThemedText style={styles.noResults}>No results found</ThemedText>}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomColor: '#ccc',
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
    paddingRight: 35,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  clearIcon: {
    position: 'absolute',
    right: 10,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultContainer: {
    paddingHorizontal: 15,
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
  },
});

export default SearchScreen;
