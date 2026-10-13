import React, { useState } from 'react';
import { useApp } from '../store';
import { BookingStatus } from '../types';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, MapPin, CheckCircle2, Clock, Mail, Phone, ExternalLink, ShieldCheck, XCircle } from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const { bookings, rooms, currentUser, updateBookingStatus } = useApp();
  const [selectedContactBooking, setSelectedContactBooking] = useState<any | null>(null);

  // Match bookings for the logged-in guest
  const myBookings = bookings.filter(b => {
    if (!currentUser) return false;
    if (b.clientId === currentUser.id) return true;
    if (currentUser.email && (b.clientId === currentUser.email || b.clientId.includes(currentUser.email.split('@')[0]))) return true;
    // Fallback: If user is Guest and this was the latest booking
    if (currentUser.role === 'GUEST' && b.clientId?.startsWith('guest_')) return true;
    return false;
  });

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking request?')) {
      updateBookingStatus(bookingId, BookingStatus.CANCELLED);
      toast('Booking request cancelled.', { icon: 'ℹ️' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              👤 Guest Portal
            </span>
            <span className="text-xs text-zinc-400 font-mono">ID: {currentUser?.id}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 mt-2">My Room Bookings</h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Track your room reservations, owner approvals, and confirmed stays.
          </p>
        </div>

        <Link 
          to="/rooms" 
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95 self-start sm:self-auto"
        >
          <span>🔍 Explore More Rooms</span>
        </Link>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {myBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-16 text-center shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🛏️
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">No Room Bookings Yet</h3>
            <p className="text-zinc-500 text-xs leading-relaxed mb-6">
              Browse our verified rooms, choose your check-in dates, and reserve your stay. The property owner will review and confirm your booking.
            </p>
            <Link 
              to="/rooms" 
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all inline-block shadow-md shadow-indigo-600/20"
            >
              Explore Available Rooms
            </Link>
          </div>
        ) : (
          myBookings.map(b => {
            const room = rooms.find(r => r.id === b.roomId) || rooms[0];
            const isApproved = b.status === BookingStatus.APPROVED || (b.status as any) === 'confirmed' || (b.status as any) === 'CONFIRMED';
            const isPending = b.status === BookingStatus.PENDING || (b.status as any) === 'pending';
            const isCancelled = b.status === BookingStatus.CANCELLED || b.status === BookingStatus.REJECTED;

            return (
              <div 
                key={b.id} 
                className={`bg-white rounded-3xl border overflow-hidden transition-all shadow-xs ${
                  isApproved 
                    ? 'border-emerald-300 ring-2 ring-emerald-100/80 shadow-emerald-500/5' 
                    : isPending
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-zinc-200 opacity-80'
                }`}
              >
                {/* Status Announcement Banner */}
                {isApproved && (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-emerald-200" />
                      <span>🎉 Booking Accepted & Confirmed by Owner! Your stay is locked.</span>
                    </div>
                    <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                      Confirmed Stay
                    </span>
                  </div>
                )}

                {isPending && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-amber-200 animate-pulse" />
                      <span>⏳ Waiting for Owner Acceptance — Property owner has been notified.</span>
                    </div>
                    <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                      Pending
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  {/* Room Thumbnail & Info */}
                  <div className="flex items-start sm:items-center gap-5 w-full md:w-auto">
                    <div className="w-24 h-24 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                      {room && <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isApproved 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : isPending 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {isApproved ? '✅ Accepted by Owner' : isPending ? '⏳ Awaiting Approval' : b.status}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">#{b.id}</span>
                      </div>

                      <h3 className="font-extrabold text-zinc-900 text-lg leading-snug">
                        {room?.title || 'Comfortable Rental Unit'}
                      </h3>

                      {room?.location?.address && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1 font-medium">
                          <MapPin size={13} className="text-zinc-400 shrink-0" />
                          <span className="truncate max-w-sm">{room.location.address}, {room.location.city}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 mt-2 font-medium">
                        <span className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-100">
                          <Calendar size={13} className="text-indigo-600" />
                          <span>{b.startDate} → {b.endDate}</span>
                        </span>
                        <span className="font-black text-emerald-600 text-sm">
                          ₹{(b.totalPrice || room?.price || 0).toLocaleString()} Total
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100">
                    {isPending && (
                      <button 
                        type="button"
                        onClick={() => handleCancelBooking(b.id)}
                        className="px-4 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle size={14} />
                        <span>Cancel Request</span>
                      </button>
                    )}

                    {isApproved && (
                      <button
                        type="button"
                        onClick={() => setSelectedContactBooking({ ...b, room })}
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Phone size={14} />
                        <span>Contact Owner</span>
                      </button>
                    )}

                    <Link 
                      to={`/rooms/${b.roomId}`} 
                      className="px-4 py-2 bg-zinc-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>View Stay</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Contact Owner Modal */}
      {selectedContactBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-zinc-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏢</span>
                <h3 className="text-base font-extrabold text-zinc-900">Property Owner Details</h3>
              </div>
              <button 
                onClick={() => setSelectedContactBooking(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500 mb-4">
              Your booking for <strong className="text-zinc-800">{selectedContactBooking.room?.title}</strong> is confirmed. You can coordinate your check-in with the property owner:
            </p>

            <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 mb-6 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-bold">Property Owner:</span>
                <span className="font-extrabold text-zinc-900">Verified Host</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-bold">Host Support Email:</span>
                <span className="font-extrabold text-indigo-600">owner-support@stayhub.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-bold">Host Phone Helpline:</span>
                <span className="font-extrabold text-zinc-900">+91 98765 43210</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-bold">Check-in Status:</span>
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready for Arrival
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                toast.success('Check-in details copied!');
                setSelectedContactBooking(null);
              }}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
