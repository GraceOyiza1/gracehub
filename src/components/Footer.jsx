import { Link } from 'react-router-dom';
import { Globe, Mail } from 'lucide-react';
import Newsletter from './Newsletter';

function LinkedInIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className={className}>
            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
        </svg>
    );
}

function Footer() {
    const externalLinks = [
        { name: "About", url: "https://graceoyiza.vercel.app" },
        { name: "Contact", url: "https://www.linkedin.com/in/grace-gift" }
    ];

    return (
        <footer className="mt-20 border-t" style={{ borderColor: 'var(--border-color)' }}>
            {/* Top Iconic Navigation */}
            <div className="py-12 px-6">
                <nav className="flex items-center justify-center gap-6 sm:gap-10">
                    <Link 
                        to="/" 
                        className="group flex flex-col items-center gap-2 transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-violet-500/30 group-hover:bg-violet-500/5 transition-all">
                            <Mail className="w-5 h-5 text-violet-500" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                            Home
                        </span>
                    </Link>
                    {externalLinks.map(link => (
                        <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-2 transition-all"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-violet-500/30 group-hover:bg-violet-500/5 transition-all">
                                {link.name === "About" ? <Globe className="w-5 h-5" /> : <LinkedInIcon className="w-5 h-5" />}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                {link.name}
                            </span>
                        </a>
                    ))}
                </nav>
            </div>

            {/* Newsletter Section */}
            <Newsletter />

            {/* Links & Copyright Section */}
            <div className="py-16 px-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
                    {/* Logo & Tagline */}
                    <div className="text-center">
                        <Link to="/" className="text-3xl font-black tracking-tighter bg-gradient-to-br from-violet-500 to-purple-500 bg-clip-text text-transparent mb-2 inline-block">
                            GraceHub.
                        </Link>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                            Stories, insights, growth, and real life.
                        </p>
                    </div>

                    {/* Bottom Line */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t text-center md:text-left" style={{ borderColor: 'var(--border-color)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                            © 2026 GraceHub
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                            Designed & Built by Grace Oyiza
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
