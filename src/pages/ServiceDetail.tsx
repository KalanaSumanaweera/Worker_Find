import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ServiceDetail() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-32 pb-24 px-6 md:px-20 max-w-5xl mx-auto">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">Emergency</span>
            <span className="text-slate-500 font-medium">Ref #AL-8291</span>
          </div>
          <h1 className="text-4xl font-bold text-teal-950 mb-4">Seeking Plumber for Kitchen Leak</h1>
          <div className="flex items-center gap-6 text-slate-600 mb-8">
            <span>Colombo 07, Cinnamon Gardens</span>
            <span>Posted 2 hours ago</span>
            <span className="font-bold text-teal-900">Budget: LKR 5,000 - 10,000</span>
          </div>

          <div className="prose prose-slate max-w-none mb-10">
            <h3 className="text-xl font-semibold text-teal-950">Description</h3>
            <p>We have a persistent leak under our kitchen sink that seems to be coming from the P-trap. We need a professional plumber to inspect, identify the source, and fix it as soon as possible. The area is easily accessible.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="glass-button glass-button-accent !px-8 !py-3 font-bold">Place a Bid</button>
            <button className="glass-button !px-8 !py-3 font-bold">Message Poster</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
