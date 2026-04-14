import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, ClipboardList, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      title: "Post Your Need",
      description: "Describe the service you require, your budget, and location. It only takes a few minutes.",
      icon: <ClipboardList className="text-teal-700" size={40} />
    },
    {
      title: "Find Experts",
      description: "Browse through verified artisans or wait for them to reach out to you with proposals.",
      icon: <Search className="text-teal-700" size={40} />
    },
    {
      title: "Get it Done",
      description: "Choose the best artisan for the job, get the work done, and leave a review.",
      icon: <CheckCircle className="text-teal-700" size={40} />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 md:pt-32 pb-16 md:pb-24">
        <section className="px-4 md:px-20 max-w-7xl mx-auto text-center mb-12 md:mb-20">
          <h1 className="text-3xl md:text-5xl font-bold text-teal-950 mb-4 md:mb-6">How ArtisanLanka Works</h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Connecting Sri Lanka's finest artisans with people who value quality craftsmanship.
          </p>
        </section>

        <section className="px-4 md:px-20 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16 md:mb-24">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 md:p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-white rounded-2xl shadow-sm">
                {step.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-teal-950 mb-2 md:mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">{step.description}</p>
            </div>
          ))}
        </section>

        <section className="bg-teal-950 py-16 md:py-24 px-4 md:px-20 text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">For Service Providers</h2>
              <ul className="space-y-4 text-teal-100 text-base md:text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">01.</span>
                  Create a professional profile showcasing your skills and past work.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">02.</span>
                  Browse available jobs in your area and send proposals.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold">03.</span>
                  Build your reputation through verified customer reviews.
                </li>
              </ul>
            </div>
            <div className="bg-white/10 p-10 rounded-3xl backdrop-blur-md border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Ready to grow your business?</h3>
              <p className="text-teal-100 mb-8">Join thousands of Sri Lankan artisans finding work every day.</p>
              <button className="glass-button glass-button-accent w-full !py-4 !text-lg">Register as a Provider</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
