import { Room, RoomStatus, Booking, BookingStatus, User, UserRole, Transaction, ChatMessage, Notification, AnalyticsData, ActivityEvent, PropertyPerformance } from './types';

export const mockUsers: User[] = [
  {
    id: 'u-jaswant-owner',
    name: 'Jaswant Galchar',
    email: 'galcharjaswant01@gmail.com',
    role: UserRole.OWNER,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    isVerified: true,
    onboardingComplete: true
  }
];

export const initialRooms: Room[] = [
  {
    id: 'r1',
    title: 'Furnished 1BHK Apartment in Alkapuri',
    description: 'Well-maintained and fully furnished 1BHK apartment in central Alkapuri. Includes wooden double bed, wardrobe, high-speed WiFi, modular kitchen setup, and dedicated parking space. Walking distance from market and cafes.',
    price: 11500,
    location: {
      lat: 22.3107,
      lng: 73.1812,
      address: 'RC Dutt Road, Alkapuri, Vadodara, Gujarat'
    },
    latitude: 22.3107,
    longitude: 73.1812,
    address: 'RC Dutt Road, Alkapuri, Vadodara, Gujarat',
    city: 'Vadodara',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrl: '/room-images/room-video-1.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=800&q=80',
    mediaGallery: [
      {
        id: 'med-r1-main',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=800&q=80',
        caption: 'Master Bedroom with Double Bed',
        category: 'Rooms'
      },
      {
        id: 'med-r1-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        caption: 'Living & Dining Area',
        category: 'Rooms'
      },
      {
        id: 'med-r1-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80',
        caption: 'Clean Modular Kitchen',
        category: 'Amenities'
      },
      {
        id: 'med-r1-4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        caption: 'Attached Tiled Bathroom',
        category: 'Amenities'
      }
    ],
    amenities: ['Hi-Speed WiFi', 'Split AC', 'Modular Kitchen', 'Geyser', 'Wardrobe', 'Bike Parking'],
    type: 'Single',
    category: 'Urban',
    rating: 4.8,
    reviewCount: 24,
    reviews: [
      {
        id: 'rev1',
        userId: 'u2',
        userName: 'Rahul Sharma',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        rating: 5,
        comment: 'Very clean and spacious 1BHK. The location in Alkapuri is super convenient.',
        date: '2026-08-20'
      }
    ]
  },
  {
    id: 'r2',
    title: 'Single AC Room PG near MSU Campus',
    description: 'Comfortable and quiet private single room PG for students and working professionals. Equipped with study table, bookshelf, single cot with mattress, split AC, and 24x7 water facility. High speed WiFi included.',
    price: 6500,
    location: {
      lat: 22.3216,
      lng: 73.1724,
      address: 'Near University Road, Fatehgunj, Vadodara, Gujarat'
    },
    latitude: 22.3216,
    longitude: 73.1724,
    address: 'Near University Road, Fatehgunj, Vadodara, Gujarat',
    city: 'Vadodara',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80'
    ],
    mediaGallery: [
      {
        id: 'med-r2-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
        caption: 'Study Desk and Single Bed',
        category: 'Rooms'
      },
      {
        id: 'med-r2-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=800&q=80',
        caption: 'Bed & Natural Window Light',
        category: 'Rooms'
      }
    ],
    amenities: ['Hi-Speed WiFi', 'Split AC', 'Study Table', 'Cupboard', 'RO Drinking Water', 'Geyser'],
    type: 'Single',
    category: 'Urban',
    rating: 4.7,
    reviewCount: 19,
    reviews: []
  },
  {
    id: 'r3',
    title: 'Spacious 2BHK Flat with Balcony in Manjalpur',
    description: 'Spacious and ventilated 2BHK flat in a peaceful gated society. Comes with two bedrooms, airy balcony, semi-modular kitchen, lift facility, and round-the-clock security. Ideal for families and couples.',
    price: 14000,
    location: {
      lat: 22.2858,
      lng: 73.1974,
      address: 'Main Ring Road, Manjalpur, Vadodara, Gujarat'
    },
    latitude: 22.2858,
    longitude: 73.1974,
    address: 'Main Ring Road, Manjalpur, Vadodara, Gujarat',
    city: 'Vadodara',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80'
    ],
    mediaGallery: [
      {
        id: 'med-r3-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
        caption: 'Master Bedroom with Balcony View',
        category: 'Rooms'
      },
      {
        id: 'med-r3-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
        caption: 'Living Room Space',
        category: 'Rooms'
      }
    ],
    amenities: ['Balcony', 'Lift Facility', 'Gated Security', 'Covered Parking', 'Modular Kitchen', 'Power Backup'],
    type: 'Double',
    category: 'Urban',
    rating: 4.9,
    reviewCount: 31,
    reviews: []
  },
  {
    id: 'r4',
    title: 'Modern Studio Apartment in Navrangpura',
    description: 'Sleek and self-contained studio flat in the heart of Navrangpura. Designed for young professionals with open-plan layout, workstation desk, mini-fridge space, smart TV, and attached bathroom.',
    price: 12500,
    location: {
      lat: 23.0365,
      lng: 72.5611,
      address: 'Commerce College Road, Navrangpura, Ahmedabad, Gujarat'
    },
    latitude: 23.0365,
    longitude: 72.5611,
    address: 'Commerce College Road, Navrangpura, Ahmedabad, Gujarat',
    city: 'Ahmedabad',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=800&q=80'
    ],
    mediaGallery: [
      {
        id: 'med-r4-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
        caption: 'Studio Living & Bed Area',
        category: 'Rooms'
      }
    ],
    amenities: ['Hi-Speed WiFi', 'Smart TV', 'Air Conditioning', 'Workstation', 'Attached Bath', 'Geyser'],
    type: 'Suite',
    category: 'Urban',
    rating: 4.6,
    reviewCount: 15,
    reviews: []
  },
  {
    id: 'r5',
    title: 'Budget Twin Sharing Student Room',
    description: 'Affordable and neat twin-sharing room for college students. Two separate beds, individual study desks, personal wardrobes, high-speed WiFi, and daily housekeeping included in Infocity.',
    price: 4800,
    location: {
      lat: 23.1924,
      lng: 72.6289,
      address: 'Near Infocity Hub, Gandhinagar, Gujarat'
    },
    latitude: 23.1924,
    longitude: 72.6289,
    address: 'Near Infocity Hub, Gandhinagar, Gujarat',
    city: 'Gandhinagar',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    mediaGallery: [],
    amenities: ['WiFi Included', 'Individual Desks', 'Daily Housekeeping', 'RO Water', 'CCTV Security'],
    type: 'Single',
    category: 'Urban',
    rating: 4.5,
    reviewCount: 12,
    reviews: []
  },
  {
    id: 'r6',
    title: 'Cozy 1RK Flat with Balcony in Vesu',
    description: 'Compact and peaceful 1RK flat with attached balcony. Comes with double bed, ceiling fan, wardrobe, tiled flooring, and natural breeze. Close to BRTS stop and shopping mart.',
    price: 8500,
    location: {
      lat: 21.1418,
      lng: 72.7709,
      address: 'VIP Road, Vesu, Surat, Gujarat'
    },
    latitude: 21.1418,
    longitude: 72.7709,
    address: 'VIP Road, Vesu, Surat, Gujarat',
    city: 'Surat',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    mediaGallery: [],
    amenities: ['Private Balcony', 'Ceiling Fan', 'Attached Bath', 'BRTS Nearby', 'Bike Parking'],
    type: 'Single',
    category: 'Urban',
    rating: 4.7,
    reviewCount: 18,
    reviews: []
  },
  {
    id: 'r7',
    title: 'Modern Sea-Facing Studio in Bandra West',
    description: 'Chic designer studio with panoramic Arabian sea view in prime Bandra West. Equipped with king bed, modular pantry, smart TV, split AC, and 24x7 security. Walking distance from Carter Road promenade.',
    price: 28000,
    location: {
      lat: 19.0596,
      lng: 72.8295,
      address: 'Carter Road, Bandra West, Mumbai, Maharashtra'
    },
    latitude: 19.0596,
    longitude: 72.8295,
    address: 'Carter Road, Bandra West, Mumbai, Maharashtra',
    city: 'Mumbai',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'
    ],
    videoUrl: '/room-images/room-video-1.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Sea View', 'Split AC', 'Smart TV', 'High Speed WiFi', 'Modular Pantry', '24x7 Security'],
    type: 'Suite',
    category: 'Luxury',
    rating: 4.9,
    reviewCount: 42,
    reviews: [
      {
        id: 'rev7',
        userId: 'u2',
        userName: 'Aakash Singhania',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        rating: 5,
        comment: 'Unbeatable location on Carter Road. Sunset views are phenomenal.',
        date: '2026-09-02'
      }
    ]
  },
  {
    id: 'r8',
    title: 'Executive 1BHK in Koramangala 4th Block',
    description: 'Fully furnished premium 1BHK in startup hotspot Koramangala. Includes dedicated workstation with ergonomic chair, high-speed fiber internet, split AC, modular kitchen, and power backup.',
    price: 19500,
    location: {
      lat: 12.9352,
      lng: 77.6245,
      address: '80 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka'
    },
    latitude: 12.9352,
    longitude: 77.6245,
    address: '80 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka',
    city: 'Bengaluru',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    videoUrl: '/room-images/room-video-1.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Fiber WiFi', 'Workstation', 'Power Backup', 'Split AC', 'Modular Kitchen', 'Lift'],
    type: 'Single',
    category: 'Urban',
    rating: 4.8,
    reviewCount: 36,
    reviews: []
  },
  {
    id: 'r9',
    title: 'Spacious 2BHK with Balcony on Kalawad Road',
    description: 'Beautiful 2BHK flat with open balconies in a prestigious society on Kalawad Road. Ventilated rooms, covered car parking, lift, water purifier, and round-the-clock security.',
    price: 12000,
    location: {
      lat: 22.2818,
      lng: 70.7758,
      address: 'Near KKV Hall, Kalawad Road, Rajkot, Gujarat'
    },
    latitude: 22.2818,
    longitude: 70.7758,
    address: 'Near KKV Hall, Kalawad Road, Rajkot, Gujarat',
    city: 'Rajkot',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'
    ],
    videoUrl: '/room-images/room-video-1.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Private Balcony', 'Covered Parking', 'Lift', 'RO Water', 'CCTV Security'],
    type: 'Double',
    category: 'Urban',
    rating: 4.7,
    reviewCount: 22,
    reviews: []
  },
  {
    id: 'r10',
    title: 'Beachside 1BHK Villa Apartment in Calangute',
    description: 'Sunny and breezy 1BHK apartment just 300 meters from Calangute beach. Features private balcony with palm views, pool access, split AC, and kitchenette. Perfect for relaxing holidays or remote work.',
    price: 16500,
    location: {
      lat: 15.5439,
      lng: 73.7553,
      address: 'Holiday Street, Calangute Beach Road, Goa'
    },
    latitude: 15.5439,
    longitude: 73.7553,
    address: 'Holiday Street, Calangute Beach Road, Goa',
    city: 'Goa',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80'
    ],
    videoUrl: '/room-images/room-video-1.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Pool Access', 'Beach Walking Distance', 'Air Conditioning', 'WiFi', 'Balcony', 'Parking'],
    type: 'Suite',
    category: 'Beach',
    rating: 4.9,
    reviewCount: 51,
    reviews: []
  },
  {
    id: 'r11',
    title: 'Boutique Heritage Studio in C-Scheme',
    description: 'Elegantly furnished heritage studio in central Jaipur. Traditional Rajasthani aesthetics combined with contemporary conveniences: king size bed, split AC, high-speed WiFi, and peaceful courtyard.',
    price: 13000,
    location: {
      lat: 26.9124,
      lng: 75.7873,
      address: 'Subhash Marg, C-Scheme, Jaipur, Rajasthan'
    },
    latitude: 26.9124,
    longitude: 75.7873,
    address: 'Subhash Marg, C-Scheme, Jaipur, Rajasthan',
    city: 'Jaipur',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80'
    ],
    videoUrl: '/room-images/room-video-1.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Heritage Interior', 'Split AC', 'Fast WiFi', 'Courtyard Access', 'Geyser', 'Car Parking'],
    type: 'Suite',
    category: 'Historic',
    rating: 4.8,
    reviewCount: 29,
    reviews: []
  },
  {
    id: 'r12',
    title: 'Peaceful 1BHK in Koregaon Park Lane 7',
    description: 'Lush green surroundings in prime Koregaon Park. Tastefully furnished 1BHK with spacious bedroom, attached balcony overlooking tree-lined street, modern bath fittings, and parking.',
    price: 18000,
    location: {
      lat: 18.5362,
      lng: 73.8940,
      address: 'Lane 7, Koregaon Park, Pune, Maharashtra'
    },
    latitude: 18.5362,
    longitude: 73.8940,
    address: 'Lane 7, Koregaon Park, Pune, Maharashtra',
    city: 'Pune',
    status: RoomStatus.AVAILABLE,
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    videoUrl: '/room-images/room-video-1.mp4',
    videoThumbnail: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Green Balcony', 'Split AC', 'Hi-Speed WiFi', 'Covered Parking', 'Gated Security'],
    type: 'Single',
    category: 'Urban',
    rating: 4.85,
    reviewCount: 38,
    reviews: []
  }
];

