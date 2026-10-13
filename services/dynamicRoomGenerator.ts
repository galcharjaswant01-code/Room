import { Room, RoomStatus } from '../types';
import { calculateDistance } from './locationService';

// Real curated residential interior & apartment photos
const PHOTO_SETS = [
  {
    type: 'Single' as const,
    category: 'Urban' as const,
    cover: 'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    ],
    titlePrefix: 'Furnished 1BHK Apartment',
    priceBase: 11000,
    amenities: ['Hi-Speed WiFi', 'Split AC', 'Modular Kitchen', 'Geyser', 'Wardrobe', 'Bike Parking'],
  },
  {
    type: 'Single' as const,
    category: 'Urban' as const,
    cover: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80',
    ],
    titlePrefix: 'Cozy Private Single Room PG',
    priceBase: 6800,
    amenities: ['High-Speed WiFi', 'Split AC', 'Study Table', 'Cupboard', 'RO Drinking Water', 'Geyser'],
  },
  {
    type: 'Double' as const,
    category: 'Urban' as const,
    cover: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=80',
    ],
    titlePrefix: 'Spacious 2BHK Flat with Balcony',
    priceBase: 15500,
    amenities: ['Private Balcony', 'Lift Facility', 'Gated Society', 'Covered Parking', 'Modular Kitchen', 'Power Backup'],
  },
  {
    type: 'Suite' as const,
    category: 'Luxury' as const,
    cover: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    ],
    titlePrefix: 'Modern Designer Studio Suite',
    priceBase: 13500,
    amenities: ['Workstation Desk', 'Smart TV', 'Air Conditioning', 'High Speed WiFi', 'Ensuite Bathroom', 'Geyser'],
  },
  {
    type: 'Penthouse' as const,
    category: 'Luxury' as const,
    cover: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    ],
    titlePrefix: 'Luxury 3BHK Penthouse with Skyline View',
    priceBase: 24500,
    amenities: ['Panoramic Terrace', 'Gym & Clubhouse', 'Italian Modular Kitchen', '2 Car Parking', '24x7 Security', 'Elevator'],
  },
  {
    type: 'Single' as const,
    category: 'Urban' as const,
    cover: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    ],
    titlePrefix: 'Bright 1RK Studio with Open Kitchen',
    priceBase: 8900,
    amenities: ['Open Kitchenette', 'Balcony', 'Ceiling Fan & AC', 'Water Purifier', 'Security Guard'],
  },
  {
    type: 'Double' as const,
    category: 'Beach' as const,
    cover: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
    ],
    titlePrefix: 'Sunny Garden View Apartment',
    priceBase: 14000,
    amenities: ['Garden View', 'Swimming Pool Access', 'Air Conditioning', 'WiFi', 'Kitchenette', 'Parking'],
  },
  {
    type: 'Single' as const,
    category: 'Historic' as const,
    cover: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    ],
    titlePrefix: 'Heritage Style 1BHK Flat',
    priceBase: 10500,
    amenities: ['Traditional Decor', 'Balcony', 'High Speed WiFi', 'Split AC', 'Modular Kitchen', 'Power Backup'],
  },
];

// Helper to extract clean area/city name
export const parseLocationName = (displayName: string): { area: string; city: string; state: string } => {
  if (!displayName) return { area: 'Central Area', city: 'City', state: 'India' };
  const parts = displayName.split(',').map((p) => p.trim());
  const area = parts[0] || 'Prime Location';
  const city = parts[1] || parts[0];
  const state = parts[2] || parts[parts.length - 2] || 'India';
  return { area, city, state };
};

// Realistic street suffixes
const STREET_SUFFIXES = [
  'Main Road',
  'Ring Road',
  'Avenue Lane',
  'Green Park Enclave',
  'Residency Road',
  'Station Link Road',
  'Cross Road 4',
  'Heights Avenue',
];

// Realistic tenant review seeds
const REVIEW_SEEDS = [
  { name: 'Rohan Mehta', rating: 5, comment: 'Spacious, clean, and exact match to photos. Landlord is very supportive.' },
  { name: 'Pooja Patel', rating: 4.8, comment: 'Great location with markets within walking distance. High-speed WiFi is reliable.' },
  { name: 'Kavita Iyer', rating: 4.9, comment: 'Very peaceful neighborhood and safe gated security. Loved staying here.' },
  { name: 'Aditya Verma', rating: 4.7, comment: 'Everything was ready when moving in. AC and geyser working perfectly.' },
];

const LOCAL_STORAGE_KEY = 'stayhub_dynamic_rooms_v1';

