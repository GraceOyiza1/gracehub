import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Home from './pages/Home';
import Write from './pages/Write';
import Login from './pages/Login';
import ArticleDetail from './pages/ArticleDetail';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const AUTHOR_EMAIL = "giftlight02@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  return (
    <Router>
      <div className="bg-glow"></div>
      <header style={{
        padding: '24px 0',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(5, 5, 5, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        zIndex: 100
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <Link to="/" style={{ 
            fontSize: 'min(1.6rem, 6vw)', 
            fontWeight: 900, 
            letterSpacing: '-1.5px',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>GraceHub.</Link>
          
          <nav style={{ display: 'flex', gap: 'clamp(10px, 3vw, 28px)', alignItems: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)' }}>Stories</Link>
            {user?.email === AUTHOR_EMAIL && (
              <>
                <Link to="/dashboard" style={{ color: 'var(--text-secondary)' }} className="mobile-hide">Dashboard</Link>
                <Link to="/write" style={{ color: 'var(--accent)' }}>Write</Link>
              </>
            )}
            {user ? (
              <button onClick={handleLogout} style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--glass-border)', 
                padding: '6px 14px',
                borderRadius: '10px',
                color: 'var(--text-white)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}>Sign out</button>
            ) : (
              <Link to="/login" className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Sign in</Link>
            )}
          </nav>
        </div>
      </header>

      <main style={{ paddingTop: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={user?.email === AUTHOR_EMAIL ? <Dashboard /> : <Home />} />
          <Route path="/write" element={user?.email === AUTHOR_EMAIL ? <Write /> : <Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;