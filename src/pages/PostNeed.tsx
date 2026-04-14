import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PostNeed() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-20 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-teal-950 mb-6 md:mb-8">Post a Service Need</h1>
        <form className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div>
            <label className="block text-sm font-bold text-teal-950 mb-2">Service Title</label>
            <input className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="e.g., Kitchen sink leak repair" />
          </div>
          <div>
            <label className="block text-sm font-bold text-teal-950 mb-2">Category</label>
            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white">
              <option>Woodwork</option>
              <option>Traditional Art</option>
              <option>Pottery</option>
              <option>Masonry</option>
              <option>Textiles</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-teal-950 mb-2">Description</label>
            <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl h-32" placeholder="Describe the work you need done..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-bold text-teal-950 mb-2">Budget (LKR)</label>
              <input className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="e.g., 5000" />
            </div>
            <div>
              <label className="block text-sm font-bold text-teal-950 mb-2">Location</label>
              <input className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="e.g., Colombo" />
            </div>
          </div>
          <button type="submit" className="glass-button glass-button-accent w-full !px-8 !py-3 md:!py-4 !text-base md:!text-lg font-bold">Post Need</button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
