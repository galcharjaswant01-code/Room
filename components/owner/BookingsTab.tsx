import React from 'react';
import { useApp } from '../../store';
import { BookingStatus } from '../../types';
import { mockBookings } from '../../mockData';
import toast from 'react-hot-toast';
import { Calendar, User, Clock, CheckCircle2, XCircle, Mail, MapPin } from 'lucide-react';

const BookingsTab: React.FC = () => {
  const { bookings, rooms, updateBookingStatus } = useApp();

  const displayedBookings = bookings.length > 0 ? bookings : mockBookings;

  const handleStatusChange = (bookingId: string, status: BookingStatus) => {
    updateBookingStatus(bookingId, status);
    toast.success(`Booking ${status === BookingStatus.APPROVED ? 'Approved' : 'Rejected'}`);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-200">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Booking Requests</h2>
          <p className="text-zinc-500 font-medium mt-1">Review, approve, or manage booking requests for your properties.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-white border border-zinc-200 px-3 py-1.5 rounded-xl shadow-sm">
            {displayedBookings.length} Total Requests
          </span>
        </div>
      </div>

      {displayedBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            📅
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">No Booking Requests Yet</h3>
          <p className="text-zinc-500 text-sm mb-6">When travelers and tenants book your stays, their stay dates and requests will appear here for your review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedBookings.map(booking => {
            const room = rooms.find(r => r.id === booking.roomId) || rooms[0];
            const isPending = booking.status === BookingStatus.PENDING || (booking.status as any) === 'pending';
            const isApproved = booking.status === BookingStatus.APPROVED || (booking.status as any) === 'CONFIRMED' || (booking.status as any) === 'confirmed';

            return (
              <div key={booking.id} className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between hover:border-zinc-300 transition-colors">
                <div className="flex items-center gap-5 w-full lg:w-auto">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                    {room && <img src={room.images[0]} alt="Room" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                        isPending 
                          ? 'bg-amber-100 text-amber-700' 
                          : isApproved 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">#{booking.id}</span>
                    </div>

                    <h3 className="font-bold text-zinc-900 text-base">{room?.title || 'Comfortable Stay Unit'}</h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mt-2 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-indigo-600" />
                        <span>{booking.startDate} → {booking.endDate}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User size={13} className="text-zinc-400" />
                        <span>Tenant: {booking.clientId || 'Registered Guest'}</span>
                      </span>
                      <span className="font-bold text-emerald-600">
                        ₹{(booking.totalPrice || room?.price || 12000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                  {isPending ? (
                    <>
                      <button 
                        type="button"
                        onClick={() => handleStatusChange(booking.id, BookingStatus.REJECTED)} 
                        className="flex-1 lg:flex-none px-5 py-2.5 border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={15} />
                        <span>Decline</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleStatusChange(booking.id, BookingStatus.APPROVED)} 
                        className="flex-1 lg:flex-none px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={15} />
                        <span>Accept Stay</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                        <CheckCircle2 size={14} /> Confirmed
                      </span>
                      <button 
                        type="button"
                        onClick={() => toast.success(`Contact details: guest@stayhub.com | +91 9876543210`)}
                        className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Mail size={13} />
                        <span>Contact Guest</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingsTab;
