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
  private seeded = false;

  constructor() {
    this.userRepo = new UserRepo();
  }

  private async seedUsersIfEmpty(): Promise<void> {
    if (this.seeded) {
      return;
    }

    const existingUsers = await this.userRepo.getAllUsers();
    if (existingUsers.length > 0) {
      this.seeded = true;
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

    for (const user of users) {
      await this.createUser(user);
    }

    this.seeded = true;
  }

  private async ensureReady(): Promise<void> {
    await this.seedUsersIfEmpty();
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

  private async createUser(input: RegisterInput): Promise<User> {
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

  public async register(input: RegisterInput): Promise<AuthResult> {
    await this.ensureReady();

    if (!input.email || !input.password || !input.name) {
      throw new Error('Name, email and password are required');
    }

    if (input.password.length < 6) {
      throw new Error('Password should be at least 6 characters');
    }

    const existing = await this.userRepo.getUserByEmail(input.email);
    if (existing) {
      throw new Error('Email already exists');
    }

    const user = await this.createUser(input);
    return {
      token: issueToken(user.id),
      user: this.sanitizeUser(user)
    };
  }

  public async login(input: LoginInput): Promise<AuthResult> {
    await this.ensureReady();

    const user = await this.userRepo.getUserByEmail(input.email);
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

  public async getUserProfile(userId: string): Promise<PublicUser> {
    await this.ensureReady();

    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.sanitizeUser(user);
  }

  public async discover(userId: string): Promise<PublicUser[]> {
    await this.ensureReady();

    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const allUsers = await this.userRepo.getAllUsers();
    const result: PublicUser[] = [];

    for (const candidate of allUsers) {
      if (candidate.id === userId) {
        continue;
      }
      const hasSwiped = await this.userRepo.hasUserSwiped(userId, candidate.id);
      if (!hasSwiped) {
        result.push(this.sanitizeUser(candidate));
      }
    }

    return result;
  }

  public async swipe(input: SwipeInput): Promise<{ matched: boolean; match?: MatchSummary; matchedUserId?: string }> {
    await this.ensureReady();

    const { userId, targetUserId, action } = input;
    if (userId === targetUserId) {
      throw new Error('You cannot swipe yourself');
    }

    const user = await this.userRepo.getUserById(userId);
    const target = await this.userRepo.getUserById(targetUserId);
    if (!user || !target) {
      throw new Error('User not found');
    }

    await this.userRepo.upsertSwipe({
      fromUserId: userId,
      toUserId: targetUserId,
      action,
      createdAt: new Date().toISOString()
    });

    if (action === 'pass') {
      return { matched: false };
    }

    const reciprocalLike = await this.userRepo.getSwipe(targetUserId, userId);
    const isMutualLike = reciprocalLike?.action === 'like';

    if (!isMutualLike) {
      return { matched: false };
    }

    let match = await this.userRepo.getMatchByUsers(userId, targetUserId);
    if (!match) {
      match = await this.userRepo.createMatch({
        id: this.id('match'),
        userIds: [userId, targetUserId],
        createdAt: new Date().toISOString()
      });
    }

    return {
      matched: true,
      match: await this.buildMatchSummary(match, userId),
      matchedUserId: targetUserId
    };
  }

  private async buildMatchSummary(match: Match, userId: string): Promise<MatchSummary> {
    const otherUserId = match.userIds.find(id => id !== userId);
    if (!otherUserId) {
      throw new Error('Invalid match data');
    }

    const otherUser = await this.userRepo.getUserById(otherUserId);
    if (!otherUser) {
      throw new Error('Match user missing');
    }

    const lastMessage = await this.userRepo.getLastMessageForMatch(match.id);

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

  public async getMatches(userId: string): Promise<MatchSummary[]> {
    await this.ensureReady();

    const user = await this.userRepo.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const matches = await this.userRepo.getMatchesForUser(userId);
    const summaries = await Promise.all(matches.map(match => this.buildMatchSummary(match, userId)));

    return summaries.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.connectedAt;
      const bTime = b.lastMessage?.createdAt || b.connectedAt;
      return bTime.localeCompare(aTime);
    });
  }

  public async sendMessage(input: SendMessageInput): Promise<ChatMessage> {
    await this.ensureReady();

    if (!input.text.trim()) {
      throw new Error('Message cannot be empty');
    }

    const match = await this.userRepo.getMatchByUsers(input.fromUserId, input.toUserId);
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

  public async getConversation(userId: string, matchUserId: string): Promise<ChatMessage[]> {
    await this.ensureReady();

    const match = await this.userRepo.getMatchByUsers(userId, matchUserId);
    if (!match) {
      throw new Error('Match not found');
    }

    return this.userRepo.getMessagesForMatch(match.id);
  }
}

export default MatchService;
