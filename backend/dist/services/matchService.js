"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const userRepo_1 = __importDefault(require("../repositories/userRepo"));
const auth_1 = require("../utils/auth");
const MIN_MESSAGES_FOR_PHOTO_ACCESS = 8;
const DEFAULT_AVATAR_KEY = 'fox';
class MatchService {
    constructor() {
        this.seeded = false;
        this.userRepo = new userRepo_1.default();
    }
    seedUsersIfEmpty() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.seeded) {
                return;
            }
            const existingUsers = yield this.userRepo.getAllUsers();
            if (existingUsers.length > 0) {
                this.seeded = true;
                return;
            }
            const users = [
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
                const user = yield this.createUser({
                    name: row.name,
                    email: row.email,
                    password: row.password
                });
                yield this.userRepo.updateUser(user.id, {
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
        });
    }
    ensureReady() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.seedUsersIfEmpty();
        });
    }
    id(prefix) {
        return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
    }
    hashPassword(password) {
        return crypto_1.default.createHash('sha256').update(password).digest('hex');
    }
    sanitizeUser(user) {
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
    createUser(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = {
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
        });
    }
    verifyGoogleIdToken(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchFn = globalThis.fetch;
            if (!fetchFn) {
                throw new Error('Fetch API not available in this runtime');
            }
            const response = yield fetchFn(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
            if (!response.ok) {
                throw new Error('Invalid Google token');
            }
            const payload = (yield response.json());
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
        });
    }
    register(input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            if (!input.email || !input.password || !input.name) {
                throw new Error('Name, email and password are required');
            }
            if (input.password.length < 6) {
                throw new Error('Password should be at least 6 characters');
            }
            const existing = yield this.userRepo.getUserByEmail(input.email);
            if (existing) {
                throw new Error('Email already exists');
            }
            const user = yield this.createUser(input);
            return {
                token: (0, auth_1.issueToken)(user.id),
                user: this.sanitizeUser(user)
            };
        });
    }
    login(input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            const user = yield this.userRepo.getUserByEmail(input.email);
            if (!user || !user.passwordHash) {
                throw new Error('Invalid credentials');
            }
            const hash = this.hashPassword(input.password);
            if (hash !== user.passwordHash) {
                throw new Error('Invalid credentials');
            }
            return {
                token: (0, auth_1.issueToken)(user.id),
                user: this.sanitizeUser(user)
            };
        });
    }
    loginWithGoogle(input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            if (!input.idToken) {
                throw new Error('Google id token is required');
            }
            const identity = yield this.verifyGoogleIdToken(input.idToken);
            let user = yield this.userRepo.getUserByGoogleId(identity.sub);
            if (!user) {
                const byEmail = yield this.userRepo.getUserByEmail(identity.email);
                if (byEmail) {
                    user = (yield this.userRepo.updateUser(byEmail.id, { googleId: identity.sub })) || byEmail;
                }
            }
            if (!user) {
                const created = {
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
                user = yield this.userRepo.createUser(created);
            }
            return {
                token: (0, auth_1.issueToken)(user.id),
                user: this.sanitizeUser(user)
            };
        });
    }
    getUserProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            const user = yield this.userRepo.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return this.sanitizeUser(user);
        });
    }
    updateUserProfile(userId, input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            if (!input.name || !input.location || !input.gender || !input.avatarKey) {
                throw new Error('Profile is incomplete');
            }
            const updated = yield this.userRepo.updateUser(userId, {
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
        });
    }
    isGrantPresent(match, grantedBy, grantedTo) {
        return match.photoAccessGrants.some(grant => grant.grantedBy === grantedBy && grant.grantedTo === grantedTo);
    }
    getMessageCount(matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepo.getMessageCountForMatch(matchId);
        });
    }
    discover(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            const user = yield this.userRepo.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const allUsers = yield this.userRepo.getAllUsers();
            const result = [];
            for (const candidate of allUsers) {
                if (candidate.id === userId || !candidate.onboardingCompleted) {
                    continue;
                }
                const hasSwiped = yield this.userRepo.hasUserSwiped(userId, candidate.id);
                if (!hasSwiped) {
                    result.push(this.sanitizeUser(candidate));
                }
            }
            return result;
        });
    }
    swipe(input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            const { userId, targetUserId, action } = input;
            if (userId === targetUserId) {
                throw new Error('You cannot swipe yourself');
            }
            const user = yield this.userRepo.getUserById(userId);
            const target = yield this.userRepo.getUserById(targetUserId);
            if (!user || !target) {
                throw new Error('User not found');
            }
            yield this.userRepo.upsertSwipe({
                fromUserId: userId,
                toUserId: targetUserId,
                action,
                createdAt: new Date().toISOString()
            });
            if (action === 'pass') {
                return { matched: false };
            }
            const reciprocalLike = yield this.userRepo.getSwipe(targetUserId, userId);
            const isMutualLike = (reciprocalLike === null || reciprocalLike === void 0 ? void 0 : reciprocalLike.action) === 'like';
            if (!isMutualLike) {
                return { matched: false };
            }
            let match = yield this.userRepo.getMatchByUsers(userId, targetUserId);
            if (!match) {
                match = yield this.userRepo.createMatch({
                    id: this.id('match'),
                    userIds: [userId, targetUserId],
                    createdAt: new Date().toISOString(),
                    photoAccessGrants: []
                });
            }
            return {
                matched: true,
                match: yield this.buildMatchSummary(match, userId),
                matchedUserId: targetUserId
            };
        });
    }
    buildMatchSummary(match, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const otherUserId = match.userIds.find(id => id !== userId);
            if (!otherUserId) {
                throw new Error('Invalid match data');
            }
            const otherUser = yield this.userRepo.getUserById(otherUserId);
            if (!otherUser) {
                throw new Error('Match user missing');
            }
            const messageCount = yield this.getMessageCount(match.id);
            const isEligible = messageCount >= MIN_MESSAGES_FOR_PHOTO_ACCESS;
            const canViewPrivatePhotos = isEligible && this.isGrantPresent(match, otherUserId, userId);
            const hasGrantedPhotoAccess = this.isGrantPresent(match, userId, otherUserId);
            const lastMessage = yield this.userRepo.getLastMessageForMatch(match.id);
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
        });
    }
    getMatches(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            const user = yield this.userRepo.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const matches = yield this.userRepo.getMatchesForUser(userId);
            const summaries = yield Promise.all(matches.map(match => this.buildMatchSummary(match, userId)));
            return summaries.sort((a, b) => {
                var _a, _b;
                const aTime = ((_a = a.lastMessage) === null || _a === void 0 ? void 0 : _a.createdAt) || a.connectedAt;
                const bTime = ((_b = b.lastMessage) === null || _b === void 0 ? void 0 : _b.createdAt) || b.connectedAt;
                return bTime.localeCompare(aTime);
            });
        });
    }
    grantPhotoAccess(userId, matchUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            const match = yield this.userRepo.getMatchByUsers(userId, matchUserId);
            if (!match) {
                throw new Error('Match not found');
            }
            const messageCount = yield this.getMessageCount(match.id);
            if (messageCount < MIN_MESSAGES_FOR_PHOTO_ACCESS) {
                throw new Error(`Keep chatting. At least ${MIN_MESSAGES_FOR_PHOTO_ACCESS} messages are required before granting photo access.`);
            }
            if (this.isGrantPresent(match, userId, matchUserId)) {
                return;
            }
            const grants = [
                ...match.photoAccessGrants,
                {
                    grantedBy: userId,
                    grantedTo: matchUserId,
                    grantedAt: new Date().toISOString()
                }
            ];
            yield this.userRepo.updateMatch(match.id, { photoAccessGrants: grants });
        });
    }
    getPrivatePhotos(viewerId, targetUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            const match = yield this.userRepo.getMatchByUsers(viewerId, targetUserId);
            if (!match) {
                throw new Error('Match not found');
            }
            const messageCount = yield this.getMessageCount(match.id);
            if (messageCount < MIN_MESSAGES_FOR_PHOTO_ACCESS) {
                throw new Error('Not enough chat history yet to unlock private photos');
            }
            if (!this.isGrantPresent(match, targetUserId, viewerId)) {
                throw new Error('The other user has not granted photo access yet');
            }
            const target = yield this.userRepo.getUserById(targetUserId);
            if (!target) {
                throw new Error('User not found');
            }
            return target.privatePhotos || [];
        });
    }
    sendMessage(input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            if (!input.text.trim()) {
                throw new Error('Message cannot be empty');
            }
            const match = yield this.userRepo.getMatchByUsers(input.fromUserId, input.toUserId);
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
        });
    }
    getConversation(userId, matchUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureReady();
            const match = yield this.userRepo.getMatchByUsers(userId, matchUserId);
            if (!match) {
                throw new Error('Match not found');
            }
            return this.userRepo.getMessagesForMatch(match.id);
        });
    }
}
exports.default = MatchService;
