import React from 'react';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import Card from '../components/Card';
import { ScrollView, StyleSheet } from 'react-native';

const HomePage = () => {

  return (
    <ThemedView>
      <ScrollView style={styles.container}>
      <ThemedText>Recently Viewed</ThemedText>
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
      <Card />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container:{
    paddingHorizontal:10,
    paddingVertical:5,
  },
});

export default HomePage;
