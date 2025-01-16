import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabLayout from './src/navigation/navigation';
import { Alert, DrawerLayoutAndroid, PermissionsAndroid, Platform, StatusBar, useColorScheme } from 'react-native';
import drawerLayout from './src/components/Drawer';
import { Colors } from './src/constants/Colors';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { db, insertDocument, insertFolder, insertImage } from './src/db/db';
import { SQLiteProvider } from './src/context/AppContext';

function App(): React.JSX.Element {
  const drawerRef = useRef<DrawerLayoutAndroid>(null);
  const colorScheme = useColorScheme();

  const createDefaultFolder = async () => {
    db.transaction((tx: { executeSql: (arg0: string, arg1: never[], arg2: (_: any, results: any) => void) => void; }) => {
      tx.executeSql(
        'SELECT * FROM Folders',
        [],
        (_: any, results: any) => {
          const rows = results.rows;
          if (rows?.length === 0) {
            const defaultFolder = {
              name: 'Default Folder',
            };
            insertFolder(defaultFolder);
          }
        },
      );
    });
  };

  const requestCameraPermission = async () => {
    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Camera Permission',
        message: 'ScanX needs access to your camera to scan documents.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
      if (!PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Error', 'User  must grant camera permissions to use document scanner.');
        return;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scanDocument = async () => {
    // prompt user to accept camera permission request if they haven't already
    if (Platform.OS === 'android' && await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    ) !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('Error', 'User  must grant camera permissions to use document scanner.');
      return;
    }

    // start the document scanner
    const { scannedImages } = await DocumentScanner.scanDocument();

    // Create a new document
    const document = {
      name: `ScanX_${new Date().getTime()}`,
      folder_id: 1,
    };

    // Insert the document into the database
    const documentId = await insertDocument(document);
    // console.log(documentId);

    // get back an array with scanned image file paths
    if (scannedImages && scannedImages.length > 0) {
      // Create a new image
      // console.log(scannedImages);
      return scannedImages.forEach(async (path) => {
        const image: any = {
          path,
          document_id: documentId,
        };
        await insertImage(image);
      });
    }
  };

  useEffect(() => {
    requestCameraPermission();
    createDefaultFolder();
  }, []);

  return (
    <SQLiteProvider>
      <NavigationContainer>
        <DrawerLayoutAndroid
          ref={drawerRef}
          drawerWidth={300}
          drawerPosition="left"
          renderNavigationView={drawerLayout}
        >
          <TabLayout openDrawer={() => drawerRef.current?.openDrawer()} scanDocument={scanDocument} />
        </DrawerLayoutAndroid>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colorScheme === 'dark' ? Colors.dark.background : Colors.light.background} />
      </NavigationContainer>
    </SQLiteProvider>
  );
}

export default App;
