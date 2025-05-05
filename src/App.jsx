import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TestConnection from './components/TestConnection';

const App = () => {
  return (
    <div className="App">
      <h1>HWMS System</h1>
      <TestConnection />
      <Routes>
        {/* Your existing routes */}
      </Routes>
    </div>
  );
}

export default App;