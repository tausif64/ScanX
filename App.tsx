import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabLayout from './src/navigation/navigation';


function App(): React.JSX.Element {

  return (
    <NavigationContainer>
      <TabLayout scanDocument={function (): void {
        throw new Error('Function not implemented.');
      }} />
    </NavigationContainer>
  );
}


export default App;
