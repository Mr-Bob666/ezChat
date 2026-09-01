import api from './api.js';

export async function uploadImage(roomId, file) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post(`/rooms/${roomId}/messages/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return data.imageUrl;
}
