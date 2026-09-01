import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { User } from '../models/index.js';
import { setOnline, setOffline } from '../services/authService.js';
import { registerHandlers } from './handlers.js';
import { registerCallHandlers } from './callHandlers.js';

// Map userId -> socketId for targeted signaling
const userSocketMap = new Map();

export function initializeSocket(io) {
  // JWT authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'username', 'avatar_url'],
      });
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user.toJSON();
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new Error('Token expired'));
      }
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user.id})`);

    // Track userId -> socketId
    userSocketMap.set(socket.user.id, socket.id);

    // Mark user online
    await setOnline(socket.user.id);

    // Send the list of currently online users to the newly connected client
    const onlineUsers = await User.findAll({
      where: { is_online: true },
      attributes: ['id', 'username', 'avatar_url'],
    });
    socket.emit('user:online_list', onlineUsers.map(u => ({
      userId: u.id,
      username: u.username,
      avatar_url: u.avatar_url,
    })));

    // Broadcast online status to everyone else
    socket.broadcast.emit('user:online', {
      userId: socket.user.id,
      username: socket.user.username,
      avatar_url: socket.user.avatar_url,
    });

    // Register event handlers
    registerHandlers(io, socket);
    registerCallHandlers(io, socket, userSocketMap);

    // Allow client to request online list at any time
    // (useful if listener was registered after the initial event)
    socket.on('user:request_online', async () => {
      const onlineUsers = await User.findAll({
        where: { is_online: true },
        attributes: ['id', 'username', 'avatar_url'],
      });
      socket.emit('user:online_list', onlineUsers.map(u => ({
        userId: u.id,
        username: u.username,
        avatar_url: u.avatar_url,
      })));
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.user.id})`);
      userSocketMap.delete(socket.user.id);
      await setOffline(socket.user.id);
      io.emit('user:offline', {
        userId: socket.user.id,
        username: socket.user.username,
      });
    });
  });
}
