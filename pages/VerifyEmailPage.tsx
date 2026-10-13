import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../services/firebase';
import { verifyJWTToken } from '../services/backendService';
import { useApp } from '../store';
import { UserRole } from '../types';

const VerifyEmailPage: React.FC = () => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { syncUserFromAuth } = useApp();
  const isVerifying = React.useRef(false);

  useEffect(() => {
    if (isVerifying.current) return;
    
    const verifyLogin = async () => {
      isVerifying.current = true;
      // Check if URL is an email sign-in link
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        let role = window.localStorage.getItem('roleForSignIn') as UserRole || UserRole.GUEST;
        
        if (!email) {
          // If missing, prompt user for it (usually happens if opened on a different device)
          email = window.prompt('Please provide your email for confirmation');
        }
        
        if (!email) {
          setStatus('error');
          setErrorMessage('Email is required to sign in.');
          return;
        }

        try {
          // Sign in with the email link
          const result = await signInWithEmailLink(auth, email, window.location.href);
          
          // Clear email from storage
          window.localStorage.removeItem('emailForSignIn');
          window.localStorage.removeItem('roleForSignIn');

          // Retrieve JWT Token
          const token = await result.user.getIdToken();
          
          // Verify with Backend
          const backendRes = await verifyJWTToken(token);
          
          if (backendRes.success) {
            syncUserFromAuth({ 
              email: result.user.email || email, 
              name: result.user.displayName || undefined, 
              role 
            });
            setStatus('success');
            
            // Redirect after short delay
            setTimeout(() => {
              navigate('/');
            }, 1500);
          } else {
            throw new Error(backendRes.error || 'Backend verification failed.');
          }

        } catch (error: any) {
          setStatus('error');
          setErrorMessage(error.message || 'Error signing in with magic link.');
        }
      } else {
        setStatus('error');
        setErrorMessage('This is not a valid verification link or it has expired.');
      }
    };

    verifyLogin();
  }, [navigate, syncUserFromAuth]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
        {status === 'verifying' && (
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              🔐
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-2">Verifying your link...</h2>
            <p className="text-zinc-500 font-medium">Please wait while we securely log you in.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              ✓
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-2">Authentication Successful!</h2>
            <p className="text-zinc-500 font-medium">Redirecting you to the dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              ✕
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-2">Authentication Failed</h2>
            <p className="text-rose-500 font-medium mb-6">{errorMessage}</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
            >
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
