import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    ClipboardCheck,
    MessageSquare,
    MapPin,
    Clock,
    User,
    ArrowRight,
    ChevronDown,
    LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function SeekerDashboard() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // active, archived
    const { token, user } = useAuth();

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:3003/api/seeker/posts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching seeker posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchPosts();
    }, [token]);

    const filteredPosts = posts.filter(p => activeTab === 'active' ? p.is_active : !p.is_active);

    return (
        <div className="min-h-screen bg-slate-50 font-['Inter']">
            <Navbar />

            <main className="pt-28 pb-12 px-4 md:px-8 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-teal-950 font-['Plus_Jakarta_Sans'] tracking-tight mb-2">My Requests</h1>
                        <p className="text-slate-500">Manage your postings and track professional responses.</p>
                    </div>
                    <Link
                        to="/post-need"
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-teal-600/20 transition-all group w-full md:w-auto justify-center"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        Post a New Need
                    </Link>
                </div>

                {/* Dashboard Tabs */}
                <div className="flex gap-4 border-b border-slate-200 mb-8">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'active' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Active Listings
                        {activeTab === 'active' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-teal-600 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('archived')}
                        className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'archived' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Archived
                        {activeTab === 'archived' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-teal-600 rounded-t-full" />}
                    </button>
                </div>

                {/* Posts List */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="py-20 text-center text-slate-400 font-medium">Loading your requests...</div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                            <LayoutDashboard size={48} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-500 font-medium">No {activeTab} posts found.</p>
                        </div>
                    ) : (
                        filteredPosts.map((post) => (
                            <div key={post.id}>
                                <PostCard post={post} />
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

interface PostCardProps {
    post: any;
}

function PostCard({ post }: PostCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const responsesCount = post.responses?.length || 0;

    return (
        <motion.div
            layout
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
        >
            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${post.status === 'approved' ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                {post.status}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={14} />
                                {new Date(post.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-teal-950 font-['Plus_Jakarta_Sans'] mb-2">{post.title}</h3>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">{post.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-teal-600" /> {post.city}</span>
                            <span className="flex items-center gap-1.5"><ClipboardCheck size={14} className="text-teal-600" /> {post.category_name}</span>
                        </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-2 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 min-w-full md:min-w-[160px]">
                        <div className="flex items-center gap-3 md:flex-col">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm relative">
                                <MessageSquare className="text-teal-600" size={24} />
                                {responsesCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                                        {responsesCount}
                                    </span>
                                )}
                            </div>
                            <div className="md:text-center">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Responses</span>
                                <span className="text-xl font-black text-teal-950 line-height-none">{responsesCount}</span>
                            </div>
                        </div>
                        <ArrowRight size={20} className="text-slate-200 md:hidden" />
                    </div>
                </div>

                {responsesCount > 0 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors group"
                    >
                        {isExpanded ? 'Hide Responses' : 'View Professional Responses'}
                        <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden bg-slate-50/50"
                    >
                        <div className="p-8 space-y-4">
                            {post.responses.map((resp: any, i: number) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={resp.id}
                                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold">
                                                {resp.worker_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-teal-950 font-['Plus_Jakarta_Sans']">{resp.worker_name}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{resp.worker_job}</p>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/worker/${resp.worker_id}`}
                                            className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                                        >
                                            View Profile <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                    <p className="text-slate-600 text-sm italic leading-relaxed">
                                        "{resp.message}"
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
