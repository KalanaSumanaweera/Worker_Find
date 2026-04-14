import { useState } from 'react';
import { Mail, Lock, User, Briefcase, ChevronRight, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'seeker' | 'provider'>('seeker');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-teal-950 mb-2">{isLogin ? 'Welcome Back' : 'Join ArtisanLanka'}</h1>
        <p className="text-slate-600 mb-8">{isLogin ? 'Sign in to continue' : 'Create your account to get started'}</p>
        
        {!isLogin && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button onClick={() => setRole('seeker')} className={`p-4 rounded-2xl border-2 text-center font-bold transition-all ${role === 'seeker' ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200'}`}>Seeker</button>
            <button onClick={() => setRole('provider')} className={`p-4 rounded-2xl border-2 text-center font-bold transition-all ${role === 'provider' ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200'}`}>Provider</button>
          </div>
        )}

        <form className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-slate-400" size={20} />
              <input className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl" placeholder="Full Name" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input type="email" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl" placeholder="Email Address" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input type="password" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl" placeholder="Password" />
          </div>

          {!isLogin && role === 'provider' && (
            <div className="space-y-4 pt-2">
              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <select className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white">
                  <option>Select Category</option>
                  <option>Woodwork</option>
                  <option>Traditional Art</option>
                  <option>Pottery</option>
                  <option>Masonry</option>
                  <option>Textiles</option>
                </select>
              </div>
              <input className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="Years of Experience" />
              <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl h-24" placeholder="Briefly describe your expertise..." />
            </div>
          )}

          <button type="submit" className="glass-button glass-button-accent w-full !px-8 !py-3 font-bold flex items-center justify-center gap-2">
            {isLogin ? 'Login' : 'Register'} <ChevronRight size={20} />
          </button>
        </form>

        {(!isLogin && role === 'seeker' || isLogin) && (
          <>
            <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-slate-400 text-sm">OR</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            
            <button className="w-full glass-button !px-8 !py-3 font-bold text-slate-700">
              Continue with Google
            </button>
          </>
        )}

        <p className="mt-8 text-center text-slate-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-teal-700 font-bold hover:underline">
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
