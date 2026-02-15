import { Router } from 'express';
import { extractUserIdFromRequest, requireAuth } from '../middleware/auth';
import MatchService from '../services/matchService';
import RealtimeService from '../services/realtimeService';

const router = Router();
const service = new MatchService();
const realtime = new RealtimeService();

router.get('/health', (_req: any, res: any) => {
  res.status(200).json({ status: 'ok' });
});

router.post('/auth/register', (req: any, res: any) => {
  try {
    const result = service.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ message });
  }
});

router.post('/auth/login', (req: any, res: any) => {
  try {
    const result = service.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(401).json({ message });
  }
});

router.get('/events', (req: any, res: any) => {
  try {
    const userId = extractUserIdFromRequest(req);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    realtime.registerClient(userId, res);
    req.on('close', () => {
      realtime.removeClient(userId, res);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    res.status(401).json({ message });
  }
});

router.use(requireAuth);

router.get('/users/me', (req: any, res: any) => {
  try {
    const profile = service.getUserProfile(req.userId);
    res.status(200).json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(404).json({ message });
  }
});

router.get('/users/discover', (req: any, res: any) => {
  try {
    const users = service.discover(req.userId);
    res.status(200).json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ message });
  }
});

router.post('/swipes', (req: any, res: any) => {
  try {
    const { targetUserId, action } = req.body;
    const result = service.swipe({ userId: req.userId, targetUserId, action });

    if (result.matched && result.match && result.matchedUserId) {
      realtime.emitToUser(req.userId, { type: 'match', payload: result.match });
      const reciprocalMatch = service
        .getMatches(result.matchedUserId)
        .find(match => match.matchId === result.match?.matchId);
      if (reciprocalMatch) {
        realtime.emitToUser(result.matchedUserId, {
          type: 'match',
          payload: reciprocalMatch
        });
      }
    }

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ message });
  }
});

router.get('/matches', (req: any, res: any) => {
  try {
    const result = service.getMatches(req.userId);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ message });
  }
});

router.get('/messages', (req: any, res: any) => {
  try {
    const matchUserId = String(req.query.matchUserId || '');
    const result = service.getConversation(req.userId, matchUserId);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ message });
  }
});

router.post('/messages', (req: any, res: any) => {
  try {
    const { toUserId, text } = req.body;
    const result = service.sendMessage({ fromUserId: req.userId, toUserId, text });
    realtime.emitToUser(toUserId, { type: 'message', payload: result });
    realtime.emitToUser(req.userId, { type: 'message', payload: result });
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ message });
  }
});

router.post('/typing', (req: any, res: any) => {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ message });
  }
});

export default function setRoutes(app: any): void {
  app.use('/api', router);
}
