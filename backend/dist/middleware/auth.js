"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.extractUserIdFromRequest = void 0;
const auth_1 = require("../utils/auth");
const getBearerToken = (headerValue) => {
    if (!headerValue.toLowerCase().startsWith('bearer ')) {
        return null;
    }
    return headerValue.slice(7).trim();
};
const extractUserIdFromRequest = (req) => {
    var _a, _b;
    const authHeader = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
    const queryToken = (_b = req.query) === null || _b === void 0 ? void 0 : _b.token;
    const tokenFromHeader = typeof authHeader === 'string' ? getBearerToken(authHeader) : null;
    const tokenFromQuery = typeof queryToken === 'string' ? queryToken : null;
    const token = tokenFromHeader || tokenFromQuery;
    if (!token) {
        throw new Error('Missing authentication token');
    }
    return (0, auth_1.verifyToken)(token).userId;
};
exports.extractUserIdFromRequest = extractUserIdFromRequest;
const requireAuth = (req, res, next) => {
    try {
        const userId = (0, exports.extractUserIdFromRequest)(req);
        req.userId = userId;
        next();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unauthorized';
        res.status(401).json({ message });
    }
};
exports.requireAuth = requireAuth;
