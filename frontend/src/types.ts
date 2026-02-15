export type Gender = 'man' | 'woman' | 'non_binary' | 'other' | 'prefer_not_say';

export interface User {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  bio: string;
  location: string;
  interests: string[];
  avatarKey: string;
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MatchSummary {
  matchId: string;
  connectedAt: string;
  user: User;
  canViewPrivatePhotos: boolean;
  hasGrantedPhotoAccess: boolean;
  isEligibleToGrantPhotoAccess: boolean;
  messageCount: number;
  lastMessage?: {
    text: string;
    createdAt: string;
    fromUserId: string;
  };
}

export interface ChatMessage {
  id: string;
  matchId: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  createdAt: string;
}

export interface SwipeResponse {
  matched: boolean;
  match?: MatchSummary;
}

export interface TypingEvent {
  fromUserId: string;
  isTyping: boolean;
}
