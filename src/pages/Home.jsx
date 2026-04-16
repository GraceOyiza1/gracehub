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
        <div className="max-w-7xl mx-auto px-6 pb-24">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
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
                        className="group flex flex-col gap-4 transition-all duration-300 active:scale-[0.98]"
                    >
                        {/* Card Image */}
                        <div className="h-48 w-full shrink-0 overflow-hidden rounded-xl border border-white/5" style={{ background: 'var(--bg-card)' }}>
                            {article.imageUrl ? (
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Card Content */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500/80">
                                {article.category}
                            </span>
                            
                            <h2 className="text-xl font-bold leading-tight transition-colors group-hover:underline decoration-violet-500/40 underline-offset-4" style={{ color: 'var(--text-primary)' }}>
                                {article.title}
                            </h2>

                            <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {article.content}
                            </p>

                            <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                <span>{formatDate(article.createdAt)}</span>
                                <span style={{ color: 'var(--border-color)' }}>•</span>
                                <span>{Math.ceil(article.content?.split(' ').length / 200)} min read</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Home;