import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function ArticleDetail() {
    const { id } = useParams();
    const location = useLocation();
    const [article, setArticle] = useState(location.state?.article || null);
    const [loading, setLoading] = useState(!article);
    const [error, setError] = useState(null);

    useEffect(() => {
        // If we already have the article from the location state, no need to fetch immediately
        if (location.state?.article) {
            setLoading(false);
            return;
        }

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
    }, [id, location.state]);

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
