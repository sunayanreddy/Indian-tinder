export type Gender = 'man' | 'woman' | 'non_binary' | 'other' | 'prefer_not_say';
export type LookingFor = 'man' | 'woman' | 'non_binary' | 'everyone' | 'prefer_not_say';
export type RelationshipGoal = 'long_term' | 'short_term' | 'marriage' | 'friendship';
export type LifestyleHabit = 'never' | 'occasionally' | 'socially' | 'regularly' | 'prefer_not_say';

export interface User {
  id: string;
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
  onboardingCompleted: boolean;
}

export interface MyProfileDetails {
  user: User;
  email: string;
  privatePhotos: string[];
}

export interface ViewerProfileDetails {
  user: User;
  isSelf: boolean;
  canViewPrivatePhotos: boolean;
  privatePhotos: string[];
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
