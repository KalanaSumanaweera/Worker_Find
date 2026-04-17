import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Power,
    MoreVertical,
    ChevronDown,
    User,
    Mail,
    MapPin,
    Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../utils/api';

export default function AdminWorkers() {
    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const { token } = useAuth();

    const fetchWorkers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/workers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setWorkers(data);
        } catch (error) {
            console.error('Error fetching workers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchWorkers();
    }, [token]);

    const handleUpdate = async (id: number, updates: any) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/workers/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates),
            });
            if (response.ok) {
                setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
            }
        } catch (error) {
            console.error('Error updating worker:', error);
        }
    };

    const filtered = workers.filter(w => {
        const matchesSearch = w.user_name.toLowerCase().includes(search.toLowerCase()) ||
            w.job.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || w.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-['Inter']">
            <Navbar />

            <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-teal-950 font-['Plus_Jakarta_Sans'] mb-2">Worker Management</h1>
                        <p className="text-slate-500">Review and moderate professional artisan profiles.</p>
                    </div>
                    <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-2xl border border-amber-100 flex items-center gap-2">
                        <Calendar size={18} />
                        <span className="text-sm font-bold">{workers.filter(w => w.status === 'pending').length} application(s) pending</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or profession..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-teal-500 transition-all outline-none text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto scrollbar-none">
                        {['all', 'pending', 'approved', 'rejected'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === f
                                    ? 'bg-white text-teal-700 shadow-sm'
                                    : 'text-slate-500 hover:text-teal-600'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table/List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Loading workers...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">No workers found matching your criteria.</div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Professional</th>
                                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Active</th>
                                            <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        <AnimatePresence>
                                            {filtered.map((w) => (
                                                <motion.tr
                                                    key={w.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="hover:bg-slate-50/30 transition-colors"
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold">
                                                                {w.user_name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-teal-950 font-['Plus_Jakarta_Sans']">{w.user_name}</p>
                                                                <p className="text-xs text-slate-500">{w.job}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                            <MapPin size={14} />
                                                            {w.city}, {w.province}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <StatusBadge status={w.status} />
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <button
                                                            onClick={() => handleUpdate(w.id, { is_active: !w.is_active })}
                                                            className={`w-12 h-6 rounded-full relative transition-all ${w.is_active ? 'bg-teal-500' : 'bg-slate-200'}`}
                                                        >
                                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${w.is_active ? 'left-7' : 'left-1'}`} />
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {w.status !== 'approved' && (
                                                                <button
                                                                    onClick={() => handleUpdate(w.id, { status: 'approved' })}
                                                                    title="Approve"
                                                                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                                                                >
                                                                    <CheckCircle size={20} />
                                                                </button>
                                                            )}
                                                            {w.status !== 'rejected' && (
                                                                <button
                                                                    onClick={() => handleUpdate(w.id, { status: 'rejected' })}
                                                                    title="Reject"
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                                >
                                                                    <XCircle size={20} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-50">
                                {filtered.map((w) => (
                                    <div key={w.id} className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xl">
                                                {w.user_name[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-teal-950 font-['Plus_Jakarta_Sans']">{w.user_name}</p>
                                                    <StatusBadge status={w.status} />
                                                </div>
                                                <p className="text-sm text-slate-500">{w.job}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
                                            <MapPin size={14} className="text-teal-500" />
                                            {w.city}, {w.province}
                                        </div>

                                        <div className="flex items-center justify-between py-4 border-t border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</span>
                                                <button
                                                    onClick={() => handleUpdate(w.id, { is_active: !w.is_active })}
                                                    className={`w-12 h-6 rounded-full relative transition-all ${w.is_active ? 'bg-teal-500' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${w.is_active ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                {w.status !== 'approved' && (
                                                    <button onClick={() => handleUpdate(w.id, { status: 'approved' })} className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                                                        <CheckCircle size={20} />
                                                    </button>
                                                )}
                                                {w.status !== 'rejected' && (
                                                    <button onClick={() => handleUpdate(w.id, { status: 'rejected' })} className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                                        <XCircle size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
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
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
            {status}
        </span>
    );
}
