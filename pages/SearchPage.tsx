import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import RoomMap, { getRoomCoordinates } from '../components/RoomMap';
import { Filter, Search, MapPin, Navigation, Map, List, Eye, RefreshCw } from 'lucide-react';
import {
  searchLocationSuggestions,
  geocodeLocation,
  getCurrentBrowserLocation,
  reverseGeocodeLocation,
  calculateDistance,
  LocationSuggestion,
} from '../services/locationService';
import { fetchProperties } from '../services/propertyService';
import { useApp } from '../store';
import { Room } from '../types';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms: storeRooms, addRooms } = useApp();

  const queryLocation = searchParams.get('location') || 'Palanpur, Gujarat';
  const queryBudget = searchParams.get('budget') || '';
  const queryType = searchParams.get('type') || '';
  const queryLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const queryLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;

  const [location, setLocation] = useState(queryLocation);
  const [budget, setBudget] = useState(queryBudget);
  const [roomType, setRoomType] = useState(queryType);
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [radius, setRadius] = useState<number>(15);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Map & Location States
  // Default center: Palanpur coordinates [24.1724, 72.4346]
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    queryLat || 24.1724,
    queryLng || 72.4346,
  ]);
  const [mapZoom, setMapZoom] = useState<number>(queryLat ? 14 : 13);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [currentGeo, setCurrentGeo] = useState<{ lat: number; lng: number; displayName: string } | null>(
    queryLat && queryLng ? { lat: queryLat, lng: queryLng, displayName: queryLocation || 'Palanpur, Gujarat' } : { lat: 24.1724, lng: 72.4346, displayName: 'Palanpur, Gujarat' }
  );

  // Autocomplete Suggestions State
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef<any>(null);
  const roomCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Location suggestions debounced query
  const handleLocationChange = (val: string) => {
    setLocation(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (val.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchLocationSuggestions(val);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch {
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Immediate direct search with selected coordinates
    performSearchWithCoords(suggestion.lat, suggestion.lng, suggestion.displayName, radius);
  };

  const performSearchWithCoords = async (
    lat: number,
    lng: number,
    displayName: string,
    searchRadius: number
  ) => {
    setIsLoading(true);
    setError('');
    setCurrentGeo({ lat, lng, displayName });
    setMapCenter([lat, lng]);
    setMapZoom(13);

    try {
      let results = await fetchProperties(lat, lng, searchRadius);

      // If backend returned no rooms, fallback to store real Palanpur listings
      if (!results || results.length === 0) {
        results = storeRooms.filter((r) => {
          const coords = getRoomCoordinates(r);
          if (!coords) return false;
          const dist = calculateDistance(lat, lng, coords[0], coords[1]);
          return dist <= searchRadius * 2.5;
        });
      }

      if (!results || results.length === 0) {
        results = storeRooms;
      }

      // Filter by Budget, Type & Area
      results = results.filter((r) => {
        let matches = true;
        if (budget === 'under_10k' && r.price > 10000) matches = false;
        if (budget === '10k_20k' && (r.price < 10000 || r.price > 20000)) matches = false;
        if (budget === 'above_20k' && r.price < 20000) matches = false;
        if (roomType && r.type?.toLowerCase() !== roomType.toLowerCase() && (r.propertyType?.toLowerCase() !== roomType.toLowerCase())) matches = false;
        if (r.status !== 'AVAILABLE') matches = false;
        if (selectedArea && selectedArea !== 'All') {
          const matchLoc = (r.locality || '').toLowerCase().includes(selectedArea.toLowerCase()) ||
                           (r.address || '').toLowerCase().includes(selectedArea.toLowerCase()) ||
                           (r.type || '').toLowerCase().includes(selectedArea.toLowerCase());
          if (!matchLoc) matches = false;
        }
        return matches;
      });

      // Calculate distance for each room and sort
      results = results
        .map((r) => {
          const coords = getRoomCoordinates(r);
          return {
            ...r,
            distance: coords ? calculateDistance(lat, lng, coords[0], coords[1]) : undefined,
          };
        })
        .sort((a, b) => ((a as any).distance ?? 9999) - ((b as any).distance ?? 9999));

      setRooms(results);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch rooms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (locText: string, searchRadius: number) => {
    setIsLoading(true);
    setError('');

    try {
      let lat: number | undefined = queryLat;
      let lng: number | undefined = queryLng;

      if (locText) {
        if (!lat || !lng) {
          const geo = await geocodeLocation(locText);
          if (geo) {
            lat = geo.lat;
            lng = geo.lng;
            setCurrentGeo(geo);
            setMapCenter([lat, lng]);
            setMapZoom(13);
          } else {
            setError('Location not found. Please try searching another city or area (e.g. Vadodara, Ahmedabad, Bangalore, Rajkot, Mumbai).');
            setRooms([]);
            setIsLoading(false);
            return;
          }
        } else {
          setCurrentGeo({ lat, lng, displayName: locText });
          setMapCenter([lat, lng]);
        }
      } else {
        setCurrentGeo(null);
      }

      // Fetch from API or fallback to real Palanpur listings
      let results = await fetchProperties(lat, lng, searchRadius);

      if (!results || results.length === 0) {
        if (lat && lng) {
          results = storeRooms.filter((r) => {
            const coords = getRoomCoordinates(r);
            if (!coords) return false;
            return calculateDistance(lat!, lng!, coords[0], coords[1]) <= searchRadius * 2.5;
          });
        }
        if (!results || results.length === 0) {
          results = storeRooms;
        }
      }

      // Filter by Budget, Type & Area
      results = results.filter((r) => {
        let matches = true;
        if (budget === 'under_10k' && r.price > 10000) matches = false;
        if (budget === '10k_20k' && (r.price < 10000 || r.price > 20000)) matches = false;
        if (budget === 'above_20k' && r.price < 20000) matches = false;
        if (roomType && r.type?.toLowerCase() !== roomType.toLowerCase() && (r.propertyType?.toLowerCase() !== roomType.toLowerCase())) matches = false;
        if (r.status !== 'AVAILABLE') matches = false;
        if (selectedArea && selectedArea !== 'All') {
          const matchLoc = (r.locality || '').toLowerCase().includes(selectedArea.toLowerCase()) ||
                           (r.address || '').toLowerCase().includes(selectedArea.toLowerCase()) ||
                           (r.type || '').toLowerCase().includes(selectedArea.toLowerCase());
          if (!matchLoc) matches = false;
        }
        return matches;
      });

      // Calculate distance if coordinates present
      if (lat && lng) {
        results = results
          .map((r) => {
            const coords = getRoomCoordinates(r);
            return {
              ...r,
              distance: coords ? calculateDistance(lat!, lng!, coords[0], coords[1]) : undefined,
            };
          })
          .sort((a, b) => ((a as any).distance ?? 9999) - ((b as any).distance ?? 9999));
      }

      setRooms(results);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch rooms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const placeName = await reverseGeocodeLocation(lat, lng);
      setLocation(placeName);
      setSearchParams({ location: placeName, budget, type: roomType, lat: lat.toString(), lng: lng.toString() });
      await performSearchWithCoords(lat, lng, placeName, radius);
    } catch {
      await performSearchWithCoords(lat, lng, `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`, radius);
    }
  };

  const handleSearchThisMapArea = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const placeName = await reverseGeocodeLocation(lat, lng);
      setLocation(placeName);
      setSearchParams({ location: placeName, budget, type: roomType, lat: lat.toString(), lng: lng.toString() });
      await performSearchWithCoords(lat, lng, placeName, radius);
    } catch {
      await performSearchWithCoords(lat, lng, `Area (${lat.toFixed(3)}, ${lng.toFixed(3)})`, radius);
    }
  };

  useEffect(() => {
    performSearch(queryLocation, radius);
  }, [queryLocation, radius, queryBudget, queryType]);

  const handleUpdateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setSearchParams({ location, budget, type: roomType });
  };

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const { lat, lng } = await getCurrentBrowserLocation();
      setUserLocation([lat, lng]);
      setMapCenter([lat, lng]);
      setMapZoom(14);

      const locName = await reverseGeocodeLocation(lat, lng);
      setLocation(locName);
      setSearchParams({ location: locName, budget, type: roomType, lat: lat.toString(), lng: lng.toString() });
    } catch (err: any) {
      alert(err.message || 'Could not access your location. Please check browser location permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToRoom = (roomId: string | undefined) => {
    if (!roomId) return;
    const el = roomCardRefs.current[roomId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-black min-h-screen pt-24 pb-20 font-sans transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Filters</h2>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-xs flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl transition-colors"
                  title="Use My Current GPS Location"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Near Me
                </button>
              </div>

              <form onSubmit={handleUpdateSearch} className="space-y-5">
                {/* Location Search Input with Autocomplete Suggestions */}
                <div className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Location / City
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Vadodara, Alkapuri..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-zinc-900 dark:text-white transition-all"
                      value={location}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                    />
                    <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                      <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                        Location Suggestions
                      </div>
                      {suggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50 dark:hover:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-2 border-b border-zinc-50 dark:border-zinc-800/50 last:border-b-0 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span className="truncate">{item.displayName}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Distance Radius
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-zinc-900 dark:text-white cursor-pointer"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                  >
                    <option value={1}>1 km</option>
                    <option value={3}>3 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Budget
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-zinc-900 dark:text-white cursor-pointer"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  >
                    <option value="">Any Budget</option>
                    <option value="under_10k">Under ₹10,000</option>
                    <option value="10k_20k">₹10,000 - ₹20,000</option>
                    <option value="above_20k">Above ₹20,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Palanpur Locality / Area
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-zinc-900 dark:text-white cursor-pointer"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                  >
                    <option value="All">All Localities in Palanpur</option>
                    <option value="Aroma Circle">Aroma Circle / Abu Highway</option>
                    <option value="College Road">College Road / Vidyamandir</option>
                    <option value="Station Area">Railway Station Road / Cozy Tower</option>
                    <option value="Mansarovar">Mansarovar Road / Lake</option>
                    <option value="Taley Baug">Taley Baug Area</option>
                    <option value="Deesa">Deesa Highway Cross Road</option>
                    <option value="Gayatri Nagar">Gayatri Nagar</option>
                    <option value="Shanti Nagar">Shanti Nagar</option>
                    <option value="Kanodar">Kanodar Highway</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Property Type
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-zinc-900 dark:text-white cursor-pointer"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                  >
                    <option value="">Any Property Type</option>
                    <option value="pg">Paying Guest (PG)</option>
                    <option value="hostel">Hostel</option>
                    <option value="flat">Flat / Apartment</option>
                    <option value="single">Single Room</option>
                    <option value="shared">Shared Room / Room-Sharing</option>
                    <option value="suite">Executive Suite</option>
                    <option value="penthouse">Penthouse / Studio</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-zinc-900 dark:bg-indigo-600 hover:bg-indigo-600 text-white font-bold transition-all shadow-md active:scale-95 text-sm"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* Results Area & Live Room Map */}
          <div className="w-full lg:w-3/4">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Search Results
                </h1>
                {currentGeo && (
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Showing rooms near:{' '}
                      <span className="font-bold">{currentGeo.displayName.split(',')[0]}</span>
                    </span>
                  </p>
                )}
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-0.5">
                  {rooms.length} available propert{rooms.length === 1 ? 'y' : 'ies'} found
                </p>
              </div>

              {/* Map Visibility Toggle */}
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    showMap
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
                </button>
              </div>
            </div>

            {/* Live Leaflet OpenStreetMap Room Map */}
            {showMap && (
              <div className="mb-8 animate-in fade-in duration-300">
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium px-1">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                    <span>💡</span> Click anywhere on map or drag to discover rooms in that location
                  </span>
                  <span className="hidden sm:inline text-zinc-400">
                    Real photos & Google Maps directions included
                  </span>
                </div>
                <RoomMap
                  rooms={rooms}
                  center={mapCenter}
                  zoom={mapZoom}
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={(r) => {
                    setSelectedRoomId(r?.id || null);
                    scrollToRoom(r?.id);
                  }}
                  userLocation={userLocation}
                  onLocationFound={(lat, lng, addr) => {
                    setUserLocation([lat, lng]);
                    setMapCenter([lat, lng]);
                    setMapZoom(14);
                    if (addr) setLocation(addr);
                    performSearchWithCoords(lat, lng, addr || 'Current Location', radius);
                  }}
                  onSearchArea={handleSearchThisMapArea}
                  onMapClick={handleMapClick}
                  height="420px"
                />
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-zinc-700 dark:text-zinc-300">Searching actual database...</p>
              </div>
            ) : error ? (
              <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm">
                <h3 className="text-xl font-bold text-rose-600 mb-2">Search Notice</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">{error}</p>
              </div>
            ) : rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    ref={(el) => (roomCardRefs.current[room.id] = el)}
                    className="relative transition-all duration-300"
                  >
                    <RoomCard
                      room={room}
                      isSelected={selectedRoomId === room.id}
                      onCardMouseEnter={() => setSelectedRoomId(room.id)}
                      onCardClick={() => setSelectedRoomId(room.id)}
                    />
                    {/* Distance Badge */}
                    {(room as any).distance !== undefined && (
                      <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-zinc-900/90 backdrop-blur text-indigo-700 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shadow-sm border border-white/50 dark:border-zinc-700 pointer-events-none">
                        <MapPin className="w-3 h-3" />
                        {((room as any).distance).toFixed(1)} km away
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-8">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-zinc-800 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                  No verified rooms match this filter
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto text-sm mb-6">
                  No listings found for this specific budget or type in Palanpur. Reset your filters to browse all verified real properties across Palanpur, Gujarat.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBudget('');
                    setRoomType('');
                    setSelectedArea('All');
                    performSearchWithCoords(24.1724, 72.4346, 'Palanpur, Gujarat', 15);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20"
                >
                  Show All Palanpur Properties
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
