
import React, { useState } from 'react';
import { useApp } from '../store';
import { BookingStatus } from '../types';
import { Link } from 'react-router-dom';

const ClientDashboard: React.FC = () => {
  const { bookings, rooms, currentUser, updateBookingStatus } = useApp();
  const myBookings = bookings.filter(b => b.clientId === currentUser?.id);
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Stays</h1>
        <p className="text-zinc-500">Manage your past and upcoming rental experiences.</p>
      </div>

      <div className="space-y-6">
        {myBookings.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-3xl">
            <p className="text-zinc-400 mb-6">You have no active stays.</p>
            <Link to="/rooms" className="text-indigo-600 font-bold text-sm hover:underline">Explore properties</Link>
          </div>
        ) : (
          myBookings.map(b => {
            const room = rooms.find(r => r.id === b.roomId);
            return (
              <div key={b.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
                <img src={room?.images[0]} className="w-full md:w-32 h-32 rounded-2xl object-cover" alt="Room" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${b.status === BookingStatus.APPROVED ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      {b.status}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">#{b.id.slice(-6)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">{room?.title}</h3>
                  <p className="text-xs text-zinc-400 font-medium mt-1">{new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 items-center">
                  {b.status === BookingStatus.PENDING && (
                    <button 
                      onClick={() => updateBookingStatus(b.id, BookingStatus.CANCELLED)}
                      className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {b.status === BookingStatus.APPROVED || b.status === 'confirmed' ? (
                    <button
                      onClick={async () => {
                        try {
                          const { fetchWithAuth } = await import('../services/apiClient');
                          const contact = await fetchWithAuth(`http://127.0.0.1:8000/api/bookings/${b.id}/contact_info/`);
                          alert(`Manager Contact Info:\nName: ${contact.name}\nPhone: ${contact.phone}\nEmail: ${contact.email}`);
                        } catch (err) {
                          alert('Could not retrieve contact info. Ensure booking is confirmed.');
                        }
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-1"
                    >
                      <span>📞</span> Contact Manager
                    </button>
                  ) : null}
                  <Link to={`/rooms/${room?.id}`} className="text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all">View</Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
