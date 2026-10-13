import { UserRole } from '../types';

export interface VerifyJWTResponse {
  success: boolean;
  user?: {
    uid: string;
    email: string;
    name?: string;
    role: UserRole;
    avatar?: string;
  };
  error?: string;
}

/**
 * Mock Backend Service to verify Firebase JWT tokens.
 * In production, this would be an API call to a Node.js or Django backend
 * that uses Firebase Admin SDK to verify the token:
 * 
 * admin.auth().verifyIdToken(token)
 */
export const verifyJWTToken = async (idToken: string): Promise<VerifyJWTResponse> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!idToken) {
    return { success: false, error: 'No token provided' };
  }

  // MOCK VERIFICATION LOGIC
  // In a real app, the backend verifies the token and returns the user's role from the DB.
  console.log('Backend simulated verification for token:', idToken.substring(0, 15) + '...');
  
  // Return a success response. We can extract basic claims from the token if it were a real JWT,
  // but for the mock we'll just let the frontend provide the user info to sync later.
  return { 
    success: true,
  };
};

import { fetchWithAuth } from './apiClient';
import { API_ROOT } from './apiConfig';

const API_BASE = API_ROOT;

export const createBookingAPI = async (bookingData: any) => {
  const res = await fetchWithAuth(`${API_BASE}/bookings/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
};

export const fetchBookingsAPI = async () => {
  const res = await fetchWithAuth(`${API_BASE}/bookings/`);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
};

export const updateBookingStatusAPI = async (id: string, status: string) => {
  const res = await fetchWithAuth(`${API_BASE}/bookings/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update booking status');
  return res.json();
};
