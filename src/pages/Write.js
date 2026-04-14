import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Write() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('General');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
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

            alert("Published successfully!");
            // Reset form
        } catch (err) {
            alert(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-10 bg-white shadow-xl rounded-lg mt-10">
            <h2 className="text-3xl font-bold mb-6">Create New Article</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Article Title" className="w-full p-4 border rounded" onChange={(e) => setTitle(e.target.value)} />

                <select className="w-full p-4 border rounded" onChange={(e) => setCategory(e.target.value)}>
                    <option>Tech</option>
                    <option>Culture</option>
                    <option>Development</option>
                </select>

                <input type="file" onChange={(e) => setImage(e.target.files[0])} className="block w-full text-sm text-gray-500" />

                <textarea placeholder="Tell your story..." className="w-full p-4 border rounded h-64" onChange={(e) => setContent(e.target.value)} />

                <button type="submit" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition">
                    {loading ? "Publishing..." : "Publish to GraceHub"}
                </button>
            </form>
        </div>
    );
}

export default Write;