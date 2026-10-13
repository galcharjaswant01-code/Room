import React, { useState, useRef, useEffect } from 'react';
import { resolveVideoUrl } from '../utils/videoResolver';

interface VideoTourModalProps {
  videoUrl: string;
  title: string;
  roomAddress?: string;
  onClose: () => void;
}

const VideoTourModal: React.FC<VideoTourModalProps> = ({ videoUrl, title, roomAddress, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const resolvedUrl = resolveVideoUrl(videoUrl);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setProgress((current / dur) * 100 || 0);
      setCurrentTime(formatTime(current));
      setDuration(formatTime(dur));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const seekTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  useEffect(() => {
    // Keyboard shortcuts (Escape to close, Space to play/pause)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header HUD */}
        <div className="p-6 md:p-8 bg-gradient-to-b from-zinc-950/80 to-transparent flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl">
              🎥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest">HD Walkthrough</span>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Preview
                </span>
              </div>
              <h3 className="text-white font-black text-xl md:text-2xl tracking-tight mt-1">{title}</h3>
              {roomAddress && <p className="text-zinc-400 text-xs font-medium mt-0.5">{roomAddress}</p>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all border border-white/10 shadow-xl active:scale-95"
            title="Close Video Tour"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Screen Area */}
        <div className="relative flex-1 bg-black aspect-video flex items-center justify-center group overflow-hidden">
          <video
            ref={videoRef}
            src={resolvedUrl}
            autoPlay
            loop
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Big Play/Pause Overlay Indicator */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute w-20 h-20 rounded-full bg-indigo-600/90 text-white flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-all z-10"
            >
              ▶
            </button>
          )}

          {/* Custom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-3 transition-opacity opacity-100 group-hover:opacity-100 z-20">
            {/* Seek bar */}
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/20 rounded-lg outline-none"
            />

            <div className="flex items-center justify-between text-white text-xs font-bold">
              <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="hover:text-indigo-400 text-lg transition-colors">
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={toggleMute} className="hover:text-indigo-400 text-lg transition-colors">
                  {isMuted ? '🔇' : '🔊'}
                </button>
                <span className="text-zinc-400 text-[11px] font-mono">
                  {currentTime} / {duration}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md text-zinc-300">
                  1080p 60fps
                </span>
                <button onClick={toggleFullScreen} className="hover:text-indigo-400 text-base transition-colors" title="Fullscreen">
                  ⛶
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-8 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-400">
          <p>💡 Tip: Watch room video tours to inspect floor plans, lighting, and amenities before booking.</p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
          >
            Done Viewing
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoTourModal;
