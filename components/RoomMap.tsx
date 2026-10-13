import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Room } from '../types';
import { Navigation, MapPin, Search } from 'lucide-react';
import { getCurrentBrowserLocation, reverseGeocodeLocation } from '../services/locationService';

export interface RoomMapProps {
  rooms?: Room[];
  selectedRoomId?: string | null;
  onSelectRoom?: (room: Room | null) => void;
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  userLocation?: [number, number] | null;
  onLocationFound?: (lat: number, lng: number, addressName?: string) => void;
  className?: string;
  height?: string;
  interactive?: boolean;
  selectable?: boolean;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  onSearchArea?: (lat: number, lng: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

// Helper to extract valid coordinates from room
export const getRoomCoordinates = (room: Room): [number, number] | null => {
  const lat = room.location?.lat ?? room.latitude;
  const lng = room.location?.lng ?? room.longitude;
  if (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat !== 0 &&
    lng !== 0
  ) {
    return [lat, lng];
  }
  return null;
};

const RoomMap: React.FC<RoomMapProps> = ({
  rooms = [],
  selectedRoomId,
  onSelectRoom,
  center = [22.3072, 73.1812], // Vadodara default if not provided
  zoom = 13,
  userLocation,
  onLocationFound,
  className = '',
  height = '420px',
  interactive = true,
  selectable = false,
  onLocationSelect,
  onSearchArea,
  onMapClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const selectableMarkerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [currentMapCenter, setCurrentMapCenter] = useState<[number, number]>(center);
  const lastSearchedCenterRef = useRef<[number, number]>(center);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: interactive,
      dragging: interactive,
    });

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Trigger invalidateSize to ensure tiles render immediately
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    // Track map pan to show "Search This Area"
    map.on('moveend', () => {
      const newCenter = map.getCenter();
      setCurrentMapCenter([newCenter.lat, newCenter.lng]);
      const last = lastSearchedCenterRef.current;
      const distDeg = Math.sqrt(
        Math.pow(newCenter.lat - last[0], 2) + Math.pow(newCenter.lng - last[1], 2)
      );
      if (distDeg > 0.015 && onSearchArea) {
        setShowSearchThisArea(true);
      }
    });

    // Handle map click
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (selectable) {
        updateSelectablePin(lat, lng);
        if (onLocationSelect) {
          const address = await reverseGeocodeLocation(lat, lng);
          onLocationSelect(lat, lng, address);
        }
      } else if (onMapClick) {
        onMapClick(lat, lng);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update selectable marker when selectable mode is active
  const updateSelectablePin = (lat: number, lng: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectableMarkerRef.current) {
      selectableMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const pinIcon = L.divIcon({
        className: 'custom-pin-icon',
        html: `
          <div style="transform: translate(-50%, -100%);">
            <div style="background-color: #4f46e5; color: white; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.4); border: 2px solid white;">
              <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        if (onLocationSelect) {
          const address = await reverseGeocodeLocation(pos.lat, pos.lng);
          onLocationSelect(pos.lat, pos.lng, address);
        }
      });
      selectableMarkerRef.current = marker;
    }
    map.panTo([lat, lng], { animate: true });
  };

  // Center or zoom update
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (center && center[0] && center[1]) {
      const current = map.getCenter();
      if (
        Math.abs(current.lat - center[0]) > 0.0001 ||
        Math.abs(current.lng - center[1]) > 0.0001
      ) {
        map.flyTo(center, zoom, { duration: 1.0 });
        lastSearchedCenterRef.current = center;
        setShowSearchThisArea(false);
      }
    }
  }, [center[0], center[1], zoom]);

  // User location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation && userLocation[0] && userLocation[1]) {
      const icon = L.divIcon({
        className: 'user-loc-pulse',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="position: absolute; inset: 0; background-color: #3b82f6; opacity: 0.35; border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; inset: 4px; background-color: #2563eb; border: 2.5px solid white; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation);
      } else {
        userMarkerRef.current = L.marker(userLocation, { icon }).addTo(map);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation]);

  // Update Room Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing room markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const bounds: L.LatLngExpression[] = [];

    rooms.forEach((room) => {
      const coords = getRoomCoordinates(room);
      if (!coords) return; // Safely skip rooms without coordinates

      bounds.push(coords);

      const isSelected = room.id === selectedRoomId;
      const formattedPrice = room.price ? `₹${room.price.toLocaleString('en-IN')}` : '₹-';

      // Sleek StayHub pill price marker
      const markerHtml = `
        <div class="stayhub-marker ${isSelected ? 'active' : ''}" style="
          background-color: ${isSelected ? '#18181b' : '#4f46e5'};
          color: white;
          font-weight: 800;
          font-size: 11px;
          padding: 5px 11px;
          border-radius: 9999px;
          border: 2px solid white;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
          white-space: nowrap;
          cursor: pointer;
          transform: translate(-50%, -50%) ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 5px;
        ">
          <span>🏠</span>
          <span>${formattedPrice}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'stayhub-room-pin',
        html: markerHtml,
        iconSize: [84, 30],
        iconAnchor: [42, 15],
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);

      // Popup with room details & "View Room" button + Google Links
      const coverImage =
        room.images && room.images.length > 0
          ? room.images[0]
          : 'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=800&q=80';

      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;
      const googleImagesUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
        `${room.title} ${room.location?.address || room.city || ''} real room interior`
      )}`;

      const popupContent = `
        <div style="font-family: inherit; width: 230px; padding: 3px;">
          <div style="position: relative; width: 100%; height: 120px; border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
            <img src="${coverImage}" style="width: 100%; height: 100%; object-fit: cover;" alt="${room.title}" />
            <span style="position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.7); color: white; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 6px; text-transform: uppercase;">
              ${room.status || 'AVAILABLE'}
            </span>
            <span style="position: absolute; top: 6px; right: 6px; background: #4f46e5; color: white; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px;">
              ★ ${room.rating || 4.8}
            </span>
          </div>
          <h4 style="font-weight: 800; font-size: 13px; color: #18181b; margin: 0 0 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${room.title}
          </h4>
          <p style="font-size: 11px; color: #71717a; margin: 0 0 8px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            📍 ${room.location?.address || room.address || 'Property Location'}
          </p>
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 900; font-size: 14px; color: #4f46e5;">
              ${formattedPrice}
              <span style="font-size: 10px; color: #a1a1aa; font-weight: 600;">/ night</span>
            </span>
            <span style="font-size: 10px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">
              Verified Photos ✓
            </span>
          </div>
          <a href="#/rooms/${room.id}" style="display: block; text-align: center; width: 100%; padding: 8px 0; background-color: #4f46e5; color: white; text-decoration: none; font-size: 11px; font-weight: 800; border-radius: 8px; box-shadow: 0 4px 8px rgba(79, 70, 229, 0.25); margin-bottom: 6px;">
            View Room Details →
          </a>
          <div style="display: flex; gap: 4px;">
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; padding: 5px 0; background: #f4f4f5; color: #3f3f46; text-decoration: none; font-size: 10px; font-weight: 700; border-radius: 6px;">
              🗺️ Google Maps
            </a>
            <a href="${googleImagesUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; padding: 5px 0; background: #eff6ff; color: #2563eb; text-decoration: none; font-size: 10px; font-weight: 700; border-radius: 6px;">
              📸 Real Photos
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'stayhub-popup',
      });