export const mockRooms: Room[] = initialRooms;

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    roomId: 'r1',
    clientId: 'u2',
    startDate: '2026-09-01',
    endDate: '2026-09-05',
    status: BookingStatus.APPROVED,
    totalPrice: 11500
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    bookingId: 'b1',
    clientId: 'u2',
    roomId: 'r1',
    amount: 11500,
    date: '2026-08-20',
    paymentMethod: 'Card'
  }
];

export const mockMessages: any[] = [
  {
    id: 'm1',
    senderId: 'u2',
    receiverId: 'u1',
    content: 'Hello Jaswant, is early check-in available for the 1BHK in Alkapuri?',
    text: 'Hello Jaswant, is early check-in available for the 1BHK in Alkapuri?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    isRead: true
  },
  {
    id: 'm2',
    senderId: 'u1',
    receiverId: 'u2',
    content: 'Hi Sarah, yes! Early check-in can be arranged from 11:00 AM onwards.',
    text: 'Hi Sarah, yes! Early check-in can be arranged from 11:00 AM onwards.',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    isRead: true
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'New Booking Request',
    message: 'Sarah Connor submitted a stay request for Furnished 1BHK Apartment in Alkapuri.',
    timestamp: '2 hours ago',
    isRead: false,
    type: 'booking'
  }
];

