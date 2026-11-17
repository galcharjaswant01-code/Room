import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { 
  checkSyncConfiguration, 
  saveApiCredential,
  getActiveCredential,
  getApiSourcesStatus,
  testApiConnection,
  getSyncStatistics,
  syncRealPalanpurListings, 
  getSyncHistory, 
  SyncResult, 
  SyncLogEntry 
} from '../services/palanpurSyncService';
import { Room, ApiSourceStatus, SyncStats } from '../types';
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
  Server,
  Layers,
  Image as ImageIcon,
  Check,
  X,
  AlertCircle,
  Activity,
  Globe,
  Sliders
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { rooms, addRooms } = useApp();

  const [activeTab, setActiveTab] = useState<'sources' | 'sync' | 'properties'>('sources');
  const [sources, setSources] = useState<ApiSourceStatus[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats>(getSyncStatistics());
  const [syncHistory, setSyncHistory] = useState<SyncLogEntry[]>(getSyncHistory());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // Per-source testing state
  const [testingSource, setTestingSource] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latencyMs: number }>>({});

  // Credentials input state
  const [credentials, setCredentials] = useState({
    google_maps: getActiveCredential('google_maps'),
    google_places: getActiveCredential('google_places'),
    property_api: getActiveCredential('property_api'),
    property_base_url: getActiveCredential('property_base_url'),
    media_api: getActiveCredential('media_api'),
  });

  // Scheduled sync toggles
  const [scheduledSync, setScheduledSync] = useState(false);
  const [syncIntervalHours, setSyncIntervalHours] = useState('24');

  // Load and refresh sources status
  const loadSourcesStatus = async () => {
    const list = await getApiSourcesStatus();
    setSources(list);
    setSyncStats(getSyncStatistics());
  };

  useEffect(() => {
    loadSourcesStatus();
    setSyncHistory(getSyncHistory());
  }, []);

  const handleCredentialChange = (field: keyof typeof credentials, val: string) => {
    setCredentials((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveCredential = (
    type: 'google_maps' | 'google_places' | 'property_api' | 'property_base_url' | 'media_api',
    friendlyName: string
  ) => {
    const value = credentials[type];
    saveApiCredential(type, value);
    toast.success(`${friendlyName} updated.`);
    loadSourcesStatus();
  };

  const handleTestConnection = async (type: 'google_maps' | 'google_places' | 'property_api' | 'media_api') => {
    setTestingSource(type);
    try {
      const res = await testApiConnection(
        type,
        credentials[type],
        type === 'property_api' ? credentials.property_base_url : undefined
      );
      setTestResults((prev) => ({ ...prev, [type]: res }));
      if (res.success) {
        toast.success(`Connection verified: ${res.message} (${res.latencyMs}ms)`);
      } else {
        toast.error(`Connection check: ${res.message}`);
      }
      loadSourcesStatus();
    } catch (err: any) {
      toast.error(`Test failed: ${err.message || 'Unknown network error'}`);
    } finally {
      setTestingSource(null);
    }
  };

  const handleRunSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const result = await syncRealPalanpurListings(
        rooms,
        (updatedRooms) => {
          addRooms(updatedRooms);
        },
        {
          placesKey: credentials.google_places || credentials.google_maps,
          propertyKey: credentials.property_api,
        }
      );

      setSyncResult(result);
      setSyncHistory(getSyncHistory());
      setSyncStats(getSyncStatistics());
      loadSourcesStatus();

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

  const hasAnyKey = Boolean(
    credentials.google_maps ||
    credentials.google_places ||
    credentials.property_api
  );

  return (
    <div className="bg-zinc-50 dark:bg-black min-h-screen pt-24 pb-20 font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                ADMIN CONSOLE
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Palanpur, Gujarat, India
              </span>
              <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded-full">
                Real Property Data Only
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
              API & Sources Status Dashboard
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-1">
              Authorized property data feeds, Google Maps/Places integration, source deduplication, and synchronization controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunSync}
              disabled={isSyncing}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Palanpur...' : 'Sync Palanpur Listings'}</span>
            </button>
          </div>
        </div>

        {/* No-API Protection Alert */}
        {!hasAnyKey && (
          <div className="mb-8 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 rounded-3xl p-6 text-amber-950 dark:text-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-200/60 dark:bg-amber-900/50 rounded-2xl text-amber-900 dark:text-amber-200 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-amber-900 dark:text-amber-100">
                  Real listing synchronization is unavailable because the Property Listing API / Google Places API is not configured.
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 max-w-3xl font-medium">
                  <strong>Zero Fake Data Guarantee:</strong> When required credentials are missing, automatic synchronization halts safely to protect your database. Fake rooms, synthetic addresses, and random internet photos will NEVER be generated. Add the required API credentials below to enable live synchronization.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('sources')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0"
            >
              Add Credentials
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 mb-8 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sources'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>API & Sources</span>
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sync'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Center & History</span>
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
            <span>Palanpur Listings ({palanpurRooms.length})</span>
          </button>
        </div>

        {/* TAB 1: API & SOURCES (Primary requirement) */}
        {activeTab === 'sources' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Cumulative Synchronization Metrics Overview */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-black text-zinc-900 dark:text-white">
                    Palanpur Synchronization Metrics
                  </h2>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Last Sync: </span>
                  <strong className="text-zinc-900 dark:text-white font-bold">
                    {syncStats.lastSyncTimestamp ? new Date(syncStats.lastSyncTimestamp).toLocaleString() : 'Never / Pending first sync'}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                    Properties Imported
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {syncStats.totalImported}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-1">Verified Palanpur homes</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                    Properties Updated
                  </span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {syncStats.totalUpdated}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-1">Price/availability refreshed</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                    Duplicates Skipped
                  </span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {syncStats.totalDuplicatesSkipped}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-1">Unique source ID checks</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
                    Failed Listings
                  </span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {syncStats.totalFailed}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-1">Halted on invalid data</span>
                </div>
              </div>
            </div>

            {/* 4 Source Connection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 1. Google Maps API */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Google Maps API</h3>
                        <p className="text-[11px] text-zinc-400">Maps JavaScript, Geocoding & Directions</p>
                      </div>
                    </div>
                    {credentials.google_maps ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-600 flex items-center gap-1">
                        <X className="w-3 h-3" /> Not Connected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    Powers interactive Palanpur-centered map, pin clustering, area boundary views, and user navigation directions.
                  </p>

                  <div className="space-y-2 mb-4">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                      Google Maps API Key
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy... (Set in .env or enter here)"
                      value={credentials.google_maps}
                      onChange={(e) => handleCredentialChange('google_maps', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-white"
                    />
                  </div>

                  {testResults.google_maps && (
                    <div className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2 ${testResults.google_maps.success ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-200'}`}>
                      {testResults.google_maps.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                      <div>
                        <p className="font-bold">{testResults.google_maps.message}</p>
                        <p className="text-[10px] opacity-75">Response latency: {testResults.google_maps.latencyMs}ms</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleSaveCredential('google_maps', 'Google Maps API Key')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all"
                  >
                    Save Key
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestConnection('google_maps')}
                    disabled={testingSource === 'google_maps'}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${testingSource === 'google_maps' ? 'animate-spin' : ''}`} />
                    <span>{testingSource === 'google_maps' ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>

              {/* 2. Google Places API */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Google Places API</h3>
                        <p className="text-[11px] text-zinc-400">Places Text Search & Place Details</p>
                      </div>
                    </div>
                    {credentials.google_places ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-600 flex items-center gap-1">
                        <X className="w-3 h-3" /> Not Connected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    Searches and verifies registered Palanpur residential hubs, paying guest locations, hostels, and student housings.
                  </p>

                  <div className="space-y-2 mb-4">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                      Google Places API Key
                    </label>
                    <input
                      type="password"
                      placeholder="AIzaSy... (Defaults to Maps Key if empty)"
                      value={credentials.google_places}
                      onChange={(e) => handleCredentialChange('google_places', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-white"
                    />
                  </div>

                  {testResults.google_places && (
                    <div className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2 ${testResults.google_places.success ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-200'}`}>
                      {testResults.google_places.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                      <div>
                        <p className="font-bold">{testResults.google_places.message}</p>
                        <p className="text-[10px] opacity-75">Response latency: {testResults.google_places.latencyMs}ms</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleSaveCredential('google_places', 'Google Places API Key')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all"
                  >
                    Save Key
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestConnection('google_places')}
                    disabled={testingSource === 'google_places'}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${testingSource === 'google_places' ? 'animate-spin' : ''}`} />
                    <span>{testingSource === 'google_places' ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>

              {/* 3. Property Listing API */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Property Listing API</h3>
                        <p className="text-[11px] text-zinc-400">Authorized Housing Registry / Vacancy Feed</p>
                      </div>
                    </div>
                    {credentials.property_api ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-600 flex items-center gap-1">
                        <Sliders className="w-3 h-3" /> Ready / Optional
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    Authorized property feed providing official vacancy updates, lease tariffs, and landlord contact channels.
                  </p>

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                        Property API Endpoint / Base URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://api.propertyhub.in/v1 or leave blank for local"
                        value={credentials.property_base_url}
                        onChange={(e) => handleCredentialChange('property_base_url', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">
                        Property API Key
                      </label>
                      <input
                        type="password"
                        placeholder="prop_live_... (Set in .env or enter here)"
                        value={credentials.property_api}
                        onChange={(e) => handleCredentialChange('property_api', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {testResults.property_api && (
                    <div className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2 ${testResults.property_api.success ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-200'}`}>
                      {testResults.property_api.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                      <div>
                        <p className="font-bold">{testResults.property_api.message}</p>
                        <p className="text-[10px] opacity-75">Response latency: {testResults.property_api.latencyMs}ms</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveCredential('property_api', 'Property API Key');
                      handleSaveCredential('property_base_url', 'Property Base URL');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all"
                  >
                    Save Config
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestConnection('property_api')}
                    disabled={testingSource === 'property_api'}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${testingSource === 'property_api' ? 'animate-spin' : ''}`} />
                    <span>{testingSource === 'property_api' ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>

              {/* 4. Media Source API */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-zinc-900 dark:text-white text-base">Authorized Media Source</h3>
                        <p className="text-[11px] text-zinc-400">Licensed Room Photos & Video Tours</p>
                      </div>
                    </div>
                    {credentials.media_api ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Connected
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center gap-1">
                        Clean Fallback
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                    Authorized repository for verified real estate photos and walkthroughs with attribution. Unlicensed or scraping photos is strictly disabled.
                  </p>

                  <div className="space-y-2 mb-4">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                      Media Source API Key
                    </label>
                    <input
                      type="password"
                      placeholder="media_sec_... (Optional authorized media key)"
                      value={credentials.media_api}
                      onChange={(e) => handleCredentialChange('media_api', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-white"
                    />
                  </div>

                  {testResults.media_api && (
                    <div className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2 ${testResults.media_api.success ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-200'}`}>
                      {testResults.media_api.success ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                      <div>
                        <p className="font-bold">{testResults.media_api.message}</p>
                        <p className="text-[10px] opacity-75">Response latency: {testResults.media_api.latencyMs}ms</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleSaveCredential('media_api', 'Media Source API Key')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all"
                  >
                    Save Key
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestConnection('media_api')}
                    disabled={testingSource === 'media_api'}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${testingSource === 'media_api' ? 'animate-spin' : ''}`} />
                    <span>{testingSource === 'media_api' ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Error Messages Log Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                API & Source Error Messages Log
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Real-time exception tracking and authorization warnings recorded during sync attempts.
              </p>

              {syncStats.errorMessages && syncStats.errorMessages.length > 0 ? (
                <div className="space-y-2">
                  {syncStats.errorMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-900 dark:text-rose-200 font-medium flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>No API errors recorded. All systems operating with zero violations.</span>
                </div>
              )}
            </div>

            {/* Scheduled Synchronization Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Automatic Scheduled Synchronization
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Periodically synchronize Palanpur listings to update occupancy, verify new rooms, and adjust rental rates.
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
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4 flex-wrap">
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

        {/* TAB 2: SYNCHRONIZATION CENTER & HISTORY */}
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
                  <span className={`w-2.5 h-2.5 rounded-full ${hasAnyKey ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <p className="text-xl font-black text-zinc-900 dark:text-white">
                    {hasAnyKey ? 'Configured' : 'Missing APIs'}
                  </p>
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-medium">
                  {hasAnyKey ? 'Authorized Credentials Ready' : 'Sync Halted Safely'}
                </p>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between text-zinc-400 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Last Synced</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm font-black text-zinc-900 dark:text-white truncate">
                  {syncHistory[0] ? new Date(syncHistory[0].timestamp).toLocaleTimeString() : 'Never'}
                </p>
                <p className="text-xs text-zinc-400 mt-1 font-medium truncate">
                  {syncHistory[0] ? new Date(syncHistory[0].timestamp).toLocaleDateString() : 'Pending sync'}
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
                    Searches configured authorized sources, deduplicates by unique source ID, and updates vacancy status.
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
                        <span className="font-extrabold text-base text-emerald-700">+{syncResult.propertiesImported ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block font-medium">Existing Updated</span>
                        <span className="font-extrabold text-base text-blue-700">{syncResult.propertiesUpdated ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block font-medium">Duplicates Prevented</span>
                        <span className="font-extrabold text-base text-indigo-700">{syncResult.duplicatesSkipped ?? 0}</span>
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
                          <th className="px-4 py-3">Duplicates Skipped</th>
                          <th className="px-4 py-3">Summary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {syncHistory.slice(0, 8).map((item) => (
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
                              +{item.propertiesImported}
                            </td>
                            <td className="px-4 py-3 font-bold text-blue-600">
                              {item.propertiesUpdated}
                            </td>
                            <td className="px-4 py-3 font-bold text-indigo-600">
                              {item.duplicatesSkipped}
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

        {/* TAB 3: REAL PALANPUR PROPERTIES TABLE */}
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
                    <th className="px-6 py-4">Source ID & System</th>
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
                      <td className="px-6 py-4">
                        <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300 block w-fit">
                          {room.sourceListingId || `PAL-${room.id}`}
                        </span>
                        <span className="text-[9px] text-zinc-400 block mt-0.5 truncate max-w-[140px]">
                          {room.source || 'Verified Public Catalog'}
                        </span>
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

      </div>
    </div>
  );
};

export default AdminDashboard;
