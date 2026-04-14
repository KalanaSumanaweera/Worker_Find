export default function Footer() {
  return (
    <footer className="bg-teal-950 text-amber-500 w-full py-12 md:py-16 px-6 md:px-8 mt-auto font-['Inter'] text-sm leading-relaxed">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="text-xl font-bold text-white mb-6">Worker Find</div>
          <p className="text-slate-400 mb-6">Connecting Sri Lanka's finest craftsmen with people who appreciate authentic, high-quality workmanship.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6">Explore</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-slate-400 hover:text-amber-200 transition-colors">Find Artisans</a></li>
            <li><a href="#" className="text-slate-400 hover:text-amber-200 transition-colors">Success Stories</a></li>
            <li><a href="#" className="text-slate-400 hover:text-amber-200 transition-colors">Become a Provider</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6">Support</h4>
          <ul className="space-y-4">
            <li><a href="#" className="text-slate-400 hover:text-amber-200 transition-colors">Contact Support</a></li>
            <li><a href="#" className="text-slate-400 hover:text-amber-200 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="text-slate-400 hover:text-amber-200 transition-colors">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6">Community</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            © 2024 Worker Find. Handcrafted in Sri Lanka. <br/>All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
