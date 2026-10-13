import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home as HomeIcon, IndianRupee, Users, Filter, Star, CheckCircle, Building2, ArrowRight } from 'lucide-react';
import { useApp } from '../store';
import { UserRole } from '../types';
import RoomCard from '../components/RoomCard';
import { searchLocationSuggestions, LocationSuggestion } from '../services/locationService';

const HomePage: React.FC = () => {
  const { rooms, currentUser } = useApp();
  const navigate = useNavigate();
  
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<any>(null);
  
  const featuredRooms = rooms.filter(r => r.is_available || r.status === 'AVAILABLE').slice(0, 6);

  const handleLocationChange = (val: string) => {
    setLocation(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await searchLocationSuggestions(val);
          setSuggestions(res);
          setShowSuggestions(res.length > 0);
        } catch {
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item: LocationSuggestion) => {
    setLocation(item.displayName);
    setShowSuggestions(false);
    navigate(`/search?location=${encodeURIComponent(item.displayName)}&budget=${budget}&lat=${item.lat}&lng=${item.lng}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    navigate(`/search?location=${encodeURIComponent(location)}&budget=${budget}`);
  };

  return (
    <div className="bg-zinc-50 min-h-screen font-sans">
      {/* Owner Formation Active Quick Banner */}
      {currentUser?.role === UserRole.OWNER && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white px-4 sm:px-6 py-3.5 shadow-md border-b border-indigo-700/50 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30 shrink-0">
                <Building2 className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-indigo-200">Owner Account Active</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Proper Formation
                  </span>
                </div>
                <p className="text-xs text-indigo-100 font-medium">
                  Logged in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}). You are viewing public rooms.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/owner')}
                className="px-4 py-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl font-extrabold text-xs transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <span>Go to Owner Dashboard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2000&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight tracking-tight mb-6 animate-in slide-in-from-bottom-5 duration-700">
              Find a place you'll <span className="text-indigo-400">love to live.</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-300 font-medium mb-10 max-w-xl animate-in slide-in-from-bottom-5 duration-700 delay-100">
              Search thousands of verified rooms, PGs, and apartments. Book instantly with confidence and secure your next home today.
            </p>

            {/* Main Search Box */}
            <div className="bg-white p-3 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-700 delay-200">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative flex items-center">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-zinc-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Where do you want to live?" 
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-900 placeholder:text-zinc-500 outline-none"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {suggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-xs text-zinc-800 font-medium flex items-center gap-2 border-b border-zinc-50 last:border-b-0 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="truncate">{item.displayName}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 relative flex items-center">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-zinc-400" />
                  </div>
                  <select 
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-zinc-900 appearance-none cursor-pointer outline-none"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  >
                    <option value="">Any Budget</option>
                    <option value="under_10k">Under ₹10,000</option>
                    <option value="10k_20k">₹10,000 - ₹20,000</option>
                    <option value="above_20k">Above ₹20,000</option>
                  </select>
                </div>
                
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 md:w-auto w-full active:scale-95"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </form>
            </div>

            {/* Quick Filters */}
            <div className="mt-6 flex flex-wrap gap-2 animate-in slide-in-from-bottom-5 duration-700 delay-300">
              <span className="text-zinc-400 text-sm font-medium mr-2 self-center">Popular:</span>
              {['Students', 'PG', '1BHK', 'Furnished', 'Under ₹10K'].map((tag) => (
                <button key={tag} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm font-medium transition-colors backdrop-blur-sm">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">Renting made brilliantly simple</h2>
            <p className="text-zinc-500 font-medium text-lg">We've removed the hassle from finding your next home. Just three simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-6 rounded-3xl hover:bg-zinc-50 transition-colors">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">1. Search & Filter</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">Find exactly what you're looking for with our smart filters and verified listings.</p>
            </div>
            
            <div className="text-center p-6 rounded-3xl hover:bg-zinc-50 transition-colors">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">2. Book Securely</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">Connect with owners instantly and lock in your room with our secure payment system.</p>
            </div>
            
            <div className="text-center p-6 rounded-3xl hover:bg-zinc-50 transition-colors">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100">
                <HomeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">3. Move In</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">Pack your bags! Move into your new home with complete peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-zinc-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight">Featured Properties</h2>
              <p className="text-zinc-500 font-medium text-lg">Handpicked rooms verified by our team.</p>
            </div>
            <button onClick={() => navigate('/search')} className="hidden sm:flex text-indigo-600 font-bold hover:text-indigo-700 items-center gap-1 group">
              View All <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
          
          {featuredRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {featuredRooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100 shadow-sm">
              <div className="text-zinc-300 mb-4"><HomeIcon className="w-12 h-12 mx-auto" /></div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">No properties listed yet</h3>
              <p className="text-zinc-500">Check back soon for amazing places to stay.</p>
            </div>
          )}
          
          <div className="mt-10 text-center sm:hidden">
            <button onClick={() => navigate('/search')} className="w-full py-4 border-2 border-zinc-200 rounded-xl font-bold text-zinc-700 hover:bg-zinc-100 transition-colors">
              View All Properties
            </button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-6 tracking-tight">Rent with complete confidence</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-12 font-medium">
            We verify every owner and property to ensure your safety. Over 10,000+ students and professionals have found their home with StayHub.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:w-48 text-center">
              <div className="text-4xl font-black text-indigo-400 mb-2">10k+</div>
              <div className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Happy Guests</div>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:w-48 text-center">
              <div className="text-4xl font-black text-emerald-400 mb-2">5k+</div>
              <div className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Verified Rooms</div>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:w-48 text-center">
              <div className="text-4xl font-black text-amber-400 mb-2">4.9/5</div>
              <div className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Average Rating</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
