import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    Briefcase,
    ClipboardCheck,
    Clock,
    TrendingUp,
    ShieldCheck,
    ArrowRight,
    MessageSquare,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../utils/api';

interface Stats {
    users: number;
    workers: number;
    pendingWorkers: number;
    posts: number;
    pendingPosts: number;
    leads: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchStats();
    }, [token]);

    const statCards = [
        { label: 'Total Users', value: stats?.users || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
        { label: 'Total Workers', value: stats?.workers || 0, icon: Briefcase, color: 'bg-teal-50 text-teal-600' },
        { label: 'Pending Approvals', value: stats?.pendingWorkers || 0, icon: Clock, color: 'bg-amber-50 text-amber-600', alert: (stats?.pendingWorkers || 0) > 0 },
        { label: 'Seeker Posts', value: stats?.posts || 0, icon: ClipboardCheck, color: 'bg-indigo-50 text-indigo-600' },
        { label: 'Job Responses', value: stats?.leads || 0, icon: MessageSquare, color: 'bg-purple-50 text-purple-600' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-['Inter']">
            <Navbar />

            <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-teal-950 font-['Plus_Jakarta_Sans'] mb-2">Platform Overview</h1>
                        <p className="text-slate-500">Welcome back, Admin. Here's what's happening today.</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto scrollbar-none max-w-full">
                        <button className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-600/20 whitespace-nowrap">Last 24h</button>
                        <button className="px-4 py-2 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors whitespace-nowrap">7 days</button>
                        <button className="px-4 py-2 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors whitespace-nowrap">30 days</button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group"
                        >
                            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-bold text-teal-950">{loading ? '...' : stat.value}</h3>
                                    {stat.alert && (
                                        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-4">
                                <TrendingUp size={16} className="text-slate-200" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Action Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quick Actions */}
                    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold text-teal-950 mb-6 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
                            <ShieldCheck className="text-teal-600" />
                            Management Center
                        </h2>
                        <div className="space-y-4">
                            <ActionCard
                                title="Worker Approvals"
                                desc="Review and verify new artisan applications"
                                count={stats?.pendingWorkers}
                                to="/admin/workers"
                                icon={Briefcase}
                            />
                            <ActionCard
                                title="Job Post Moderation"
                                desc="Review and approve seeker job requests"
                                count={stats?.pendingPosts}
                                to="/admin/posts"
                                icon={ClipboardCheck}
                            />
                            <ActionCard
                                title="User Management"
                                desc="Manage roles and account statuses"
                                to="/admin/users"
                                icon={Users}
                            />
                        </div>
                    </section>

                    {/* Activity Placeholder */}
                    <section className="bg-teal-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <TrendingUp size={200} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <span className="bg-teal-800 text-teal-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Platform Tip</span>
                                <h2 className="text-3xl font-bold mt-4 mb-2 font-['Plus_Jakarta_Sans'] leading-tight">Automate Approvals for Verified Google Users</h2>
                                <p className="text-teal-100/70 max-w-sm">Consider allowing instant activation for users who complete Google verification to reduce manual review work.</p>
                            </div>
                            <button className="mt-8 bg-white text-teal-900 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 w-fit hover:bg-teal-50 transition-all group">
                                Setup Automation
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function ActionCard({ title, desc, count, to, icon: Icon }: any) {
    return (
        <Link to={to} className="flex items-start sm:items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-teal-600 transition-all shadow-sm shrink-0">
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="font-bold text-teal-950">{title}</h4>
                    {count !== undefined && count > 0 && (
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-lg w-fit">
                            {count} PENDING
                        </span>
                    )}
                </div>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all mt-1 sm:mt-0" />
        </Link>
    );
}
