import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Home() {
    const [articles, setArticles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");

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
                setError("Connection blocked or lost. Please check your AdBlocker.");
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return "Processing...";
        try { return timestamp.toDate().toDateString(); }
        catch (e) { return "Just now"; }
    };

    const filteredArticles = selectedCategory === "All"
        ? articles
        : articles.filter(article => article.category === selectedCategory);

    const categories = ["Personal Stories", "Motivation & Mindset", "Tech & Learning", "Business & Side Hustles", "Short Reads / Micro Stories"];

    return (
        <div className="max-w-[800px] mx-auto px-6 pb-24">
            {/* Hero Section */}
            <div className="py-16 sm:py-24 text-center">
                <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4 article-title">
                    GraceHub.
                </h1>
                <p className="text-lg sm:text-xl max-w-xl mx-auto font-medium px-4" style={{ color: 'var(--text-secondary)' }}>
                    Stories, insights, growth, and real life.
                </p>

                {/* Category Filter Badges */}
                <div className="mt-8 flex gap-2 justify-center flex-wrap">
                    <button
                        onClick={() => setSelectedCategory("All")}
                        className="px-3 py-1.5 border rounded-full text-xs font-bold cursor-pointer transition-all duration-200"
                        style={selectedCategory === "All"
                            ? { background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.4)', color: '#a78bfa' }
                            : { background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }
                        }
                    >
                        {articles.length} Stories (All)
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className="px-3 py-1.5 border rounded-full text-xs font-bold cursor-pointer transition-all duration-200"
                            style={selectedCategory === cat
                                ? { background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.4)', color: '#a78bfa' }
                                : { background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }
                            }
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed Section */}
            <div className="flex flex-col gap-6">
                {loading && (
                    <div className="p-10 rounded-3xl text-center border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Gathering stories...</div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/5 border border-red-500/20 p-10 rounded-3xl">
                        <h3 className="text-red-500 font-bold mb-2 text-lg">Connection Issue</h3>
                        <p className="text-red-400 italic text-sm">{error}</p>
                        <button className="mt-6 bg-red-500/20 text-red-400 border border-red-500/20 px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-colors" onClick={() => window.location.reload()}>
                            Retry Connection
                        </button>
                    </div>
                )}

                {!loading && !error && filteredArticles.length === 0 && (
                    <div className="p-10 rounded-3xl text-center border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <div style={{ color: 'var(--text-muted)' }}>No stories found.</div>
                    </div>
                )}

                {filteredArticles.map(article => (
                    <Link
                        key={article.id}
                        to={`/article/${article.slug || article.id}`}
                        className="group relative p-8 rounded-3xl flex flex-col sm:flex-row justify-between gap-6 transition-all duration-300 active:scale-[0.98] border"
                        style={{
                            background: 'var(--bg-card)',
                            borderColor: 'var(--border-color)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--bg-card-hover)';
                            e.currentTarget.style.borderColor = 'var(--border-hover)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'var(--bg-card)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4 text-xs font-bold flex-wrap">
                                <span className="bg-violet-500/10 text-violet-500 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                                    {article.category}
                                </span>
                                <span className="uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                                    {formatDate(article.createdAt)}
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 transition-colors group-hover:text-violet-500" style={{ color: 'var(--text-primary)' }}>
                                {article.title}
                            </h2>
                            <p className="text-base leading-relaxed line-clamp-3 mb-5" style={{ color: 'var(--text-secondary)' }}>
                                {article.content}
                            </p>
                            <div className="text-sm font-bold uppercase tracking-[0.2em] transition-colors group-hover:text-violet-500" style={{ color: 'var(--text-muted)' }}>
                                Read Full Story →
                            </div>
                        </div>
                        {article.imageUrl && (
                            <div className="w-full sm:w-40 sm:h-40 shrink-0 self-center overflow-hidden rounded-2xl">
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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