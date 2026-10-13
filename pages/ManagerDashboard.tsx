
import React from 'react';
import { useApp } from '../store';
import { BookingStatus, RoomStatus } from '../types';

const ManagerDashboard: React.FC = () => {
  const { bookings, rooms, updateBookingStatus, updateRoomStatus } = useApp();

  const pendingBookings = bookings.filter(b => b.status === BookingStatus.PENDING);

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING: return 'bg-amber-100 text-amber-800';
      case BookingStatus.APPROVED: return 'bg-emerald-100 text-emerald-800';
      case BookingStatus.REJECTED: return 'bg-zinc-800 text-white'; // Professional neutral
      case BookingStatus.CANCELLED: return 'bg-zinc-100 text-zinc-500'; // Professional neutral
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Operations Center</h1>
          <p className="text-zinc-500">Managing curated boutique inventory across India.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-5 py-3 bg-white border border-zinc-100 rounded-2xl shadow-sm">
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Incoming</p>
             <p className="text-xl font-bold">{pendingBookings.length} Requests</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-zinc-50">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Action Queue</h2>
            </div>
            <div className="divide-y divide-zinc-50">
              {pendingBookings.length === 0 ? (
                <div className="p-20 text-center text-zinc-400">
                  <p className="text-sm font-bold opacity-40 italic">Queue is currently clear.</p>
                </div>
              ) : (
                pendingBookings.map(b => {
                  const room = rooms.find(r => r.id === b.roomId);
                  return (
                    <div key={b.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={room?.images[0]} className="w-16 h-16 rounded-xl object-cover" alt="Room" />
                        <div>
                          <h3 className="font-bold text-zinc-900">{room?.title}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">{b.startDate} — {b.endDate}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => updateBookingStatus(b.id, BookingStatus.APPROVED)}
                          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateBookingStatus(b.id, BookingStatus.REJECTED)}
                          className="bg-zinc-100 text-zinc-500 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-zinc-50">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Past Decisions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Property</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-sm">
                  {bookings.filter(b => b.status !== BookingStatus.PENDING).map(b => {
                    const room = rooms.find(r => r.id === b.roomId);
                    return (
                      <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-8 py-5 font-bold">{room?.title}</td>
                        <td className="px-8 py-5">
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${getStatusStyle(b.status)}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right font-bold text-indigo-600">₹{b.totalPrice.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-2xl shadow-zinc-950/20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8">Stock Overview</h2>
            <div className="space-y-6">
              {rooms.slice(0, 10).map(room => (
                <div key={room.id} className="flex items-center justify-between group">
                  <div>
                    <p className="text-xs font-bold">{room.title.split('at')[0]}</p>
                    {/* Fixed: Extracting city from address string since Room object does not have city property directly */}
                    <p className="text-[10px] opacity-40 font-medium uppercase tracking-widest mt-0.5">{room.location.address.split(',')[2]?.trim() || "Urban"}</p>
                  </div>
                  <select 
                    value={room.status}
                    onChange={(e) => updateRoomStatus(room.id, e.target.value as RoomStatus)}
                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-white/20 outline-none transition-all cursor-pointer ${
                      room.status === RoomStatus.AVAILABLE ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    <option value={RoomStatus.AVAILABLE}>Open</option>
                    <option value={RoomStatus.BOOKED}>Full</option>
                  </select>
                </div>
              ))}
              <div className="pt-4 border-t border-white/5 text-center">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Showing Top 10 • Total 100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
