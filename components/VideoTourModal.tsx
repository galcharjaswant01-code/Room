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
  const [isMuted, setIsMuted] = useState(true); // Default muted guarantees autoplay on all browsers
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [currentSrc, setCurrentSrc] = useState(() => resolveVideoUrl(videoUrl));

  useEffect(() => {
    setCurrentSrc(resolveVideoUrl(videoUrl));
    setIsLoading(true);
  }, [videoUrl]);

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
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play();
            setIsPlaying(true);
          }
        });
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
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
    if (videoRef.current && videoRef.current.duration) {
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

  const handleVideoError = () => {
    // If current source failed, fallback to guaranteed bundled video
    if (currentSrc !== '/room-videos/12684293_1920_1080_60fps.mp4') {
      setCurrentSrc('/room-videos/12684293_1920_1080_60fps.mp4');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Attempt play on mount
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => setIsPlaying(false));
        }
      });
    }
  }, [currentSrc]);

  useEffect(() => {
    // Keyboard shortcuts (Escape to close, Space to play/pause, M to mute/unmute)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted]);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header HUD */}
        <div className="p-5 md:p-6 bg-gradient-to-b from-zinc-950/90 to-transparent flex items-center justify-between z-20 border-b border-zinc-800/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl shadow-lg">
              🎥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                  HD Walkthrough Video
                </span>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Verified Room Tour
                </span>
              </div>
              <h3 className="text-white font-black text-lg md:text-xl tracking-tight mt-1 truncate max-w-md">{title}</h3>
              {roomAddress && <p className="text-zinc-400 text-xs font-medium mt-0.5 truncate max-w-lg">{roomAddress}</p>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all border border-white/10 shadow-xl active:scale-95"
            title="Close Video Tour"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Screen Viewport */}
        <div className="relative flex-1 bg-black aspect-video flex items-center justify-center group overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 z-10">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}

          <video
            ref={videoRef}
            src={currentSrc}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            onCanPlay={() => setIsLoading(false)}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
            onTimeUpdate={handleTimeUpdate}
            onError={handleVideoError}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Big Play/Pause Overlay Indicator */}
          {!isPlaying && !isLoading && (
            <button
              onClick={togglePlay}
              className="absolute w-20 h-20 rounded-full bg-indigo-600/90 text-white flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-all z-10 border border-indigo-400/40"
            >
              ▶
            </button>
          )}

          {/* Tap to Unmute Banner Badge */}
          {isMuted && isPlaying && !isLoading && (
            <button
              onClick={toggleMute}
              className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-indigo-600 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>🔇</span>
              <span>Tap to Unmute</span>
            </button>
          )}

          {/* Custom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-2.5 transition-opacity opacity-100 group-hover:opacity-100 z-20">
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
                <button onClick={togglePlay} className="hover:text-indigo-400 text-base transition-colors" title={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={toggleMute} className="hover:text-indigo-400 text-base transition-colors" title={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted ? '🔇' : '🔊'}
                </button>
                <span className="text-zinc-400 text-[11px] font-mono">
                  {currentTime} / {duration}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded-md text-zinc-300">
                  1080p HD
                </span>
                <button onClick={toggleFullScreen} className="hover:text-indigo-400 text-base transition-colors" title="Fullscreen">
                  ⛶
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-400">
          <p className="truncate">💡 Tip: Room walkthrough videos show true space, window ventilation, and amenities.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex-shrink-0 ml-4"
          >
            Close Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoTourModal;
