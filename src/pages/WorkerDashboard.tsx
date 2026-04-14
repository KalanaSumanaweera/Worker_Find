import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const seekerPosts = [
  { id: 1, title: "Seeking Plumber for Kitchen Leak", category: "Plumbing", location: "Colombo 07", time: "2 hours ago" },
  { id: 2, title: "Need Electrician for Wiring", category: "Electrical", location: "Kandy", time: "5 hours ago" },
  { id: 3, title: "Looking for Carpenter for Table", category: "Woodwork", location: "Galle", time: "1 day ago" },
];

export default function WorkerDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-32 pb-24 px-6 md:px-20 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-teal-950 mb-12">Worker Dashboard</h1>
        
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-teal-950 mb-6">Available Seeker Posts</h2>
          <div className="space-y-6">
            {seekerPosts.map((post) => (
              <div key={post.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-teal-950 mb-2">{post.title}</h3>
                  <p className="text-slate-600 text-sm">{post.category} • {post.location} • Posted {post.time}</p>
                </div>
                <Link to={`/service/${post.id}`} className="glass-button !px-6 !py-3">View Details</Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
