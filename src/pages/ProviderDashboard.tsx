import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    Search,
    MapPin,
    Clock,
    DollarSign,
    Send,
    CheckCircle,
    AlertCircle,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../utils/api';

export default function ProviderDashboard() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const { token } = useAuth();

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/provider/posts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching job feed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchPosts();
    }, [token]);

    const handleRespond = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPost || !message) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/provider/posts/${selectedPost.id}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    setSelectedPost(null);
                    setMessage('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error sending response:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 font-['Inter']">
            <Navbar />

            <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-teal-950 font-['Plus_Jakarta_Sans'] tracking-tight mb-2">Job Feed</h1>
                        <p className="text-slate-500">Find new opportunities and grow your artisan business.</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by job or category..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="py-20 text-center text-slate-400">Loading jobs...</div>
                        ) : filtered.length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                                <Briefcase size={48} className="mx-auto mb-4 text-slate-200" />
                                <p className="text-slate-500 font-medium">No matching job opportunities found.</p>
                            </div>
                        ) : (
                            filtered.map((post) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className={`p-6 bg-white rounded-[2.5rem] border transition-all cursor-pointer group ${selectedPost?.id === post.id ? 'border-teal-500 ring-4 ring-teal-500/5' : 'border-slate-100 hover:border-teal-200 hover:shadow-md'
                                        }`}
                                    onClick={() => setSelectedPost(post)}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <span className="bg-teal-50 text-teal-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                                                {post.category_name}
                                            </span>
                                            <h3 className="text-lg md:text-xl font-bold text-teal-950 font-['Plus_Jakarta_Sans'] group-hover:text-teal-600 transition-colors line-clamp-2 md:line-clamp-none">{post.title}</h3>
                                        </div>
                                        {post.budget && (
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Budget</p>
                                                <p className="text-base md:text-lg font-black text-teal-600">Rs. {post.budget.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-600 text-sm line-clamp-2 mb-6">{post.description}</p>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-50 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest gap-4">
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-teal-600" /> {post.city}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-teal-600" /> {new Date(post.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className="text-teal-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform ml-auto sm:ml-0">
                                            Quick Offer <Send size={12} />
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Response Panel — Desktop Sidebar / Mobile Bottom Sheet */}
                    <div className="lg:col-start-3">
                        <AnimatePresence mode="wait">
                            {selectedPost ? (
                                <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto">
                                    {/* Mobile Backdrop */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setSelectedPost(null)}
                                        className="absolute inset-0 bg-teal-950/40 backdrop-blur-sm lg:hidden"
                                    />

                                    {/* Panel */}
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, y: 100 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 100 }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        className="absolute inset-x-0 bottom-0 lg:sticky lg:top-28 lg:inset-auto bg-teal-900 rounded-t-[3rem] lg:rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl max-h-[90vh] overflow-y-auto"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Quick Offer</h2>
                                            <button onClick={() => setSelectedPost(null)} className="p-2 bg-teal-800 rounded-full text-teal-400 hover:text-white transition-colors">
                                                <AlertCircle size={20} />
                                            </button>
                                        </div>

                                        <div className="bg-teal-800/50 backdrop-blur-md rounded-2xl p-4 mb-6 border border-teal-700/50">
                                            <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Responding to</p>
                                            <p className="font-bold truncate">{selectedPost.title}</p>
                                            <p className="text-xs text-teal-300">Seeker: {selectedPost.seeker_name}</p>
                                        </div>

                                        {success ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-teal-500/20 border border-teal-500/50 p-6 rounded-2xl text-center"
                                            >
                                                <CheckCircle className="mx-auto mb-3 text-teal-300" size={32} />
                                                <p className="font-bold">Message Sent!</p>
                                                <p className="text-xs text-teal-200 mt-1">The seeker will see your profile and message.</p>
                                            </motion.div>
                                        ) : (
                                            <form onSubmit={handleRespond}>
                                                <label className="block text-xs font-black text-teal-300 uppercase tracking-widest mb-2">Your Proposal</label>
                                                <textarea
                                                    required
                                                    className="w-full h-40 bg-teal-800/80 border border-teal-700 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all placeholder:text-teal-700 mb-6"
                                                    placeholder="Explain why you are the best fit for this job. Include your experience and estimated timeline..."
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                ></textarea>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full bg-white text-teal-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-50 transition-all disabled:opacity-50 group"
                                                >
                                                    {isSubmitting ? 'Sending...' : 'Send Offer'}
                                                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </form>
                                        )}
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="hidden lg:block bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm text-center py-20 sticky top-28">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                                        <MessageSquare size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-teal-950 font-['Plus_Jakarta_Sans'] mb-2">Select a Job</h3>
                                    <p className="text-slate-500 text-sm">Click on any job post to view more details and send an offer.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