// Load stored dynamic rooms
export const getStoredDynamicRooms = (): Room[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// Save newly generated dynamic rooms
export const saveDynamicRooms = (newRooms: Room[]) => {
  try {
    const existing = getStoredDynamicRooms();
    const map = new Map<string, Room>();
    existing.forEach((r) => map.set(r.id, r));
    newRooms.forEach((r) => map.set(r.id, r));
    const combined = Array.from(map.values());
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combined.slice(-150))); // Keep latest 150
  } catch (e) {
    console.warn('Failed to save dynamic rooms to localStorage', e);
  }
};

/**
 * Generate authentic, realistic rooms for any target latitude & longitude
 */
export const generateRoomsForLocation = (
  targetLat: number,
  targetLng: number,
  displayName: string,
  count: number = 8
): Room[] => {
  const { area, city, state } = parseLocationName(displayName);

  // Normalize place slug for unique reproducible ID
  const placeSlug = `${area}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);

  const generated: Room[] = [];

  // Deterministic-like angular spread so markers cluster naturally around the searched point (300m - 2.5km)
  for (let i = 0; i < count; i++) {
    const photoTemplate = PHOTO_SETS[i % PHOTO_SETS.length];
    const street = STREET_SUFFIXES[i % STREET_SUFFIXES.length];
    const reviewSeed = REVIEW_SEEDS[i % REVIEW_SEEDS.length];

    // Angular distribution around target point
    const angle = (i * (360 / count) + (i % 2 === 0 ? 15 : -25)) * (Math.PI / 180);
    // Radius in degrees: ~0.004 to 0.018 deg is ~400m to 2.0km
    const distOffset = 0.004 + (i * 0.002) % 0.012;
    const roomLat = Number((targetLat + Math.cos(angle) * distOffset).toFixed(6));
    const roomLng = Number((targetLng + Math.sin(angle) * distOffset).toFixed(6));

    const roomAddress = `${street}, ${area}, ${city}, ${state}`;
    const roomTitle = `${photoTemplate.titlePrefix} in ${area}`;
    const priceVariance = (i % 3 === 0 ? 500 : i % 2 === 0 ? -500 : 0) + (i * 200);
    const price = photoTemplate.priceBase + priceVariance;
    const rating = Number((4.5 + ((i % 5) * 0.1)).toFixed(1));
    const reviewCount = 8 + (i * 4);

    const roomId = `room-${placeSlug}-${i + 1}`;

    const mediaGallery = photoTemplate.images.map((imgUrl, imgIdx) => ({
      id: `med-${roomId}-${imgIdx}`,
      type: 'image' as const,
      url: imgUrl,
      thumbnail: imgUrl,
      caption: `${roomTitle} - ${imgIdx === 0 ? 'Master Bedroom' : imgIdx === 1 ? 'Living Room & Seating' : imgIdx === 2 ? 'Modular Kitchen' : 'Attached Bathroom'}`,
      category: (imgIdx === 2 ? 'Amenities' : 'Rooms') as any,
    }));

    const room: Room = {
      id: roomId,
      title: roomTitle,
      description: `Spacious, fully verified ${photoTemplate.titlePrefix.toLowerCase()} available for rent in ${area}, ${city}. Features bright ventilated rooms, clean modular fittings, round-the-clock water and electricity supply, and close proximity to public transportation, cafes, and markets. Inspected and verified by StayHub.`,
      price,
      location: {
        lat: roomLat,
        lng: roomLng,
        address: roomAddress,
      },
      latitude: roomLat,
      longitude: roomLng,
      address: roomAddress,
      city,
      status: RoomStatus.AVAILABLE,
      images: photoTemplate.images,
      videoUrl: '/room-images/room-video-1.mp4',
      videoThumbnail: photoTemplate.cover,
      mediaGallery,
      amenities: photoTemplate.amenities,
      type: photoTemplate.type,
      category: photoTemplate.category,
      rating,
      reviewCount,
      reviews: [
        {
          id: `rev-${roomId}`,
          userId: 'u2',
          userName: reviewSeed.name,
          userAvatar: `https://images.unsplash.com/photo-${1534528741775 + (i * 100)}?auto=format&fit=crop&q=80&w=256`,
          rating: reviewSeed.rating,
          comment: reviewSeed.comment,
          date: '2026-09-15',
        },
      ],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    };

    generated.push(room);
  }

  saveDynamicRooms(generated);
  return generated;
};

// URL builder utilities for Google Maps, Google Images, and Street View
export const getGoogleSearchLinks = (room: Room) => {
  const coords = `${room.location.lat},${room.location.lng}`;
  const query = encodeURIComponent(`${room.title} ${room.location.address}`);
  const imageQuery = encodeURIComponent(`${room.title} ${room.city || room.location.address} real room interior`);

  return {
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${coords}`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${coords}`,
    streetViewUrl: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coords}`,
    googleImagesUrl: `https://www.google.com/search?tbm=isch&q=${imageQuery}`,
  };
};
