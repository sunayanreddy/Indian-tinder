import axios from 'axios';
import {
  AuthResponse,
  ChatMessage,
  Gender,
  MatchSummary,
  SwipeResponse,
  TypingEvent,
  User
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
let authToken = '';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

client.interceptors.request.use(config => {
  if (authToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${authToken}`
    };
  }
  return config;
});

export const setAuthToken = (token: string): void => {
  authToken = token;
};

export const createEventsSource = (): EventSource => {
  const tokenParam = encodeURIComponent(authToken);
  return new EventSource(`${API_BASE_URL}/events?token=${tokenParam}`);
};

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ProfileInput {
  name: string;
  age: number;
  gender: Gender;
  bio: string;
  location: string;
  interests: string[];
  avatarKey: string;
  privatePhotos: string[];
}

export const register = async (payload: RegisterInput): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/register', payload);
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/login', { email, password });
  return response.data;
};

export const loginWithGoogle = async (idToken: string): Promise<AuthResponse> => {
  const response = await client.post<AuthResponse>('/auth/google', { idToken });
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await client.get<User>('/users/me');
  return response.data;
};

export const updateProfile = async (payload: ProfileInput): Promise<User> => {
  const response = await client.put<User>('/users/me/profile', payload);
  return response.data;
};

export const discoverUsers = async (): Promise<User[]> => {
  const response = await client.get<User[]>('/users/discover');
  return response.data;
};

export const swipeUser = async (
  targetUserId: string,
  action: 'like' | 'pass'
): Promise<SwipeResponse> => {
  const response = await client.post<SwipeResponse>('/swipes', {
    targetUserId,
    action
  });
  return response.data;
};

export const getMatches = async (): Promise<MatchSummary[]> => {
  const response = await client.get<MatchSummary[]>('/matches');
  return response.data;
};

export const grantPhotoAccess = async (matchUserId: string): Promise<{ ok: boolean }> => {
  const response = await client.post<{ ok: boolean }>(`/matches/${matchUserId}/grant-photo-access`);
  return response.data;
};

export const getPrivatePhotos = async (matchUserId: string): Promise<string[]> => {
  const response = await client.get<{ photos: string[] }>(`/matches/${matchUserId}/private-photos`);
  return response.data.photos;
};

export const getMessages = async (matchUserId: string): Promise<ChatMessage[]> => {
  const response = await client.get<ChatMessage[]>('/messages', {
    params: {
      matchUserId
    }
  });
  return response.data;
};

export const sendMessage = async (toUserId: string, text: string): Promise<ChatMessage> => {
  const response = await client.post<ChatMessage>('/messages', {
    toUserId,
    text
  });
  return response.data;
};

export const sendTyping = async (toUserId: string, isTyping: boolean): Promise<{ ok: boolean }> => {
  const response = await client.post<{ ok: boolean }>('/typing', {
    toUserId,
    isTyping
  });
  return response.data;
};

export const parseTypingEvent = (raw: string): TypingEvent => {
  const parsed: any = JSON.parse(raw);
  return parsed;
};

export const parseMessageEvent = (raw: string): ChatMessage => {
  const parsed: any = JSON.parse(raw);
  return parsed;
};

export const parseMatchEvent = (raw: string): MatchSummary => {
  const parsed: any = JSON.parse(raw);
  return parsed;
};
