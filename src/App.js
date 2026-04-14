import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Write from './pages/Write';

function App() {
  return (
    <Router>
      <nav style={{
        padding: '20px',
        background: '#1a1a1a',
        color: 'white',
        display: 'flex',
        gap: '20px'
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Home (Read)</Link>
        <Link to="/write" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Write Article</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/write" element={<Write />} />
      </Routes>
    </Router>
  );
}

export default App;