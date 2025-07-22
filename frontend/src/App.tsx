import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AssetList from './pages/AssetList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/assets" element={<AssetList />} />
        {/* Add more routes as more pages here*/}
      </Routes>
    </Router>
  );
}

export default App;

