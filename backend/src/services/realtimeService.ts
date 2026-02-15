interface RealtimeEvent {
  type: 'message' | 'typing' | 'match';
  payload: any;
}

class RealtimeService {
  private clientsByUser: Map<string, Set<any>> = new Map();

  public registerClient(userId: string, res: any): void {
    if (!this.clientsByUser.has(userId)) {
      this.clientsByUser.set(userId, new Set());
    }
    this.clientsByUser.get(userId)?.add(res);

    this.sendRaw(res, { type: 'typing', payload: { fromUserId: '', isTyping: false } });
  }

  public removeClient(userId: string, res: any): void {
    const clients = this.clientsByUser.get(userId);
    if (!clients) {
      return;
    }
    clients.delete(res);
    if (clients.size === 0) {
      this.clientsByUser.delete(userId);
    }
  }

  public emitToUser(userId: string, event: RealtimeEvent): void {
    const clients = this.clientsByUser.get(userId);
    if (!clients || clients.size === 0) {
      return;
    }

    clients.forEach(client => {
      this.sendRaw(client, event);
    });
  }

  private sendRaw(res: any, event: RealtimeEvent): void {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event.payload)}\n\n`);
  }
}

export default RealtimeService;
