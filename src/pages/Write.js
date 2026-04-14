import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

function Write() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Tech');
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
                const imageRef = ref(storage, `articles/${image.name + Date.now()}`);
                await uploadBytes(imageRef, image);
                url = await getDownloadURL(imageRef);
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
            <div className="container" style={{ paddingBottom: '100px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'clamp(30px, 10vw, 60px)', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div className="badge">Preview Mode</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '8px 16px' }} onClick={() => setIsPreview(false)}>Edit</button>
                        <button className="btn-primary" onClick={handleSubmit} style={{ padding: '8px 20px' }}>{loading ? "..." : "Publish"}</button>
                    </div>
                </div>
                <h1 className="article-title">{title || "Your Untitled Story"}</h1>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>In <span style={{ color: 'var(--accent)' }}>{category}</span></div>
                <div className="article-body" style={{ whiteSpace: 'pre-wrap' }}>{content || "Tap 'Edit' to write..."}</div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 'clamp(20px, 5vw, 40px)' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'clamp(30px, 10vw, 60px)', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                    <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Drafting</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" style={{ background: 'none', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', boxShadow: 'none', padding: '8px 16px' }} onClick={() => setIsPreview(true)}>Preview</button>
                    <button className="btn-primary" onClick={handleSubmit} style={{ padding: '8px 20px' }}>{loading ? "..." : "Publish"}</button>
                </div>
            </header>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <input 
                    type="text" 
                    placeholder="Story Title" 
                    className="article-title"
                    style={{ 
                        border: 'none', 
                        outline: 'none', 
                        fontWeight: 900, 
                        width: '100%', 
                        fontFamily: 'var(--font-sans)', 
                        background: 'none', 
                        padding: '0'
                    }} 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} 
                />

                <div className="glass-card mobile-stack" style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '15px 25px', width: 'fit-content' }}>
                    <select 
                        style={{ padding: '8px 12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', color: 'white', fontWeight: 600, outline: 'none', fontSize: '0.9rem' }} 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="Tech">Tech</option>
                        <option value="Culture">Culture</option>
                        <option value="Development">Development</option>
                        <option value="Personal">Personal</option>
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