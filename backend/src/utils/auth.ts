import crypto from 'crypto';

interface TokenPayload {
  sub: string;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

const base64Url = (input: string): string => {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const fromBase64Url = (input: string): string => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const withPad = pad ? normalized + '='.repeat(4 - pad) : normalized;
  return Buffer.from(withPad, 'base64').toString('utf8');
};

const sign = (value: string): string => {
  return crypto
    .createHmac('sha256', JWT_SECRET)
    .update(value)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export const issueToken = (userId: string): string => {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload: TokenPayload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  };
  const payloadEncoded = base64Url(JSON.stringify(payload));
  const signature = sign(`${header}.${payloadEncoded}`);
  return `${header}.${payloadEncoded}.${signature}`;
};

export const verifyToken = (token: string): { userId: string } => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token');
  }

  const [header, payload, signature] = parts;
  const expected = sign(`${header}.${payload}`);
  if (signature !== expected) {
    throw new Error('Invalid token signature');
  }

  const parsed = JSON.parse(fromBase64Url(payload)) as TokenPayload;
  if (!parsed.sub || !parsed.exp) {
    throw new Error('Invalid token payload');
  }

  if (parsed.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return { userId: parsed.sub };
};
