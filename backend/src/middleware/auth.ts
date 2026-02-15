import { verifyToken } from '../utils/auth';

const getBearerToken = (headerValue: string): string | null => {
  if (!headerValue.toLowerCase().startsWith('bearer ')) {
    return null;
  }
  return headerValue.slice(7).trim();
};

export const extractUserIdFromRequest = (req: any): string => {
  const authHeader = req.headers?.authorization;
  const queryToken = req.query?.token;

  const tokenFromHeader =
    typeof authHeader === 'string' ? getBearerToken(authHeader) : null;
  const tokenFromQuery = typeof queryToken === 'string' ? queryToken : null;

  const token = tokenFromHeader || tokenFromQuery;
  if (!token) {
    throw new Error('Missing authentication token');
  }

  return verifyToken(token).userId;
};

export const requireAuth = (req: any, res: any, next: any): void => {
  try {
    const userId = extractUserIdFromRequest(req);
    req.userId = userId;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    res.status(401).json({ message });
  }
};
