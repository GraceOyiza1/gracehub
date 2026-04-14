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
        <div className="container" style={{ paddingBottom: '100px', paddingTop: '40px' }}>
            <div style={{ marginBottom: '60px' }}>
                <h1 className="article-title" style={{ fontSize: '3.5rem' }}>Writer's Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Manage your published stories and drafting studio.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {loading && (
                    <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
                    </div>
                )}

                {error && (
                    <div className="glass-card" style={{ padding: '40px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
                        <h3 style={{ color: '#ef4444', marginBottom: '10px' }}>Dashboard Connection Issue</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
                        <button className="btn-primary" style={{ marginTop: '20px', fontSize: '0.8rem' }} onClick={() => window.location.reload()}>Retry Connection</button>
                    </div>
                )}

                {!loading && !error && articles.length === 0 ? (
                    <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>You haven't published any stories yet.</p>
                        <Link to="/write" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Write Your First Story</Link>
                    </div>
                ) : (
                    !loading && !error && articles.map(article => (
                        <div key={article.id} className="glass-card mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 'clamp(20px, 5vw, 30px)', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <span className="badge" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}>● Published</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(article.createdAt)}</span>
                                </div>
                                <h3 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.4rem)' }}>{article.title}</h3>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', width: '100%', justifyContent: 'flex-end', marginTop: '10px' }} className="mobile-p-0">
                                <Link to={`/article/${article.id}`} style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>View</Link>
                                <button 
                                    onClick={() => handleDelete(article.id)}
                                    style={{ 
                                        background: 'rgba(239, 68, 68, 0.1)', 
                                        color: '#ef4444', 
                                        border: '1px solid rgba(239, 68, 68, 0.2)', 
                                        padding: '8px 16px', 
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Dashboard;
