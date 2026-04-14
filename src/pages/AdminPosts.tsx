import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Power,
    ClipboardCheck,
    User,
    MapPin,
    Tag,
    DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function AdminPosts() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const { token } = useAuth();

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:3003/api/admin/posts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching admin posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchPosts();
    }, [token]);

    const handleUpdate = async (id: number, updates: any) => {
        try {
            const response = await fetch(`http://localhost:3003/api/admin/posts/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates),
            });
            if (response.ok) {
                setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
            }
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const filtered = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.user_name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || p.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-['Inter']">
            <Navbar />

            <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-teal-950 font-['Plus_Jakarta_Sans'] mb-2">Job Post Management</h1>
                    <p className="text-slate-500">Review and moderate job requests from seekers.</p>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by title or seeker name..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-teal-500 transition-all outline-none text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 bg-slate-50 p-1 rounded-2xl">
                        {['all', 'pending', 'approved', 'rejected'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === f
                                    ? 'bg-white text-teal-700 shadow-sm'
                                    : 'text-slate-500 hover:text-teal-600'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-dotted border-slate-200">Loading posts...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-dotted border-slate-200">No job posts found.</div>
                    ) : (
                        <AnimatePresence>
                            {filtered.map((post, i) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <StatusBadge status={post.status} />
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-2 py-0.5 border border-slate-100 rounded-full">ID: {post.id}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-teal-950 font-['Plus_Jakarta_Sans'] mb-3">{post.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <User size={16} className="text-teal-600" />
                                                <span className="font-medium text-slate-700">{post.user_name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Tag size={16} className="text-teal-600" />
                                                <span>{post.category_name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={16} className="text-teal-600" />
                                                <span>{post.city}, {post.province}</span>
                                            </div>
                                            {post.budget && (
                                                <div className="flex items-center gap-1.5">
                                                    <DollarSign size={16} className="text-teal-600" />
                                                    <span className="font-bold text-teal-700">Rs. {post.budget.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-slate-50">
                                        <button
                                            onClick={() => handleUpdate(post.id, { is_active: !post.is_active })}
                                            className={`px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all flex-1 md:flex-none ${post.is_active ? 'bg-teal-50 text-teal-700' : 'bg-slate-50 text-slate-500'
                                                }`}
                                        >
                                            <Power size={14} className={post.is_active ? 'text-teal-600' : 'text-slate-400'} />
                                            {post.is_active ? 'Active' : 'Inactive'}
                                        </button>

                                        <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block" />

                                        <button
                                            onClick={() => handleUpdate(post.id, { status: 'approved' })}
                                            disabled={post.status === 'approved'}
                                            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-600/10 hover:bg-teal-700 transition-all disabled:opacity-30 disabled:shadow-none flex-1 md:flex-none whitespace-nowrap"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleUpdate(post.id, { status: 'rejected' })}
                                            disabled={post.status === 'rejected'}
                                            className="px-6 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-all disabled:opacity-30 flex-1 md:flex-none"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        pending: 'bg-amber-100 text-amber-700',
        approved: 'bg-teal-100 text-teal-700',
        rejected: 'bg-red-100 text-red-700',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
            {status}
        </span>
    );
}
