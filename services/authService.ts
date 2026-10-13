import { API_ROOT } from './apiConfig';
const API_BASE = `${API_ROOT}/auth`;
import { fetchWithAuth } from './apiClient';

export const registerAPI = async (data: any) => {
  const res = await fetch(`${API_BASE}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.detail || 'Registration failed');
  }
  return res.json();
};

export const loginAPI = async (data: any) => {
  const res = await fetch(`${API_BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Login failed');
  }
  const result = await res.json();
  localStorage.setItem('access_token', result.access);
  localStorage.setItem('refresh_token', result.refresh);
  return result;
};

export const verifyEmailAPI = async (data: any) => {
  const res = await fetch(`${API_BASE}/verify-email/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Verification failed');
  }
  return res.json();
};

export const resendOtpAPI = async (data: any) => {
  const res = await fetch(`${API_BASE}/resend-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to resend OTP');
  }
  return res.json();
};

export const forgotPasswordAPI = async (data: any) => {
  const res = await fetch(`${API_BASE}/forgot-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to send reset email');
  }
  return res.json();
};

export const resetPasswordAPI = async (data: any) => {
  const res = await fetch(`${API_BASE}/reset-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to reset password');
  }
  return res.json();
};

export const firebaseLoginAPI = async (token: string) => {
  const res = await fetch(`${API_BASE}/firebase-login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Firebase login failed on backend');
  }
  const result = await res.json();
  localStorage.setItem('access_token', result.access);
  localStorage.setItem('refresh_token', result.refresh);
  return result;
};

export const fetchMeAPI = async () => {
  const res = await fetchWithAuth(`${API_BASE}/me/`);
  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return res.json();
};

export const googleAuthAPI = async (data: { email: string; first_name?: string; last_name?: string; role?: string }) => {
  const res = await fetch(`${API_BASE}/google/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.detail || 'Google authentication failed');
  }
  const result = await res.json();
  localStorage.setItem('access_token', result.access);
  localStorage.setItem('refresh_token', result.refresh);
  return result;
};
