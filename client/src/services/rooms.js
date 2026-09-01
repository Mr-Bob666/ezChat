import api from './api';

export function getRooms(params) {
  return api.get('/rooms', { params });
}

export function createRoom(data) {
  return api.post('/rooms', data);
}

export function getRoom(roomId) {
  return api.get(`/rooms/${roomId}`);
}

export function deleteRoom(roomId) {
  return api.delete(`/rooms/${roomId}`);
}

export function joinRoom(roomId) {
  return api.post(`/rooms/${roomId}/join`);
}

export function leaveRoom(roomId) {
  return api.post(`/rooms/${roomId}/leave`);
}

export function getMembers(roomId, params) {
  return api.get(`/rooms/${roomId}/members`, { params });
}

export function getMessages(roomId, params) {
  return api.get(`/rooms/${roomId}/messages`, { params });
}

// Role management
export function setMemberRole(roomId, userId, role) {
  return api.put(`/rooms/${roomId}/members/${userId}/role`, { role });
}

// Mute
export function muteMember(roomId, userId) {
  return api.post(`/rooms/${roomId}/members/${userId}/mute`);
}

export function unmuteMember(roomId, userId) {
  return api.post(`/rooms/${roomId}/members/${userId}/unmute`);
}

// Kick
export function kickMember(roomId, userId, reason) {
  return api.post(`/rooms/${roomId}/members/${userId}/kick`, { reason });
}

// Bans
export function getBannedMembers(roomId) {
  return api.get(`/rooms/${roomId}/bans`);
}

export function unbanMember(roomId, userId) {
  return api.delete(`/rooms/${roomId}/bans/${userId}`);
}

// Invite code
export function getJoinedRooms() {
  return api.get('/rooms/joined');
}

export function joinByInviteCode(inviteCode) {
  return api.post('/rooms/join-by-code', { invite_code: inviteCode });
}

export function regenerateInviteCode(roomId) {
  return api.post(`/rooms/${roomId}/regenerate-code`);
}
