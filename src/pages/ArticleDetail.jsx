import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
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

    // Audio / Speech State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voice, setVoice] = useState(null);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            // Prioritize "Natural" or high-quality US voices
            const selectedVoice = availableVoices.find(v => v.name.includes('Natural') || v.name.includes('Google US English'))
                || availableVoices.find(v => v.lang.startsWith('en'))
                || availableVoices[0];
            setVoice(selectedVoice);
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

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
        const handleUnload = () => {
            window.speechSynthesis.cancel();
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            document.title = 'GraceHub';
            window.speechSynthesis.cancel(); // Stop speaking when leaving
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [article]);

    const handleListen = () => {
        if (!article?.content) return;

        if (isSpeaking) {
            if (isPaused) {
                window.speechSynthesis.resume();
                setIsPaused(false);
            } else {
                window.speechSynthesis.pause();
                setIsPaused(true);
            }
        } else {
            // Start fresh
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(article.content);
            utterance.rate = 0.9;
            if (voice) utterance.voice = voice;

            utterance.onstart = () => {
                setIsSpeaking(true);
                setIsPaused(false);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            utterance.onerror = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

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

    if (loading) return <div className="max-w-[800px] mx-auto px-6 pt-32 text-center animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading story...</div>;

    if (error) return (
        <div className="max-w-[800px] mx-auto px-6 pt-32 text-center">
            <h2 className="text-red-500 text-2xl font-black mb-6">{error}</h2>
            <Link to="/" className="px-6 py-3 rounded-2xl font-bold inline-block transition-colors border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Back to Home</Link>
        </div>
    );

    if (!article) return <div className="max-w-[800px] mx-auto px-6 pt-32 text-center" style={{ color: 'var(--text-muted)' }}>Story not found.</div>;

    return (
        <article className="max-w-[800px] mx-auto px-6 pb-24 pt-10 sm:pt-20">
            {/* Meta Section */}
            <div className="mb-12 sm:mb-20">
                <div className="flex items-center gap-3 mb-8 flex-wrap">
                    <span className="bg-violet-500/10 text-violet-500 border border-violet-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        {article.category}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(article.createdAt)}
                    </span>
                    <span className="hidden sm:block" style={{ color: 'var(--border-color)' }}>•</span>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        {Math.ceil(article.content?.split(' ').length / 200)} min read
                    </span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black leading-[1.1] mb-10 tracking-tight article-title">
                    {article.title}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 shrink-0 shadow-lg shadow-violet-500/20"></div>
                        <div>
                            <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Grace Oyiza</div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Publisher & Author</div>
                        </div>
                    </div>

                    {!isSpeaking && (
                        <button
                            onClick={handleListen}
                            className="flex items-center gap-3 px-6 py-3 rounded-2xl border font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-center bg-violet-600/10 border-violet-500/30 text-violet-400"
                        >
                            <span className="text-xl">🔊</span>
                            Listen to Article
                        </button>
                    )}
                </div>
            </div>

            {/* Floating Audio Player */}
            {article && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100] transition-all duration-500 ease-out ${isSpeaking ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                    <div className="p-4 rounded-[2rem] border shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-4"
                        style={{ background: 'var(--navbar-bg)', borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center shrink-0">
                                <Volume2 className="w-5 h-5 text-violet-400" />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-400 truncate">Now Reading</div>
                                <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{article.title}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleStop} className="p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" title="Stop">
                                <Square className="w-5 h-5 fill-slate-500 text-slate-500" />
                            </button>
                            <button onClick={handleListen} className="p-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/30 transition-all active:scale-95 cursor-pointer" title={isPaused ? "Play" : "Pause"}>
                                {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cover Image */}
            {article.imageUrl && (
                <div className="mb-16 rounded-[2rem] overflow-hidden border shadow-2xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-80 md:h-[450px] object-cover"
                    />
                </div>
            )}

            {/* Content Body */}
            <div className="article-body whitespace-pre-wrap">
                {article.content}
            </div>

            {/* Engagement Section */}
            <div className="mt-16 flex items-center justify-center gap-6 py-8 border-y" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={handleLike}
                        disabled={hasLiked || hasDisliked}
                        className={`p-4 rounded-full border transition-all duration-300 ${hasLiked || hasDisliked ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
                        style={hasLiked
                            ? { background: 'rgba(139,92,246,0.1)', borderColor: '#8b5cf6', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }
                            : { background: 'var(--bg-card)', borderColor: 'var(--border-color)' }
                        }
                    >
                        <svg className="w-6 h-6" fill={hasLiked ? '#a78bfa' : 'none'} viewBox="0 0 24 24" stroke={hasLiked ? '#a78bfa' : 'currentColor'} style={{ color: hasLiked ? '#a78bfa' : 'var(--text-primary)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                    <span className="text-sm font-bold" style={{ color: hasLiked ? '#a78bfa' : 'var(--text-muted)' }}>{likes}</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={handleDislike}
                        disabled={hasLiked || hasDisliked}
                        className={`p-4 rounded-full border transition-all duration-300 ${hasLiked || hasDisliked ? 'cursor-default opacity-60' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{dislikes}</span>
                </div>
            </div>

            {/* Footer Call to Action */}
            <div className="mt-24 p-10 sm:p-12 rounded-[2.5rem] text-center border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-2xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>Thanks for reading!</h3>
                <p className="mb-10 text-lg leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
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
