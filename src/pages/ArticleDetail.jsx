import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';

function ArticleDetail() {
    const { slug } = useParams();
    const location = useLocation();
    const [article, setArticle] = useState(null);
    const [articleId, setArticleId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // User interaction state
    const [hasLiked, setHasLiked] = useState(false);
    const [hasDisliked, setHasDisliked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                // Try fetching by slug from Firestore
                const q = query(collection(db, "articles"), where("slug", "==", slug));
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const docSnap = snapshot.docs[0];
                    const data = docSnap.data();
                    setArticle(data);
                    setArticleId(docSnap.id);
                    setLikes(data.likes || 0);
                    setDislikes(data.dislikes || 0);
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

        // Check local storage for previous interaction
        const interaction = localStorage.getItem(`interaction-${slug}`);
        if (interaction === 'like') setHasLiked(true);
        if (interaction === 'dislike') setHasDisliked(true);
    }, [slug]);

    // Dynamic SEO: update browser tab title when article loads
    useEffect(() => {
        if (article?.title) {
            document.title = `${article.title} | GraceHub`;
        }
        return () => { document.title = 'GraceHub'; };
    }, [article]);

    const handleLike = async () => {
        if (hasLiked || hasDisliked) return;
        setLikes(prev => prev + 1);
        setHasLiked(true);
        localStorage.setItem(`interaction-${slug}`, 'like');
        try {
            await updateDoc(doc(db, "articles", articleId), { likes: increment(1) });
        } catch (err) { console.error("Like error:", err); }
    };

    const handleDislike = async () => {
        if (hasLiked || hasDisliked) return;
        setDislikes(prev => prev + 1);
        setHasDisliked(true);
        localStorage.setItem(`interaction-${slug}`, 'dislike');
        try {
            await updateDoc(doc(db, "articles", articleId), { dislikes: increment(1) });
        } catch (err) { console.error("Dislike error:", err); }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "Processing...";
        try {
            return timestamp.toDate().toDateString();
        } catch (e) {
            return "Just now";
        }
    };

    if (loading) return <div className="max-w-[800px] mx-auto px-6 pt-32 text-center text-slate-500 animate-pulse">Loading story...</div>;
    
    if (error) return (
        <div className="max-w-[800px] mx-auto px-6 pt-32 text-center">
            <h2 className="text-red-500 text-2xl font-black mb-6">{error}</h2>
            <Link to="/" className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-white font-bold inline-block hover:bg-white/10 transition-colors">Back to Home</Link>
        </div>
    );

    if (!article) return <div className="max-w-[800px] mx-auto px-6 pt-32 text-center text-slate-500">Story not found.</div>;

    return (
        <article className="max-w-[800px] mx-auto px-6 pb-24 pt-10 sm:pt-20">
            {/* Meta Section */}
            <div className="mb-12 sm:mb-20">
                <div className="flex items-center gap-3 mb-8 flex-wrap">
                    <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        {article.category}
                    </span>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        {formatDate(article.createdAt)}
                    </span>
                    <span className="text-slate-600 hidden sm:block">•</span>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        {Math.ceil(article.content?.split(' ').length / 200)} min read
                    </span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl font-black leading-[1.1] mb-10 tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                    {article.title}
                </h1>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 shrink-0 shadow-lg shadow-violet-500/20"></div>
                    <div>
                        <div className="font-bold text-lg">Grace Oyiza</div>
                        <div className="text-sm text-slate-500 font-medium">Publisher & Author</div>
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            {article.imageUrl && (
                <div className="bg-white/5 border border-white/10 p-2 mb-16 rounded-[2.5rem] overflow-hidden">
                    <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="w-full h-auto max-h-[600px] object-cover rounded-[2.2rem]" 
                    />
                </div>
            )}

            {/* Content Body */}
            <div className="font-serif text-[1.25rem] sm:text-[1.4rem] leading-relaxed text-slate-200 whitespace-pre-wrap selection:bg-violet-500/30">
                {article.content}
            </div>

            {/* Engagement Section */}
            <div className="mt-16 flex items-center justify-center gap-6 py-8 border-y border-white/5">
                <div className="flex flex-col items-center gap-2">
                    <button 
                        onClick={handleLike}
                        disabled={hasLiked || hasDisliked}
                        className={`group p-4 rounded-full border transition-all duration-300 ${
                            hasLiked 
                                ? 'bg-violet-500/10 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
                                : 'bg-white/5 border-white/10 hover:border-violet-500/50 hover:bg-white/10'
                        } ${hasLiked || hasDisliked ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
                    >
                        <svg className={`w-6 h-6 transition-colors ${hasLiked ? 'text-violet-400 fill-violet-400' : 'text-white group-hover:text-violet-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                    <span className={`text-sm font-bold tracking-tight ${hasLiked ? 'text-violet-400' : 'text-slate-500'}`}>{likes}</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <button 
                        onClick={handleDislike}
                        disabled={hasLiked || hasDisliked}
                        className={`group p-4 rounded-full border transition-all duration-300 ${
                            hasDisliked 
                                ? 'bg-white/10 border-white/20 opacity-50' 
                                : 'bg-white/5 border-white/10 hover:border-slate-500/50 hover:bg-white/10 text-slate-400'
                        } ${hasLiked || hasDisliked ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
                    >
                        <svg className="w-6 h-6 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14h5v4m0-4h5v4m0-4h5v4m-5-4h5v4" visibility="hidden" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <span className={`text-sm font-bold tracking-tight ${hasDisliked ? 'text-slate-400' : 'text-slate-500'}`}>{dislikes}</span>
                </div>
            </div>
            
            {/* Footer Call to Action */}
            <div className="mt-24 p-12 bg-white/[0.03] border border-white/10 rounded-[2.5rem] text-center">
                <h3 className="text-2xl font-black mb-4">Thanks for reading!</h3>
                <p className="text-slate-400 mb-10 text-lg leading-relaxed max-w-lg mx-auto">
                    If you enjoyed this story, consider exploring more from my recent publication.
                </p>
                <Link to="/" className="bg-gradient-to-br from-violet-600 to-purple-600 px-8 py-4 rounded-2xl text-white font-black text-lg shadow-xl shadow-violet-500/20 transition-transform hover:scale-105 inline-block">
                    Explore More Stories
                </Link>
            </div>
        </article>
    );
}

export default ArticleDetail;
