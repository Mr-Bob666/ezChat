import * as messageService from '../services/messageService.js';
import { isMember, isMuted } from '../services/roomService.js';
import { rateLimitMessage, cleanupRateLimit } from '../middleware/rateLimit.js';

export function registerHandlers(io, socket) {
  socket.use(rateLimitMessage(socket));

  socket.on('disconnect', () => {
    cleanupRateLimit(socket.id);
  });

  // Join a room channel
  socket.on('room:join', async (data) => {
    try {
      const { roomId } = data;
      const member = await isMember(roomId, socket.user.id);
      if (!member) return;

      socket.join(`room:${roomId}`);
      console.log(`${socket.user.username} joined room:${roomId}`);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Leave a room channel
  socket.on('room:leave', (data) => {
    const { roomId } = data;
    socket.leave(`room:${roomId}`);
    console.log(`${socket.user.username} left room:${roomId}`);
  });

  // Send a message
  socket.on('message:send', async (data) => {
    try {
      const { roomId, content, type, imageUrl } = data;
      const msgType = type || 'text';

      const muted = await isMuted(roomId, socket.user.id);
      if (muted) {
        return socket.emit('error', { message: '你已被禁言，无法发送消息' });
      }

      if (msgType === 'image') {
        if (!imageUrl) return;
      } else {
        if (!content || content.trim().length === 0) return;
        if (content.length > 2000) {
          return socket.emit('error', { message: '消息不能超过2000个字符' });
        }
      }

      const sanitized = msgType === 'text' ? content.trim().replace(/<[^>]*>/g, '') : (content || '');
      const message = await messageService.create(socket.user.id, roomId, sanitized, {
        type: msgType,
        imageUrl: imageUrl || null,
      });

      const msgPayload = {
        id: message.id,
        roomId: parseInt(roomId),
        user_id: socket.user.id,
        user: {
          id: socket.user.id,
          username: socket.user.username,
          avatar_url: socket.user.avatar_url,
        },
        sender: {
          id: socket.user.id,
          username: socket.user.username,
          avatar_url: socket.user.avatar_url,
        },
        content: message.content,
        type: message.type,
        image_url: message.image_url,
        is_recalled: message.is_recalled,
        created_at: message.created_at,
      };

      io.to(`room:${roomId}`).emit('message:new', msgPayload);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Recall a message
  socket.on('message:recall', async (data) => {
    try {
      const { roomId, messageId } = data;
      const message = await messageService.recall(messageId, socket.user.id);

      io.to(`room:${roomId}`).emit('message:recalled', {
        roomId: parseInt(roomId),
        messageId: message.id,
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Typing start
  socket.on('typing:start', (data) => {
    const { roomId } = data;
    socket.to(`room:${roomId}`).emit('typing:update', {
      roomId: parseInt(roomId),
      userId: socket.user.id,
      username: socket.user.username,
      isTyping: true,
    });
  });

  // Typing stop
  socket.on('typing:stop', (data) => {
    const { roomId } = data;
    socket.to(`room:${roomId}`).emit('typing:update', {
      roomId: parseInt(roomId),
      userId: socket.user.id,
      username: socket.user.username,
      isTyping: false,
    });
  });
}

/**
 * Emit a room-level event to all sockets in that room.
 * Called from HTTP controllers after role/mute/kick operations.
 */
export function emitRoomEvent(io, roomId, event, payload) {
  io.to(`room:${roomId}`).emit(event, payload);
}
