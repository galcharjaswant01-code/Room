
export enum UserRole {
  GUEST = 'GUEST',
  MANAGER = 'MANAGER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN'
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  PENDING = 'PENDING'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  // Landlord Specific
  mobile?: string;
  governmentId?: string;
  address?: string;
  isVerified?: boolean;
  onboardingComplete?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption: string;
  category: 'Rooms' | 'Amenities' | 'Dining' | 'Exterior' | 'Videos';
}

export interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  status: RoomStatus;
  images: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  mediaGallery?: MediaItem[];
  amenities: string[];
  type: 'Single' | 'Double' | 'Suite' | 'Penthouse';
  category: 'Beach' | 'Urban' | 'Nature' | 'Historic' | 'Luxury';
  rating: number;
  reviewCount: number;
  reviews: Review[];
  createdAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  bookingId: string;
  clientId: string;
  roomId: string;
  amount: number;
  date: string;
  paymentMethod: 'Stripe' | 'PayPal' | 'Card';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'BOOKING' | 'MESSAGE' | 'SYSTEM' | 'REVIEW';
  relatedId?: number;
  link?: string;
}

export interface AnalyticsData {
  month: string;
  revenue: number;
  bookings: number;
  views: number;
}

export interface ActivityEvent {
  id: string;
  type: 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'PAYMENT_RECEIVED' | 'PROPERTY_ADDED' | 'PROPERTY_UPDATED' | 'TENANT_REGISTERED' | 'REVIEW_SUBMITTED';
  message: string;
  timestamp: string;
  userId?: string;
  propertyId?: string;
  amount?: number;
}

export interface PropertyPerformance {
  propertyId: string;
  propertyName: string;
  totalRooms: number;
  bookedRooms: number;
  revenue: number;
  occupancyRate: number;
  rating: number;
}

