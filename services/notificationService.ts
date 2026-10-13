import { Notification } from '../types';
import { fetchWithAuth } from './apiClient';
import { API_ROOT } from './apiConfig';

const API_URL = `${API_ROOT}/notifications/`;

export const fetchNotificationsAPI = async (): Promise<Notification[]> => {
  try {
    const data = await fetchWithAuth(API_URL);
    return data.map((n: any) => ({
      id: n.id.toString(),
      userId: n.user ? n.user.toString() : '',
      title: n.title,
      message: n.message,
      timestamp: n.created_at,
      isRead: n.is_read,
      type: n.type,
      relatedId: n.related_id
    }));
  } catch (err) {
    console.error("Failed to fetch notifications", err);
    return [];
  }
};

export const markNotificationAsReadAPI = async (id: string): Promise<void> => {
  await fetchWithAuth(`${API_URL}${id}/mark_read/`, { method: 'POST' });
};

export const markAllNotificationsAsReadAPI = async (): Promise<void> => {
  await fetchWithAuth(`${API_URL}mark_all_read/`, { method: 'POST' });
};
