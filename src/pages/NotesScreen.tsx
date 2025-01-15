import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';

const NotesScreen = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>NotesScreen</ThemedText>
    </ThemedView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default NotesScreen;
