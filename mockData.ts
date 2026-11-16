import { Room, RoomStatus, Booking, BookingStatus, User, UserRole, Transaction, ChatMessage, Notification, AnalyticsData, ActivityEvent, PropertyPerformance } from './types';

export const mockUsers: User[] = [
  {
    id: 'u-owner-main',
    name: 'Property Owner',
    email: 'galcharjaswant01@gmail.com',
    role: UserRole.OWNER,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    isVerified: true,
    onboardingComplete: true
  }
];

export const initialRooms: Room[] = [
  {
    "id": "r1",
    "title": "Shree Banas PG & Student Residency",
    "description": "Verified student and paying guest residence located right on Abu Highway near Aroma Circle, Palanpur. Provides 24/7 RO water, high-speed WiFi, meal mess option, and study desks. Walking distance to highway transit and shops.",
    "price": 4500,
    "location": {
      "lat": 24.1804,
      "lng": 72.4412,
      "address": "Near Aroma Circle, Abu Highway, Palanpur, Gujarat 385001"
    },
    "latitude": 24.1804,
    "longitude": 72.4412,
    "address": "Near Aroma Circle, Abu Highway, Palanpur, Gujarat 385001",
    "locality": "Aroma Circle / Abu Highway",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "CONFIRMED_AVAILABLE",
    "source": "Google Places & Verified Palanpur Registry",
    "sourceListingId": "pal-aroma-pg-01",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1804,72.4412",
    "attribution": "Verified Public Housing Catalog (Palanpur)",
    "images": [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r1-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
        "caption": "Shared Student Room Layout",
        "category": "Rooms"
      },
      {
        "id": "med-r1-2",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80",
        "caption": "Individual Study Desk & Bed",
        "category": "Rooms"
      },
      {
        "id": "med-r1-3",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "caption": "Study Space with Lighting",
        "category": "Rooms"
      },
      {
        "id": "med-r1-4",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "caption": "Clean Shared Washroom",
        "category": "Amenities"
      }
    ],
    "amenities": [
      "Hi-Speed WiFi",
      "RO Drinking Water",
      "Meal Mess Option",
      "Study Table",
      "Geyser",
      "Bike Parking"
    ],
    "type": "PG",
    "propertyType": "PG",
    "category": "Urban",
    "rating": 4.8,
    "reviewCount": 34,
    "reviews": []
  },
  {
    "id": "r2",
    "title": "G.D. Modi Campus Area Student Rooms",
    "description": "Convenient student rooms within 2 minutes walk from G.D. Modi College and Vidyamandir sports ground. Features private attached washrooms, individual electricity meters, and wardrobe.",
    "price": 6000,
    "location": {
      "lat": 24.1751,
      "lng": 72.4382,
      "address": "G.D. Modi College Road, Opp. Vidyamandir Sports Ground, Palanpur, Gujarat 385001"
    },
    "latitude": 24.1751,
    "longitude": 72.4382,
    "address": "G.D. Modi College Road, Opp. Vidyamandir Sports Ground, Palanpur, Gujarat 385001",
    "locality": "College Road",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "CONFIRMED_AVAILABLE",
    "source": "Palanpur Student Housing Directory",
    "sourceListingId": "pal-dir-gdmodi-02",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1751,72.4382",
    "attribution": "Verified Student Residency Records",
    "images": [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r2-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "caption": "Single Room Interior",
        "category": "Rooms"
      },
      {
        "id": "med-r2-2",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "caption": "Work Desk & Bookshelf",
        "category": "Rooms"
      },
      {
        "id": "med-r2-3",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "caption": "Attached Bathroom",
        "category": "Amenities"
      }
    ],
    "amenities": [
      "Attached Washroom",
      "Separate Electric Meter",
      "Wardrobe",
      "Hi-Speed WiFi",
      "Bike Parking"
    ],
    "type": "Single",
    "propertyType": "Single",
    "category": "Urban",
    "rating": 4.9,
    "reviewCount": 42,
    "reviews": []
  },
  {
    "id": "r3",
    "title": "Cozy Tower Executive 1BHK Rental Unit",
    "description": "Executive furnished 1BHK rental unit in the landmark Cozy Tower complex, directly facing Palanpur Railway Station Road. Features lift, split AC, modular kitchen, and balcony.",
    "price": 11500,
    "location": {
      "lat": 24.1718,
      "lng": 72.4265,
      "address": "Cozy Tower Complex, Railway Station Road, Palanpur, Gujarat 385001"
    },
    "latitude": 24.1718,
    "longitude": 72.4265,
    "address": "Cozy Tower Complex, Railway Station Road, Palanpur, Gujarat 385001",
    "locality": "Station Area",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "CONFIRMED_AVAILABLE",
    "source": "Palanpur Verified Registry",
    "sourceListingId": "pal-cozy-stn-03",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1718,72.4265",
    "attribution": "Verified Property Management",
    "images": [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r3-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "caption": "Station View Living Area",
        "category": "Rooms"
      },
      {
        "id": "med-r3-2",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80",
        "caption": "Double Bedroom Suite",
        "category": "Rooms"
      },
      {
        "id": "med-r3-3",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
        "caption": "Modular Kitchen",
        "category": "Amenities"
      }
    ],
    "amenities": [
      "Split AC",
      "Lift / Elevator",
      "Modular Kitchen",
      "Reserved Parking",
      "24/7 Security"
    ],
    "type": "Suite",
    "propertyType": "Suite",
    "category": "Luxury",
    "rating": 4.95,
    "reviewCount": 28,
    "reviews": []
  },
  {
    "id": "r4",
    "title": "Mansarovar Lakeview Residency Flat",
    "description": "Spacious 2BHK residential flat located along Mansarovar Road. Scenic views of Mansarovar lake, 24/7 municipal water supply, dedicated parking, and secure gated campus.",
    "price": 14000,
    "location": {
      "lat": 24.1685,
      "lng": 72.428,
      "address": "Mansarovar Road, Near Mansarovar Lake, Palanpur, Gujarat 385001"
    },
    "latitude": 24.1685,
    "longitude": 72.428,
    "address": "Mansarovar Road, Near Mansarovar Lake, Palanpur, Gujarat 385001",
    "locality": "Mansarovar Road",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "LISTING_ONLY",
    "availabilityNotice": "Listing Information Only – Inquire for live vacancy",
    "source": "Palanpur Urban Housing Records",
    "sourceListingId": "pal-mansarovar-fl-04",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1685,72.4280",
    "attribution": "Public Listing Record",
    "images": [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r4-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        "caption": "Spacious Hall with Lakeview Balcony",
        "category": "Rooms"
      },
      {
        "id": "med-r4-2",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
        "caption": "Master Bedroom",
        "category": "Rooms"
      }
    ],
    "amenities": [
      "Lake View Balcony",
      "Dedicated Car Parking",
      "CCTV Security",
      "Lift",
      "Municipal Water"
    ],
    "type": "Flat",
    "propertyType": "Flat",
    "category": "Urban",
    "rating": 4.75,
    "reviewCount": 19,
    "reviews": []
  },
  {
    "id": "r5",
    "title": "Vidyamandir Area Paying Guest",
    "description": "Comfortable paying guest accommodation in Taley Baug area near Vidyamandir school. Clean environment, study space, hot water via solar geyser, and healthy vegetarian meals.",
    "price": 5000,
    "location": {
      "lat": 24.1735,
      "lng": 72.434,
      "address": "Near Taley Baug Circle, Vidyamandir Road, Palanpur, Gujarat 385001"
    },
    "latitude": 24.1735,
    "longitude": 72.434,
    "address": "Near Taley Baug Circle, Vidyamandir Road, Palanpur, Gujarat 385001",
    "locality": "Taley Baug",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "CONFIRMED_AVAILABLE",
    "source": "Banaskantha Educational Housing",
    "sourceListingId": "pal-taleybaug-pg-05",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1735,72.4340",
    "attribution": "Educational Vicinity Registry",
    "images": [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r5-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "caption": "Clean Student Bedroom",
        "category": "Rooms"
      },
      {
        "id": "med-r5-2",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "caption": "Study Desk Setup",
        "category": "Rooms"
      }
    ],
    "amenities": [
      "Solar Hot Water",
      "Vegetarian Mess",
      "CCTV Surveillance",
      "Daily Cleaning",
      "Hi-Speed WiFi"
    ],
    "type": "PG",
    "propertyType": "PG",
    "category": "Urban",
    "rating": 4.85,
    "reviewCount": 26,
    "reviews": []
  },
  {
    "id": "r6",
    "title": "Deesa Cross Road Modern Apartment",
    "description": "Well-connected apartment at Deesa Highway Cross Road, Palanpur. Fast highway access to Deesa and Abu Road, nearby markets, and modern interior finish.",
    "price": 9500,
    "location": {
      "lat": 24.182,
      "lng": 72.419,
      "address": "Near Deesa Highway Circle, Deesa Road, Palanpur, Gujarat 385001"
    },
    "latitude": 24.182,
    "longitude": 72.419,
    "address": "Near Deesa Highway Circle, Deesa Road, Palanpur, Gujarat 385001",
    "locality": "Deesa Cross Road",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "LISTING_ONLY",
    "availabilityNotice": "Listing Information Only – Inquire for live vacancy",
    "source": "Gujarat RERA Public Records / Local Registry",
    "sourceListingId": "pal-deesa-apt-06",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1820,72.4190",
    "attribution": "Public Municipal Registry",
    "images": [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r6-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "caption": "Main Living Area",
        "category": "Rooms"
      },
      {
        "id": "med-r6-2",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80",
        "caption": "Bedroom with Natural Light",
        "category": "Rooms"
      }
    ],
    "amenities": [
      "Power Backup",
      "Modular Kitchen",
      "Balcony",
      "Covered Parking",
      "Security"
    ],
    "type": "Flat",
    "propertyType": "Apartment",
    "category": "Urban",
    "rating": 4.7,
    "reviewCount": 15,
    "reviews": []
  },
  {
    "id": "r7",
    "title": "Gayatri Nagar Independent Residential Room",
    "description": "Peaceful independent room in Gayatri Nagar, Palanpur. Includes separate entrance, access to open terrace, attached washroom, and safe family residential neighborhood.",
    "price": 5500,
    "location": {
      "lat": 24.164,
      "lng": 72.437,
      "address": "Plot 24, Gayatri Mandir Road, Gayatri Nagar, Palanpur, Gujarat 385001"
    },
    "latitude": 24.164,
    "longitude": 72.437,
    "address": "Plot 24, Gayatri Mandir Road, Gayatri Nagar, Palanpur, Gujarat 385001",
    "locality": "Gayatri Nagar",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "CONFIRMED_AVAILABLE",
    "source": "Palanpur Local Listing Catalog",
    "sourceListingId": "pal-gayatri-rm-07",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1640,72.4370",
    "attribution": "Verified Home Rental Registry",
    "images": [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r7-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "caption": "Independent Room with Bed",
        "category": "Rooms"
      },
      {
        "id": "med-r7-2",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "caption": "Desk and Wardrobe Area",
        "category": "Rooms"
      }
    ],
    "amenities": [
      "Separate Entrance",
      "Open Terrace Access",
      "Attached Washroom",
      "Bike Parking"
    ],
    "type": "Single",
    "propertyType": "Single",
    "category": "Urban",
    "rating": 4.8,
    "reviewCount": 21,
    "reviews": []
  },
  {
    "id": "r8",
    "title": "Highway Comfort Stay & Shared Rooms",
    "description": "Affordable room-sharing accommodation along Ahmedabad-Palanpur highway near Kanodar. Ideal for working professionals and trainees seeking budget-friendly stays.",
    "price": 3800,
    "location": {
      "lat": 24.148,
      "lng": 72.425,
      "address": "Ahmedabad-Palanpur Highway, Near Kanodar Cross Road, Palanpur, Gujarat 385001"
    },
    "latitude": 24.148,
    "longitude": 72.425,
    "address": "Ahmedabad-Palanpur Highway, Near Kanodar Cross Road, Palanpur, Gujarat 385001",
    "locality": "Kanodar Highway",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "CONFIRMED_AVAILABLE",
    "source": "Palanpur Verified Registry",
    "sourceListingId": "pal-highway-sh-08",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1480,72.4250",
    "attribution": "Verified Lodging Index",
    "images": [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r8-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
        "caption": "Clean 2-Bed Sharing Setup",
        "category": "Rooms"
      }
    ],
    "amenities": [
      "Regular Bus/Auto Access",
      "Free WiFi",
      "RO Drinking Water",
      "CCTV Security"
    ],
    "type": "Shared",
    "propertyType": "Shared",
    "category": "Urban",
    "rating": 4.65,
    "reviewCount": 18,
    "reviews": []
  },
  {
    "id": "r9",
    "title": "Simla Gate Traditional 2-Room Floor",
    "description": "Spacious two-room floor located in the historic heart of Palanpur near Simla Gate. Walking distance to central textile and jewelry markets, vegetable market, and banks.",
    "price": 7000,
    "location": {
      "lat": 24.172,
      "lng": 72.431,
      "address": "Near Old City Simla Gate, City Center, Palanpur, Gujarat 385001"
    },
    "latitude": 24.172,
    "longitude": 72.431,
    "address": "Near Old City Simla Gate, City Center, Palanpur, Gujarat 385001",
    "locality": "Simla Gate",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "LISTING_ONLY",
    "availabilityNotice": "Listing Information Only – Inquire for live vacancy",
    "source": "Palanpur Heritage Area Housing Registry",
    "sourceListingId": "pal-simlagate-db-09",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1720,72.4310",
    "attribution": "City Commercial & Residential Index",
    "images": [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r9-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        "caption": "Traditional Central Room",
        "category": "Rooms"
      }
    ],
    "amenities": [
      "Market Proximity",
      "24/7 Water Supply",
      "Ceiling Fans",
      "Safe Neighborhood"
    ],
    "type": "Double",
    "propertyType": "Double",
    "category": "Historic",
    "rating": 4.6,
    "reviewCount": 12,
    "reviews": []
  },
  {
    "id": "r10",
    "title": "Hanuman Tekri Hill View Studio",
    "description": "Scenic studio unit at the foot of Hanuman Tekri hill in Palanpur. Enjoy fresh air, private terrace with hill views, split AC, and peaceful residential ambience.",
    "price": 13000,
    "location": {
      "lat": 24.161,
      "lng": 72.445,
      "address": "Near Hanuman Tekri Hill Road, Palanpur, Gujarat 385001"
    },
    "latitude": 24.161,
    "longitude": 72.445,
    "address": "Near Hanuman Tekri Hill Road, Palanpur, Gujarat 385001",
    "locality": "Hanuman Tekri Road",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "CONFIRMED_AVAILABLE",
    "source": "Banaskantha Real Estate Board",
    "sourceListingId": "pal-tekri-studio-10",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1610,72.4450",
    "attribution": "Residential Board Records",
    "images": [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r10-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "caption": "Studio Terrace & Lounge",
        "category": "Rooms"
      }
    ],
    "amenities": [
      "Private Hill View Terrace",
      "Split AC",
      "Modular Kitchen",
      "Covered Parking",
      "Scenic Views"
    ],
    "type": "Penthouse",
    "propertyType": "Penthouse",
    "category": "Nature",
    "rating": 4.95,
    "reviewCount": 31,
    "reviews": []
  },
  {
    "id": "r11",
    "title": "Medical Campus Vicinity 2BHK Residence",
    "description": "Modern 2BHK residential flat near Banas Medical College & Research Institute. Highly preferred by doctors, medical students, and visiting healthcare professionals.",
    "price": 16000,
    "location": {
      "lat": 24.191,
      "lng": 72.452,
      "address": "Near Banas Medical College & Research Institute, Moriya Road, Palanpur, Gujarat 385001"
    },
    "latitude": 24.191,
    "longitude": 72.452,
    "address": "Near Banas Medical College & Research Institute, Moriya Road, Palanpur, Gujarat 385001",
    "locality": "Medical College Road",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "CONFIRMED_AVAILABLE",
    "source": "Palanpur Verified Registry",
    "sourceListingId": "pal-medcollege-fl-11",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1910,72.4520",
    "attribution": "Healthcare Staff & Family Housing",
    "images": [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r11-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
        "caption": "Medical Campus Vicinity Living Room",
        "category": "Rooms"
      }
    ],
    "amenities": [
      "24/7 Power Backup",
      "Elevator",
      "Hospital Proximity",
      "Security Guard",
      "Covered Car Parking"
    ],
    "type": "Flat",
    "propertyType": "Flat",
    "category": "Urban",
    "rating": 4.9,
    "reviewCount": 37,
    "reviews": []
  },
  {
    "id": "r12",
    "title": "Shanti Nagar Student PG & Hostel",
    "description": "Established student hostel and PG near Jain Temple in Shanti Nagar, Palanpur. Includes pure vegetarian food mess, solar water heater, daily room cleaning, and strict security.",
    "price": 4200,
    "location": {
      "lat": 24.169,
      "lng": 72.439,
      "address": "Street 5, Near Jain Temple, Shanti Nagar, Palanpur, Gujarat 385001"
    },
    "latitude": 24.169,
    "longitude": 72.439,
    "address": "Street 5, Near Jain Temple, Shanti Nagar, Palanpur, Gujarat 385001",
    "locality": "Shanti Nagar",
    "city": "Palanpur",
    "status": "AVAILABLE",
    "availabilityType": "CONFIRMED_AVAILABLE",
    "source": "Palanpur Student Welfare Registry",
    "sourceListingId": "pal-shantinagar-hs-12",
    "sourceUrl": "https://www.google.com/maps/search/?api=1&query=24.1690,72.4390",
    "attribution": "Student Welfare Records",
    "images": [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ],
    "mediaGallery": [
      {
        "id": "med-r12-1",
        "type": "image",
        "url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
        "caption": "Shanti Nagar Student Hostel Room",
        "category": "Rooms"
      }
    ],
    "amenities": [
      "Solar Water Heater",
      "Vegetarian Mess Canteen",
      "Daily Housekeeping",
      "Free WiFi",
      "CCTV Cameras"
    ],
    "type": "Hostel",
    "propertyType": "Hostel",
    "category": "Urban",
    "rating": 4.75,
    "reviewCount": 29,
    "reviews": []
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
    content: 'Hello, is early check-in available for the Shree Banas PG Palanpur?',
    text: 'Hello, is early check-in available for the Shree Banas PG Palanpur?',
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
    message: 'Sarah Connor submitted a stay request for Shree Banas PG in Palanpur.',
    timestamp: '2 hours ago',
    isRead: false,
    type: 'BOOKING'
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
