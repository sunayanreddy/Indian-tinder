import crypto from 'crypto';
import {
  ChatMessage,
  Gender,
  Match,
  MatchSummary,
  PhotoAccessGrant,
  PublicUser,
  SwipeAction,
  User
} from '../models/user';
import UserRepo from '../repositories/userRepo';
import { issueToken } from '../utils/auth';

const MIN_MESSAGES_FOR_PHOTO_ACCESS = 8;
const DEFAULT_AVATAR_KEY = 'fox';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface GoogleAuthInput {
  idToken: string;
}

interface ProfileInput {
  name: string;
  age: number;
  gender: Gender;
  bio: string;
  location: string;
  interests: string[];
  avatarKey: string;
  privatePhotos: string[];
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

interface GoogleIdentity {
  sub: string;
  email: string;
  name?: string;
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

    const users: Array<{
      name: string;
      email: string;
      password: string;
      age: number;
      gender: Gender;
      bio: string;
      location: string;
      interests: string[];
      avatarKey: string;
      privatePhotos: string[];
    }> = [
      {
        name: 'Aarav Malhotra',
        email: 'aarav@example.com',
        password: 'password123',
        age: 28,
        gender: 'man',
        bio: 'Product manager, runner, and forever chai loyalist.',
        location: 'Bengaluru',
        interests: ['travel', 'fitness', 'startup', 'music'],
        avatarKey: 'lion',
        privatePhotos: [
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Isha Kapoor',
        email: 'isha@example.com',
        password: 'password123',
        age: 26,
        gender: 'woman',
        bio: 'Dancer, foodie, and fan of long late-night conversations.',
        location: 'Mumbai',
        interests: ['dance', 'music', 'food', 'travel'],
        avatarKey: 'lotus',
        privatePhotos: [
          'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Rohan Bhat',
        email: 'rohan@example.com',
        password: 'password123',
        age: 30,
        gender: 'man',
        bio: 'Engineer, guitarist, and mountain weekend explorer.',
        location: 'Hyderabad',
        interests: ['tech', 'music', 'hiking', 'gaming'],
        avatarKey: 'falcon',
        privatePhotos: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
        ]
      }
    ];

    for (const row of users) {
      const user = await this.createUser({
        name: row.name,
        email: row.email,
        password: row.password
      });

      await this.userRepo.updateUser(user.id, {
        age: row.age,
        gender: row.gender,
        bio: row.bio,
        location: row.location,
        interests: row.interests,
        avatarKey: row.avatarKey,
        privatePhotos: row.privatePhotos,
        onboardingCompleted: true
      });
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
      age: user.age || 21,
      gender: user.gender || 'prefer_not_say',
      bio: user.bio || '',
      location: user.location || '',
      interests: user.interests || [],
      avatarKey: user.avatarKey || DEFAULT_AVATAR_KEY,
      onboardingCompleted: Boolean(user.onboardingCompleted)
    };
  }

  private async createUser(input: RegisterInput): Promise<User> {
    const user: User = {
      id: this.id('user'),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      passwordHash: this.hashPassword(input.password),
      age: 21,
      gender: 'prefer_not_say',
      bio: '',
      location: '',
      interests: [],
      avatarKey: DEFAULT_AVATAR_KEY,
      privatePhotos: [],
      onboardingCompleted: false,
      createdAt: new Date().toISOString()
    };

    return this.userRepo.createUser(user);
  }

  private async verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
    const fetchFn = (globalThis as any).fetch;
    if (!fetchFn) {
      throw new Error('Fetch API not available in this runtime');
    }

    const response = await fetchFn(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!response.ok) {
      throw new Error('Invalid Google token');
    }

    const payload = (await response.json()) as any;
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && payload.aud !== expectedClientId) {
      throw new Error('Google token audience mismatch');
    }

    if (!payload.sub || !payload.email) {
      throw new Error('Google token missing required claims');
    }

