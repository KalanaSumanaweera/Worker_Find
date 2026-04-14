import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Menu, X, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'si', label: 'සිංහල' },
    { code: 'ta', label: 'தமிழ்' }
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(25,28,29,0.06)] flex justify-between items-center px-6 md:px-8 h-20">
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-tighter text-teal-900 font-['Plus_Jakarta_Sans']">Worker Find</Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-teal-700 font-semibold border-b-2 border-amber-500 pb-1 font-['Plus_Jakarta_Sans'] tracking-tight">{t('explore')}</Link>
          <Link to="/how-it-works" className="text-slate-600 font-medium font-['Plus_Jakarta_Sans'] tracking-tight hover:text-teal-500 transition-colors duration-300">{t('how_it_works')}</Link>
          <Link to="/about" className="text-slate-600 font-medium font-['Plus_Jakarta_Sans'] tracking-tight hover:text-teal-500 transition-colors duration-300">{t('about')}</Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1 text-teal-900"
            >
              <Globe size={20} />
              <span className="text-xs font-bold uppercase">{i18n.language}</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[60]">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 transition-colors ${i18n.language === lang.code ? 'text-teal-700 font-bold' : 'text-slate-600'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.name[0]}
                  </div>
                  <span className="text-sm font-bold text-teal-950">{user.name.split(' ')[0]}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[60] overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="text-sm font-bold text-teal-950 truncate">{user.email}</p>
                    </div>
                    <Link
                      to={user.role === 'admin' ? '/admin/dashboard' : `/dashboard/${user.role}`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <Settings size={18} />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="glass-button !text-base !px-6 !py-2.5">{t('login')}</Link>
            )}
            <Link to="/post-need" className="glass-button glass-button-accent !text-base !px-6 !py-2.5">{t('post_need')}</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-teal-900"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[45] bg-white pt-24 px-6 lg:hidden">
          <div className="flex flex-col gap-6">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-teal-950">{t('explore')}</Link>
            <Link to="/how-it-works" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-teal-950">{t('how_it_works')}</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-teal-950">{t('about')}</Link>
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : `/dashboard/${user.role}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-bold text-teal-950 font-['Plus_Jakarta_Sans']"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="glass-button !w-full !text-lg !py-4 text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="glass-button !w-full !text-lg !py-4 text-center"
                >
                  {t('login')}
                </Link>
              )}
              <Link
                to="/post-need"
                onClick={() => setIsMenuOpen(false)}
                className="glass-button glass-button-accent !w-full !text-lg !py-4 text-center"
              >
                {t('post_need')}
              </Link>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