export const mockAnalytics: any[] = [
  { month: 'Jan', revenue: 45000, bookings: 12, occupancyRate: 78, views: 340 },
  { month: 'Feb', revenue: 58000, bookings: 15, occupancyRate: 85, views: 420 },
  { month: 'Mar', revenue: 64000, bookings: 18, occupancyRate: 92, views: 510 },
  { month: 'Apr', revenue: 52000, bookings: 16, occupancyRate: 88, views: 480 },
  { month: 'May', revenue: 71000, bookings: 20, occupancyRate: 95, views: 630 },
  { month: 'Jun', revenue: 84000, bookings: 24, occupancyRate: 96, views: 720 }
];

export const mockPreviousYearAnalytics: any[] = [
  { month: 'Jan', revenue: 38000, bookings: 10, occupancyRate: 70, views: 280 },
  { month: 'Feb', revenue: 42000, bookings: 12, occupancyRate: 75, views: 310 },
  { month: 'Mar', revenue: 49000, bookings: 14, occupancyRate: 80, views: 390 },
  { month: 'Apr', revenue: 46000, bookings: 13, occupancyRate: 78, views: 370 },
  { month: 'May', revenue: 55000, bookings: 16, occupancyRate: 85, views: 450 },
  { month: 'Jun', revenue: 62000, bookings: 18, occupancyRate: 88, views: 500 }
];

