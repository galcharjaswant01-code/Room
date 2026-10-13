import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Notification } from '../types';

const NotificationBell: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING': return '📅';
      case 'MESSAGE': return '💬';
      case 'REVIEW': return '⭐';
      default: return '🔔';
    }
  };

  const getDestination = (notif: Notification) => {
    if (notif.link) return notif.link;
    if (currentUser?.role === 'OWNER') return '/owner?tab=bookings';
    return '/client';
  };

  const formatTimestamp = (ts: string) => {
    if (!ts || ts === 'Just now') return 'Just now';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }
    setIsOpen(false);
    navigate(getDestination(notif));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h3 className="font-bold text-zinc-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllNotificationsAsRead()}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-zinc-500">You have no notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {notifications.slice(0, 20).map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-zinc-50 transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-lg">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm ${!notif.isRead ? 'font-bold text-zinc-900' : 'font-medium text-zinc-700'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1.5 ml-2"></span>
                        )}
                      </div>
                      <p className={`text-xs text-zinc-500 line-clamp-2 ${!notif.isRead ? 'font-medium' : ''}`}>
                        {notif.message}
                      </p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          {formatTimestamp(notif.timestamp)}
                        </span>
                        
                        <div className="flex gap-2">
                          <Link 
                            to={getDestination(notif)}
                            onClick={(e) => { e.stopPropagation(); handleNotificationClick(notif); }}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </Link>
                          {!notif.isRead && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); markNotificationAsRead(notif.id); }}
                              className="text-[10px] font-bold text-zinc-500 hover:text-zinc-700 bg-zinc-100 px-2 py-1 rounded"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-zinc-100 bg-zinc-50 text-center">
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Real-time updates active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
