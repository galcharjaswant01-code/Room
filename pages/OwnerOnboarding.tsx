import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { uploadFiles } from '../services/uploadService';

const OwnerOnboarding: React.FC = () => {
  const { currentUser, updateProfile } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    mobile: '',
    governmentId: '',
    address: ''
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If they are not a owner, or already onboarded, redirect out
  if (!currentUser) return null; // Wait for auth
  if (currentUser.role !== 'OWNER') {
    navigate('/');
    return null;
  }
  if (currentUser.onboardingComplete) {
    navigate('/owner');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let avatarUrl = currentUser.avatar;
      if (photoFile) {
        const urls = await uploadFiles([photoFile]);
        avatarUrl = urls[0];
      }

      updateProfile({
        ...formData,
        avatar: avatarUrl,
        onboardingComplete: true,
        isVerified: false // Admin must verify them
      });

      // Redirect to dashboard
      navigate('/owner');
    } catch (error) {
      console.error('Error during onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-xl shadow-indigo-600/20 mb-6">
            🏢
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Welcome to StayHub</h1>
          <p className="mt-2 text-zinc-500">Let's set up your Owner profile so you can start listing properties.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
                 <input 
                   type="text" 
                   value={currentUser.name} 
                   disabled 
                   className="w-full px-4 py-3 bg-zinc-100 border-transparent rounded-xl text-zinc-500 cursor-not-allowed font-medium text-sm"
                 />
                 <p className="text-[10px] text-zinc-400 mt-1">Managed via authentication provider</p>
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
                 <input 
                   type="email" 
                   value={currentUser.email} 
                   disabled 
                   className="w-full px-4 py-3 bg-zinc-100 border-transparent rounded-xl text-zinc-500 cursor-not-allowed font-medium text-sm"
                 />
               </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Mobile Number *</label>
              <input 
                type="tel" 
                required
                value={formData.mobile}
                onChange={e => setFormData({...formData, mobile: e.target.value})}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Government ID Number (Aadhaar/PAN) *</label>
              <input 
                type="text" 
                required
                value={formData.governmentId}
                onChange={e => setFormData({...formData, governmentId: e.target.value})}
                placeholder="Enter your ID number for verification"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Business Address *</label>
              <textarea 
                required
                rows={3}
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="Full residential or business address"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Profile Photo (Optional)</label>
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
                    {photoFile ? (
                      <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <img src={currentUser.avatar} alt="Current" className="w-full h-full object-cover opacity-50 grayscale" />
                    )}
                 </div>
                 <div className="flex-1">
                   <input 
                     type="file" 
                     accept="image/*"
                     onChange={handleFileChange}
                     className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                   />
                 </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold tracking-wide hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-wait flex justify-center items-center gap-2"
              >
                {isLoading ? 'Saving Profile...' : 'Complete Registration'}
                {!isLoading && <span>→</span>}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerOnboarding;
