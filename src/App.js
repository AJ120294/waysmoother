import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import { LoadScript } from '@react-google-maps/api';

const libraries = ['places']; // Required for the Autocomplete

function App() {
  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" libraries={libraries}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultPage />} />
        </Routes>
      </Router>
    </LoadScript>
  );
}

export default App;