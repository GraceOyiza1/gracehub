import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Home() {
    const [articles, setArticles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Firestore Listen Error:", err);
                setError("Connection blocked or lost. Check if your AdBlocker is blocking Google Firestore.");
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

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div style={{ padding: 'clamp(60px, 15vw, 100px) 0 60px', textAlign: 'center' }}>
                <h1 style={{ 
                    marginBottom: '16px', 
                    letterSpacing: '-0.05em', 
                    background: 'linear-gradient(to bottom, #fff 30%, #666 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>GraceHub.</h1>
                <p style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontWeight: 500, padding: '0 10px' }}>
                    Stories, insights, and digital artifacts curated by **Grace Oyiza**.
                </p>
                <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span className="badge">12 Articles</span>
                    <span className="badge">Design</span>
                    <span className="badge">Code</span>
                </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {loading && (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>Gathering stories...</div>
                    </div>
                )}

                {error && (
                    <div className="glass-card" style={{ padding: '40px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
                        <h3 style={{ color: '#ef4444', marginBottom: '10px' }}>Connection Issue</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
                        <button className="btn-primary" style={{ marginTop: '20px', fontSize: '0.8rem' }} onClick={() => window.location.reload()}>Retry Connection</button>
                    </div>
                )}

                {!loading && !error && articles.length === 0 && (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>No stories found yet.</div>
                    </div>
                )}

                {articles.map(article => (
                    <Link key={article.id} to={`/article/${article.id}`} className="glass-card mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', padding: 'clamp(20px, 5vw, 30px)' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', marginBottom: '12px', fontWeight: 600, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className="badge" style={{ padding: '2px 8px' }}>{article.category}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{formatDate(article.createdAt)}</span>
                            </div>
                            <h2 style={{ marginBottom: '12px', fontWeight: 800 }}>{article.title}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 3vw, 1.05rem)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '15px' }}>
                                {article.content}
                            </p>
                            <div style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>
                                Read Full Story →
                            </div>
                        </div>
                        {article.imageUrl && (
                            <div style={{ width: '100%', maxWidth: '160px', height: '160px', flexShrink: 0, alignSelf: 'center' }} className="mobile-p-0">
                                <img 
                                    src={article.imageUrl} 
                                    alt={article.title} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
                                />
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Home;