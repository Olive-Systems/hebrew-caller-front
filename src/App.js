import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Admin from './pages/Admin';
import { SettingsProvider } from './context/SettingsContext';
import './App.css';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <nav style={{ opacity: 1}}>
          Cop<Link to="/admin">y</Link>right Olive Systems, Inc.
        </nav>
      </Router>
    </SettingsProvider>
  );
}

export default App;