import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { FileStack } from './src/navigation/navigation';
import { Alert, PermissionsAndroid,StatusBar, useColorScheme } from 'react-native';
import { Colors } from './src/constants/Colors';

import { db,  insertFolder } from './src/db/db';


function App(): React.JSX.Element {
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

  const requestNotificationPermission = async () => {
    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (!PermissionsAndroid.RESULTS.GRANTED) {
        return;
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    requestCameraPermission();
    createDefaultFolder();
    requestNotificationPermission();
  }, []);

  return (
      <NavigationContainer>
        <FileStack />
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colorScheme === 'dark' ? Colors.dark.background : Colors.light.background} />
      </NavigationContainer>
  );
}

export default App;
