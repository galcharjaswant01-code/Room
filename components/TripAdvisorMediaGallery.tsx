import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import { resolveVideoUrl } from '../utils/videoResolver';

interface TripAdvisorMediaGalleryProps {
  mediaItems: MediaItem[];
  initialIndex?: number;
  propertyTitle: string;
  propertyLocation?: string;
  onClose: () => void;
}

export type MediaCategoryFilter = 'ALL' | 'Videos' | 'Rooms' | 'Amenities' | 'Dining' | 'Exterior';

const TripAdvisorMediaGallery: React.FC<TripAdvisorMediaGalleryProps> = ({
  mediaItems,
  initialIndex = 0,
  propertyTitle,
  propertyLocation,
  onClose
}) => {
  const [activeFilter, setActiveFilter] = useState<MediaCategoryFilter>('ALL');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Filter items based on active category tab
  const filteredItems = activeFilter === 'ALL'
    ? mediaItems
    : activeFilter === 'Videos'
      ? mediaItems.filter(item => item.type === 'video' || item.category === 'Videos')
      : mediaItems.filter(item => item.category === activeFilter);

  const currentItem = filteredItems[currentIndex] || filteredItems[0] || mediaItems[0];

  useEffect(() => {
    // Reset index to 0 when filter changes
    setCurrentIndex(0);
  }, [activeFilter]);

  useEffect(() => {
    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredItems.length]);

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const counts = {
    ALL: mediaItems.length,
    Videos: mediaItems.filter(i => i.type === 'video' || i.category === 'Videos').length,
    Rooms: mediaItems.filter(i => i.category === 'Rooms').length,
    Amenities: mediaItems.filter(i => i.category === 'Amenities').length,
    Dining: mediaItems.filter(i => i.category === 'Dining').length,
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col overflow-hidden animate-in fade-in duration-300 select-none">
      {/* Top Header HUD (TripAdvisor Style) */}
      <div className="p-4 md:p-6 bg-zinc-900 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
            🦉
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-zinc-950 px-2 py-0.5 rounded">TripAdvisor Verified</span>
              {propertyLocation && <span className="text-zinc-400 text-xs">📍 {propertyLocation}</span>}
            </div>
            <h2 className="text-white font-extrabold text-lg md:text-xl tracking-tight mt-0.5">{propertyTitle}</h2>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === 'ALL' ? 'bg-white text-zinc-900 shadow-md' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            All Media ({counts.ALL})
          </button>
          
          {counts.Videos > 0 && (
            <button
              onClick={() => setActiveFilter('Videos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === 'Videos' ? 'bg-indigo-600 text-white shadow-md' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>🎥</span> Videos ({counts.Videos})
            </button>
          )}

          {counts.Rooms > 0 && (
            <button
              onClick={() => setActiveFilter('Rooms')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === 'Rooms' ? 'bg-white text-zinc-900 shadow-md' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>🛏️</span> Rooms ({counts.Rooms})
            </button>
          )}

          {counts.Amenities > 0 && (
            <button
              onClick={() => setActiveFilter('Amenities')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === 'Amenities' ? 'bg-white text-zinc-900 shadow-md' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>🏊</span> Amenities ({counts.Amenities})
            </button>
          )}

          {counts.Dining > 0 && (
            <button
              onClick={() => setActiveFilter('Dining')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === 'Dining' ? 'bg-white text-zinc-900 shadow-md' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>🍽️</span> Dining ({counts.Dining})
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all border border-zinc-700"
          title="Close Lightbox"
        >
          ✕
        </button>
      </div>

      {/* Main Lightbox Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center group p-4 overflow-hidden">
        {/* Prev Arrow Button */}
        {filteredItems.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-6 z-30 w-14 h-14 rounded-full bg-zinc-900/80 hover:bg-white text-white hover:text-zinc-950 flex items-center justify-center text-xl backdrop-blur-md border border-zinc-700 transition-all active:scale-90"
            title="Previous"
          >
            ❮
          </button>
        )}

        {/* Media Container */}
        {currentItem?.type === 'video' ? (
          <div className="relative max-w-5xl w-full aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              src={resolveVideoUrl(currentItem.url)}
              autoPlay
              controls
              loop
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-md flex items-center gap-1.5">
              <span>🎥</span> HD Walkthrough Video
            </div>
          </div>
        ) : (
          <div className="relative max-w-6xl max-h-[75vh] flex items-center justify-center">
            <img
              src={currentItem?.url}
              alt={currentItem?.caption || propertyTitle}
              className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl transition-all duration-300"
            />
          </div>
        )}

        {/* Next Arrow Button */}
        {filteredItems.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-6 z-30 w-14 h-14 rounded-full bg-zinc-900/80 hover:bg-white text-white hover:text-zinc-950 flex items-center justify-center text-xl backdrop-blur-md border border-zinc-700 transition-all active:scale-90"
            title="Next"
          >
            ❯
          </button>
        )}

        {/* Caption Banner */}
        {currentItem?.caption && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md px-6 py-2.5 rounded-full border border-zinc-800 text-xs font-bold text-white text-center max-w-xl truncate z-20">
            {currentItem.caption}
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Filmstrip Carousel (TripAdvisor Style) */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center gap-3 overflow-x-auto no-scrollbar z-20">
        {filteredItems.map((item, idx) => (
          <button
            key={item.id || idx}
            onClick={() => setCurrentIndex(idx)}
            className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
              idx === currentIndex
                ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20'
                : 'border-transparent opacity-50 hover:opacity-100'
            }`}
          >
            <img
              src={item.thumbnail || item.url}
              alt={item.caption}
              className="w-full h-full object-cover"
            />
            {item.type === 'video' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">▶</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TripAdvisorMediaGallery;
