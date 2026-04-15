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
        <div className="max-w-[800px] mx-auto px-6 flex flex-col items-center justify-center min-h-[70vh] text-center">
            <h1 className="text-5xl sm:text-7xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-6">
                Welcome Back.
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl font-medium mb-10 max-w-md">
                Sign in to your dashboard to write and manage your stories.
            </p>
            <button 
                className="bg-gradient-to-br from-violet-600 to-purple-600 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-violet-500/20 transition-transform hover:scale-105" 
                onClick={handleLogin}
            >
                Sign in with Google
            </button>
        </div>
    );
}

export default Login;
