import axios from 'axios';
import {
  AuthResponse,
  ChatMessage,
  Gender,
  LifestyleHabit,
  LookingFor,
  MatchSummary,
  MyProfileDetails,
  RelationshipGoal,
  SwipeResponse,
  TypingEvent,
  User,
  ViewerProfileDetails
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
let authToken = '';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
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

const getErrorMessage = (error: any, fallback: string): string => {
  const responseData = error?.response?.data;
  const serverMessage =
    (responseData && typeof responseData.message === 'string' && responseData.message) ||
    (responseData && typeof responseData.error === 'string' && responseData.error) ||
    (typeof responseData === 'string' ? responseData : '');
  if (typeof serverMessage === 'string' && serverMessage.trim()) {
    return serverMessage;
  }

  if (error?.message === 'Network Error') {
    return 'Unable to reach server. Please check your connection and try again.';
  }

  if (error?.response?.status === 400) {
    return 'Invalid input. Please check your details and try again.';
  }

  return fallback;
};

client.interceptors.response.use(
  response => response,
  error => {
    const friendly = new Error(getErrorMessage(error, 'Request failed'));
    Object.defineProperty(friendly, 'status', {
      value: error && error.response ? error.response.status : 0,
      enumerable: false,
      configurable: true
    });
    return Promise.reject(friendly);
  }
);

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
  lookingFor: LookingFor;
  relationshipGoal: RelationshipGoal;
  occupation: string;
  education: string;
  heightCm: number;
  drinking: LifestyleHabit;
  smoking: LifestyleHabit;
  religion: string;
  languages: string[];
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

export const getMyProfileDetails = async (): Promise<MyProfileDetails> => {
  const response = await client.get<MyProfileDetails>('/users/me/details');
  return response.data;
};

export const getUserProfileById = async (targetUserId: string): Promise<ViewerProfileDetails> => {
  const response = await client.get<ViewerProfileDetails>(`/users/${targetUserId}`);
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

export const getApiErrorMessage = (error: any, fallback: string): string => {
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
};

export const getApiErrorStatus = (error: any): number => {
  return Number(error?.status || 0);
};
