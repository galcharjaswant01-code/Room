import React from 'react';
import { useApp } from '../../store';
import { RoomStatus } from '../../types';
import toast from 'react-hot-toast';
import { Home, Plus, ExternalLink, Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MyPropertiesTabProps {
  onEdit?: (roomId: string) => void;
  onAddNew?: () => void;
}

const MyPropertiesTab: React.FC<MyPropertiesTabProps> = ({ onEdit, onAddNew }) => {
  const { rooms, updateRoomStatus } = useApp();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleToggleStatus = (roomId: string, currentStatus: RoomStatus) => {
    const nextStatus = currentStatus === RoomStatus.AVAILABLE 
      ? RoomStatus.BOOKED 
      : currentStatus === RoomStatus.BOOKED 
      ? RoomStatus.MAINTENANCE 
      : RoomStatus.AVAILABLE;
    updateRoomStatus(roomId, nextStatus);
    toast.success(`Property status set to ${nextStatus}`);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-200">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">My Properties</h2>
          <p className="text-zinc-500 font-medium mt-1">Manage all your active listings, availability statuses, and pricing.</p>
        </div>
        {onAddNew && (
          <button 
            type="button"
            onClick={onAddNew}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Property</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 text-[10px] font-extrabold uppercase text-zinc-400 tracking-widest border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">City / Area</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4">Monthly Rent</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {rooms.map(room => (
                <tr key={room.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={room.images[0] || 'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=400&q=80'} alt={room.title} className="w-16 h-12 rounded-xl object-cover border border-zinc-100 shrink-0" />
                      <div>
                        <p className="font-bold text-zinc-900 line-clamp-1">{room.title}</p>
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{room.location.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-zinc-600">
                    {room.city || 'Vadodara'}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      type="button"
                      onClick={() => handleToggleStatus(room.id, room.status)}
                      title="Click to toggle status"
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer hover:opacity-80 ${
                        room.status === RoomStatus.AVAILABLE 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : room.status === RoomStatus.BOOKED 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {room.status} ↺
                    </button>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900">
                    {formatCurrency(room.price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link 
                        to={`/rooms/${room.id}`}
                        className="text-zinc-500 hover:text-indigo-600 transition-colors p-1"
                        title="View Public Listing"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <button 
                        type="button"
                        onClick={() => onEdit && onEdit(room.id)} 
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1 uppercase tracking-wider"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyPropertiesTab;
