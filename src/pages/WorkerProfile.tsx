import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, MessageCircle, Phone, CheckCircle, Mail, Home, Briefcase, Plus, Send, User, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

export default function WorkerProfile() {
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isRespectModalOpen, setIsRespectModalOpen] = useState(false);

  const RespectModal = () => (
    <AnimatePresence>
      {isRespectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsRespectModalOpen(false)}
            className="absolute inset-0 bg-teal-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <CheckCircle size={100} className="text-teal-600" />
            </div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mx-auto mb-6">
                <User size={32} />
              </div>
              <h3 className="text-lg md:text-xl font-black text-teal-950 mb-2 leading-tight">Professional Etiquette</h3>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-6">Respect the Worker</p>

              <div className="space-y-4 mb-8">
                <p className="text-md md:text-lg text-teal-900 font-medium leading-relaxed">
                  "Please be respectful for the worker"
                </p>
                <div className="h-px bg-slate-100 w-12 mx-auto" />
                <p className="text-md md:text-lg text-teal-700 font-bold leading-relaxed">
                  "කරුණාකර වැඩකරුට ගෞරවනීය වන්න"
                </p>
              </div>

              <button
                onClick={() => {
                  setShowPhone(true);
                  setIsRespectModalOpen(false);
                }}
                className="w-full glass-button glass-button-accent !py-2 font-black uppercase tracking-widest shadow-xl shadow-teal-500/20 active:scale-95 transition-all"
              >
                <span className="text-[16px] md:text-lg">I Understand & Agree</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const fetchWorker = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workers/${id}`);
      const data = await response.json();
      setWorker(data);
    } catch (error) {
      console.error('Error fetching worker details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorker();
  }, [id]);

  const handleContactSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: id,
          customer_name: contactForm.name,
          customer_phone: contactForm.phone,
          message: contactForm.message
        })
      });
      if (response.ok) {
        setContactSubmitted(true);
        setContactForm({ name: '', phone: '', message: '' });
        setTimeout(() => setContactSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting contact request:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating || !comment.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: id,
          name: "Anonymous User",
          rating,
          comment,
          date: new Date().toLocaleDateString('en-LK', { dateStyle: 'medium' })
        })
      });
      if (response.ok) {
        setComment('');
        setRating(0);
        fetchWorker(); // Refresh
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <Loader2 className="animate-spin text-teal-600" size={48} />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <h2 className="text-2xl font-bold text-teal-950">Worker not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-8 lg:px-20 max-w-[1440px] mx-auto">
        <RespectModal />

        {/* Top Section: Profile Header & Availability */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-start">
          <div className="lg:col-span-2 flex flex-col md:flex-row gap-8 py-4">
            <img
              src={`https://picsum.photos/seed/${worker.name}/400/500`}
              alt={worker.name}
              className="w-full md:w-64 h-80 object-cover rounded-[2rem] shadow-xl"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col justify-center p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-teal-50 text-teal-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-teal-100">{worker.job?.includes('Master') ? 'Master Provider' : 'Professional'}</span>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-3 py-1 rounded-full">
                  <Star size={14} className="fill-amber-500" /> {Number(worker.rating).toFixed(1)}
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-teal-950 mb-3 tracking-tight">{worker.name}</h1>

              <div className="space-y-3 mb-6 p-4">
                <div className="flex items-center gap-3 text-slate-500">
                  <MapPin size={18} className="text-teal-500 shrink-0" />
                  <span className="text-[14px] md:text-base font-medium text-slate-600 tracking-tight">{worker.city}, {worker.province}, Sri Lanka</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Phone size={18} className="text-teal-500 shrink-0" />
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] md:text-base font-bold text-slate-600 tracking-tight">
                      {showPhone ? (worker.phone || '+94 77 123 4567') : '••••••••••'}
                    </span>
                    {!showPhone && (
                      <button
                        onClick={() => setIsRespectModalOpen(true)}
                        className="text-[10px] font-black uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 hover:bg-teal-100 transition-colors"
                      >
                        Show Number
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-500 bg-teal-50/50 p-2 rounded-xl border border-teal-50/10 w-fit">
                  <Mail size={16} className="text-teal-600 shrink-0" />
                  <span className="text-xs md:text-base font-medium">{worker.email || `${worker.name.toLowerCase().replace(' ', '.')}@workerfind.com`}</span>
                </div>
              </div>

              <div className="flex flex-wrap md:flex-nowrap gap-3">
                <a
                  href={showPhone ? `https://wa.me/${worker.phone?.replace('+', '').replace(' ', '')}` : '#'}
                  onClick={(e) => {
                    if (!showPhone) {
                      e.preventDefault();
                      setIsRespectModalOpen(true);
                    }
                  }}
                  target={showPhone ? "_blank" : "_self"}
                  rel="noreferrer"
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 glass-button glass-button-accent !px-5 !py-2.5 font-bold shadow-lg shadow-teal-500/10 transition-transform active:scale-95 text-xs">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className='text-[18px]'>WhatsApp</span>
                </a>
                <a
                  href={showPhone ? `tel:${worker.phone}` : '#'}
                  onClick={(e) => {
                    if (!showPhone) {
                      e.preventDefault();
                      setIsRespectModalOpen(true);
                    }
                  }}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 glass-button !px-5 !py-2.5 font-bold transition-transform active:scale-95 bg-white border-slate-200 text-xs text-teal-950"
                >
                  <Phone size={16} /> <span className="border-none text-[18px]">Call Now</span>
                </a>
              </div>
            </div>
          </div>

          <aside className="space-y-6 sticky top-32">
            {/* <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-teal-950 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Send size={20} className="text-teal-500" /> Quick Message
              </h3>
              {contactSubmitted ? (
                <div className="bg-teal-50 p-6 rounded-3xl border border-teal-100 text-teal-700 text-center animate-pulse">
                  <CheckCircle className="mx-auto mb-2" />
                  <p className="font-bold">Request Sent!</p>
                  <p className="text-xs uppercase mt-1 opacity-70">Damith will contact you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-teal-500/10"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-teal-500/10"
                    required
                  />
                  <textarea
                    placeholder="Describe your job..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-teal-500/10 h-24 resize-none"
                  />
                  <button type="submit" className="w-full glass-button glass-button-accent !py-4 font-bold text-sm shadow-xl shadow-teal-500/10">
                    Send Signal
                  </button>
                </form>
              )}
            </div> */}

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-teal-950 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Home size={20} className="text-teal-500" /> Availability
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm"><span className="font-medium text-slate-500">Mon - Fri</span><span className="font-bold text-teal-950">08:00 - 18:00</span></div>
                <div className="flex justify-between items-center text-sm"><span className="font-medium text-slate-500">Saturday</span><span className="font-bold text-teal-950">09:00 - 14:00</span></div>
                <div className="flex justify-between items-center text-sm"><span className="font-medium text-slate-500">Sunday</span><span className="font-bold text-rose-500 px-3 py-1 bg-rose-50 rounded-xl uppercase text-[10px]">Closed</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50 text-center">
                  <div className="text-lg font-bold text-teal-950 tracking-tighter">15+</div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Years Exp</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50 text-center">
                  <div className="text-lg font-bold text-teal-950 tracking-tighter">450</div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Projects</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50">
                <div className="bg-teal-50 p-4 rounded-2xl flex items-start gap-3 border border-teal-100/50">
                  <CheckCircle className="text-teal-600 shrink-0" size={18} />
                  <div>
                    <h4 className="font-bold text-teal-950 text-xs uppercase tracking-tight">Identity Verified</h4>
                    <p className="text-[10px] text-teal-800 leading-tight mt-1">Credentials and business registration verified by Worker Find.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Main Content Sections: Balanced Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Services Section (Left 2/3) */}
          <section className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full">
            <h2 className="text-xl font-bold text-teal-950 mb-6 flex items-center gap-3 tracking-tight">
              <Briefcase size={22} className="text-teal-600" /> Services Offered
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {worker.services && worker.services.map((service: string, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-teal-500/20 transition-all group">
                  <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 shrink-0">
                    <CheckCircle size={16} />
                  </div>
                  <span className="text-slate-700 font-bold text-sm tracking-tight">{service}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Rate Damith Card (Right 1/3) */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-teal-950 mb-6 font-['Plus_Jakarta_Sans']">Rate {worker.name.split(' ')[0]}</h3>
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="cursor-pointer transition-colors"
                  >
                    <Star
                      size={32}
                      className={`${(hover || rating) >= star ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`}
                    />
                  </motion.button>
                ))}
              </div>
              <textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-base font-medium focus:ring-2 focus:ring-teal-500/10 placeholder:text-slate-300 mb-4 flex-1 h-32 resize-none"
              />

              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="w-full glass-button glass-button-accent !py-4 font-bold text-md flex items-center justify-center gap-2 shadow-xl shadow-teal-500/20">

                {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> <span className="text-sm md:text-md">Submit Feedback</span></>}

              </button>
            </div>
          </aside>
        </div>

        {/* Recent Feedback: Full Width Section */}
        <section className="mb-12">
          <div className="bg-white p-4 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10 px-1">
              <h2 className="text-2xl font-bold text-teal-950 flex items-center gap-3">
                <MessageCircle size={26} className="text-teal-600" /> <span className="text-sm md:text-md">Recent Community Feedback</span>
              </h2>
              <div className="flex items-center justify-center gap-1 text-slate-400 font-bold text-sm uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <span className="text-xs md:text-md">{worker.reviews_count || 0}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {worker.reviews && worker.reviews.length > 0 ? worker.reviews.map((rev: any, i: number) => (
                <div key={i} className="bg-slate-50/50 p-6 md:p-8 rounded-[2rem] border border-slate-100 flex flex-col sm:flex-row gap-6 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 shrink-0 shadow-sm font-black text-xl">
                    {rev.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-teal-950 text-sm">{rev.name}</span>
                        <CheckCircle size={12} className="text-teal-500" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{rev.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={12} className={s <= rev.rating ? "fill-amber-500 text-amber-500" : "text-slate-200"} />
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed italic border-l-2 border-teal-100 pl-4">"{rev.comment}"</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center text-slate-400 font-medium">No feedback yet. Be the first to rate!</div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
