"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const matchService_1 = __importDefault(require("../services/matchService"));
const realtimeService_1 = __importDefault(require("../services/realtimeService"));
const router = (0, express_1.Router)();
const service = new matchService_1.default();
const realtime = new realtimeService_1.default();
router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
router.post('/auth/register', (req, res) => {
    try {
        const result = service.register(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ message });
    }
});
router.post('/auth/login', (req, res) => {
    try {
        const result = service.login(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(401).json({ message });
    }
});
router.get('/events', (req, res) => {
    var _a;
    try {
        const userId = (0, auth_1.extractUserIdFromRequest)(req);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        (_a = res.flushHeaders) === null || _a === void 0 ? void 0 : _a.call(res);
        realtime.registerClient(userId, res);
        req.on('close', () => {
            realtime.removeClient(userId, res);
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unauthorized';
        res.status(401).json({ message });
    }
});
router.use(auth_1.requireAuth);
router.get('/users/me', (req, res) => {
    try {
        const profile = service.getUserProfile(req.userId);
        res.status(200).json(profile);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(404).json({ message });
    }
});
router.get('/users/discover', (req, res) => {
    try {
        const users = service.discover(req.userId);
        res.status(200).json(users);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ message });
    }
});
router.post('/swipes', (req, res) => {
    try {
        const { targetUserId, action } = req.body;
        const result = service.swipe({ userId: req.userId, targetUserId, action });
        if (result.matched && result.match && result.matchedUserId) {
            realtime.emitToUser(req.userId, { type: 'match', payload: result.match });
            realtime.emitToUser(result.matchedUserId, {
                type: 'match',
                payload: service.getMatches(result.matchedUserId).find(match => { var _a; return match.matchId === ((_a = result.match) === null || _a === void 0 ? void 0 : _a.matchId); })
            });
        }
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ message });
    }
});
router.get('/matches', (req, res) => {
    try {
        const result = service.getMatches(req.userId);
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ message });
    }
});
router.get('/messages', (req, res) => {
    try {
        const matchUserId = String(req.query.matchUserId || '');
        const result = service.getConversation(req.userId, matchUserId);
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ message });
    }
});
router.post('/messages', (req, res) => {
    try {
        const { toUserId, text } = req.body;
        const result = service.sendMessage({ fromUserId: req.userId, toUserId, text });
        realtime.emitToUser(toUserId, { type: 'message', payload: result });
        realtime.emitToUser(req.userId, { type: 'message', payload: result });
        res.status(201).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ message });
    }
});
router.post('/typing', (req, res) => {
    try {
        const { toUserId, isTyping } = req.body;
        realtime.emitToUser(toUserId, {
            type: 'typing',
            payload: {
                fromUserId: req.userId,
                isTyping: Boolean(isTyping)
            }
        });
        res.status(200).json({ ok: true });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ message });
    }
});
function setRoutes(app) {
    app.use('/api', router);
}
exports.default = setRoutes;
