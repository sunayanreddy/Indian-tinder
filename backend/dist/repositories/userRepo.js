"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_FILE_PATH = path_1.default.resolve(__dirname, '../../data/store.json');
const emptyStore = () => ({
    users: [],
    swipes: [],
    matches: [],
    messages: []
});
class UserRepo {
    constructor() {
        this.store = this.readStore();
    }
    readStore() {
        const dir = path_1.default.dirname(DATA_FILE_PATH);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        if (!fs_1.default.existsSync(DATA_FILE_PATH)) {
            const initial = emptyStore();
            fs_1.default.writeFileSync(DATA_FILE_PATH, JSON.stringify(initial, null, 2), 'utf8');
            return initial;
        }
        try {
            const raw = fs_1.default.readFileSync(DATA_FILE_PATH, 'utf8');
            const parsed = JSON.parse(raw);
            return {
                users: parsed.users || [],
                swipes: parsed.swipes || [],
                matches: parsed.matches || [],
                messages: parsed.messages || []
            };
        }
        catch (_error) {
            const fallback = emptyStore();
            fs_1.default.writeFileSync(DATA_FILE_PATH, JSON.stringify(fallback, null, 2), 'utf8');
            return fallback;
        }
    }
    persist() {
        fs_1.default.writeFileSync(DATA_FILE_PATH, JSON.stringify(this.store, null, 2), 'utf8');
    }
    createUser(user) {
        this.store.users.push(user);
        this.persist();
        return user;
    }
    getAllUsers() {
        return this.store.users;
    }
    getUserById(id) {
        return this.store.users.find(user => user.id === id);
    }
    getUserByEmail(email) {
        return this.store.users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }
    upsertSwipe(swipe) {
        const existingIndex = this.store.swipes.findIndex(row => row.fromUserId === swipe.fromUserId && row.toUserId === swipe.toUserId);
        if (existingIndex === -1) {
            this.store.swipes.push(swipe);
        }
        else {
            this.store.swipes[existingIndex] = swipe;
        }
        this.persist();
        return swipe;
    }
    getSwipe(fromUserId, toUserId) {
        return this.store.swipes.find(row => row.fromUserId === fromUserId && row.toUserId === toUserId);
    }
    hasUserSwiped(fromUserId, toUserId) {
        return Boolean(this.getSwipe(fromUserId, toUserId));
    }
    createMatch(match) {
        this.store.matches.push(match);
        this.persist();
        return match;
    }
    getMatchByUsers(userA, userB) {
        return this.store.matches.find(match => {
            const set = new Set(match.userIds);
            return set.has(userA) && set.has(userB);
        });
    }
    getMatchesForUser(userId) {
        return this.store.matches.filter(match => match.userIds.includes(userId));
    }
    addMessage(message) {
        this.store.messages.push(message);
        this.persist();
        return message;
    }
    getMessagesForMatch(matchId) {
        return this.store.messages
            .filter(message => message.matchId === matchId)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    getLastMessageForMatch(matchId) {
        const matchMessages = this.getMessagesForMatch(matchId);
        return matchMessages[matchMessages.length - 1];
    }
}
exports.default = UserRepo;
