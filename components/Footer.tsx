import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { Activity, Clock, ShieldCheck, LifeBuoy, BookOpen, FileText, Smartphone } from 'lucide-react';
import { UserRole } from '../types';

const Footer: React.FC = () => {
  const { currentUser } = useApp();
  const currentYear = new Date().getFullYear();
  
  const [lastSync, setLastSync] = useState('Just now');
  
  // Simulate sync updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync('Just now');
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getRoleDisplay = () => {
    if (!currentUser) return 'Guest';
    switch (currentUser.role) {
      case UserRole.OWNER: return 'Landlord';
      case UserRole.MANAGER: return 'Manager';
      case UserRole.ADMIN: return 'Admin';
      case UserRole.GUEST: return 'Tenant';
      default: return 'Guest';
    }
  };

  return (
    <footer className="mt-auto bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Left Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
                🏠
              </div>
              <span className="font-black text-xl tracking-tight text-zinc-900 dark:text-white">StayHub</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              &copy; {currentYear} Room Rental System.<br/>
              All Rights Reserved.
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 italic mt-6">
              Made with ❤️ for Property Management
            </p>
          </div>

          {/* Center Section: Quick Links */}
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Quick Links</h4>
            <ul className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {(!currentUser || currentUser.role === UserRole.GUEST) ? (
                <>
                  <li><Link to="/rooms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><Smartphone size={14}/> Explore Rooms</Link></li>
                  <li><Link to="/wishlist" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><Activity size={14}/> My Wishlist</Link></li>
                  <li><Link to="#" onClick={() => {}} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><BookOpen size={14}/> How it Works</Link></li>
                  <li><Link to="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><LifeBuoy size={14}/> Support</Link></li>
                </>
              ) : currentUser.role === UserRole.OWNER ? (
                <>
                  <li><Link to="/owner" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><Smartphone size={14}/> Dashboard</Link></li>
                  <li><Link to="/owner" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><Activity size={14}/> Analytics</Link></li>
                  <li><Link to="/owner" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><BookOpen size={14}/> Bookings</Link></li>
                  <li><Link to="/owner" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><FileText size={14}/> My Properties</Link></li>
                  <li><Link to="/owner" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><LifeBuoy size={14}/> Support</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><Smartphone size={14}/> Dashboard</Link></li>
                  <li><Link to="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"><LifeBuoy size={14}/> Support</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Right Section: System Status */}
          <div>
            <h4 className="font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wider text-xs">System Info</h4>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Logged in as</span>
                <span className="text-zinc-900 dark:text-white font-bold">{getRoleDisplay()}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">App Version</span>
                <span className="text-zinc-900 dark:text-white font-mono text-xs font-bold">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2"><Clock size={14}/> Last Sync</span>
                <span className="text-zinc-900 dark:text-white text-xs">{lastSync} (auto update)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Server Status</span>
                <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest"><ShieldCheck size={14}/> Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms & Conditions</Link>
            <Link to="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Help Center</Link>
            <Link to="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Support</Link>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-lg">𝕏</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-lg">📸</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-lg">💼</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
