export type SwipeAction = 'like' | 'pass';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  age: number;
  bio: string;
  location: string;
  interests: string[];
  avatarUrl: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  interests: string[];
  avatarUrl: string;
}

export interface Swipe {
  fromUserId: string;
  toUserId: string;
  action: SwipeAction;
  createdAt: string;
}

export interface Match {
  id: string;
  userIds: [string, string];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  createdAt: string;
}

export interface MatchSummary {
  matchId: string;
  connectedAt: string;
  user: PublicUser;
  lastMessage?: {
    text: string;
    createdAt: string;
    fromUserId: string;
  };
}

export interface DataStore {
  users: User[];
  swipes: Swipe[];
  matches: Match[];
  messages: ChatMessage[];
}
