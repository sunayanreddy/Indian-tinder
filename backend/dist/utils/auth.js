"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.issueToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const base64Url = (input) => {
    return Buffer.from(input)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};
const fromBase64Url = (input) => {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4;
    const withPad = pad ? normalized + '='.repeat(4 - pad) : normalized;
    return Buffer.from(withPad, 'base64').toString('utf8');
};
const sign = (value) => {
    return crypto_1.default
        .createHmac('sha256', JWT_SECRET)
        .update(value)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
};
const issueToken = (userId) => {
    const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
    };
    const payloadEncoded = base64Url(JSON.stringify(payload));
    const signature = sign(`${header}.${payloadEncoded}`);
    return `${header}.${payloadEncoded}.${signature}`;
};
exports.issueToken = issueToken;
const verifyToken = (token) => {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token');
    }
    const [header, payload, signature] = parts;
    const expected = sign(`${header}.${payload}`);
    if (signature !== expected) {
        throw new Error('Invalid token signature');
    }
    const parsed = JSON.parse(fromBase64Url(payload));
    if (!parsed.sub || !parsed.exp) {
        throw new Error('Invalid token payload');
    }
    if (parsed.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
    }
    return { userId: parsed.sub };
};
exports.verifyToken = verifyToken;
