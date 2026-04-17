import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Search as SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import React from 'react';

function FloatingShape({ className, delay = 0, duration = 10, isMobile = false }) {
  if (isMobile) return null;
  return (
    <motion.div
      animate={{
        y: [-40, 40, -40],
        x: [-20, 20, -20],
        rotate: [0, 90, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
      className={`absolute rounded-3xl blur-2xl opacity-20 pointer-events-none ${className}`}
    />
  );
}


function FloatingReview({ text, author, rating, initialPos, delay = 0, isMobile = false }: any) {
  if (isMobile) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{
        opacity: [0, 0.9, 0.1, 1, 0],
        scale: 1,
        y: [0, -40, 20, -20, 0],
        x: [0, 20, -10, 10, 0],
      }}
      transition={{
        opacity: { duration: 25 + delay * 3, repeat: Infinity, ease: "easeInOut", delay: delay * 4 },
        y: { duration: 12 + delay, repeat: Infinity, ease: "easeInOut" },
        x: { duration: 15 + delay, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{
        scale: 1.05,
        opacity: 1,
        zIndex: 50,
        backgroundColor: "rgba(255, 255, 255, 1)",
        boxShadow: "0 40px 80px -20px rgba(13, 148, 136, 0.25)",
        borderColor: "rgba(13, 148, 136, 0.3)",
      }}
      className="absolute glass-card p-8 rounded-[3rem] w-80 md:w-96 cursor-default select-none transition-all duration-300 border border-white/50 shadow-2xl backdrop-blur-3xl z-10"
      style={{ left: initialPos.left, top: initialPos.top }}
    >
      <div className="flex gap-1 mb-4 text-amber-500">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={18} className={i < Math.floor(rating) ? "fill-amber-500" : "text-slate-200"} />
        ))}
      </div>
      <p className="text-slate-700 text-lg font-medium italic mb-6 leading-relaxed">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
          {author[0]}
        </div>
        <div>
          <h4 className="font-bold text-teal-950 text-base">{author}</h4>
          <p className="text-teal-600/70 text-sm font-semibold">Verified Client</p>
        </div>
      </div>
    </motion.div>
  );
}

