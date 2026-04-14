import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Star, MessageCircle, Phone, Search, X, ChevronDown, MapPin, SlidersHorizontal } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const locations = {
  "North Western": {
    "Kurunegala": ["Katupitiya", "Kosgolla", "Mathawa", "Narammala", "Wariyapola", "Kuliyapitiya"],
    "Puttalam": ["Chilaw", "Puttalam", "Wennappuwa", "Marawila"]
  },
  "Western": {
    "Colombo": ["Colombo 01", "Colombo 07", "Maharagama", "Kottawa", "Nugegoda"],
    "Gampaha": ["Negombo", "Gampaha", "Kelaniya", "Kiribathgoda"],
    "Kalutara": ["Kalutara", "Panadura", "Horana"]
  },
  "Central": {
    "Kandy": ["Kandy City", "Peradeniya", "Katugastota", "Gampola"],
    "Matale": ["Matale", "Dambulla", "Sigiriya"],
    "Nuwara Eliya": ["Nuwara Eliya", "Hatton"]
  }
};

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('c') || '');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedVillages, setSelectedVillages] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  const [workers, setWorkers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories on load
  useEffect(() => {
    fetch('http://localhost:3003/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Sync state with URL params on initial load
  useEffect(() => {
    const query = searchParams.get('q');
    const category = searchParams.get('c');
    if (query) setSearch(query);
    if (category) setSelectedCategory(category);
  }, [searchParams]);

  // Update URL params when search/category changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (selectedCategory) params.set('c', selectedCategory);
    setSearchParams(params, { replace: true });
  }, [search, selectedCategory]);

  // Fetch workers from API
  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          q: search,
          category: selectedCategory,
          province: selectedProvince,
          district: selectedDistrict,
          rating: minRating.toString()
        });

        const response = await fetch(`http://localhost:3003/api/workers?${queryParams}`);
        const data = await response.json();
        setWorkers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching workers:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchWorkers, 300); // Debounce
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedProvince, selectedDistrict, minRating]);

  const districts = useMemo(() => {
    if (!selectedProvince) return [];
    return Object.keys(locations[selectedProvince as keyof typeof locations]);
  }, [selectedProvince]);

  const villagesList = useMemo(() => {
    if (!selectedProvince || !selectedDistrict) return [];
    return locations[selectedProvince as keyof typeof locations][selectedDistrict as keyof (typeof locations)["Western"]];
  }, [selectedProvince, selectedDistrict]);

  const toggleVillage = (v: string) => {
    setSelectedVillages(prev =>
      prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]
    );
  };

  const filteredArtisans = useMemo(() => {
    if (selectedVillages.length === 0) return workers;
    return workers.filter(w => selectedVillages.includes(w.city));
  }, [workers, selectedVillages]);

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <Navbar />
      <main className="pt-32 pb-24 px-4 md:px-8 lg:px-20 max-w-[1440px] mx-auto">
        {/* Unified Single-Line Filter Bar */}
        <section className="mb-12 relative z-40">
          <div className="bg-white p-2 md:p-3 rounded-[2.5rem] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col gap-4">
            <div className="flex flex-wrap md:flex-nowrap items-center gap-1 md:gap-2">
              {/* Expanding Search Input */}
              <motion.div
                animate={{
                  flex: isSearchFocused ? 2.5 : 1.2,
                  minWidth: isSearchFocused ? '320px' : '200px'
                }}
                className="relative group transition-all"
              >
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-teal-600' : 'text-slate-400'}`} size={20} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-14 pr-6 py-[11px] bg-slate-50 border-none rounded-[1.8rem] focus:ring-2 focus:ring-teal-500/10 text-[15px] font-medium transition-all"
                  placeholder={isSearchFocused ? "Type names, skills, or keywords..." : "Search experts..."}
                />
              </motion.div>

              <div className="hidden md:block h-10 w-[1px] bg-slate-100 mx-2" />

              {/* Category Select */}
              <div className="flex-1 min-w-[150px] relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none pl-5 pr-10 py-[11px] bg-transparent border-none focus:ring-0 text-slate-700 font-bold text-sm cursor-pointer hover:text-teal-600 transition-colors"
                >
                  <option value="">Category</option>
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
              </div>

              <div className="h-6 w-[1px] bg-slate-100 mx-1" />

              {/* Province Select */}
              <div className="flex-1 min-w-[150px] relative">
                <select
                  value={selectedProvince}
                  onChange={(e) => { setSelectedProvince(e.target.value); setSelectedDistrict(''); setSelectedVillages([]); }}
                  className="w-full appearance-none pl-5 pr-10 py-[11px] bg-transparent border-none focus:ring-0 text-slate-700 font-bold text-sm cursor-pointer hover:text-teal-600 transition-colors"
                >
                  <option value="">Province</option>
                  {Object.keys(locations).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
              </div>

              {selectedProvince && (
                <>
                  <div className="h-6 w-[1px] bg-slate-100 mx-1" />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 min-w-[150px] relative"
                  >
                    <select
                      value={selectedDistrict}
                      onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedVillages([]); }}
                      className="w-full appearance-none pl-5 pr-10 py-[11px] bg-transparent border-none focus:ring-0 text-slate-700 font-bold text-sm cursor-pointer hover:text-teal-600 transition-colors"
                    >
                      <option value="">District</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                  </motion.div>
                </>
              )}

              <div className="h-10 w-[1px] bg-slate-100 mx-2 hidden lg:block" />

              <button className="glass-button glass-button-accent !px-6 !py-[6px] shadow-xl shadow-teal-500/10">
                <Search size={18} className="lg:hidden" />
                <span className="hidden lg:inline text-[18px]">Find Now</span>
              </button>
            </div>

            {/* Sub-row: Rating & Villages */}
            <AnimatePresence>
              {(selectedDistrict || selectedVillages.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 pb-2 pt-2 border-t border-slate-50 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {selectedDistrict && locations[selectedProvince as keyof typeof locations][selectedDistrict as keyof (typeof locations)["Western"]].map(v => (
                        <button
                          key={v}
                          onClick={() => toggleVillage(v)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${selectedVillages.includes(v)
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'
                            }`}
                        >
                          {v}
                          {selectedVillages.includes(v) && <X size={12} />}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-transparent">
                      <SlidersHorizontal size={14} className="text-slate-400" />
                      <select
                        value={minRating}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 p-0"
                      >
                        <option value="0">Any Rating</option>
                        <option value="4">4+ Stars</option>
                        <option value="4.5">4.5+ Stars</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Artisans Grid */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 px-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-teal-950 font-['Plus_Jakarta_Sans'] tracking-tight mb-2">Find Local Magic</h1>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <MapPin size={18} className="text-teal-500" />
                {selectedProvince ? `${selectedProvince}${selectedDistrict ? ` > ${selectedDistrict}` : ''}` : 'Sri Lanka'}
              </div>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-teal-600 font-black text-xl">{filteredArtisans.length}</span> <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Professionals Found</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading State
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 animate-pulse">
                  <div className="h-48 bg-slate-50 rounded-2xl mb-6" />
                  <div className="h-6 bg-slate-50 rounded-full w-3/4 mb-4" />
                  <div className="h-4 bg-slate-50 rounded-full w-1/2 mb-8" />
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-slate-50 rounded-full w-24" />
                    <div className="h-8 bg-slate-50 rounded-full w-24" />
                  </div>
                </div>
              ))
            ) : filteredArtisans.length > 0 ? (
              filteredArtisans.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/worker/${a.id}`} className="group bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 block relative overflow-hidden">
                    <div className="relative mb-6">
                      <img src={`https://picsum.photos/seed/${a.name}/400/400`} alt={a.name} className="w-full h-56 object-cover rounded-[2rem] group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-teal-600 shadow-lg hover:bg-teal-600 hover:text-white transition-all"><MessageCircle size={20} /></div>
                        <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-teal-600 shadow-lg hover:bg-teal-600 hover:text-white transition-all"><Phone size={20} /></div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest mb-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        Available Now
                      </div>
                      <h3 className="text-xl font-bold text-teal-950 mb-1 group-hover:text-teal-600 transition-colors">{a.name}</h3>
                      <p className="text-slate-500 font-medium mb-3">{a.job}</p>
                      <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 w-fit px-3 py-1 rounded-full text-sm">
                        <Star size={16} className="fill-amber-500" /> {a.rating} <span className="text-slate-400 font-normal ml-1">({a.reviews})</span>
                      </div>
                    </div>

                    <div className="flex justify-center items-center pt-6 border-t border-slate-50">
                      {/* <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Hourly Rate</span>
                        <span className="font-extrabold text-teal-950 text-xl">LKR {a.price.toLocaleString()}</span>
                      </div> */}
                      <button className="glass-button glass-button-accent !px-6 !py-[5px] !rounded-2xl shadow-xl shadow-teal-500/10 text-[15px]"><span className="hidden lg:inline text-[18px]">Contact Now</span></button>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-teal-950 mb-2">No professionals found</h3>
                <p className="text-slate-500 font-medium">Try adjusting your filters or search keywords.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