    return {
      sub: String(payload.sub),
      email: String(payload.email),
      name: payload.name ? String(payload.name) : undefined
    };
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
    if (!user || !user.passwordHash) {
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

  public async loginWithGoogle(input: GoogleAuthInput): Promise<AuthResult> {
    await this.ensureReady();

    if (!input.idToken) {
      throw new Error('Google id token is required');
    }

    const identity = await this.verifyGoogleIdToken(input.idToken);
    let user = await this.userRepo.getUserByGoogleId(identity.sub);

    if (!user) {
      const byEmail = await this.userRepo.getUserByEmail(identity.email);
      if (byEmail) {
        user = (await this.userRepo.updateUser(byEmail.id, { googleId: identity.sub })) || byEmail;
      }
    }

    if (!user) {
      const created: User = {
        id: this.id('user'),
        googleId: identity.sub,
        name: identity.name || identity.email.split('@')[0],
        email: identity.email.toLowerCase(),
        age: 21,
        gender: 'prefer_not_say',
        bio: '',
        location: '',
        interests: [],
        avatarKey: DEFAULT_AVATAR_KEY,
        privatePhotos: [],
        onboardingCompleted: false,
        createdAt: new Date().toISOString()
      };
      user = await this.userRepo.createUser(created);
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

  public async updateUserProfile(userId: string, input: ProfileInput): Promise<PublicUser> {
    await this.ensureReady();

    if (!input.name || !input.location || !input.gender || !input.avatarKey) {
      throw new Error('Profile is incomplete');
    }

    const updated = await this.userRepo.updateUser(userId, {
      name: input.name.trim(),
      age: input.age,
      gender: input.gender,
      bio: input.bio.trim(),
      location: input.location.trim(),
      interests: input.interests,
      avatarKey: input.avatarKey,
      privatePhotos: input.privatePhotos,
      onboardingCompleted: true
    });

    if (!updated) {
      throw new Error('User not found');
    }

    return this.sanitizeUser(updated);
  }

  private isGrantPresent(match: Match, grantedBy: string, grantedTo: string): boolean {
    return match.photoAccessGrants.some(
      grant => grant.grantedBy === grantedBy && grant.grantedTo === grantedTo
    );
  }

  private async getMessageCount(matchId: string): Promise<number> {
    return this.userRepo.getMessageCountForMatch(matchId);
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
      if (candidate.id === userId || !candidate.onboardingCompleted) {
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
        createdAt: new Date().toISOString(),
        photoAccessGrants: []
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

    const messageCount = await this.getMessageCount(match.id);
    const isEligible = messageCount >= MIN_MESSAGES_FOR_PHOTO_ACCESS;
    const canViewPrivatePhotos =
      isEligible && this.isGrantPresent(match, otherUserId, userId);
    const hasGrantedPhotoAccess = this.isGrantPresent(match, userId, otherUserId);
    const lastMessage = await this.userRepo.getLastMessageForMatch(match.id);

    return {
      matchId: match.id,
      connectedAt: match.createdAt,
      user: this.sanitizeUser(otherUser),
      canViewPrivatePhotos,
      hasGrantedPhotoAccess,
      isEligibleToGrantPhotoAccess: isEligible,
      messageCount,
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

  public async grantPhotoAccess(userId: string, matchUserId: string): Promise<void> {
    await this.ensureReady();

    const match = await this.userRepo.getMatchByUsers(userId, matchUserId);
    if (!match) {
      throw new Error('Match not found');
    }

    const messageCount = await this.getMessageCount(match.id);
    if (messageCount < MIN_MESSAGES_FOR_PHOTO_ACCESS) {
      throw new Error(
        `Keep chatting. At least ${MIN_MESSAGES_FOR_PHOTO_ACCESS} messages are required before granting photo access.`
      );
    }

    if (this.isGrantPresent(match, userId, matchUserId)) {
      return;
    }

    const grants: PhotoAccessGrant[] = [
      ...match.photoAccessGrants,
      {
        grantedBy: userId,
        grantedTo: matchUserId,
        grantedAt: new Date().toISOString()
      }
    ];

    await this.userRepo.updateMatch(match.id, { photoAccessGrants: grants });
  }

  public async getPrivatePhotos(viewerId: string, targetUserId: string): Promise<string[]> {
    await this.ensureReady();

    const match = await this.userRepo.getMatchByUsers(viewerId, targetUserId);
    if (!match) {
      throw new Error('Match not found');
    }

    const messageCount = await this.getMessageCount(match.id);
    if (messageCount < MIN_MESSAGES_FOR_PHOTO_ACCESS) {
      throw new Error('Not enough chat history yet to unlock private photos');
    }

    if (!this.isGrantPresent(match, targetUserId, viewerId)) {
      throw new Error('The other user has not granted photo access yet');
    }

    const target = await this.userRepo.getUserById(targetUserId);
    if (!target) {
      throw new Error('User not found');
    }

    return target.privatePhotos || [];
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
