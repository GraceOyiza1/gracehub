import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

function Newsletter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [message, setMessage] = useState("");

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        try {
            // 1. Check if the email already exists
            const q = query(collection(db, "subscribers"), where("email", "==", email.toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setStatus("success");
                setMessage("You're already on the journey! ✍️");
                setEmail("");
                return;
            }

            // 2. Add new subscriber
            await addDoc(collection(db, "subscribers"), {
                email: email.toLowerCase(),
                createdAt: serverTimestamp()
            });

            setStatus("success");
            setMessage("Welcome to the journey! Check your inbox soon. ✨");
            setEmail("");
        } catch (err) {
            console.error("Subscription error:", err);
            setStatus("error");
            setMessage("Something went wrong. Please try again.");
        }
    };

    return (
        <section className="py-24 px-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="max-w-xl mx-auto text-center">
                <div className="w-16 h-16 bg-violet-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-violet-500/20">
                    <Mail className="w-8 h-8 text-violet-500" />
                </div>
                
                <h2 className="text-3xl sm:text-5xl font-black mb-6 article-title tracking-tight text-balance">
                    The Newsletter
                </h2>
                
                <p className="text-lg mb-10 leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Discover thoughtfully written, twist-driven articles sent straight to your inbox.
                </p>

                {status === "success" ? (
                    <div className="p-8 rounded-3xl bg-violet-500/5 border border-violet-500/20 text-violet-400 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500">
                        <CheckCircle2 className="w-10 h-10" />
                        <span className="font-bold text-lg">{message}</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubscribe} className="relative group max-w-lg mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
                            <input
                                type="email"
                                required
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-6 pr-6 sm:pr-16 py-5 rounded-3xl border transition-all outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 shadow-sm"
                                style={{ 
                                    background: 'var(--bg-card)', 
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="sm:absolute right-2 top-2 bottom-2 px-8 sm:px-5 py-4 sm:py-0 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-lg shadow-violet-600/20 sm:shadow-none"
                            >
                                {status === "loading" ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="sm:hidden font-bold mr-2 uppercase tracking-widest text-xs">Subscribe</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <p className="mt-6 text-[10px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    By subscribing, you agree to receive email updates from GraceHub.
                </p>
                
                {status === "error" && (
                    <p className="mt-4 text-sm text-red-500 font-bold">{message}</p>
                )}
            </div>
        </section>
    );
}

export default Newsletter;
