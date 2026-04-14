import React from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
            navigate('/');
        } catch (error) {
            console.error("Login failed", error);
            alert(`Login failed: ${error.message}`);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <h1 className="article-title" style={{ fontSize: '4rem', marginBottom: '10px' }}>Welcome Back.</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.2rem' }}>Sign in to write and manage your stories.</p>
            <button className="btn-primary" onClick={handleLogin}>
                Sign in with Google
            </button>
        </div>
    );
}

export default Login;
