"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RealtimeService {
    constructor() {
        this.clientsByUser = new Map();
    }
    registerClient(userId, res) {
        var _a;
        if (!this.clientsByUser.has(userId)) {
            this.clientsByUser.set(userId, new Set());
        }
        (_a = this.clientsByUser.get(userId)) === null || _a === void 0 ? void 0 : _a.add(res);
        this.sendRaw(res, { type: 'typing', payload: { fromUserId: '', isTyping: false } });
    }
    removeClient(userId, res) {
        const clients = this.clientsByUser.get(userId);
        if (!clients) {
            return;
        }
        clients.delete(res);
        if (clients.size === 0) {
            this.clientsByUser.delete(userId);
        }
    }
    emitToUser(userId, event) {
        const clients = this.clientsByUser.get(userId);
        if (!clients || clients.size === 0) {
            return;
        }
        clients.forEach(client => {
            this.sendRaw(client, event);
        });
    }
    sendRaw(res, event) {
        res.write(`event: ${event.type}\n`);
        res.write(`data: ${JSON.stringify(event.payload)}\n\n`);
    }
}
exports.default = RealtimeService;
