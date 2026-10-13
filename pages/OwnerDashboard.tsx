import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useApp } from '../store';
import { BookingStatus } from '../types';
import OverviewTab from '../components/owner/OverviewTab';
import MyPropertiesTab from '../components/owner/MyPropertiesTab';
import AddPropertyTab from '../components/owner/AddPropertyTab';
import BookingsTab from '../components/owner/BookingsTab';
import EarningsTab from '../components/owner/EarningsTab';
import ProfileTab from '../components/owner/ProfileTab';

const OwnerDashboard: React.FC = () => {
  const { currentUser, bookings } = useApp();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'bookings' || tabParam === 'Booking Requests') {
      setActiveTab('Booking Requests');
    }
  }, [searchParams]);

  if (!currentUser) return null;

  const pendingBookingsCount = bookings.filter(
    b => b.status === BookingStatus.PENDING || (b.status as any) === 'pending'
  ).length;

  const tabs = [
    { id: 'Overview', icon: '📊', label: 'Overview' },
    { id: 'My Properties', icon: '🏠', label: 'My Properties' },
    { id: 'Add Property', icon: '➕', label: 'Add Property' },
    { id: 'Booking Requests', icon: '📅', label: 'Booking Requests' },
    { id: 'Earnings', icon: '💰', label: 'Earnings & Payouts' },
    { id: 'Profile', icon: '👤', label: 'Owner Profile' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewTab />;
      case 'My Properties': return (
        <MyPropertiesTab 
          onAddNew={() => setActiveTab('Add Property')}
          onEdit={() => {
            toast('Editing property details', { icon: '✏️' });
            setActiveTab('Add Property');
          }} 
        />
      );
      case 'Add Property': return <AddPropertyTab />;
      case 'Booking Requests': return <BookingsTab />;
      case 'Earnings': return <EarningsTab />;
      case 'Profile': return <ProfileTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 pt-16 transition-colors">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-16 left-0 z-50 h-[calc(100vh-64px)] w-64 bg-white border-r border-zinc-200 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
         <div className="p-6 border-b border-zinc-100">
            <div className="flex items-center gap-3.5">
              <img src={currentUser.avatar} alt="Profile" className="w-11 h-11 rounded-2xl border border-zinc-200 object-cover shadow-xs" />
              <div className="min-w-0">
                 <p className="text-sm font-extrabold truncate text-zinc-900">{currentUser.name}</p>
                 <div className="flex items-center gap-1.5 mt-0.5">
                   <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Verified Owner</p>
                 </div>
              </div>
            </div>
         </div>

         <div className="p-3.5 flex-1 overflow-y-auto space-y-1">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'Booking Requests' && pendingBookingsCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-amber-400 text-amber-950' : 'bg-amber-500 text-white animate-pulse'
                    }`}>
                      {pendingBookingsCount}
                    </span>
                  )}
                </button>
              );
            })}
         </div>

         <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
              <p className="font-bold">Need assistance?</p>
              <p className="text-[11px] text-indigo-700 mt-0.5">24/7 dedicated owner support available.</p>
            </div>
         </div>
      </aside>

      <main className="flex-1 overflow-x-hidden p-6 lg:p-10 relative">
        <button 
           onClick={() => setSidebarOpen(true)}
           className="lg:hidden mb-4 inline-flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-zinc-200 text-zinc-800 text-xs font-bold shadow-xs"
        >
          <span>☰</span>
          <span>Dashboard Menu</span>
        </button>
        {renderContent()}
      </main>
    </div>
  );
};

export default OwnerDashboard;