      marker.on('click', () => {
        if (onSelectRoom) {
          onSelectRoom(room);
        }
      });

      markersRef.current[room.id] = marker;
    });

    // Auto-fit bounds if multiple rooms and no explicit tight zoom
    if (bounds.length > 1 && !selectedRoomId) {
      try {
        map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 14 });
      } catch {
        // bounds fallback
      }
    }
  }, [rooms, selectedRoomId]);

  // When selectedRoomId changes from outside
  useEffect(() => {
    if (!selectedRoomId) return;
    const marker = markersRef.current[selectedRoomId];
    const map = mapInstanceRef.current;
    if (marker && map) {
      const latlng = marker.getLatLng();
      map.flyTo(latlng, Math.max(map.getZoom(), 14), { duration: 0.8 });
      marker.openPopup();
    }
  }, [selectedRoomId]);

  // Handle "Use My Location"
  const handleUseMyLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const { lat, lng } = await getCurrentBrowserLocation();
      const map = mapInstanceRef.current;
      if (map) {
        map.flyTo([lat, lng], 14, { duration: 1.2 });
      }
      const addressName = await reverseGeocodeLocation(lat, lng);
      if (onLocationFound) {
        onLocationFound(lat, lng, addressName);
      }
    } catch (err: any) {
      console.warn('Geolocation error:', err.message);
      setLocationError(err.message || 'Location access denied.');
      setTimeout(() => setLocationError(null), 4000);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSearchThisAreaClick = () => {
    if (onSearchArea) {
      lastSearchedCenterRef.current = currentMapCenter;
      setShowSearchThisArea(false);
      onSearchArea(currentMapCenter[0], currentMapCenter[1]);
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm ${className}`}
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating "Search This Area on Map" Button */}
      {showSearchThisArea && onSearchArea && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-top-3">
          <button
            type="button"
            onClick={handleSearchThisAreaClick}
            className="bg-zinc-900/95 hover:bg-black text-white text-xs font-black px-4 py-2.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-2 backdrop-blur-md transition-all transform hover:scale-105 active:scale-95"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span>Search Rooms in this Map Area</span>
          </button>
        </div>
      )}

      {/* Floating Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* Use My Location Button */}
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-zinc-800 dark:text-zinc-100 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-zinc-800 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          title="Detect and center to my current location"
        >
          <Navigation
            className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${
              isLocating ? 'animate-spin' : ''
            }`}
          />
          <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
        </button>

        {/* Friendly Error Banner */}
        {locationError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-xl shadow-lg max-w-xs animate-in fade-in slide-in-from-top-2">
            ⚠️ {locationError}
          </div>
        )}
      </div>

      {/* Available Room Count Badge on Map */}
      {rooms.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-zinc-900/90 backdrop-blur-md text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 border border-white/10 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {rooms.length} Room{rooms.length === 1 ? '' : 's'} on Map
          </span>
        </div>
      )}

      {selectable && (
        <div className="absolute top-4 right-4 z-10 bg-indigo-600 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-md pointer-events-none">
          Click map to set property location 📍
        </div>
      )}
    </div>
  );
};

export default RoomMap;
