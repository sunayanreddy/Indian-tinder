import crypto from 'crypto';
import {
  ChatMessage,
  Match,
  MatchSummary,
  PublicUser,
  SwipeAction,
  User
} from '../models/user';
import UserRepo from '../repositories/userRepo';
import { issueToken } from '../utils/auth';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  age: number;
  bio: string;
  location: string;
  interests: string[];
  avatarUrl?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface SwipeInput {
  userId: string;
  targetUserId: string;
  action: SwipeAction;
}

interface SendMessageInput {
  fromUserId: string;
  toUserId: string;
  text: string;
}

interface AuthResult {
  token: string;
  user: PublicUser;
}

class MatchService {
  private userRepo: UserRepo;

  constructor() {
    this.userRepo = new UserRepo();
    this.seedUsersIfEmpty();
  }

  private seedUsersIfEmpty(): void {
    if (this.userRepo.getAllUsers().length > 0) {
      return;
    }

    const users: RegisterInput[] = [
      {
        name: 'Aarav Malhotra',
        email: 'aarav@example.com',
        password: 'password123',
        age: 28,
        bio: 'Product manager, runner, and forever chai loyalist.',
        location: 'Bengaluru',
        interests: ['travel', 'fitness', 'startup', 'music'],
        avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Isha Kapoor',
        email: 'isha@example.com',
        password: 'password123',
        age: 26,
        bio: 'Dancer, foodie, and fan of long late-night conversations.',
        location: 'Mumbai',
        interests: ['dance', 'music', 'food', 'travel'],
        avatarUrl:
          'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Rohan Bhat',
        email: 'rohan@example.com',
        password: 'password123',
        age: 30,
        bio: 'Engineer, guitarist, and mountain weekend explorer.',
        location: 'Hyderabad',
        interests: ['tech', 'music', 'hiking', 'gaming'],
        avatarUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Meera Nair',
        email: 'meera@example.com',
        password: 'password123',
        age: 27,
        bio: 'Architect who loves books, beaches, and filter coffee.',
        location: 'Chennai',
        interests: ['books', 'design', 'travel', 'coffee'],
        avatarUrl:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
      }
    ];

    users.forEach(user => this.createUser(user));
  }

  private id(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private sanitizeUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      age: user.age,
      bio: user.bio,
      location: user.location,
      interests: user.interests,
      avatarUrl: user.avatarUrl
    };
  }

  private createUser(input: RegisterInput): User {
    const user: User = {
      id: this.id('user'),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      passwordHash: this.hashPassword(input.password),
      age: input.age,
      bio: input.bio.trim(),
      location: input.location.trim(),
      interests: input.interests,
      avatarUrl:
        input.avatarUrl ||
        'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString()
    };

    return this.userRepo.createUser(user);
  }

  public register(input: RegisterInput): AuthResult {
    if (!input.email || !input.password || !input.name) {
      throw new Error('Name, email and password are required');
    }

    if (input.password.length < 6) {
      throw new Error('Password should be at least 6 characters');
    }

    const existing = this.userRepo.getUserByEmail(input.email);
    if (existing) {
      throw new Error('Email already exists');
    }

    const user = this.createUser(input);
    return {
      token: issueToken(user.id),
      user: this.sanitizeUser(user)
    };
  }

  public login(input: LoginInput): AuthResult {
    const user = this.userRepo.getUserByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const hash = this.hashPassword(input.password);
    if (hash !== user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    return {
      token: issueToken(user.id),
      user: this.sanitizeUser(user)
    };
  }

  public getUserProfile(userId: string): PublicUser {
    const user = this.userRepo.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.sanitizeUser(user);
  }

  public discover(userId: string): PublicUser[] {
    const user = this.userRepo.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.userRepo
      .getAllUsers()
      .filter(candidate => candidate.id !== userId)
      .filter(candidate => !this.userRepo.hasUserSwiped(userId, candidate.id))
      .map(candidate => this.sanitizeUser(candidate));
  }

  public swipe(input: SwipeInput): { matched: boolean; match?: MatchSummary; matchedUserId?: string } {
    const { userId, targetUserId, action } = input;
    if (userId === targetUserId) {
      throw new Error('You cannot swipe yourself');
    }

    const user = this.userRepo.getUserById(userId);
    const target = this.userRepo.getUserById(targetUserId);
    if (!user || !target) {
      throw new Error('User not found');
    }

    this.userRepo.upsertSwipe({
      fromUserId: userId,
      toUserId: targetUserId,
      action,
      createdAt: new Date().toISOString()
    });

    if (action === 'pass') {
      return { matched: false };
    }

    const reciprocalLike = this.userRepo.getSwipe(targetUserId, userId);
    const isMutualLike = reciprocalLike?.action === 'like';

    if (!isMutualLike) {
      return { matched: false };
    }

    let match = this.userRepo.getMatchByUsers(userId, targetUserId);
    if (!match) {
      match = this.userRepo.createMatch({
        id: this.id('match'),
        userIds: [userId, targetUserId],
        createdAt: new Date().toISOString()
      });
    }

    return {
      matched: true,
      match: this.buildMatchSummary(match, userId),
      matchedUserId: targetUserId
    };
  }

  private buildMatchSummary(match: Match, userId: string): MatchSummary {
    const otherUserId = match.userIds.find(id => id !== userId);
    if (!otherUserId) {
      throw new Error('Invalid match data');
    }

    const otherUser = this.userRepo.getUserById(otherUserId);
    if (!otherUser) {
      throw new Error('Match user missing');
    }

    const lastMessage = this.userRepo.getLastMessageForMatch(match.id);

    return {
      matchId: match.id,
      connectedAt: match.createdAt,
      user: this.sanitizeUser(otherUser),
      lastMessage: lastMessage
        ? {
            text: lastMessage.text,
            createdAt: lastMessage.createdAt,
            fromUserId: lastMessage.fromUserId
          }
        : undefined
    };
  }

  public getMatches(userId: string): MatchSummary[] {
    const user = this.userRepo.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.userRepo
      .getMatchesForUser(userId)
      .map(match => this.buildMatchSummary(match, userId))
      .sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || a.connectedAt;
        const bTime = b.lastMessage?.createdAt || b.connectedAt;
        return bTime.localeCompare(aTime);
      });
  }

  public sendMessage(input: SendMessageInput): ChatMessage {
    if (!input.text.trim()) {
      throw new Error('Message cannot be empty');
    }

    const match = this.userRepo.getMatchByUsers(input.fromUserId, input.toUserId);
    if (!match) {
      throw new Error('You can only message users you matched with');
    }

    return this.userRepo.addMessage({
      id: this.id('msg'),
      matchId: match.id,
      fromUserId: input.fromUserId,
      toUserId: input.toUserId,
      text: input.text.trim(),
      createdAt: new Date().toISOString()
    });
  }

  public getConversation(userId: string, matchUserId: string): ChatMessage[] {
    const match = this.userRepo.getMatchByUsers(userId, matchUserId);
    if (!match) {
      throw new Error('Match not found');
    }

    return this.userRepo.getMessagesForMatch(match.id);
  }
}

export default MatchService;
