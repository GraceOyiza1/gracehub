import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

function Home() {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        // This looks into your Firestore "articles" collection
        const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, []);

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto' }}>
            <h1>Grace's Reading Platform</h1>
            <hr />
            {articles.map(article => (
                <div key={article.id} style={{ marginBottom: '30px' }}>
                    <h2>{article.title}</h2>
                    <p>{article.content.substring(0, 150)}...</p> {/* Just a preview */}
                    <small>{article.createdAt?.toDate().toDateString()}</small>
                </div>
            ))}
        </div>
    );
}

export default Home;