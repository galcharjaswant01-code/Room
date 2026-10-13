
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { ThemeProvider } from './components/ThemeProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import AuthModal from './components/AuthModal';
import ClientDashboard from './pages/ClientDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import OwnerOnboarding from './pages/OwnerOnboarding';
import RoomCard from './components/RoomCard';
import { UserRole } from './types';

const PrivateRoute: React.FC<{ children: React.ReactNode, roles?: UserRole[] }> = ({ children, roles }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" />;
  if (roles && !roles.includes(currentUser.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const OwnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/" />;
  if (currentUser.role !== UserRole.OWNER) return <Navigate to="/" />;

  return (
    <>
      {!currentUser.isVerified && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2">
          <span>⚠️</span>
          Your owner account is under review. Full features are enabled in preview mode.
        </div>
      )}
      {children}
    </>
  );
};

const WishlistPage: React.FC = () => {
  const { wishlist, rooms } = useApp();
  const wishlistedRooms = rooms.filter(r => wishlist.includes(r.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">My Wishlist</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Saved properties for your future escapes</p>
      </div>
      
      {wishlistedRooms.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[4rem] border border-gray-100 flex flex-col items-center">
          <span className="text-6xl mb-8 grayscale">❤️</span>
          <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Your wishlist is empty</h3>
          <p className="text-gray-400 font-medium max-w-xs mx-auto mb-10">Start exploring our collection and tap the heart icon to save your favorites here.</p>
          <button onClick={() => window.history.back()} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95">Explore Stays</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Corrected: Use RoomCard component for mapping wishlisted items */}
          {wishlistedRooms.map(room => (
            <div key={room.id}><RoomCard room={room} /></div>
          ))}
        </div>
      )}
    </div>
  );
};

import SearchPage from './pages/SearchPage';

const RootRoute: React.FC = () => {
  const { currentUser } = useApp();
  if (currentUser?.role === UserRole.OWNER) {
    return <Navigate to="/owner" replace />;
  }
  return <HomePage />;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/rooms" element={<HomePage />} />
            <Route path="/rooms/:id" element={<RoomDetailsPage />} />
            <Route path="/verify" element={<VerifyEmailPage />} />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />

            <Route path="/wishlist" element={
              <PrivateRoute roles={[UserRole.GUEST, UserRole.ADMIN]}>
                <WishlistPage />
              </PrivateRoute>
            } />
            
            <Route path="/client" element={
              <PrivateRoute roles={[UserRole.MANAGER, UserRole.ADMIN]}>
                <ClientDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/onboarding" element={
              <PrivateRoute roles={[UserRole.OWNER]}>
                <OwnerOnboarding />
              </PrivateRoute>
            } />
            
            <Route path="/owner" element={
              <OwnerRoute>
                <OwnerDashboard />
              </OwnerRoute>
            } />

            <Route path="/admin" element={
              <PrivateRoute roles={[UserRole.ADMIN]}>
                <div className="p-32 text-center">
                   <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Admin Control Center</h2>
                   <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">System settings and user management</p>
                   <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <span className="text-3xl block mb-4">👥</span>
                        <h4 className="font-black text-gray-900 text-sm uppercase">Users</h4>
                      </div>
                      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <span className="text-3xl block mb-4">🏠</span>
                        <h4 className="font-black text-gray-900 text-sm uppercase">Properties</h4>
                      </div>
                      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <span className="text-3xl block mb-4">🛡️</span>
                        <h4 className="font-black text-gray-900 text-sm uppercase">Security</h4>
                      </div>
                   </div>
                </div>
              </PrivateRoute>
            } />
          </Routes>
        </main>
        <Footer />
        <AuthModal />
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
