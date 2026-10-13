import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store';

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || ''
  });

  const [gallery, setGallery] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.avatar) {
      setGallery(prev => prev.includes(currentUser.avatar) ? prev : [currentUser.avatar, ...prev]);
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const processImageFile = (file: File, setActive: boolean, inputRef: React.RefObject<HTMLInputElement | null>) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setGallery(prev => !prev.includes(base64) ? [base64, ...prev] : prev);
      if (setActive) setFormData(prev => ({ ...prev, avatar: base64 }));
      if (inputRef.current) inputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const setAsActive = (url: string) => {
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  const removeFromGallery = (url: string) => {
    const next = gallery.filter(item => item !== url);
    setGallery(next);
    if (formData.avatar === url) {
       setFormData(prev => ({ ...prev, avatar: next[0] || '' }));
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Profile</h1>
          <p className="text-zinc-500 mt-2 font-medium">Manage your personal details and profile photo.</p>
        </div>
        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
          <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">{currentUser.role} Account</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="relative group mb-8">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl transition-all bg-zinc-100">
              <img src={formData.avatar} className="w-full h-full object-cover" alt="Profile" />
            </div>
            
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-zinc-900 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
              title="Change Profile Photo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={e => e.target.files?.[0] && processImageFile(e.target.files[0], true, fileInputRef)} 
            />
          </div>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 px-6 bg-zinc-900 text-white rounded-2xl font-bold text-sm tracking-wide hover:bg-black transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload Photo</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
              <input 
                type="text" 
                className="w-full px-5 py-3.5 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
              <input 
                type="email" 
                className="w-full px-5 py-3.5 rounded-xl bg-zinc-50 border border-zinc-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Your Photos</h2>
              <button 
                type="button" 
                onClick={() => galleryFileInputRef.current?.click()}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                + Add Photo
              </button>
              <input 
                type="file" 
                ref={galleryFileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={e => e.target.files?.[0] && processImageFile(e.target.files[0], false, galleryFileInputRef)} 
              />
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {gallery.map((url, i) => {
                const active = formData.avatar === url;
                return (
                  <div 
                    key={i} 
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                      active ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setAsActive(url)}
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`Photo ${i}`} />
                    {active && <div className="absolute inset-0 border-2 border-indigo-500 rounded-xl"></div>}
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFromGallery(url); }}
                      className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Remove"
                    >
                      <svg className="w-3 h-3 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-10 border-t border-zinc-100 flex items-center gap-6">
            <button 
              type="submit" 
              className="bg-zinc-900 text-white px-10 py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-black transition-all shadow-xl shadow-zinc-900/10 active:scale-95"
            >
              Save Changes
            </button>
            {showSuccess && (
              <span className="text-emerald-600 text-xs font-bold uppercase tracking-widest animate-in fade-in">✓ Profile Updated</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;