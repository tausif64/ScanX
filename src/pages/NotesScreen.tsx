import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import RNFS from 'react-native-fs';
// import Pdf from 'react-native-pdf';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import PdfRendererView from 'react-native-pdf-renderer';

const NotesScreen: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<string[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    const loadPdfs = async () => {
      const folderPath = RNFS.DocumentDirectoryPath + '/ScanX';

      try {
        const files = await RNFS.readdir(folderPath);
        // console.log(files);
        const pdfs = files.filter(file => file.endsWith('.pdf'));
        setPdfFiles(pdfs.map(file => `${folderPath}/${file}`));
      } catch (error) {
        console.error('Error reading directory:', error);
      }
    };

    loadPdfs();
  }, []);

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => setSelectedPdf(item)}>
      <Text style={styles.item}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText>NotesScreen</ThemedText>
      <View style={styles.container}>
        {selectedPdf ?
          <PdfRendererView
            style={styles.bg}
            source={selectedPdf}
            distanceBetweenPages={16}
            maxZoom={5}
            onPageChange={(current, total) => {
              console.log(current, total);
            }}
          />
          :
          <FlatList
            data={pdfFiles}
            keyExtractor={(item) => item}
            renderItem={renderItem}
          />
        }
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bg: {
    backgroundColor: '#fff',
  },
});

export default NotesScreen;
