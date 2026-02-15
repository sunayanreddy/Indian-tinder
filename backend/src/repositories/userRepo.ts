import fs from 'fs';
import path from 'path';
import { ChatMessage, DataStore, Match, Swipe, User } from '../models/user';

const DEFAULT_DATA_FILE_PATH = path.resolve(__dirname, '../../data/store.json');
const DATA_FILE_PATH = process.env.DATA_FILE_PATH || DEFAULT_DATA_FILE_PATH;

const emptyStore = (): DataStore => ({
  users: [],
  swipes: [],
  matches: [],
  messages: []
});

class UserRepo {
  private store: DataStore;

  constructor() {
    this.store = this.readStore();
  }

  private readStore(): DataStore {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE_PATH)) {
      const initial = emptyStore();
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }

    try {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as DataStore;
      return {
        users: parsed.users || [],
        swipes: parsed.swipes || [],
        matches: parsed.matches || [],
        messages: parsed.messages || []
      };
    } catch (_error) {
      const fallback = emptyStore();
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(fallback, null, 2), 'utf8');
      return fallback;
    }
  }

  private persist(): void {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(this.store, null, 2), 'utf8');
  }

  public createUser(user: User): User {
    this.store.users.push(user);
    this.persist();
    return user;
  }

  public getAllUsers(): User[] {
    return this.store.users;
  }

  public getUserById(id: string): User | undefined {
    return this.store.users.find(user => user.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.store.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  public upsertSwipe(swipe: Swipe): Swipe {
    const existingIndex = this.store.swipes.findIndex(
      row => row.fromUserId === swipe.fromUserId && row.toUserId === swipe.toUserId
    );

    if (existingIndex === -1) {
      this.store.swipes.push(swipe);
    } else {
      this.store.swipes[existingIndex] = swipe;
    }

    this.persist();
    return swipe;
  }

  public getSwipe(fromUserId: string, toUserId: string): Swipe | undefined {
    return this.store.swipes.find(row => row.fromUserId === fromUserId && row.toUserId === toUserId);
  }

  public hasUserSwiped(fromUserId: string, toUserId: string): boolean {
    return Boolean(this.getSwipe(fromUserId, toUserId));
  }

  public createMatch(match: Match): Match {
    this.store.matches.push(match);
    this.persist();
    return match;
  }

  public getMatchByUsers(userA: string, userB: string): Match | undefined {
    return this.store.matches.find(match => {
      const set = new Set(match.userIds);
      return set.has(userA) && set.has(userB);
    });
  }

  public getMatchesForUser(userId: string): Match[] {
    return this.store.matches.filter(
      match => match.userIds[0] === userId || match.userIds[1] === userId
    );
  }

  public addMessage(message: ChatMessage): ChatMessage {
    this.store.messages.push(message);
    this.persist();
    return message;
  }

  public getMessagesForMatch(matchId: string): ChatMessage[] {
    return this.store.messages
      .filter(message => message.matchId === matchId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  public getLastMessageForMatch(matchId: string): ChatMessage | undefined {
    const matchMessages = this.getMessagesForMatch(matchId);
    return matchMessages[matchMessages.length - 1];
  }
}

export default UserRepo;
