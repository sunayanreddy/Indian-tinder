import mongoose from 'mongoose';
import { ChatMessage, Match, PhotoAccessGrant, Swipe, User } from '../models/user';

const userSchema = new mongoose.Schema<User>(
  {
    id: { type: String, required: true, unique: true },
    googleId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    age: { type: Number, required: true },
    gender: {
      type: String,
      enum: ['man', 'woman', 'non_binary', 'other', 'prefer_not_say'],
      required: true
    },
    bio: { type: String, required: false, default: '' },
    location: { type: String, required: false, default: '' },
    interests: [{ type: String, required: true }],
    avatarKey: { type: String, required: true },
    lookingFor: {
      type: String,
      enum: ['man', 'woman', 'non_binary', 'everyone', 'prefer_not_say'],
      required: true,
      default: 'prefer_not_say'
    },
    relationshipGoal: {
      type: String,
      enum: ['long_term', 'short_term', 'marriage', 'friendship'],
      required: true,
      default: 'long_term'
    },
    occupation: { type: String, required: false, default: '' },
    education: { type: String, required: false, default: '' },
    heightCm: { type: Number, required: true, default: 170 },
    drinking: {
      type: String,
      enum: ['never', 'occasionally', 'socially', 'regularly', 'prefer_not_say'],
      required: true,
      default: 'prefer_not_say'
    },
    smoking: {
      type: String,
      enum: ['never', 'occasionally', 'socially', 'regularly', 'prefer_not_say'],
      required: true,
      default: 'prefer_not_say'
    },
    religion: { type: String, required: false, default: '' },
    languages: [{ type: String, required: true }],
    privatePhotos: [{ type: String, required: true }],
    onboardingCompleted: { type: Boolean, required: true, default: false },
    createdAt: { type: String, required: true }
  },
  { versionKey: false }
);

const swipeSchema = new mongoose.Schema<Swipe>(
  {
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    action: { type: String, enum: ['like', 'pass'], required: true },
    createdAt: { type: String, required: true }
  },
  { versionKey: false }
);

swipeSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

const photoAccessGrantSchema = new mongoose.Schema<PhotoAccessGrant>(
  {
    grantedBy: { type: String, required: true },
    grantedTo: { type: String, required: true },
    grantedAt: { type: String, required: true }
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema<Match>(
  {
    id: { type: String, required: true, unique: true },
    userIds: [{ type: String, required: true }],
    createdAt: { type: String, required: true },
    photoAccessGrants: { type: [photoAccessGrantSchema], required: true, default: [] }
  },
  { versionKey: false }
);

const messageSchema = new mongoose.Schema<ChatMessage>(
  {
    id: { type: String, required: true, unique: true },
    matchId: { type: String, required: true },
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: String, required: true }
  },
  { versionKey: false }
);

const UserModel = mongoose.models.UserModel || mongoose.model<User>('UserModel', userSchema);
const SwipeModel = mongoose.models.SwipeModel || mongoose.model<Swipe>('SwipeModel', swipeSchema);
const MatchModel = mongoose.models.MatchModel || mongoose.model<Match>('MatchModel', matchSchema);
const MessageModel =
  mongoose.models.MessageModel || mongoose.model<ChatMessage>('MessageModel', messageSchema);

class UserRepo {
  private static readonly CHAT_TTL_MS = 24 * 60 * 60 * 1000;

  private getCutoffIso(): string {
    return new Date(Date.now() - UserRepo.CHAT_TTL_MS).toISOString();
  }

  private async purgeExpiredMessages(): Promise<void> {
    await MessageModel.deleteMany({
      createdAt: { $lt: this.getCutoffIso() }
    }).exec();
  }

  public async createUser(user: User): Promise<User> {
    await UserModel.create(user);
    return user;
  }

  public async updateUser(userId: string, patch: Partial<User>): Promise<User | undefined> {
    await UserModel.findOneAndUpdate({ id: userId }, patch, { new: true }).exec();
    return this.getUserById(userId);
  }

  public async getAllUsers(): Promise<User[]> {
    return UserModel.find().lean<User[]>().exec();
  }

  public async getUserById(id: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ id }).lean<User>().exec();
    return user || undefined;
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean<User>().exec();
    return user || undefined;
  }

  public async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ googleId }).lean<User>().exec();
    return user || undefined;
  }

  public async upsertSwipe(swipe: Swipe): Promise<Swipe> {
    await SwipeModel.findOneAndUpdate(
      { fromUserId: swipe.fromUserId, toUserId: swipe.toUserId },
      swipe,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();
    return swipe;
  }

  public async getSwipe(fromUserId: string, toUserId: string): Promise<Swipe | undefined> {
    const swipe = await SwipeModel.findOne({ fromUserId, toUserId }).lean<Swipe>().exec();
    return swipe || undefined;
  }

  public async hasUserSwiped(fromUserId: string, toUserId: string): Promise<boolean> {
    const swipe = await this.getSwipe(fromUserId, toUserId);
    return Boolean(swipe);
  }

  public async createMatch(match: Match): Promise<Match> {
    await MatchModel.create(match);
    return match;
  }

  public async updateMatch(matchId: string, patch: Partial<Match>): Promise<Match | undefined> {
    await MatchModel.findOneAndUpdate({ id: matchId }, patch, { new: true }).exec();
    return this.getMatchById(matchId);
  }

  public async getMatchById(matchId: string): Promise<Match | undefined> {
    const match = await MatchModel.findOne({ id: matchId }).lean<Match>().exec();
    return match || undefined;
  }

  public async getMatchByUsers(userA: string, userB: string): Promise<Match | undefined> {
    const match = await MatchModel.findOne({ userIds: { $all: [userA, userB] } })
      .lean<Match>()
      .exec();
    return match || undefined;
  }

  public async getMatchesForUser(userId: string): Promise<Match[]> {
    return MatchModel.find({ userIds: userId }).lean<Match[]>().exec();
  }

  public async addMessage(message: ChatMessage): Promise<ChatMessage> {
    await this.purgeExpiredMessages();
    await MessageModel.create(message);
    return message;
  }

  public async getMessagesForMatch(matchId: string): Promise<ChatMessage[]> {
    await this.purgeExpiredMessages();
    return MessageModel.find({ matchId })
      .sort({ createdAt: 1 })
      .lean<ChatMessage[]>()
      .exec();
  }

  public async getLastMessageForMatch(matchId: string): Promise<ChatMessage | undefined> {
    await this.purgeExpiredMessages();
    const last = await MessageModel.findOne({ matchId }).sort({ createdAt: -1 }).lean<ChatMessage>().exec();
    return last || undefined;
  }

  public async getMessageCountForMatch(matchId: string): Promise<number> {
    await this.purgeExpiredMessages();
    return MessageModel.countDocuments({ matchId }).exec();
  }
}

export default UserRepo;
