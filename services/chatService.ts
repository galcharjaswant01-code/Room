import { ChatMessage } from '../types';

export const fetchConversations = async (userId: string): Promise<ChatMessage[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([]), 500));
};

export const sendMessage = async (messageData: Partial<ChatMessage>): Promise<ChatMessage> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `m${Date.now()}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        ...messageData
      } as ChatMessage);
    }, 500);
  });
};