const fallbackCategories = [
  { id: 101, name: 'Woodworking', slug: 'woodworking', icon: 'carpenter', pos: { left: '2%', top: '20%' } },
  { id: 102, name: 'Masonry', slug: 'masonry', icon: 'construction', pos: { left: '72%', top: '15%' } },
  { id: 103, name: 'Plumbing', slug: 'plumbing', icon: 'plumbing', pos: { left: '1%', top: '60%' } },
  { id: 104, name: 'Electrical', slug: 'electrical', icon: 'bolt', pos: { left: '74%', top: '65%' } },
  { id: 105, name: 'Textiles', slug: 'textiles', icon: 'content_cut', pos: { left: '76%', top: '40%' } },
  { id: 106, name: 'Pottery', slug: 'pottery', icon: 'ceramics', pos: { left: '2%', top: '40%' } },
  { id: 107, name: 'Roofing', slug: 'roofing', icon: 'roofing', pos: { left: '20%', top: '88%' } },
  { id: 108, name: 'Gardening', slug: 'gardening', icon: 'yard', pos: { left: '55%', top: '88%' } },
];

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: number, name: string, icon: string, pos: any }[]>([]);
  const [reviews, setReviews] = useState<{ text: string, author: string, rating: number, pos: any }[]>([]);

  useEffect(() => {
    // Fetch categories
    fetch('http://localhost:3003/api/categories')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Data is not an array');
        const positions = [
          { left: '30%', top: '10%' },
          { left: '75%', top: '12%' },
          { left: '1%', top: '65%' },
          { left: '74%', top: '65%' },
          { left: '80%', top: '40%' },
          { left: '4%', top: '38%' },
          { left: '20%', top: '88%' },
          { left: '55%', top: '88%' },
        ];
        const enriched = data.slice(0, 8).map((c: any, i: number) => ({
          ...c,
          pos: positions[i] || { left: '50%', top: '50%' }
        }));
        setCategories(enriched.length > 0 ? enriched : fallbackCategories);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setCategories(fallbackCategories);
      });

    // Fetch reviews/latest testimonials
    fetch('http://localhost:3003/api/workers')
      .then(res => res.json())
      .then(workers => {
        const someReviews = workers
          .filter((w: any) => w.reviews_count > 0)
          .slice(0, 4)
          .map((w: any, i: number) => ({
            text: `Working with ${w.name} was a pleasure. Top quality!`,
            author: w.name + " Customer",
            rating: 5,
            pos: [
              { left: '10%', top: '15%' },
              { left: '65%', top: '10%' },
              { left: '15%', top: '60%' },
              { left: '70%', top: '55%' }
            ][i]
          }));
        setReviews(someReviews);
      })
      .catch(err => console.error('Error fetching reviews:', err));
  }, []);

  const handleSearch = (e: any) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/discover');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-0 lg:pt-20">
        <section className="relative min-h-[700px] md:min-h-[850px] flex flex-col items-center justify-center px-4 md:px-8 text-center overflow-hidden">
          {/* Background AntiGravity Elements */}

          {/* Background Shapes — Desktop Only */}
          <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
            <FloatingShape className="w-64 h-64 bg-teal-200 top-[10%] left-[5%]" delay={0} duration={12} isMobile={isMobile} />
            <FloatingShape className="w-96 h-96 bg-blue-100 bottom-[10%] right-[5%]" delay={2} duration={15} isMobile={isMobile} />
            <FloatingShape className="w-48 h-48 bg-teal-100 top-[20%] right-[15%]" delay={5} duration={10} isMobile={isMobile} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-teal-50/50 to-transparent opacity-60 blur-3xl -z-10" />
          </div>


          <div className="max-w-4xl space-y-6 relative z-10">
            <motion.h1
              initial={isMobile ? { opacity: 0, y: 30, filter: "blur(10px)" }: { opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={isMobile ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold font-['Plus_Jakarta_Sans'] text-teal-950 tracking-tight leading-[1.1] md:leading-[1.05]"
            >
              {t('hero_title')}
            </motion.h1>
            <motion.p
              initial={isMobile ? { opacity: 0, y: 30, filter: "blur(5px)" } : { opacity: 0, y: 30, filter: "blur(5px)" }}
              animate={isMobile ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="text-base sm:text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-4 md:px-0"
            >
              {t('hero_subtitle')}
            </motion.p>

            <motion.form
              onSubmit={handleSearch}
              initial={isMobile ? { opacity: 0, y: 40, filter: "blur(5px)" } : { opacity: 0, y: 40, filter: "blur(5px)" }}
              animate={isMobile ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              onMouseEnter={() => !isMobile && setHoveredId('search')}
              onMouseLeave={() => !isMobile && setHoveredId(null)}
              className="mt-8 md:mt-12 p-2 md:p-3 bg-white/70 backdrop-blur-2xl border border-white/20 rounded-2xl md:rounded-full shadow-[0_20px_50px_rgba(13,148,136,0.15)] w-full max-w-xl md:max-w-4xl mx-auto flex items-center gap-1 group md:hover:shadow-[0_20px_70px_rgba(13,148,136,0.25)] transition-all duration-500 px-2 md:px-0"
            >
              <div className="flex-1 relative min-w-0">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 md:px-6 py-3 md:py-4 bg-transparent focus:ring-0 text-sm md:text-lg placeholder:text-slate-400 rounded-full"
                  placeholder={isMobile ? "Search..." : t('search_placeholder')}
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-slate-200" />
              <div className="flex-1 relative min-w-0 hidden sm:block">
                <input className="w-full px-4 md:px-6 py-3 md:py-4 bg-transparent focus:ring-0 text-sm md:text-lg placeholder:text-slate-400 rounded-full" placeholder={isMobile ? "Location" : t('location_placeholder')} />
              </div>
              <button
                type="submit"
                className="p-3 md:px-12 md:py-4 rounded-xl md:rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg md:transform md:hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0"
              >
                <SearchIcon size={20} className="md:hidden" />
                <span className="hidden md:inline !text-lg">{t('search')}</span>
              </button>
            </motion.form>

            <div className="mt-8 md:mt-10 flex flex-row flex-wrap justify-center gap-3 md:gap-6 px-2">
              <motion.div
                initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={isMobile ? { opacity: 1 } : {
                  opacity: 1,
                  y: 0,
                  translateX: hoveredId === 'search' ? -40 : (hoveredId === 'all-workers' ? -30 : 0),
                  translateY: hoveredId === 'search' ? 30 : 0,
                }}
                transition={isMobile ? {} : { duration: 0.8, delay: 0.4, ease: "easeOut" }}
                onMouseEnter={() => !isMobile && setHoveredId('all-categories')}
                onMouseLeave={() => !isMobile && setHoveredId(null)}
                className="relative flex-1 md:flex-none"
              >
                <Link to="/discover" className="glass-button glass-button-black !text-[13px] md:!text-base !px-4 md:!px-8 !py-3 md:!py-4 flex items-center justify-center gap-2 shadow-2xl hover:scale-105 transition-all w-full">
                  <span className="material-symbols-outlined text-lg md:text-xl">grid_view</span>
                  All Categories
                </Link>
              </motion.div>

              <motion.div
                initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={isMobile ? { opacity: 1 } : {
                  opacity: 1,
                  y: 0,
                  translateX: hoveredId === 'search' ? 40 : (hoveredId === 'all-categories' ? 30 : 0),
                  translateY: hoveredId === 'search' ? 30 : 0,
                }}
                transition={isMobile ? {} : { duration: 0.8, delay: 0.4, ease: "easeOut" }}
                onMouseEnter={() => !isMobile && setHoveredId('all-workers')}
                onMouseLeave={() => !isMobile && setHoveredId(null)}
                className="relative flex-1 md:flex-none"
              >
                <Link to="/discover" className="glass-button glass-button-black !text-[13px] md:!text-base !px-4 md:!px-8 !py-3 md:!py-4 flex items-center justify-center gap-2 shadow-2xl hover:scale-105 transition-all w-full">
                  <span className="material-symbols-outlined text-lg md:text-xl">group</span>
                  All Workers
                </Link>
              </motion.div>
            </div>

          </div>
        </section>

        <section className="relative min-h-[700px] py-16 px-4 md:px-8 overflow-hidden bg-slate-50/30">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-teal-100/30 to-transparent opacity-50 blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-teal-950 mb-4 tracking-tight">Voices of Success</h2>
            <p className="text-slate-600 text-lg">See why thousands trust our verified professionals.</p>
          </div>

          {/* Testimonials Grid — Desktop Only */}
          <div className="hidden md:block relative h-[600px] max-w-7xl mx-auto">
            {reviews.map((rev, i) => (
              <FloatingReview
                key={rev.author}
                text={rev.text}
                author={rev.author}
                rating={rev.rating}
                initialPos={rev.pos}
                delay={i}
                isMobile={isMobile}
              />
            ))}
          </div>

          {/* Testimonials Grid — Mobile Only */}
          <div className="md:hidden grid grid-cols-1 gap-6 px-4">
            {reviews.length > 0 ? reviews.map((rev) => (
              <div
                key={rev.author}
                className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl"
              >
                <div className="flex gap-1 mb-4 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(rev.rating) ? "fill-amber-500" : "text-slate-100"} />
                  ))}
                </div>
                <p className="text-slate-700 font-medium italic mb-6 leading-relaxed">&ldquo;{rev.text}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-black text-base">
                    {rev.author[0]}
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-teal-950 text-sm">{rev.author}</h4>
                    <p className="text-teal-600/70 text-xs font-semibold">Verified Client</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-400 text-sm py-8">No reviews yet. Be the first to share your experience!</p>
            )}
          </div>

          <div className="mt-12 text-center relative z-10">
            <Link to="/reviews" className="glass-button !px-12 !py-4 !text-lg bg-teal-600 hover:bg-teal-700 text-white shadow-2xl transition-all hover:scale-105 inline-flex items-center gap-2">
              View All Reviews
              <span className="material-symbols-outlined">trending_flat</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
