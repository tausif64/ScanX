import React from 'react';
import App from './App';
import { SQLiteProvider } from './src/context/AppContext';

function Root(): React.JSX.Element {
  return (
      <SQLiteProvider>
          <App />
      </SQLiteProvider>
  );
}

export default Root;
