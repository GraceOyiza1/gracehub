import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

function Write() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Personal Stories');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!title || !content) return alert("Title and content are required.");
        setLoading(true);

        try {
            let url = "";
            if (image) {
                url = await compressImage(image);
            }

            await addDoc(collection(db, "articles"), {
                title,
                content,
                category,
                imageUrl: url,
                createdAt: serverTimestamp(),
            });

            setIsPublished(true);
        } catch (err) {
            console.error("Publishing error:", err);
            if (err.message.includes("blocked") || err.code === "unavailable") {
                alert("Connection failed! Your browser or AdBlocker is blocking the upload to Google Firestore. Please disable AdBlock and try again.");
            } else {
                alert("Publishing failed: " + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (isPublished) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
                <h1 className="article-title">Published Successfully!</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.2rem' }}>
                    Your story is now live on **GraceHub**.
                </p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button className="btn-primary" onClick={() => navigate('/')}>View in Stories</button>
                    <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)' }} onClick={() => {
                        setTitle(''); setContent(''); setImage(null); setIsPublished(false); setIsPreview(false);
                    }}>Write Another</button>
                </div>
            </div>
        );
    }

    if (isPreview) {
        return (
            <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-24">
                <div className="flex justify-between mb-10 sm:mb-16 items-center flex-wrap gap-4">
                    <div className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-slate-300">Preview Mode</div>
                    <div className="flex gap-3">
                        <button className="bg-white/5 text-white border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors" onClick={() => setIsPreview(false)}>Edit</button>
                        <button className="bg-violet-600 px-5 py-2 rounded-xl text-white text-sm font-semibold hover:bg-violet-500 transition-colors" onClick={handleSubmit}>{loading ? "..." : "Publish"}</button>
                    </div>
                </div>

                {image && (
                    <div className="bg-white/5 border border-white/10 p-2 mb-16 rounded-[2.5rem] overflow-hidden">
                        <img 
                            src={URL.createObjectURL(image)} 
                            alt="Cover Preview" 
                            className="w-full h-auto max-h-[600px] object-cover rounded-[2.2rem]" 
                        />
                    </div>
                )}

                <h1 className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight article-title mb-4">{title || "Your Untitled Story"}</h1>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>In <span style={{ color: 'var(--accent)' }}>{category}</span></div>
                <div className="article-body" style={{ whiteSpace: 'pre-wrap' }}>{content || "Tap 'Edit' to write..."}</div>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-24">
            <header className="flex justify-between mb-10 sm:mb-16 items-center flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500"></div>
                    <h2 className="text-base text-slate-400 font-semibold">Drafting</h2>
                </div>
                <div className="flex gap-3">
                    <button className="bg-transparent text-slate-400 border border-white/10 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors" onClick={() => setIsPreview(true)}>Preview</button>
                    <button className="bg-violet-600 px-5 py-2 rounded-xl text-white font-semibold text-sm hover:bg-violet-500 transition-colors" onClick={handleSubmit}>{loading ? "..." : "Publish"}</button>
                </div>
            </header>

            <form className="flex flex-col gap-6 sm:gap-8">
                <input 
                    type="text" 
                    placeholder="Story Title" 
                    className="text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight text-white placeholder-slate-600"
                    style={{ 
                        border: 'none', 
                        outline: 'none', 
                        width: '100%', 
                        fontFamily: 'var(--font-sans)', 
                        background: 'transparent', 
                        padding: '0'
                    }} 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} 
                />

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center px-4 py-4 sm:px-6 sm:py-4 w-full sm:w-max bg-white/5 border border-white/10 rounded-2xl">
                    <select 
                        className="px-3 py-2 border border-white/10 bg-white/5 rounded-xl text-white font-semibold outline-none text-sm w-full sm:w-auto focus:border-violet-500/50"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="Personal Stories">Personal Stories</option>
                        <option value="Motivation & Mindset">Motivation & Mindset</option>
                        <option value="Tech & Learning">Tech & Learning</option>
                        <option value="Business & Side Hustles">Business & Side Hustles</option>
                        <option value="Short Reads / Micro Stories">Short Reads / Micro Stories</option>
                    </select>
                    
                    <label style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📷 {image ? 'Image Added' : 'Cover Image'}</span>
                        <input 
                            type="file" 
                            onChange={(e) => setImage(e.target.files[0])} 
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>

                <textarea 
                    placeholder="Tell your story..." 
                    style={{ 
                        width: '100%', 
                        border: 'none', 
                        outline: 'none', 
                        height: '60vh', 
                        fontSize: '1.2rem', 
                        fontFamily: 'var(--font-serif)', 
                        resize: 'none', 
                        background: 'none', 
                        color: '#d0d0d0',
                        lineHeight: 1.6
                    }} 
                    value={content}
                    onChange={(e) => setContent(e.target.value)} 
                />
            </form>
        </div>
    );
}

export default Write;