// Per-socket rate limiter for message:send events
const messageLimits = new Map(); // socketId -> { count, resetAt }

const LIMIT = 5;       // Max messages
const WINDOW = 2000;   // Per 2 seconds

export function rateLimitMessage(socket) {
  return (data, next) => {
    if (data?.event?.[0] === 'message:send') {
      const now = Date.now();
      let limit = messageLimits.get(socket.id);

      if (!limit || now > limit.resetAt) {
        limit = { count: 0, resetAt: now + WINDOW };
        messageLimits.set(socket.id, limit);
      }

      limit.count++;
      if (limit.count > LIMIT) {
        return socket.emit('error', { message: '发送太快了，请稍后再试' });
      }
    }
    next();
  };
}

// Cleanup on disconnect
export function cleanupRateLimit(socketId) {
  messageLimits.delete(socketId);
}
