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
                setError("Connection blocked or lost. Please check your AdBlocker.");
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
        <div className="max-w-[800px] mx-auto px-6 pb-24">
            {/* Hero Section */}
            <div className="py-16 sm:py-24 text-center">
                <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
                    GraceHub.
                </h1>
                <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto font-medium px-4">
                    Stories, insights, and digital artifacts curated by <strong className="text-white">Grace Oyiza</strong>.
                </p>
                <div className="mt-8 flex gap-3 justify-center flex-wrap">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-violet-400">
                        {articles.length} Stories
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-400">Tech</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-400">Digital Publishing</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-400">Insights</span>
                </div>
            </div>
            
            {/* Feed Section */}
            <div className="flex flex-col gap-8">
                {loading && (
                    <div className="bg-white/5 border border-white/10 p-10 rounded-3xl text-center">
                        <div className="text-slate-500 animate-pulse">Gathering stories...</div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/5 border border-red-500/20 p-10 rounded-3xl">
                        <h3 className="text-red-500 font-bold mb-2 text-lg">Connection Issue</h3>
                        <p className="text-slate-400 italic text-sm">{error}</p>
                        <button className="mt-6 bg-red-500/20 text-red-400 border border-red-500/20 px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-colors" onClick={() => window.location.reload()}>Retry Connection</button>
                    </div>
                )}

                {!loading && !error && articles.length === 0 && (
                    <div className="bg-white/5 border border-white/10 p-10 rounded-3xl text-center">
                        <div className="text-slate-500">No stories found yet.</div>
                    </div>
                )}

                {articles.map(article => (
                    <Link 
                        key={article.id} 
                        to={`/article/${article.id}`} 
                        state={{ article }} 
                        className="group relative bg-white/[0.03] border border-white/10 p-8 rounded-3xl flex flex-col sm:flex-row justify-between gap-6 transition-all hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.98]"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4 text-xs font-bold">
                                <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                                    {article.category}
                                </span>
                                <span className="text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                    {formatDate(article.createdAt)}
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 group-hover:text-violet-400 transition-colors">
                                {article.title}
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed line-clamp-3 mb-6">
                                {article.content}
                            </p>
                            <div className="text-sm font-bold text-white/50 group-hover:text-violet-400 transition-colors uppercase tracking-[0.2em]">
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