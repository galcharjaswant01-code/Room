import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { generateRoomDescription } from '../services/geminiService';
import { RoomStatus, BookingStatus, MediaItem } from '../types';
import TripAdvisorMediaGallery from '../components/TripAdvisorMediaGallery';
import RoomMap, { getRoomCoordinates } from '../components/RoomMap';

const RoomDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms, currentUser, addBooking, requireAuth } = useApp();
  const room = rooms.find(r => r.id === id);

  const [aiDesc, setAiDesc] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [bookingDates, setBookingDates] = useState({ start: '', end: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  
  // TripAdvisor Media Gallery Lightbox State
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  useEffect(() => {
    if (room) {
      setLoadingAi(true);
      generateRoomDescription(room.title, room.amenities).then(desc => {
        setAiDesc(desc);
        setLoadingAi(false);
      });
    }
  }, [room]);

  if (!room) return <div className="p-20 text-center text-zinc-400">Property not found.</div>;

  const defaultVideoUrl = "/room-images/room-video-1.mp4";

  // Order media gallery with primary room photo FIRST, followed by room angles, amenities, dining, and video
  const galleryItems: MediaItem[] = [
    { id: `med-${room.id}-main`, type: 'image', url: room.images[0], caption: `${room.title} Main Suite View`, category: 'Rooms' },
    { id: `med-${room.id}-2`, type: 'image', url: room.images[1] || room.images[0], caption: `Ensuite Living & Seating Area`, category: 'Rooms' },
    { id: `med-${room.id}-3`, type: 'image', url: room.images[2] || room.images[0], caption: `Private Terrace & City Perspective`, category: 'Rooms' },
    { id: `med-${room.id}-4`, type: 'image', url: room.images[3] || room.images[0], caption: `Heritage Courtyard Swimming Pool`, category: 'Amenities' },
    { id: `med-${room.id}-5`, type: 'image', url: room.images[4] || room.images[0], caption: `Rooftop Restaurant & Bar`, category: 'Dining' },
    { id: `med-${room.id}-vid`, type: 'video', url: room.videoUrl || defaultVideoUrl, thumbnail: room.images[0], caption: `${room.title} HD Video Walkthrough`, category: 'Videos' },
  ];

  const videoIndex = galleryItems.findIndex(i => i.type === 'video');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(async () => {
      const diffTime = Math.abs(new Date(bookingDates.end).getTime() - new Date(bookingDates.start).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      await addBooking({
        roomId: room.id,
        clientId: currentUser!.id,
        startDate: bookingDates.start,
        endDate: bookingDates.end,
        status: BookingStatus.PENDING,
        totalPrice: diffDays * room.price
      });
      setShowSuccess(true);
    });
  };

  const openGallery = (index: number = 0) => {
    setSelectedMediaIndex(index);
    setShowGalleryModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* TripAdvisor Interactive Fullscreen Media Lightbox */}
      {showGalleryModal && (
        <TripAdvisorMediaGallery
          mediaItems={galleryItems}
          initialIndex={selectedMediaIndex}
          propertyTitle={room.title}
          propertyLocation={room.location.address}
          onClose={() => setShowGalleryModal(false)}
        />
      )}

      {/* Header Info Banner */}
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-indigo-600 mb-6 flex items-center gap-2">
          ← Back to Search
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                <span>🦉</span> TripAdvisor Heritage Choice
              </span>
              <span className="text-xs font-bold text-zinc-400">#1 Boutique Stay in {room.location.address.split(',')[2] || 'City'}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">{room.title}</h1>
            <p className="text-zinc-500 font-medium flex items-center gap-2 mt-1.5 mb-3">
              📍 {room.location.address} • <span className="text-indigo-600 font-bold">{room.category}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${room.location.lat},${room.location.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1 transition-all hover:bg-indigo-100"
              >
                🗺️ View on Google Maps
              </a>
              <a 
                href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(room.title + ' ' + room.location.address + ' real room interior')}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1 transition-all hover:bg-blue-100"
              >
                📸 Real Photos on Google
              </a>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${room.location.lat},${room.location.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-bold text-zinc-700 hover:text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 flex items-center gap-1 transition-all hover:bg-zinc-200"
              >
                📍 Get Directions
              </a>
              <a 
                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${room.location.lat},${room.location.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 transition-all hover:bg-emerald-100"
              >
                🧭 360° Street View
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-bold">
            <button
              onClick={() => openGallery(videoIndex >= 0 ? videoIndex : 0)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <span>🎥</span>
              <span>Watch Video Tour</span>
            </button>
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <span className="text-amber-500 text-base">★</span>
              <span className="text-zinc-900 font-black">{room.rating}</span>
              <span className="text-zinc-400 text-xs font-normal">({room.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* TripAdvisor Hero Collage Grid (Main Photo First on Left, Video & Angles on Bottom Right) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-12 h-[460px] rounded-3xl overflow-hidden shadow-xl border border-zinc-200/80 bg-zinc-900 relative">
        {/* Main Featured First Photo (Left 2 columns) */}
        <div 
          onClick={() => openGallery(0)}
          className="md:col-span-2 relative h-full cursor-pointer group overflow-hidden"
        >
          <img 
            src={room.images[0]} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Main Featured Room Photo" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-8 text-white z-10">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1">Featured Room Image</span>
            <h3 className="text-2xl font-black">{room.title}</h3>
          </div>
          <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-md z-20 flex items-center gap-1.5">
            <span>📷</span> Main Photo
          </span>
        </div>

        {/* Right 2 columns (3 grid photo thumbnails + 1 Video Card at bottom right) */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3 h-full">
          {/* Photo 2 */}
          <div 
            onClick={() => openGallery(1)}
            className="relative h-full overflow-hidden cursor-pointer group rounded-xl bg-zinc-950"
          >
            <img src={galleryItems[1]?.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Room Angle 1" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
          </div>

          {/* Photo 3 */}
          <div 
            onClick={() => openGallery(2)}
            className="relative h-full overflow-hidden cursor-pointer group rounded-xl bg-zinc-950"
          >
            <img src={galleryItems[2]?.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Room Angle 2" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
          </div>

          {/* Photo 4 */}
          <div 
            onClick={() => openGallery(3)}
            className="relative h-full overflow-hidden cursor-pointer group rounded-xl bg-zinc-950"
          >
            <img src={galleryItems[3]?.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Amenity Photo" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
          </div>

          {/* Video Walkthrough Card (Bottom Right Side) */}
          <div 
            onClick={() => openGallery(videoIndex >= 0 ? videoIndex : 0)}
            className="relative h-full overflow-hidden cursor-pointer group rounded-xl bg-zinc-950 border border-indigo-500/30"
          >
            <img src={room.images[0]} className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105" alt="Video Tour Preview" />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-black/60 to-black/30 flex flex-col items-center justify-center p-3 text-center z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm shadow-xl group-hover:scale-110 transition-transform mb-1 border border-indigo-400/40">
                ▶
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Room Video Tour</span>
              <span className="text-[9px] text-zinc-400 font-bold">Click to Play HD Video</span>
            </div>
            <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm z-20">
              🎥 Video
            </span>
          </div>
        </div>

        {/* Floating TripAdvisor All Photos & Videos Badge */}
        <button
          onClick={() => openGallery(0)}
          className="absolute bottom-5 right-5 z-20 px-5 py-2.5 bg-zinc-950/90 hover:bg-white hover:text-zinc-950 text-white backdrop-blur-md rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all border border-white/20 flex items-center gap-2 active:scale-95"
        >
          <span>📷</span>
          <span>View All Photos ({galleryItems.length})</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1">
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">About this stay</h2>
            <p className="text-zinc-600 leading-relaxed max-w-2xl mb-8">{room.description}</p>
            
            <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100">
               <div className="flex items-center gap-2 mb-4">
                 <span className="text-indigo-600 text-sm">✨</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">AI Concierge Insights</span>
               </div>
               <p className="text-zinc-900 font-medium italic leading-relaxed">
                 {loadingAi ? "Generating insights..." : `"${aiDesc}"`}
               </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-bold mb-8">What this place offers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {room.amenities.map(a => (
                <div key={a} className="flex items-center gap-3 text-zinc-600">
                  <span className="text-indigo-600 font-bold">✓</span>
                  <span className="text-sm font-medium">{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location on Map */}
          {getRoomCoordinates(room) && (
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-3">Where you'll be</h2>
              <p className="text-xs font-medium text-zinc-500 mb-6 flex items-center gap-1.5">
                <span>📍</span>
                <span>{room.location?.address || room.address}</span>
              </p>
              <div className="rounded-3xl overflow-hidden border border-zinc-200">
                <RoomMap
                  rooms={[room]}
                  center={getRoomCoordinates(room)!}
                  zoom={15}
                  height="280px"
                  interactive={true}
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-[420px]">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-200/20 sticky top-28">
            <div className="flex items-baseline justify-between mb-8">
              <span className="text-3xl font-bold tracking-tight">{formatPrice(room.price)} <span className="text-sm text-zinc-400 font-medium">night</span></span>
              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${room.status === RoomStatus.AVAILABLE ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {room.status}
              </span>
            </div>

            {room.status === RoomStatus.AVAILABLE ? (
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="grid grid-cols-2 gap-px bg-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden shadow-inner">
                  <div className="bg-white p-4">
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Check-in</label>
                    <input type="date" required className="w-full text-xs font-bold outline-none" value={bookingDates.start} onChange={e => setBookingDates(p => ({...p, start: e.target.value}))} />
                  </div>
                  <div className="bg-white p-4">
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Check-out</label>
                    <input type="date" required className="w-full text-xs font-bold outline-none" value={bookingDates.end} onChange={e => setBookingDates(p => ({...p, end: e.target.value}))} />
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/10">
                  Reserve this stay
                </button>
                <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">No immediate charge</p>
              </form>
            ) : (
              <div className="text-center py-8 px-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                 <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Fully Booked</p>
              </div>
            )}

            {showSuccess && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 animate-in fade-in slide-in-from-top-4">
                <p className="text-xs font-bold leading-relaxed">Waiting for Owner Approval. Booking is pending.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
