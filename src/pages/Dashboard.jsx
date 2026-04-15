import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Dashboard() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Dashboard Listen Error:", err);
                setError("Dashboard data blocked. Check if your AdBlocker is interfering with Google Firestore.");
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return "Processing...";
        try {
            return timestamp.toDate().toDateString();
        } catch (e) {
            return "Just now";
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
            try {
                await deleteDoc(doc(db, "articles", id));
            } catch (err) {
                alert("Failed to delete story. Connection may be blocked.");
            }
        }
    };

    return (
        <div className="max-w-[800px] mx-auto px-6 pb-24 pt-10">
            <div className="mb-16">
                <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-4">Writer's Dashboard</h1>
                <p className="text-slate-400 text-lg sm:text-xl">Manage your published stories and drafting studio.</p>
            </div>

            <div className="flex flex-col gap-6">
                {loading && (
                    <div className="bg-white/5 border border-white/10 p-16 rounded-3xl text-center">
                        <p className="text-slate-500 animate-pulse">Loading your dashboard...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/5 border border-red-500/20 p-10 rounded-3xl">
                        <h3 className="text-red-500 font-bold mb-2 text-lg">Dashboard Connection Issue</h3>
                        <p className="text-slate-400 italic text-sm">{error}</p>
                        <button className="mt-6 bg-red-500/20 text-red-400 border border-red-500/20 px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-colors" onClick={() => window.location.reload()}>Retry Connection</button>
                    </div>
                )}

                {!loading && !error && articles.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 p-16 rounded-3xl text-center flex flex-col items-center">
                        <p className="text-slate-400 mb-6 text-lg">You haven't published any stories yet.</p>
                        <Link to="/write" className="bg-gradient-to-br from-violet-600 to-blue-600 px-6 py-3 rounded-xl text-white font-bold inline-block hover:scale-105 transition-transform shadow-lg shadow-violet-500/20">Write Your First Story</Link>
                    </div>
                ) : (
                    !loading && !error && articles.map(article => (
                        <div key={article.id} className="bg-white/[0.03] border border-white/10 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center p-6 sm:p-8 gap-6 transition-colors hover:bg-white/[0.05] hover:border-white/20">
                            <div className="flex-1">
                                <div className="flex gap-4 items-center mb-3 flex-wrap">
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                        Published
                                    </span>
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{formatDate(article.createdAt)}</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold">{article.title}</h3>
                            </div>
                            
                            <div className="flex gap-4 items-center w-full sm:w-auto justify-end mt-2 sm:mt-0">
                                <Link to={`/article/${article.id}`} state={{ article }} className="text-slate-400 font-bold text-sm hover:text-white transition-colors">View</Link>
                                <button 
                                    onClick={() => handleDelete(article.id)}
                                    className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-colors flex items-center gap-2 cursor-pointer"
                                    title="Delete Story"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Dashboard;
