import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Briefcase, MapPin, DollarSign, Image as ImageIcon, CheckCircle, Send, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AdminProfile() {
    const [formData, setFormData] = useState({
        name: '',
        job: '',
        price: '',
        province: '',
        city: '',
        story: '',
        services: [] as string[],
        category_ids: [] as string[]
    });
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        fetch('http://localhost:3003/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error('Error fetching categories:', err));
    }, []);
    const [currentService, setCurrentService] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const toggleCategory = (id: string) => {
        setFormData(prev => {
            const exists = prev.category_ids.includes(id);
            if (exists) {
                return { ...prev, category_ids: prev.category_ids.filter(c => c !== id) };
            } else {
                return { ...prev, category_ids: [...prev.category_ids, id] };
            }
        });
    };

    const addService = () => {
        if (currentService.trim() && !formData.services.includes(currentService)) {
            setFormData(prev => ({ ...prev, services: [...prev.services, currentService] }));
            setCurrentService('');
        }
    };

    const removeService = (service: string) => {
        setFormData(prev => ({ ...prev, services: prev.services.filter(s => s !== service) }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3003/api/workers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setSubmitted(true);
                setFormData({
                    name: '',
                    job: '',
                    price: '',
                    province: '',
                    city: '',
                    story: '',
                    services: [],
                    category_ids: []
                });
                setTimeout(() => setSubmitted(false), 3000);
            }
        } catch (error) {
            console.error('Error adding worker:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafbfc]">
            <Navbar />
            <main className="pt-32 pb-24 px-6 md:px-20 max-w-[1000px] mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-teal-950 mb-3 tracking-tight">Register New Professional</h1>
                    <p className="text-slate-500 font-medium text-lg">Add high-quality artisans to the Artisan Lanka directory.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Identity Section */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Artesan Name</label>
                                <div className="relative">
                                    <UserPlus className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-500" size={20} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/10 text-lg font-medium"
                                        placeholder="e.g. Ruwan Silva"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Job Title / Specialty</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-500" size={20} />
                                    <input
                                        type="text"
                                        value={formData.job}
                                        onChange={(e) => setFormData(prev => ({ ...prev, job: e.target.value }))}
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/10 text-lg font-medium"
                                        placeholder="e.g. Master Woodworker"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Job Categories (Select all that apply)</label>
                                <div className="flex flex-wrap gap-3">
                                    {categories.map(c => {
                                        const isSelected = formData.category_ids.includes(c.id.toString());
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => toggleCategory(c.id.toString())}
                                                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${isSelected
                                                    ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20'
                                                    : 'bg-white border-slate-100 text-slate-500 hover:border-teal-200'
                                                    }`}
                                            >
                                                {c.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Hourly Rate (LKR)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-500" size={20} />
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/10 text-lg font-medium"
                                        placeholder="e.g. 4500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Province</label>
                                    <input
                                        type="text"
                                        value={formData.province}
                                        onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/10 text-lg font-medium"
                                        placeholder="Western"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">City/District</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/10 text-lg font-medium"
                                        placeholder="Colombo"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services & Bio Section */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-8">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Services Offered</label>
                            <div className="flex gap-4 mb-4">
                                <input
                                    type="text"
                                    value={currentService}
                                    onChange={(e) => setCurrentService(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                                    className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/10 text-lg font-medium"
                                    placeholder="e.g. Teak restoration"
                                />
                                <button
                                    type="button"
                                    onClick={addService}
                                    className="bg-teal-50 text-teal-600 px-8 rounded-2xl font-bold hover:bg-teal-100 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.services.map((s, i) => (
                                    <span key={i} className="bg-teal-50 text-teal-600 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 border border-teal-100">
                                        {s}
                                        <button type="button" onClick={() => removeService(s)}><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Personal Story (Optional)</label>
                            <textarea
                                value={formData.story}
                                onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500/10 text-lg font-medium h-32 resize-none"
                                placeholder="Share the artisan's heritage and craftsmanship..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-8 pt-4">
                        <div className="hidden md:flex items-center gap-2 text-slate-400 font-bold text-sm tracking-tight px-6 py-3 bg-slate-50 rounded-full border border-slate-100">
                            <CheckCircle size={16} className="text-teal-500" /> All changes are manually reviewed before listing
                        </div>
                        <button
                            type="submit"
                            className={`glass-button glass-button-accent !px-12 !py-5 shadow-2xl shadow-teal-500/20 text-xl font-bold flex items-center gap-3 transition-all ${submitted ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {submitted ? (
                                <>Success! Profile Created</>
                            ) : (
                                <><Send size={24} /> Register Artisan</>
                            )}
                        </button>
                    </div>
                </form>
            </main>
            <Footer />
        </div>
    );
}
