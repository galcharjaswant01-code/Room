import { Room } from '../types';
import { fetchWithAuth } from './apiClient';
import { API_ROOT, API_BASE_URL } from './apiConfig';

export const fetchProperties = async (lat?: number, lng?: number, radius?: number): Promise<Room[]> => {
  try {
    let url = `${API_ROOT}/properties/rooms/`;
    if (lat && lng) {
      url += `?lat=${lat}&lng=${lng}${radius ? `&radius=${radius}` : ''}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch rooms', response.statusText);
      return [];
    }
    const data = await response.json();
    return data.map((room: any) => {
      const parsedLat = room.latitude != null ? parseFloat(room.latitude) : undefined;
      const parsedLng = room.longitude != null ? parseFloat(room.longitude) : undefined;
      return {
        id: room.id.toString(),
        title: room.title,
        description: room.description,
        price: parseFloat(room.price),
        latitude: parsedLat,
        longitude: parsedLng,
        address: room.address || room.location || '',
        city: room.city || (typeof room.location === 'string' ? room.location : ''),
        location: {
          lat: parsedLat ?? (room.location?.lat ?? 0),
          lng: parsedLng ?? (room.location?.lng ?? 0),
          address: room.address || room.location || '',
        },
        status: room.is_available ? 'AVAILABLE' : 'BOOKED',
        images: room.images && room.images.length > 0 
          ? room.images.map((img: any) => img.image.startsWith('http') ? img.image : `${API_BASE_URL}${img.image}`)
          : ['https://images.unsplash.com/photo-1522771731515-6e01a8848db7?auto=format&fit=crop&w=800&q=80'],
        type: room.room_type === 'single' ? 'Single' : room.room_type === 'studio' ? 'Suite' : 'Double',
        category: 'Urban', // Default category
        rating: 4.5,
        reviewCount: 0,
        reviews: [],
        amenities: room.facilities ? room.facilities.map((f: any) => f.name || f) : [],
        createdAt: room.created_at || new Date().toISOString(),
      };
    }) as Room[];
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};

const API_BASE = API_ROOT;

export const createProperty = async (propertyData: Partial<Room>): Promise<Room> => {
  const backendData = {
    title: propertyData.title,
    description: propertyData.description,
    price: propertyData.price,
    location: propertyData.location?.address || propertyData.address || 'Unknown',
    address: propertyData.location?.address || propertyData.address || 'Unknown',
    city: propertyData.city || '',
    latitude: propertyData.location?.lat ?? propertyData.latitude,
    longitude: propertyData.location?.lng ?? propertyData.longitude,
    room_type: propertyData.type?.toLowerCase() || 'single',
    is_available: propertyData.status === 'AVAILABLE',
  };

  const res = await fetchWithAuth(`${API_BASE}/properties/rooms/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendData),
  });
  if (!res.ok) throw new Error('Failed to create property');
  const data = await res.json();
  
  return {
    ...propertyData,
    id: data.id.toString(),
  } as Room;
};

export const updateProperty = async (id: string, propertyData: Partial<Room>): Promise<Room> => {
  const backendData: any = {};
  if (propertyData.title) backendData.title = propertyData.title;
  if (propertyData.price) backendData.price = propertyData.price;
  if (propertyData.status) backendData.is_available = propertyData.status === 'AVAILABLE';
  
  const res = await fetchWithAuth(`${API_BASE}/properties/rooms/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendData),
  });
  if (!res.ok) throw new Error('Failed to update property');
  
  return { id, ...propertyData } as Room;
};

export const deleteProperty = async (id: string): Promise<boolean> => {
  const res = await fetchWithAuth(`${API_BASE}/properties/rooms/${id}/`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete property');
  return true;
};
