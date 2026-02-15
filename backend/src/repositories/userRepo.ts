import mongoose from 'mongoose';
import { ChatMessage, Match, Swipe, User } from '../models/user';

const userSchema = new mongoose.Schema<User>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    age: { type: Number, required: true },
    bio: { type: String, required: true },
    location: { type: String, required: true },
    interests: [{ type: String, required: true }],
    avatarUrl: { type: String, required: true },
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

const matchSchema = new mongoose.Schema<Match>(
  {
    id: { type: String, required: true, unique: true },
    userIds: [{ type: String, required: true }],
    createdAt: { type: String, required: true }
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
  public async createUser(user: User): Promise<User> {
    await UserModel.create(user);
    return user;
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
    await MessageModel.create(message);
    return message;
  }

  public async getMessagesForMatch(matchId: string): Promise<ChatMessage[]> {
    return MessageModel.find({ matchId })
      .sort({ createdAt: 1 })
      .lean<ChatMessage[]>()
      .exec();
  }

  public async getLastMessageForMatch(matchId: string): Promise<ChatMessage | undefined> {
    const last = await MessageModel.findOne({ matchId }).sort({ createdAt: -1 }).lean<ChatMessage>().exec();
    return last || undefined;
  }
}

export default UserRepo;
