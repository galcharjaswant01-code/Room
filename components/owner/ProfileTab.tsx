import React, { useState } from 'react';
import { useApp } from '../../store';

const ProfileTab: React.FC = () => {
  const { currentUser, updateProfile } = useApp();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    mobile: currentUser?.mobile || '',
    address: currentUser?.address || '',
  });

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    alert('Profile updated successfully!');
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-200 max-w-3xl">
       <div className="mb-8">
         <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Profile Settings</h2>
         <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage your owner account details and verification status.</p>
       </div>

       <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden mb-8">
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-6 bg-zinc-900 text-white">
             <img src={currentUser.avatar} alt="Profile" className="w-24 h-24 rounded-2xl object-cover border-4 border-zinc-800" />
             <div>
                <h3 className="text-2xl font-black">{currentUser.name}</h3>
                <p className="text-zinc-400">{currentUser.email}</p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10">
                   {currentUser.isVerified ? (
                     <><span className="text-emerald-400">✓</span> <span className="text-emerald-50">Verified Owner</span></>
                   ) : (
                     <><span className="text-amber-400">⏳</span> <span className="text-amber-50">Pending Verification</span></>
                   )}
                </div>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
                 <input 
                   type="text" 
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-sm text-zinc-900 dark:text-white transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
                 <input 
                   type="email" 
                   value={currentUser.email}
                   disabled
                   className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800/50 border-transparent rounded-xl text-zinc-400 dark:text-zinc-500 cursor-not-allowed font-medium text-sm transition-colors"
                 />
                 <p className="text-[10px] text-zinc-400 mt-1">Managed via authentication provider</p>
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Mobile Number</label>
                 <input 
                   type="tel" 
                   value={formData.mobile}
                   onChange={e => setFormData({...formData, mobile: e.target.value})}
                   className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-sm text-zinc-900 dark:text-white transition-colors"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Government ID</label>
                 <input 
                   type="text" 
                   value={currentUser.governmentId || 'Not provided'}
                   disabled
                   className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800/50 border-transparent rounded-xl text-zinc-400 dark:text-zinc-500 cursor-not-allowed font-medium text-sm transition-colors"
                 />
               </div>
               <div className="md:col-span-2">
                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Business Address</label>
                 <textarea 
                   rows={3}
                   value={formData.address}
                   onChange={e => setFormData({...formData, address: e.target.value})}
                   className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium text-sm resize-none text-zinc-900 dark:text-white transition-colors"
                 />
               </div>
             </div>

             <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button type="submit" className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold tracking-wide hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-900/20 dark:shadow-none">
                  Save Changes
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default ProfileTab;
