export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  interests: string[];
  avatarUrl: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MatchSummary {
  matchId: string;
  connectedAt: string;
  user: User;
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
