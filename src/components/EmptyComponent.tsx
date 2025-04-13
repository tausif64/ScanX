import { View, Text, StyleSheet, Button } from 'react-native';
import React from 'react';


const EmptyComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headingText}>Welcome to ScanX.</Text>
      <Text style={styles.subHeading}>No document.</Text>
      <Button title="Scan"  />
    </View>
  );
};

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headingText:{
        fontSize: 24,
        fontWeight: 600,
        textAlign: 'center',
    },
    subHeading:{
        fontWeight: 400,
        fontSize: 18,
        paddingVertical: 15,
    },
});

export default EmptyComponent;
