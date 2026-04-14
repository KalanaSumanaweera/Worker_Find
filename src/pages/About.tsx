import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-16 md:pb-24">
        <section className="px-4 md:px-20 max-w-7xl mx-auto mb-16 md:mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-teal-950 mb-6 md:mb-8 font-['Plus_Jakarta_Sans']">Preserving Craft, Empowering People.</h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-4 md:mb-6">
                Worker Find was born out of a simple need: to bridge the gap between Sri Lanka's incredible local talent and the modern digital world.
              </p>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                Our mission is to empower local artisans—from traditional woodcarvers to modern electricians—by providing them with a platform to showcase their skills and connect with customers across the island.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://picsum.photos/seed/artisan-work/800/600"
                alt="Artisan working"
                className="rounded-3xl md:rounded-[40px] shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-4 md:-bottom-8 -left-4 md:-left-8 bg-amber-500 text-white p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-xl">
                <p className="text-2xl md:text-4xl font-bold mb-1">5000+</p>
                <p className="text-sm md:text-base font-semibold">Verified Artisans</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 md:py-24 px-4 md:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-teal-950 mb-8 md:mb-12">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div>
                <h4 className="text-xl font-bold text-teal-800 mb-3">Integrity</h4>
                <p className="text-slate-600">We verify every artisan to ensure trust and quality for our seekers.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-teal-800 mb-3">Community</h4>
                <p className="text-slate-600">We believe in supporting local economies and preserving traditional skills.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-teal-800 mb-3">Innovation</h4>
                <p className="text-slate-600">We use technology to simplify the way services are found and delivered.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
