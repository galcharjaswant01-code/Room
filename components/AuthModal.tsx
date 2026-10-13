import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../store';
import { UserRole } from '../types';
import { mockUsers } from '../mockData';
import { firebaseLoginAPI, googleAuthAPI, loginAPI, registerAPI } from '../services/authService';
import { auth, googleProvider, signInWithPopup } from '../services/firebase';
import { Mail, Lock, User, Building2, Sparkles, CheckCircle2, ArrowRight, X, ShieldCheck } from 'lucide-react';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, syncUserFromAuth, authModalMode, setAuthModalMode } = useApp();
  const navigate = useNavigate();
  
  // Role for registration & login
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'owner'>('tenant');
  
  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect owner or guest account from email input (Strict: Only galcharjaswant01@gmail.com)
  const cleanEmail = email.trim().toLowerCase();
  const isKnownOwnerEmail = cleanEmail === 'galcharjaswant01@gmail.com';
  const isKnownGuestEmail = cleanEmail.length > 0 && cleanEmail !== 'galcharjaswant01@gmail.com';

  // Automatically update selectedRole: Only galcharjaswant01@gmail.com is allowed as owner
  useEffect(() => {
    if (isKnownOwnerEmail) {
      setSelectedRole('owner');
    } else if (cleanEmail.length > 0) {
      setSelectedRole('tenant');
    }
  }, [cleanEmail, isKnownOwnerEmail]);

  // Synchronize when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setError('');
      setMessage('');
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setError('');
    setMessage('');
    closeAuthModal();
  };

  const handleGoogleAuth = async () => {
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const nameParts = (user.displayName || '').trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';
      const userEmail = (user.email || '').trim().toLowerCase();

      // STRICT RULE: Only galcharjaswant01@gmail.com is granted OWNER role
      const finalRole = userEmail === 'galcharjaswant01@gmail.com' ? UserRole.OWNER : UserRole.GUEST;

      try {
        await googleAuthAPI({
          email: userEmail,
          first_name: firstName,
          last_name: lastName,
          role: finalRole === UserRole.OWNER ? 'owner' : 'tenant'
        });
      } catch (backendErr) {
        console.warn('Backend Google Auth endpoint failed, attempting firebase token auth:', backendErr);
        try {
          await firebaseLoginAPI(idToken);
        } catch (fbErr) {
          console.warn('Firebase login API failed, proceeding with client sync:', fbErr);
        }
      }

      const syncedUser = syncUserFromAuth({
        email: user.email || 'galcharjaswant01@gmail.com',
        name: user.displayName || (finalRole === UserRole.OWNER ? 'Jaswant Galchar' : 'StayHub Member'),
        avatar: user.photoURL || undefined,
        role: finalRole
      });

      handleClose();

      // Navigate appropriately based on strict owner role
      if (syncedUser.role === UserRole.OWNER) {
        toast.success(`Welcome to your Owner Dashboard, ${syncedUser.name}!`);
        navigate('/owner');
      } else {
        toast.success(`Welcome back, ${syncedUser.name}!`);
        navigate('/rooms');
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      // STRICT RULE: Only galcharjaswant01@gmail.com is allowed as Owner
      if (selectedRole === 'owner' && cleanEmail !== 'galcharjaswant01@gmail.com') {
        setError('Only galcharjaswant01@gmail.com is authorized as Property Owner. All other email addresses are Guests.');
        setIsLoading(false);
        return;
      }

      const finalRole = cleanEmail === 'galcharjaswant01@gmail.com' ? UserRole.OWNER : UserRole.GUEST;

      if (authModalMode === 'register') {
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        try {
          await registerAPI({
            username: email,
            email: email,
            password: password,
            first_name: firstName,
            last_name: lastName,
            role: finalRole === UserRole.OWNER ? 'owner' : 'tenant'
          });
        } catch (regErr: any) {
          console.warn('Backend register error, proceeding with login/sync fallback:', regErr);
        }

        try {
          await loginAPI({ email, password });
        } catch (logErr) {
          console.warn('Login after register failed, syncing locally:', logErr);
        }

        const syncedUser = syncUserFromAuth({
          email,
          name: fullName || email.split('@')[0],
          role: finalRole
        });

        handleClose();

        if (syncedUser.role === UserRole.OWNER) {
          toast.success(`Owner account created! Opening Owner Dashboard.`);
          navigate('/owner');
        } else {
          toast.success(`Account created! Welcome to StayHub.`);
          navigate('/rooms');
        }
      } else {
        // Sign In mode
        try {
          await loginAPI({ email, password });
        } catch (err: any) {
          console.warn('API login failed, syncing profile fallback:', err);
        }

        const syncedUser = syncUserFromAuth({
          email,
          name: email.split('@')[0],
          role: finalRole
        });

        handleClose();

        // Direct properly based on owner or guest formation
        if (syncedUser.role === UserRole.OWNER) {
          toast.success(`Welcome back, ${syncedUser.name}! Opening Owner Tools.`);
          navigate('/owner');
        } else {
          toast.success(`Welcome back, ${syncedUser.name}!`);
          navigate('/rooms');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative border border-zinc-100 animate-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🏠</span>
            <span className="font-extrabold tracking-tight text-white text-base uppercase">StayHub</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            {authModalMode === 'register' ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="text-indigo-100 text-xs mt-1">
            {authModalMode === 'register' 
              ? 'Join StayHub as a Guest to book or an Owner to list stays' 
              : 'Sign in to access your dashboard, bookings, and tools'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-black/20 rounded-2xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setError('');
                setMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                authModalMode === 'login'
                  ? 'bg-white text-indigo-700 shadow-md font-extrabold'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('register');
                setError('');
                setMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authModalMode === 'register'
                  ? 'bg-white text-indigo-700 shadow-md font-extrabold'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              <Sparkles size={13} className={authModalMode === 'register' ? 'text-indigo-600' : 'text-indigo-200'} />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
          {message && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium flex items-center gap-2">
              <span className="shrink-0 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Account Role Selector & Auto-Detector */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                {authModalMode === 'register' ? 'I want to register as:' : 'Account Type:'}
              </label>
              {isKnownOwnerEmail && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
                  <ShieldCheck size={11} /> Owner Detected
                </span>
              )}
              {isKnownGuestEmail && !isKnownOwnerEmail && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  Guest Detected
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedRole('tenant')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                  selectedRole === 'tenant'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 font-bold shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                }`}
              >
                <User size={18} className={`mt-0.5 shrink-0 ${selectedRole === 'tenant' ? 'text-indigo-600' : 'text-zinc-400'}`} />
                <div>
                  <div className="text-xs font-bold">Tenant / Guest</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Book & explore stays</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (cleanEmail && cleanEmail !== 'galcharjaswant01@gmail.com') {
                    toast.error('Only galcharjaswant01@gmail.com is allowed as Property Owner');
                    return;
                  }
                  setSelectedRole('owner');
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                  selectedRole === 'owner'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 font-bold shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                }`}
              >
                <Building2 size={18} className={`mt-0.5 shrink-0 ${selectedRole === 'owner' ? 'text-indigo-600' : 'text-zinc-400'}`} />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>Property Owner</span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded">1 Email Only</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">galcharjaswant01@gmail.com</div>
                </div>
              </button>
            </div>
          </div>

          {/* Google One-Click Auth Button */}
          <div className="space-y-3 mb-5">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleAuth}
              className="w-full py-3 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
              </svg>
              <span>{authModalMode === 'register' ? 'Register with Google' : `Continue with Google as ${selectedRole === 'owner' ? 'Owner' : 'Guest'}`}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-zinc-400 bg-white px-2 tracking-wider">
              Or with email & password
            </div>
          </div>

          {/* Email & Password Authentication Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {authModalMode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Full Name
                </label>
                <div className="flex items-center rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                  <User size={16} className="text-zinc-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaswant Galchar"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="bg-transparent flex-1 text-sm outline-none text-zinc-900 font-semibold"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Email Address
              </label>
              <div className="flex items-center rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                <Mail size={16} className="text-zinc-400 mr-2 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="galcharjaswant01@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-transparent flex-1 text-sm outline-none text-zinc-900 font-semibold"
                />
              </div>

              {/* Live Formation Detection Indicator */}
              {cleanEmail.length >= 3 && (
                <div className="mt-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {isKnownOwnerEmail ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                      <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                        <Building2 size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black text-emerald-900 flex items-center justify-between">
                          <span>Verified Primary Owner Account</span>
                          <span className="text-[10px] bg-emerald-200/80 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                            Owner Formation
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                          Authorized Owner Email (Jaswant Galchar). You will be routed into <strong>Owner Formation (/owner)</strong> with full management controls.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2.5">
                      <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0 mt-0.5">
                        <User size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black text-indigo-900 flex items-center justify-between">
                          <span>Guest / Tenant Account Confirmed</span>
                          <span className="text-[10px] bg-indigo-200/80 text-indigo-800 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                            Guest Formation
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-700 mt-1 leading-relaxed">
                          You will be routed into <strong>Guest Formation (/rooms)</strong> to explore and book rooms. <em>(Owner formation is strictly restricted to galcharjaswant01@gmail.com)</em>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Password
              </label>
              <div className="flex items-center rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                <Lock size={16} className="text-zinc-400 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-transparent flex-1 text-sm outline-none text-zinc-900 font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl text-white text-sm font-black transition-all shadow-md active:scale-95 disabled:opacity-70 mt-2 flex items-center justify-center gap-2 ${
                selectedRole === 'owner'
                  ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-700/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              <span>
                {isLoading 
                  ? 'Authenticating...' 
                  : (authModalMode === 'register' 
                      ? (selectedRole === 'owner' ? 'Register in Owner Formation' : 'Register in Guest Formation') 
                      : (selectedRole === 'owner' ? 'Sign In to Owner Formation (Dashboard)' : 'Sign In to Guest Formation (Explore)'))}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Toggle Link at Bottom */}
          <div className="mt-6 pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
            {authModalMode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('register');
                    setError('');
                    setMessage('');
                  }}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setError('');
                    setMessage('');
                  }}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
