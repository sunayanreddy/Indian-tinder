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
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
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
    bio: { type: String, required: true },
    location: { type: String, required: true },
    interests: [{ type: String, required: true }],
    avatarKey: { type: String, required: true },
    privatePhotos: [{ type: String, required: true }],
    onboardingCompleted: { type: Boolean, required: true, default: false },
    createdAt: { type: String, required: true }
}, { versionKey: false });
const swipeSchema = new mongoose_1.default.Schema({
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    action: { type: String, enum: ['like', 'pass'], required: true },
    createdAt: { type: String, required: true }
}, { versionKey: false });
swipeSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
const photoAccessGrantSchema = new mongoose_1.default.Schema({
    grantedBy: { type: String, required: true },
    grantedTo: { type: String, required: true },
    grantedAt: { type: String, required: true }
}, { _id: false });
const matchSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    userIds: [{ type: String, required: true }],
    createdAt: { type: String, required: true },
    photoAccessGrants: { type: [photoAccessGrantSchema], required: true, default: [] }
}, { versionKey: false });
const messageSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true, unique: true },
    matchId: { type: String, required: true },
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: String, required: true }
}, { versionKey: false });
const UserModel = mongoose_1.default.models.UserModel || mongoose_1.default.model('UserModel', userSchema);
const SwipeModel = mongoose_1.default.models.SwipeModel || mongoose_1.default.model('SwipeModel', swipeSchema);
const MatchModel = mongoose_1.default.models.MatchModel || mongoose_1.default.model('MatchModel', matchSchema);
const MessageModel = mongoose_1.default.models.MessageModel || mongoose_1.default.model('MessageModel', messageSchema);
class UserRepo {
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield UserModel.create(user);
            return user;
        });
    }
    updateUser(userId, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            yield UserModel.findOneAndUpdate({ id: userId }, patch, { new: true }).exec();
            return this.getUserById(userId);
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return UserModel.find().lean().exec();
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel.findOne({ id }).lean().exec();
            return user || undefined;
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel.findOne({ email: email.toLowerCase() }).lean().exec();
            return user || undefined;
        });
    }
    getUserByGoogleId(googleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel.findOne({ googleId }).lean().exec();
            return user || undefined;
        });
    }
    upsertSwipe(swipe) {
        return __awaiter(this, void 0, void 0, function* () {
            yield SwipeModel.findOneAndUpdate({ fromUserId: swipe.fromUserId, toUserId: swipe.toUserId }, swipe, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
            return swipe;
        });
    }
    getSwipe(fromUserId, toUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const swipe = yield SwipeModel.findOne({ fromUserId, toUserId }).lean().exec();
            return swipe || undefined;
        });
    }
    hasUserSwiped(fromUserId, toUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const swipe = yield this.getSwipe(fromUserId, toUserId);
            return Boolean(swipe);
        });
    }
    createMatch(match) {
        return __awaiter(this, void 0, void 0, function* () {
            yield MatchModel.create(match);
            return match;
        });
    }
    updateMatch(matchId, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            yield MatchModel.findOneAndUpdate({ id: matchId }, patch, { new: true }).exec();
            return this.getMatchById(matchId);
        });
    }
    getMatchById(matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = yield MatchModel.findOne({ id: matchId }).lean().exec();
            return match || undefined;
        });
    }
    getMatchByUsers(userA, userB) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = yield MatchModel.findOne({ userIds: { $all: [userA, userB] } })
                .lean()
                .exec();
            return match || undefined;
        });
    }
    getMatchesForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return MatchModel.find({ userIds: userId }).lean().exec();
        });
    }
    addMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield MessageModel.create(message);
            return message;
        });
    }
    getMessagesForMatch(matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            return MessageModel.find({ matchId })
                .sort({ createdAt: 1 })
                .lean()
                .exec();
        });
    }
    getLastMessageForMatch(matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            const last = yield MessageModel.findOne({ matchId }).sort({ createdAt: -1 }).lean().exec();
            return last || undefined;
        });
    }
    getMessageCountForMatch(matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            return MessageModel.countDocuments({ matchId }).exec();
        });
    }
}
exports.default = UserRepo;
