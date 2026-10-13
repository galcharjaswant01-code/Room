import React, { useState } from 'react';
import { Room, RoomStatus } from '../types';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import VideoTourModal from './VideoTourModal';

const RoomCard: React.FC<{
  room: Room;
  isSelected?: boolean;
  onCardClick?: () => void;
  onCardMouseEnter?: () => void;
}> = ({ room, isSelected, onCardClick, onCardMouseEnter }) => {
  const { wishlist, toggleWishlist, requireAuth } = useApp();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isWishlisted = wishlist.includes(room.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const fallbackImg = "https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=800&q=80";
  const defaultVideoUrl = "/room-images/room-video-1.mp4";

  const isNew = (() => {
    if (!room.createdAt) return false;
    const createdDate = new Date(room.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  })();

  return (
    <div
      className={`group flex flex-col p-1.5 rounded-3xl transition-all duration-300 ${
        isSelected ? 'ring-2 ring-indigo-600 bg-indigo-50/30 shadow-lg' : ''
      }`}
      onClick={onCardClick}
      onMouseEnter={onCardMouseEnter}
    >
      {showVideoModal && (
        <VideoTourModal 
          videoUrl={room.videoUrl || defaultVideoUrl}
          title={room.title}
          roomAddress={room.location.address}
          onClose={() => setShowVideoModal(false)}
        />
      )}

      <div className="relative aspect-[1/1] overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-100 transition-all hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 duration-300">
        <Link to={`/rooms/${room.id}`} className="block w-full h-full relative">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 bg-zinc-200 animate-pulse" />
          )}
          <img 
            src={imgError ? fallbackImg : room.images[0]} 
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} 
            alt={room.title} 
          />
        </Link>
        
        <button 
          onClick={(e) => { e.preventDefault(); requireAuth(() => toggleWishlist(room.id)); }}
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm z-10 border ${isWishlisted ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/60 text-zinc-900 border-white/20 hover:bg-white'}`}
        >
          <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </button>

        <button 
          onClick={(e) => { e.preventDefault(); setShowVideoModal(true); }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white shadow-xl transition-all hover:bg-indigo-700 hover:scale-105 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 z-10 flex items-center gap-2 border border-indigo-500/30"
          title="Play HD Room Video Walkthrough"
        >
          <span className="text-xs">🎥</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Play Video Tour</span>
        </button>

        <div className="absolute top-4 left-4 flex items-center gap-2">
          {isNew && (
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm bg-blue-600 text-white">
              NEW
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${room.status === RoomStatus.AVAILABLE ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white'}`}>
            {room.status}
          </span>
          <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <span>📷</span> {room.mediaGallery?.length || room.images.length || 5}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-start gap-2">
          <Link to={`/rooms/${room.id}`} className="hover:opacity-70 transition-opacity flex-1">
            <h3 className="font-bold text-zinc-900 text-base line-clamp-1">{room.title}</h3>
          </Link>
          <span className="text-amber-500 text-sm font-bold flex items-center gap-1">★ {room.rating}</span>
        </div>
        <p className="text-xs text-zinc-400 font-medium mt-0.5">{room.location.address}</p>
        <div className="mt-4 flex flex-col gap-2 border-t border-zinc-50 pt-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-zinc-900 text-sm">{formatPrice(room.price)} <span className="font-medium text-zinc-400 text-[10px] uppercase">/ night</span></p>
            <span className="text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest bg-zinc-100 text-zinc-500">
              {room.category}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-zinc-100">
             <div className="flex items-center gap-1.5 flex-wrap">
               <a 
                 href={`https://www.google.com/maps/search/?api=1&query=${room.location.lat},${room.location.lng}`}
                 target="_blank" rel="noopener noreferrer"
                 onClick={(e) => e.stopPropagation()}
                 className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
                 title="Open in Google Maps"
               >
                 🗺️ Map
               </a>
               <a 
                 href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${room.title} ${room.location.address} real room interior`)}`}
                 target="_blank" rel="noopener noreferrer"
                 onClick={(e) => e.stopPropagation()}
                 className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                 title="View real photos of this property on Google"
               >
                 📸 Real Photos
               </a>
             </div>
             {(room as any).distance !== undefined && (
               <span className="text-[10px] font-bold text-zinc-500 whitespace-nowrap">
                 {((room as any).distance).toFixed(1)} km
               </span>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
