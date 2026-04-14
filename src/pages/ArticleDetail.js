import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function ArticleDetail() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const docRef = doc(db, "articles", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setArticle(docSnap.data());
                } else {
                    setError("Story not found.");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Could not load story. Check your connection or AdBlocker.");
            }
            setLoading(false);
        };
        fetchArticle();
    }, [id]);

    const formatDate = (timestamp) => {
        if (!timestamp) return "Processing...";
        try {
            return timestamp.toDate().toDateString();
        } catch (e) {
            return "Just now";
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading story...</div>;
    
    if (error) return (
        <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
            <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</h2>
            <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
    );

    if (!article) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Story not found.</div>;

    return (
        <article className="container" style={{ paddingBottom: '100px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>
            <div style={{ marginBottom: 'clamp(30px, 8vw, 60px)' }}>
                <div style={{ display: 'flex', gap: '8px 12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <span className="badge">{article.category}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(article.createdAt)}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }} className="mobile-hide">•</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{Math.ceil(article.content?.split(' ').length / 200)} min read</span>
                </div>
                <h1 className="article-title">{article.title}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gradient)', flexShrink: 0 }}></div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Grace Oyiza</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Publisher & Author</div>
                    </div>
                </div>
            </div>

            {article.imageUrl && (
                <div className="glass-card" style={{ padding: '8px', marginBottom: 'clamp(30px, 10vw, 60px)', borderRadius: '20px' }}>
                    <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', borderRadius: '14px', display: 'block' }} 
                    />
                </div>
            )}

            <div className="article-body" style={{ whiteSpace: 'pre-wrap' }}>
                {article.content}
            </div>
            
            <div style={{ marginTop: '100px', padding: '40px', background: 'var(--glass)', borderRadius: '24px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '15px' }}>Thanks for reading!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>If you enjoyed this story, consider exploring more from my recent publication.</p>
                <Link to="/" className="btn-primary" style={{ display: 'inline-block' }}>Explore More Stories</Link>
            </div>
        </article>
    );
}

export default ArticleDetail;
