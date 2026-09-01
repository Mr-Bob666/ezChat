/**
 * Voice call signaling handlers (WebRTC).
 *
 * Flow:
 *  1. Caller  -> call:initiate   -> Server forwards call:incoming to target
 *  2. Callee  -> call:accept     -> Server forwards call:accepted to caller
 *     Callee  -> call:reject     -> Server forwards call:rejected to caller
 *  3. Caller  -> call:offer      -> Server forwards to callee
 *  4. Callee  -> call:answer     -> Server forwards to caller
 *  5. Both    -> call:ice-candidate -> Server forwards to peer
 *  6. Either  -> call:end        -> Server forwards call:ended to peer
 */

export function registerCallHandlers(io, socket, userSocketMap) {
  // Initiate a call
  socket.on('call:initiate', ({ targetUserId }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    if (!targetSocketId) {
      return socket.emit('call:error', { message: '对方不在线' });
    }
    io.to(targetSocketId).emit('call:incoming', {
      callerId: socket.user.id,
      callerName: socket.user.username,
      callerAvatar: socket.user.avatar_url,
    });
  });

  // Accept a call
  socket.on('call:accept', ({ callerId }) => {
    const callerSocketId = userSocketMap.get(callerId);
    if (!callerSocketId) {
      return socket.emit('call:error', { message: '对方已断开连接' });
    }
    io.to(callerSocketId).emit('call:accepted', {
      userId: socket.user.id,
      username: socket.user.username,
      avatar_url: socket.user.avatar_url,
    });
  });

  // Reject a call
  socket.on('call:reject', ({ callerId }) => {
    const callerSocketId = userSocketMap.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:rejected', {
        userId: socket.user.id,
        username: socket.user.username,
      });
    }
  });

  // WebRTC offer
  socket.on('call:offer', ({ targetUserId, offer }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:offer', {
        callerId: socket.user.id,
        offer,
      });
    }
  });

  // WebRTC answer
  socket.on('call:answer', ({ targetUserId, answer }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:answer', {
        callerId: socket.user.id,
        answer,
      });
    }
  });

  // ICE candidate exchange
  socket.on('call:ice-candidate', ({ targetUserId, candidate }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:ice-candidate', {
        callerId: socket.user.id,
        candidate,
      });
    }
  });

  // End call
  socket.on('call:end', ({ targetUserId }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:ended', {
        userId: socket.user.id,
      });
    }
  });
}
