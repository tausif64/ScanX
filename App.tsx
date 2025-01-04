import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabLayout from './src/navigation/navigation';
import { DrawerLayoutAndroid } from 'react-native';
import drawerLayout from './src/components/Drawer';


function App(): React.JSX.Element {
  const drawerRef = useRef<DrawerLayoutAndroid>(null);

  return (
    <NavigationContainer>
      <DrawerLayoutAndroid
        ref={drawerRef}
        drawerWidth={300}
        drawerPosition="left"
        renderNavigationView={drawerLayout}
      >
        <TabLayout openDrawer={() => drawerRef.current?.openDrawer()} scanDocument={function (): void {
        throw new Error('Function not implemented.');
      }} />
      </DrawerLayoutAndroid>
    </NavigationContainer>
  );
}


export default App;