export const mockActivityFeed: ActivityEvent[] = [
  {
    id: 'act1',
    type: 'BOOKING_CREATED',
    message: 'New stay booking confirmed for 1BHK Apartment in Alkapuri',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    amount: 11500
  },
  {
    id: 'act2',
    type: 'PAYMENT_RECEIVED',
    message: 'Online rent payment received for Room #204',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    amount: 14200
  },
  {
    id: 'act3',
    type: 'PROPERTY_ADDED',
    message: 'Luxury Studio in Vasna Road published successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  },
  {
    id: 'act4',
    type: 'REVIEW_SUBMITTED',
    message: 'Guest rated your listing 5-stars with positive feedback',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString()
  }
];

export const mockPropertyPerformance: PropertyPerformance[] = [
  {
    propertyId: 'r1',
    propertyName: 'Furnished 1BHK Alkapuri',
    totalRooms: 8,
    bookedRooms: 7,
    revenue: 80500,
    occupancyRate: 88,
    rating: 4.9
  },
  {
    propertyId: 'r2',
    propertyName: 'Luxury Studio Vasna Road',
    totalRooms: 6,
    bookedRooms: 5,
    revenue: 55000,
    occupancyRate: 83,
    rating: 4.8
  },
  {
    propertyId: 'r3',
    propertyName: 'Spacious 2BHK Gotri Estate',
    totalRooms: 10,
    bookedRooms: 8,
    revenue: 112000,
    occupancyRate: 80,
    rating: 4.7
  },
  {
    propertyId: 'r4',
    propertyName: 'Urban Suite Fatehgunj',
    totalRooms: 5,
    bookedRooms: 4,
    revenue: 48000,
    occupancyRate: 80,
    rating: 4.6
  }
];
