import React from 'react';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import Card from '../components/Card';

const HomePage = () => {
  return (
    <ThemedView>
      <ThemedText>Welcome</ThemedText>
      <Card />
    </ThemedView>
  );
};

export default HomePage;
