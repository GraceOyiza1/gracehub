import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Write from './pages/Write';
import Login from './pages/Login';
import ArticleDetail from './pages/ArticleDetail';
import Dashboard from './pages/Dashboard';

function Navbar() {
  const { user, isAuthor } = useAuth();
  const handleLogout = () => signOut(auth);

  return (
    <header className="sticky top-0 z-50 py-6 bg-black/70 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-[800px] mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
        <Link to="/" className="text-3xl font-black tracking-tighter bg-gradient-to-br from-violet-500 to-blue-500 bg-clip-text text-transparent">
          GraceHub.
        </Link>
        
        <nav className="flex items-center gap-4 sm:gap-8 font-semibold text-sm">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">Stories</Link>
          {isAuthor && (
            <>
              <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors hidden sm:block">Dashboard</Link>
              <Link to="/write" className="text-violet-400 hover:text-violet-300 transition-colors">Write</Link>
            </>
          )}
          {user ? (
            <button onClick={handleLogout} className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl text-white font-semibold cursor-pointer text-xs hover:bg-white/10 transition-colors">
              Sign out
            </button>
          ) : (
            <Link to="/login" className="bg-gradient-to-br from-violet-600 to-blue-600 px-4 py-1.5 rounded-xl text-white font-semibold text-xs transition-transform hover:scale-105">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-glow"></div>
        <Navbar />
        <main className="pt-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/write" element={<Write />} />
            <Route path="/login" element={<Login />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;