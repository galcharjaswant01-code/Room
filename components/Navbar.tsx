import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../store';
import { UserRole } from '../types';
import { UserPlus } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar: React.FC = () => {
  const { currentUser, logout, wishlist, openAuthModal } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { path: '/rooms', label: 'Explore Stays', roles: [] },
    { path: '/wishlist', label: 'Wishlist', roles: [UserRole.GUEST], count: wishlist.length },
    { path: '/client', label: 'Manage', roles: [UserRole.MANAGER] },
    { path: '/owner', label: '🏢 Owner Dashboard', roles: [UserRole.OWNER] },
  ];

  const visibleLinks = navLinks.filter(link => 
    link.roles.length === 0 || (currentUser && (link.roles.includes(currentUser.role) || currentUser.role === UserRole.ADMIN))
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="h-16 border-b border-zinc-100 sticky top-0 z-50 bg-white/90 backdrop-blur-md transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl">🏠</span>
            <span className="font-extrabold text-lg tracking-tight uppercase text-zinc-900">StayHub</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1.5">
            {visibleLinks.map(link => {
              const isOwnerDashboardLink = link.path === '/owner';
              return (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isOwnerDashboardLink
                      ? (isActive(link.path) 
                          ? 'bg-indigo-600 text-white shadow-sm font-extrabold' 
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-extrabold border border-indigo-200/60')
                      : (isActive(link.path) 
                          ? 'text-indigo-600 bg-indigo-50 font-extrabold' 
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70')
                  }`}
                >
                  {link.label}
                  {link.count !== undefined && link.count > 0 && (
                    <span className="ml-1 opacity-60 text-[10px]">({link.count})</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {currentUser && <NotificationBell />}

          {currentUser ? (
            <div className="flex items-center gap-2.5">
              {/* Formation Badge */}
              <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                currentUser.role === UserRole.OWNER
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {currentUser.role === UserRole.OWNER ? '🏢 Owner' : '👤 Guest'}
              </span>

              <Link to="/profile" className="flex items-center gap-2.5 p-1 pr-3 rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors">
                <img src={currentUser.avatar} className="w-8 h-8 rounded-full object-cover shadow-xs border border-white" alt="Profile" />
                <span className="text-xs font-bold text-zinc-700 hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
              </Link>
              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => openAuthModal('login')} 
                className="px-4 py-2 rounded-full text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Sign In
              </button>
              <button 
                onClick={() => openAuthModal('register')} 
                className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center gap-1.5"
              >
                <UserPlus size={16} />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;