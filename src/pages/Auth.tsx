import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Briefcase, ArrowRight, ShieldCheck, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'seeker'
    });

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        const token = searchParams.get('token');
        const userData = searchParams.get('user');

        if (token && userData) {
            try {
                const user = JSON.parse(decodeURIComponent(userData));
                login(user, token);
                navigate(from, { replace: true });
            } catch (err) {
                console.error('Failed to parse Google user data', err);
            }
        }
    }, [searchParams, login, navigate, from]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const response = await fetch(`http://localhost:3003${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            login(data.user, data.token);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-['Inter'] relative overflow-hidden">
            <Navbar />

            {/* Background Elements */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-teal-50 rounded-full blur-3xl opacity-60 animate-pulse" />
                <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60" />
            </div>

            <main className="relative z-10 pt-32 pb-12 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="glass-card p-6 md:p-10 rounded-[2.5rem] border border-teal-500/10 shadow-2xl relative overflow-hidden">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-600/20">
                                <ShieldCheck className="text-white w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-bold text-teal-950 mb-2 font-['Plus_Jakarta_Sans']">
                                {isLogin ? 'Welcome Back' : 'Join Worker Find'}
                            </h1>
                            <p className="text-slate-500">
                                {isLogin ? 'Enter your details to access your account' : 'Create an account to start your journey'}
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm flex items-center gap-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                required={!isLogin}
                                                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: 'seeker' })}
                                                className={`py-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${formData.role === 'seeker'
                                                    ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm'
                                                    : 'bg-white/50 border-slate-200 text-slate-500 hover:border-slate-300'
                                                    }`}
                                            >
                                                <User className="w-5 h-5" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Seeker</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role: 'provider' })}
                                                className={`py-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${formData.role === 'provider'
                                                    ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm'
                                                    : 'bg-white/50 border-slate-200 text-slate-500 hover:border-slate-300'
                                                    }`}
                                            >
                                                <Briefcase className="w-5 h-5" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Provider</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        <div className="mt-8 flex flex-col items-center gap-6">
                            <div className="relative w-full text-center">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-100" />
                                </div>
                                <span className="relative px-4 bg-white text-slate-400 text-sm">Or continue with</span>
                            </div>

                            <div className="flex gap-4 w-full">
                                <a
                                    href={`http://localhost:3003/api/auth/google?role=${formData.role}`}
                                    className="flex-1 py-3.5 px-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 hover:bg-slate-50 transition-all font-bold text-slate-700 shadow-sm text-sm"
                                >
                                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                                    <span>Sign in with Google</span>
                                </a>
                            </div>

                            <div className="text-slate-500">
                                {isLogin ? (
                                    <>Don't have an account? <button onClick={() => setIsLogin(false)} className="text-teal-600 font-bold hover:underline">Sign up</button></>
                                ) : (
                                    <>Already have an account? <button onClick={() => setIsLogin(true)} className="text-teal-600 font-bold hover:underline">Log in</button></>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
