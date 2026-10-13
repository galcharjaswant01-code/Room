/**
 * StayHub Centralized API Configuration
 * 
 * In development, defaults to local Django backend at http://127.0.0.1:8000.
 * In production, set VITE_API_URL in your hosting platform (Vercel, Netlify, etc.)
 * e.g. VITE_API_URL="https://api.yourstayhub.com"
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const API_ROOT = `${API_BASE_URL}/api`;
