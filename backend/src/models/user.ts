export type SwipeAction = 'like' | 'pass';

export type Gender = 'man' | 'woman' | 'non_binary' | 'other' | 'prefer_not_say';
export type LookingFor =
  | 'man'
  | 'woman'
  | 'non_binary'
  | 'everyone'
  | 'prefer_not_say';
export type RelationshipGoal = 'long_term' | 'short_term' | 'marriage' | 'friendship';
export type LifestyleHabit = 'never' | 'occasionally' | 'socially' | 'regularly' | 'prefer_not_say';

export interface User {
  id: string;
  googleId?: string;
  name: string;
  email: string;
  passwordHash?: string;
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
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface PublicUser {
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

export interface Swipe {
  fromUserId: string;
  toUserId: string;
  action: SwipeAction;
  createdAt: string;
}

export interface PhotoAccessGrant {
  grantedBy: string;
  grantedTo: string;
  grantedAt: string;
}

export interface Match {
  id: string;
  userIds: [string, string];
  createdAt: string;
  photoAccessGrants: PhotoAccessGrant[];
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

export interface DataStore {
  users: User[];
  swipes: Swipe[];
  matches: Match[];
  messages: ChatMessage[];
}
