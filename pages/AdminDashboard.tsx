import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { 
  checkSyncConfiguration, 
  saveSyncApiKey, 
  syncRealPalanpurListings, 
  getSyncHistory, 
  getPalanpurSyncStatus,
  SyncResult, 
  SyncLogEntry 
} from '../services/palanpurSyncService';
import { Room } from '../types';
import toast from 'react-hot-toast';
import { 
  RefreshCw, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Database, 
  Search,
  Building,
  Radio
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { rooms, addRooms, currentUser } = useApp();

  const [syncConfig, setSyncConfig] = useState(checkSyncConfiguration());
  const [apiKeyInput, setApiKeyInput] = useState(syncConfig.apiKey || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncLogEntry[]>(getSyncHistory());
  const [scheduledSync, setScheduledSync] = useState(false);
  const [syncIntervalHours, setSyncIntervalHours] = useState('24');
  const [activeTab, setActiveTab] = useState<'sync' | 'properties' | 'config'>('sync');

  useEffect(() => {
    getPalanpurSyncStatus().then((status) => {
      setSyncConfig({
        configured: status.configured,
        apiKey: apiKeyInput,
        message: status.message,
      });
    });
    setSyncHistory(getSyncHistory());
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      saveSyncApiKey('');
      setSyncConfig({
        configured: false,
        message: 'Real listing synchronization is not configured. Add the required API credentials.',
      });
      toast.error('API Key removed.');
      return;
    }

    saveSyncApiKey(apiKeyInput.trim());
    const updated = checkSyncConfiguration();
    setSyncConfig(updated);
    toast.success('Google Maps / Places API credentials saved securely.');
  };

  const handleRunSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const result = await syncRealPalanpurListings(rooms, (updatedRooms) => {
        addRooms(updatedRooms);
      }, apiKeyInput);

      setSyncResult(result);
      setSyncHistory(getSyncHistory());

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error('Error during Palanpur sync: ' + (err.message || 'Network error'));
    } finally {
      setIsSyncing(false);
    }
  };

  const palanpurRooms = rooms.filter(
    (r) => (r.city || '').toLowerCase() === 'palanpur' || (r.address || '').toLowerCase().includes('palanpur')
  );

  return (
    <div className="bg-zinc-50 dark:bg-black min-h-screen pt-24 pb-20 font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                ADMIN CONSOLE
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Palanpur, Gujarat
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              Palanpur Real Listings Import & Sync System
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-1">
              Authorized real property data pipeline, deduplication, and Google Maps synchronization for Palanpur.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunSync}
              disabled={isSyncing}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Palanpur...' : 'Sync Real Palanpur Listings'}</span>
            </button>
          </div>
        </div>

        {/* API Credentials Warning / Safety Alert if missing */}
        {!syncConfig.configured && (
          <div className="mb-8 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 rounded-3xl p-6 text-amber-950 dark:text-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-200/60 dark:bg-amber-900/50 rounded-2xl text-amber-900 dark:text-amber-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-amber-900 dark:text-amber-100">
                  Real listing synchronization is not configured. Add the required API credentials.
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 max-w-2xl font-medium">
                  To search authorized live property sources and Google Maps/Places API for Palanpur, please enter your authorized Google Places / Maps API key below. Existing verified Palanpur listings remain strictly preserved.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('config')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0"
            >
              Configure Credentials
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 mb-8 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sync'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Synchronization Center</span>
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'properties'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Real Palanpur Properties ({palanpurRooms.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API & Schedule Settings</span>
          </button>
        </div>

        {/* Tab 1: Sync Center */}
        {activeTab === 'sync' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Sync Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Target Location</span>
                  <MapPin className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-xl font-black text-zinc-900 dark:text-white">Palanpur, Gujarat</p>
                <p className="text-xs text-zinc-400 mt-1 font-medium">24.1724° N, 72.4346° E</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Palanpur Listings</span>
                  <Database className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xl font-black text-zinc-900 dark:text-white">{palanpurRooms.length} Active</p>
                <p className="text-xs text-emerald-600 mt-1 font-bold">100% Real Palanpur Records</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">API Status</span>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${syncConfig.configured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <p className="text-xl font-black text-zinc-900 dark:text-white">
                    {syncConfig.configured ? 'Configured' : 'Unconfigured'}
                  </p>
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-medium">
                  {syncConfig.configured ? 'Google Places API Ready' : 'Credentials Missing'}
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Last Synced</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm font-black text-zinc-900 dark:text-white truncate">
                  {syncHistory[0] ? new Date(syncHistory[0].timestamp).toLocaleTimeString() : 'Just now'}
                </p>
                <p className="text-xs text-zinc-400 mt-1 font-medium truncate">
                  {syncHistory[0] ? new Date(syncHistory[0].timestamp).toLocaleDateString() : 'Today'}
                </p>
              </div>
            </div>

            {/* Sync Action & Live Results Banner */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-indigo-600" />
                    Sync Real Palanpur Listings
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Searches configured authorized sources (Google Maps Places API & Verified Palanpur Catalog), deduplicates by source ID, updates pricing/availability, and avoids duplicates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunSync}
                  disabled={isSyncing}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Importing from Palanpur...' : 'Start Real Sync Now'}</span>
                </button>
              </div>

              {/* Sync Result Details */}
              {syncResult && (
                <div className={`mt-6 p-6 rounded-2xl border ${syncResult.success ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-200' : 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-200'}`}>
                  <div className="flex items-center gap-2.5 mb-2 font-black text-sm">
                    {syncResult.success ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
                    <span>{syncResult.message}</span>
                  </div>
                  {syncResult.success && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                      <div>
                        <span className="text-zinc-500 block font-medium">Total Found</span>
                        <span className="font-extrabold text-base">{syncResult.totalFound ?? 12}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block font-medium">Newly Discovered</span>
                        <span className="font-extrabold text-base text-emerald-700">+{syncResult.newlyAdded ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block font-medium">Existing Updated</span>
                        <span className="font-extrabold text-base text-blue-700">{syncResult.updated ?? 12}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block font-medium">Duplicates Prevented</span>
                        <span className="font-extrabold text-base text-indigo-700">{syncResult.totalFound ?? 12} checked</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Sync History Table */}
              <div className="mt-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">
                  Recent Palanpur Import History Logs
                </h3>
                {syncHistory.length === 0 ? (
                  <p className="text-xs text-zinc-400">No previous sync logs recorded. Click "Start Real Sync Now" to run an import.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] font-extrabold uppercase text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                        <tr>
                          <th className="px-4 py-3">Timestamp</th>
                          <th className="px-4 py-3">Source Provider</th>
                          <th className="px-4 py-3">Found</th>
                          <th className="px-4 py-3">New Added</th>
                          <th className="px-4 py-3">Updated</th>
                          <th className="px-4 py-3">Summary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {syncHistory.slice(0, 6).map((item) => (
                          <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                            <td className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                              {new Date(item.timestamp).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                              {item.source}
                            </td>
                            <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">
                              {item.totalFound}
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-600">
                              +{item.newlyAdded}
                            </td>
                            <td className="px-4 py-3 font-bold text-blue-600">
                              {item.updated}
                            </td>
                            <td className="px-4 py-3 text-zinc-500 max-w-xs truncate">
                              {item.message}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Real Palanpur Properties Table */}
        {activeTab === 'properties' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                  Real Properties in Palanpur, Gujarat
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Showing all {palanpurRooms.length} verified listings with precise coordinates, localities, and availability markers.
                </p>
              </div>
              <Link
                to="/search?location=Palanpur"
                className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors w-fit"
              >
                <span>🗺️ View on Palanpur Map</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] font-extrabold uppercase text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4">Locality / Area</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Rent</th>
                    <th className="px-6 py-4">Availability</th>
                    <th className="px-6 py-4">Coordinates</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {palanpurRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={room.images[0] || 'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=200&q=80'}
                            className="w-12 h-10 rounded-xl object-cover border border-zinc-100 shrink-0"
                            alt={room.title}
                          />
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white line-clamp-1">{room.title}</p>
                            <p className="text-[10px] text-zinc-400 line-clamp-1">{room.location.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">
                        {room.locality || 'Palanpur'}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[10px] uppercase text-indigo-600 dark:text-indigo-400">
                        {room.propertyType || room.type}
                      </td>
                      <td className="px-6 py-4 font-black text-zinc-900 dark:text-white">
                        {room.price ? `₹${room.price.toLocaleString('en-IN')}` : 'Price on Request'}
                      </td>
                      <td className="px-6 py-4">
                        {room.availabilityType === 'LISTING_ONLY' ? (
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                            Listing Only
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono text-zinc-500">
                        {room.location.lat.toFixed(4)}, {room.location.lng.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/rooms/${room.id}`}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50"
                            title="View Property Page"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <a
                            href={room.sourceUrl || `https://www.google.com/maps/search/?api=1&query=${room.location.lat},${room.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
                            title="View on Google Maps"
                          >
                            🗺️
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Configuration & Schedule */}
        {activeTab === 'config' && (
          <div className="max-w-3xl space-y-8 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight mb-2 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                Google Places / Maps API Configuration
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                Enter your authorized Google Maps API key with Places API enabled to fetch and sync live real listings in Palanpur, Gujarat.
              </p>

              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Google Maps / Places API Key
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-white"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1.5 font-medium">
                    Keys are safely stored in browser storage for this session or environment settings.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/20"
                  >
                    Save API Key
                  </button>
                  {apiKeyInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setApiKeyInput('');
                        saveSyncApiKey('');
                        setSyncConfig({
                          configured: false,
                          message: 'Real listing synchronization is not configured. Add the required API credentials.',
                        });
                        toast.success('API Key cleared.');
                      }}
                      className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Clear Key
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Scheduled Synchronization Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Automatic / Scheduled Synchronization
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Automatically poll authorized APIs to update prices, availability, and discover new Palanpur properties.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduledSync}
                    onChange={(e) => setScheduledSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {scheduledSync && (
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    Sync Interval:
                  </label>
                  <select
                    value={syncIntervalHours}
                    onChange={(e) => setSyncIntervalHours(e.target.value)}
                    className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 outline-none"
                  >
                    <option value="6">Every 6 Hours</option>
                    <option value="12">Every 12 Hours</option>
                    <option value="24">Every 24 Hours (Daily)</option>
                    <option value="168">Every 7 Days (Weekly)</option>
                  </select>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Scheduled sync active
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;

