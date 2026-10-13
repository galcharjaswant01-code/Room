import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Room, Booking, Transaction, UserRole, RoomStatus, BookingStatus, ChatMessage, Notification, AnalyticsData, ActivityEvent, PropertyPerformance } from './types';
import { mockUsers, mockRooms, mockBookings, mockTransactions, mockMessages, mockNotifications, mockAnalytics, mockPreviousYearAnalytics, mockActivityFeed, mockPropertyPerformance } from './mockData';
import { auth } from './services/firebase';
import { onIdTokenChanged } from 'firebase/auth';
import { createBookingAPI, fetchBookingsAPI, updateBookingStatusAPI } from './services/backendService';

interface AppState {
  currentUser: User | null;
  rooms: Room[];
  bookings: Booking[];
  transactions: Transaction[];
  messages: ChatMessage[];
  notifications: Notification[];
  analytics: AnalyticsData[];
  wishlist: string[]; // Room IDs
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'login' | 'register') => void;
  requireAuth: (callback: () => void) => void;
  login: (email: string) => boolean;
  register: (user: { name: string; email: string; role?: UserRole }) => boolean;
  detectRoleFromEmail: (inputEmail: string, explicitRole?: UserRole) => UserRole;
  syncUserFromAuth: (authUser: { email: string; name?: string; avatar?: string; role?: UserRole }) => User;
  logout: () => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  updateProfile: (updatedUser: Partial<User>) => void;
  toggleWishlist: (roomId: string) => void;
  addRooms: (newRooms: Room[]) => void;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const getInitialRooms = () => {
    let dynamicStored: Room[] = [];
    try {
      const raw = localStorage.getItem('stayhub_rooms_v1') || localStorage.getItem('stayhub_dynamic_rooms_v1');
      if (raw) dynamicStored = JSON.parse(raw);
    } catch {}
    const map = new Map<string, Room>();
    mockRooms.forEach(r => map.set(r.id, r));
    dynamicStored.forEach(r => map.set(r.id, r));
    return Array.from(map.values());
  };

  const [rooms, setRooms] = useState<Room[]>(getInitialRooms);

  const addRooms = (newRooms: Room[]) => {
    setRooms(prev => {
      const map = new Map<string, Room>();
      prev.forEach(r => map.set(r.id, r));
      newRooms.forEach(r => map.set(r.id, r));
      return Array.from(map.values());
    });
  };

  useEffect(() => {
    import('./services/propertyService').then(module => {
      module.fetchProperties().then(fetchedRooms => {
        if (fetchedRooms && fetchedRooms.length > 0) {
          setRooms(prev => {
            const map = new Map<string, Room>();
            prev.forEach(r => map.set(r.id, r));
            fetchedRooms.forEach(r => map.set(r.id, r));
            return Array.from(map.values());
          });
        }
      }).catch(console.error);
    });
  }, []);

  const getInitialBookings = (): Booking[] => {
    try {
      const stored = localStorage.getItem('stayhub_bookings_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return mockBookings;
  };

  const [bookings, setBookings] = useState<Booking[]>(getInitialBookings);

  useEffect(() => {
    if (currentUser) {
      fetchBookingsAPI().then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedBookings = data.map((b: any) => ({
            id: b.id.toString(),
            roomId: b.room.toString(),
            clientId: b.tenant.toString(),
            startDate: b.check_in_date,
            endDate: b.check_out_date,
            status: b.status.toUpperCase(),
            totalPrice: parseFloat(b.total_amount),
            createdAt: b.created_at
          }));
          setBookings(prev => {
            const combinedMap = new Map();
            mappedBookings.forEach((item: Booking) => combinedMap.set(item.id, item));
            prev.forEach(item => combinedMap.set(item.id, item));
            const combined = Array.from(combinedMap.values());
            localStorage.setItem('stayhub_bookings_v1', JSON.stringify(combined));
            return combined;
          });
        }
      }).catch(console.error);
    }
  }, [currentUser]);

  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);

  const getInitialNotifications = (): Notification[] => {
    try {
      const stored = localStorage.getItem('stayhub_notifications_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return mockNotifications;
  };

  const [notifications, setNotifications] = useState<Notification[]>(getInitialNotifications);

  useEffect(() => {
    if (currentUser) {
      const fetchNotifs = async () => {
        try {
          const { fetchNotificationsAPI } = await import('./services/notificationService');
          const data = await fetchNotificationsAPI();
          if (Array.isArray(data) && data.length > 0) {
            setNotifications(prev => {
              const map = new Map();
              data.forEach((n: Notification) => map.set(n.id, n));
              prev.forEach(n => map.set(n.id, n));
              const combined = Array.from(map.values());
              localStorage.setItem('stayhub_notifications_v1', JSON.stringify(combined));
              return combined;
            });
          }
        } catch (e) {
          console.error(e);
        }
      };
      
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const markNotificationAsRead = async (id: string) => {
    try {
      const { markNotificationAsReadAPI } = await import('./services/notificationService');
      await markNotificationAsReadAPI(id).catch(() => {});
    } catch (e) {}
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      localStorage.setItem('stayhub_notifications_v1', JSON.stringify(next));
      return next;
    });
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const { markAllNotificationsAsReadAPI } = await import('./services/notificationService');
      await markAllNotificationsAsReadAPI().catch(() => {});
    } catch (e) {}
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, isRead: true }));
      localStorage.setItem('stayhub_notifications_v1', JSON.stringify(next));
      return next;
    });
  };
  const [analytics, setAnalytics] = useState<AnalyticsData[]>(mockAnalytics);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const requireAuth = (callback: () => void) => {
    if (currentUser) {
      callback();
    } else {
      openAuthModal();
    }
  };

  // Initialize wishlist and check auth on load
  useEffect(() => {
    const saved = localStorage.getItem('stayhub_wishlist');
    if (saved) setWishlist(JSON.parse(saved));

    const checkAuth = async () => {
      // 1. Restore local session immediately if present
      try {
        const savedUserStr = localStorage.getItem('stayhub_current_user');
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr);
          const detectedRole = detectRoleFromEmail(parsed.email, parsed.role);
          setCurrentUser({ ...parsed, role: detectedRole });
        }
      } catch (e) {
        console.error("Failed to restore saved local user session:", e);
      }

      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const { fetchMeAPI } = await import('./services/authService');
          const data = await fetchMeAPI();
          const roleMapping: Record<string, UserRole> = {
            'tenant': UserRole.GUEST,
            'owner': UserRole.OWNER,
            'admin': UserRole.ADMIN,
            'manager': UserRole.MANAGER
          };
          const resolvedRole = roleMapping[data.role] || detectRoleFromEmail(data.email);
          
          const user: User = {
            id: data.id.toString(),
            name: `${data.first_name} ${data.last_name}`.trim() || data.username,
            email: data.email,
            role: resolvedRole,
            avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(data.username)}`,
            isVerified: true,
            onboardingComplete: true
          };
          setCurrentUser(user);
          localStorage.setItem('stayhub_current_user', JSON.stringify(user));
        } catch (error) {
          console.error("Failed to fetch user, token might be expired");
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    };
    checkAuth();
  }, []);

  const login = (email: string) => {
    return false;
  };

  const register = ({ name, email, role = UserRole.GUEST }: { name: string; email: string; role?: UserRole }) => {
    return false;
  };

  const detectRoleFromEmail = (inputEmail: string): UserRole => {
    const clean = (inputEmail || '').trim().toLowerCase();

    // STRICT RULE: Only ONE email ID is authorized as Owner
    if (clean === 'galcharjaswant01@gmail.com') {
      return UserRole.OWNER;
    }

    // ALL OTHER EMAIL IDS ARE STRICTLY GUEST (No other email allowed as owner)
    return UserRole.GUEST;
  };

  const syncUserFromAuth = ({ email, name, avatar, role }: { email: string; name?: string; avatar?: string; role?: UserRole }): User => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const detectedRole = detectRoleFromEmail(cleanEmail);

    if (cleanEmail) {
      localStorage.setItem(`stayhub_role_${cleanEmail}`, detectedRole === UserRole.OWNER ? 'owner' : 'guest');
    }

    const resolvedEmail = email || 'galcharjaswant01@gmail.com';
    const resolvedName = name || (detectedRole === UserRole.OWNER ? 'Jaswant Galchar' : resolvedEmail.split('@')[0]) || 'User';

    const localUser: User = {
      id: cleanEmail === 'galcharjaswant01@gmail.com' ? 'u-jaswant-owner' : 'user-' + Date.now(),
      name: resolvedName,
      email: resolvedEmail,
      role: detectedRole,
      avatar: avatar || (detectedRole === UserRole.OWNER
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
        : `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(resolvedName)}`),
      isVerified: true,
      onboardingComplete: true
    };

    setCurrentUser(localUser);
    localStorage.setItem('stayhub_current_user', JSON.stringify(localUser));

    // Background backend profile sync
    import('./services/authService').then(({ fetchMeAPI }) => {
      fetchMeAPI().then(data => {
        // Enforce: ONLY galcharjaswant01@gmail.com is allowed as Owner
        const backendRole = data.email?.toLowerCase() === 'galcharjaswant01@gmail.com' ? UserRole.OWNER : UserRole.GUEST;
        const updatedUser: User = {
          id: data.id.toString(),
          name: `${data.first_name} ${data.last_name}`.trim() || data.username,
          email: data.email,
          role: backendRole,
          avatar: data.email?.toLowerCase() === 'galcharjaswant01@gmail.com'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
            : `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(data.username)}`,
          isVerified: true,
          onboardingComplete: true
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('stayhub_current_user', JSON.stringify(updatedUser));
      }).catch(err => {
        // Fallback already assigned
      });
    });

    return localUser;
  };

  const logout = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('stayhub_current_user');
    setCurrentUser(null);
    setWishlist([]);
  };

  const updateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms(prev => {
      const next = prev.map(r => r.id === roomId ? { ...r, status } : r);
      try {
        localStorage.setItem('stayhub_rooms_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const addBooking = async (newBookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const tempId = 'b-' + Date.now();
    const createdTimestamp = new Date().toISOString();
    const newBooking: Booking = {
      ...newBookingData,
      id: tempId,
      status: BookingStatus.PENDING,
      createdAt: createdTimestamp
    };

    // 1. Immediately store new booking locally
    setBookings(prev => {
      const next = [newBooking, ...prev];
      try {
        localStorage.setItem('stayhub_bookings_v1', JSON.stringify(next));
      } catch {}
      return next;
    });

    // 2. Generate Real-time Notification for Property Owner (Jaswant Galchar)
    const targetRoom = rooms.find(r => r.id === newBookingData.roomId);
    const guestName = currentUser?.name || 'A Guest';
    const roomTitle = targetRoom?.title || 'Comfortable Stay Unit';
    const totalFormatted = (newBookingData.totalPrice || targetRoom?.price || 0).toLocaleString();

    const ownerNotification: Notification = {
      id: `notif-book-${Date.now()}`,
      userId: 'u-jaswant-owner',
      title: '🔔 New Guest Booking Request!',
      message: `${guestName} booked "${roomTitle}" from ${newBookingData.startDate} to ${newBookingData.endDate} (₹${totalFormatted}). Please review and accept this stay!`,
      timestamp: createdTimestamp,
      isRead: false,
      type: 'BOOKING',
      link: '/owner?tab=bookings'
    };

    setNotifications(prev => {
      const next = [ownerNotification, ...prev];
      try {
        localStorage.setItem('stayhub_notifications_v1', JSON.stringify(next));
      } catch {}
      return next;
    });

    // 3. Connect to backend if available
    try {
      const backendData = {
        room: newBookingData.roomId,
        check_in_date: newBookingData.startDate,
        check_out_date: newBookingData.endDate,
        total_amount: newBookingData.totalPrice
      };
      const created = await createBookingAPI(backendData);
      if (created?.id) {
        setBookings(prev => {
          const next = prev.map(b => b.id === tempId ? { ...b, id: created.id.toString() } : b);
          try {
            localStorage.setItem('stayhub_bookings_v1', JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    } catch (error) {
      console.warn("Backend booking API deferred, using local persistence:", error);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    // 1. Update booking state and persist
    let targetBooking: Booking | undefined;
    setBookings(prev => {
      targetBooking = prev.find(b => b.id === bookingId);
      const next = prev.map(b => b.id === bookingId ? { ...b, status } : b);
      try {
        localStorage.setItem('stayhub_bookings_v1', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (targetBooking) {
      const room = rooms.find(r => r.id === targetBooking!.roomId);

      if (status === BookingStatus.APPROVED) {
        // Change room status to BOOKED
        updateRoomStatus(targetBooking.roomId, RoomStatus.BOOKED);

        // Record owner payout transaction
        const newTransaction: Transaction = {
          id: `t${Date.now()}`,
          bookingId: targetBooking.id,
          clientId: targetBooking.clientId,
          roomId: targetBooking.roomId,
          amount: targetBooking.totalPrice,
          date: new Date().toISOString(),
          paymentMethod: 'Stripe'
        };
        setTransactions(prev => [...prev, newTransaction]);

        // Generate Guest acceptance notification
        const guestNotification: Notification = {
          id: `notif-appr-${Date.now()}`,
          userId: targetBooking.clientId,
          title: '🎉 Booking Accepted by Owner!',
          message: `Owner Jaswant Galchar has accepted your booking for "${room?.title || 'your room'}" (${targetBooking.startDate} to ${targetBooking.endDate}). Your stay is confirmed!`,
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'BOOKING',
          link: '/client'
        };

        setNotifications(prev => {
          const next = [guestNotification, ...prev];
          try {
            localStorage.setItem('stayhub_notifications_v1', JSON.stringify(next));
          } catch {}
          return next;
        });
      } else if (status === BookingStatus.REJECTED) {
        // Generate Guest decline notification
        const guestDeclineNotif: Notification = {
          id: `notif-rej-${Date.now()}`,
          userId: targetBooking.clientId,
          title: 'Booking Request Declined',
          message: `Your booking request for "${room?.title || 'the property'}" (${targetBooking.startDate} to ${targetBooking.endDate}) could not be accommodated.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'BOOKING',
          link: '/client'
        };

        setNotifications(prev => {
          const next = [guestDeclineNotif, ...prev];
          try {
            localStorage.setItem('stayhub_notifications_v1', JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    }

    // 2. Background sync to backend API if available
    try {
      await updateBookingStatusAPI(bookingId, status.toLowerCase());
    } catch (err) {
      console.warn("Backend updateBookingStatus offline or deferred:", err);
    }
  };

  const updateProfile = (updatedFields: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updatedFields });
    }
  };

  const toggleWishlist = (roomId: string) => {
    setWishlist(prev => {
      const next = prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId];
      localStorage.setItem('stayhub_wishlist', JSON.stringify(next));
      return next;
    });
  };

  return React.createElement(AppContext.Provider, {
    value: {
      currentUser, rooms, bookings, transactions,
        messages,
        notifications,
        analytics,
        wishlist, isAuthModalOpen, authModalMode,
      login, register, detectRoleFromEmail, syncUserFromAuth, logout, updateRoomStatus, addBooking, updateBookingStatus, updateProfile, toggleWishlist, addRooms, openAuthModal, closeAuthModal, setAuthModalMode, requireAuth,
      markNotificationAsRead, markAllNotificationsAsRead
    }
  }, children);
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
