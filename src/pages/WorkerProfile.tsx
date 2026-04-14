import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, MessageCircle, Phone, CheckCircle, Mail, Home, Briefcase, Plus, Send, User, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

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

  const fetchWorker = async () => {
    try {
      const response = await fetch(`http://localhost:3003/api/workers/${id}`);
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
      const response = await fetch('http://localhost:3003/api/contact', {
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
      const response = await fetch('http://localhost:3003/api/reviews', {
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

        {/* Top Section: Profile Header & Availability */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 items-start">
          <div className="lg:col-span-2 flex flex-col md:flex-row gap-8 py-4 ml-8 mt-8">
            <img
              src={`https://picsum.photos/seed/${worker.name}/400/500`}
              alt={worker.name}
              className="w-full md:w-64 h-80 object-cover rounded-[2rem] shadow-xl"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col justify-center ml-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-teal-50 text-teal-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-teal-100">{worker.job.includes('Master') ? 'Master Artisan' : 'Professional'}</span>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-3 py-1 rounded-full">
                  <Star size={14} className="fill-amber-500" /> {Number(worker.rating).toFixed(1)}
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-teal-950 mb-4 tracking-tight">{worker.name}</h1>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-500">
                  <MapPin size={16} className="text-teal-500 shrink-0" />
                  <span className="text-[18px] font-medium text-slate-600 tracking-tight">{worker.city}, {worker.province}, Sri Lanka</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Phone size={16} className="text-teal-500 shrink-0" />
                  <span className="text-[18px] font-medium text-slate-600 tracking-tight">{worker.phone || '+94 77 123 4567'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium bg-teal-50/50 p-2 rounded-xl border border-teal-50/10 w-fit">
                  <Mail size={14} className="text-teal-600 shrink-0" />
                  <span className="text-md">{worker.email || `${worker.name.toLowerCase().replace(' ', '.')}@artisanlanka.com`}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a href={`https://wa.me/${worker.phone?.replace('+', '').replace(' ', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 glass-button glass-button-accent !px-6 !py-3 font-extrabold shadow-lg shadow-teal-500/10 transition-transform active:scale-95">
                  <MessageCircle size={18} /> <span className="text-sm">WhatsApp</span>
                </a>
                <a href={`tel:${worker.phone}`} className="flex items-center gap-2 glass-button !px-6 !py-3 font-extrabold transition-transform active:scale-95 bg-white border-slate-200">
                  <Phone size={18} /> <span className="text-sm border-none">Call Now</span>
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

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-teal-950 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Home size={20} className="text-teal-500" /> Availability
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-base"><span className="font-medium text-slate-500">Mon - Fri</span><span className="font-bold text-teal-950">08:00 - 18:00</span></div>
                <div className="flex justify-between items-center text-base"><span className="font-medium text-slate-500">Saturday</span><span className="font-bold text-teal-950">09:00 - 14:00</span></div>
                <div className="flex justify-between items-center text-base"><span className="font-medium text-slate-500">Sunday</span><span className="font-bold text-rose-500 px-3 py-1 bg-rose-50 rounded-xl uppercase text-xs">Closed</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50 text-center">
                  <div className="text-xl font-bold text-teal-950 tracking-tighter">15+</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Years Exp</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100/50 text-center">
                  <div className="text-xl font-bold text-teal-950 tracking-tighter">450</div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Projects</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50">
                <div className="bg-teal-50 p-4 rounded-2xl flex items-start gap-3 border border-teal-100/50">
                  <CheckCircle className="text-teal-600 shrink-0" size={18} />
                  <div>
                    <h4 className="font-bold text-teal-950 text-xs uppercase tracking-tight">Identity Verified</h4>
                    <p className="text-[10px] text-teal-800 leading-tight mt-1">Credentials and business registration verified by Artisan Lanka.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Main Content Sections: Balanced Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Services Section (Left 2/3) */}
          <section className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full">
            <h2 className="text-2xl font-bold text-teal-950 mb-8 flex items-center gap-3 tracking-tight">
              <Briefcase size={26} className="text-teal-600" /> Services Offered
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {worker.services && worker.services.map((service: string, i: number) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-teal-500/20 transition-all group">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <span className="text-slate-700 font-bold text-base tracking-tight">{service}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Rate Damith Card (Right 1/3) */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-full flex flex-col">
              <h3 className="text-2xl font-bold text-teal-950 mb-6 font-['Plus_Jakarta_Sans']">Rate {worker.name.split(' ')[0]}</h3>
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
                className="w-full glass-button glass-button-accent !py-4 font-bold text-md flex items-center justify-center gap-2 shadow-xl shadow-teal-500/20"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Submit Feedback</>}
              </button>
            </div>
          </aside>
        </div>

        {/* Recent Feedback: Full Width Section */}
        <section className="mb-12">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-10 px-2">
              <h2 className="text-2xl font-bold text-teal-950 flex items-center gap-3">
                <MessageCircle size={26} className="text-teal-600" /> Recent Community Feedback
              </h2>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                {worker.reviews_count || 0} Verified Reviews
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {worker.reviews && worker.reviews.length > 0 ? worker.reviews.map((rev: any, i: number) => (
                <div key={i} className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 flex gap-6 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 shrink-0 shadow-sm font-black text-xl">
                    {rev.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-teal-950">{rev.name}</span>
                        <CheckCircle size={14} className="text-teal-500" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{rev.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-3">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={12} className={s <= rev.rating ? "fill-amber-500 text-amber-500" : "text-slate-200"} />
                      ))}
                    </div>
                    <p className="text-slate-600 text-[15px] font-medium leading-relaxed italic border-l-2 border-teal-100 pl-4">"{rev.comment}"</p>
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
