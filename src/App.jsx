import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Write from './pages/Write';
import Login from './pages/Login';
import ArticleDetail from './pages/ArticleDetail';
import Dashboard from './pages/Dashboard';

function Navbar({ isDark, toggleTheme }) {
  const { user, isAuthor } = useAuth();
  const handleLogout = () => signOut(auth);

  return (
    <header
      className="sticky top-0 z-50 py-5 backdrop-blur-2xl border-b"
      style={{
        background: 'var(--navbar-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="max-w-[800px] mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
        <Link
          to="/"
          className="text-3xl font-black tracking-tighter bg-gradient-to-br from-violet-500 to-purple-500 bg-clip-text text-transparent"
        >
          GraceHub.
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6 font-semibold text-sm">
          <Link
            to="/"
            className="transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.target.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.target.style.color = 'var(--text-secondary)')}
          >
            Stories
          </Link>

          {isAuthor && (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:block transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.target.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.target.style.color = 'var(--text-secondary)')}
              >
                Dashboard
              </Link>
              <Link to="/write" className="text-violet-400 hover:text-violet-300 transition-colors">
                Write
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="border px-4 py-1.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              Sign out
            </button>
          )}

          {/* ── Theme Toggle Switch ── */}
          <label className="theme-toggle" title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <input
              type="checkbox"
              checked={!isDark}
              onChange={toggleTheme}
            />
            <div className="theme-toggle-track">
              <div className="theme-toggle-thumb">
                {isDark ? '🌙' : '☀️'}
              </div>
            </div>
          </label>
        </nav>
      </div>
    </header>
  );
}

function App() {
  // Read saved preference, default to dark
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('gracehub-theme');
    return saved ? saved === 'dark' : true;
  });

  // Apply data-theme attribute to <html> whenever isDark changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('gracehub-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <AuthProvider>
      <Router>
        <div className="bg-glow"></div>
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        <main className="pt-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/write" element={<Write />} />
            <Route path="/login" element={<Login />} />
            <Route path="/article/:slug" element={<ArticleDetail />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;