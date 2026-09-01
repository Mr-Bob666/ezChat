import { defineStore } from 'pinia';
import {
  getRooms, getJoinedRooms as getJoinedRoomsApi,
  createRoom as createRoomApi, joinRoom as joinRoomApi,
  leaveRoom as leaveRoomApi, getRoom, deleteRoom as deleteRoomApi,
  getMembers as getMembersApi, setMemberRole as setMemberRoleApi,
  muteMember as muteMemberApi, unmuteMember as unmuteMemberApi,
  kickMember as kickMemberApi, getBannedMembers as getBannedMembersApi,
  unbanMember as unbanMemberApi, joinByInviteCode as joinByInviteCodeApi,
  regenerateInviteCode as regenerateInviteCodeApi,
} from '../services/rooms.js';

export const useRoomsStore = defineStore('rooms', {
  state: () => ({
    rooms: [],
    currentRoomId: null,
    currentRoom: null,
    total: 0,
    page: 1,
    loading: false,
    members: [],
    membersLoading: false,
    bannedMembers: [],
  }),

  getters: {
    currentRoomDetail: (state) => state.currentRoom,
  },

  actions: {
    async fetchRooms(page = 1) {
      this.loading = true;
      try {
        const [publicRes, joinedRes] = await Promise.all([
          getRooms({ page, limit: 50 }),
          getJoinedRoomsApi(),
        ]);
        const publicRooms = publicRes.data.rooms;
        const joinedPrivateRooms = joinedRes.data.rooms;
        // Merge: add joined private rooms that aren't already in the public list
        const publicIds = new Set(publicRooms.map(r => r.id));
        const merged = [...publicRooms, ...joinedPrivateRooms.filter(r => !publicIds.has(r.id))];
        this.rooms = merged;
        this.total = publicRes.data.total;
        this.page = publicRes.data.page;
      } finally {
        this.loading = false;
      }
    },

    async createRoom(roomData) {
      const { data } = await createRoomApi(roomData);
      this.rooms.unshift(data.room);
      return data.room;
    },

    async selectRoom(roomId) {
      this.currentRoomId = roomId;
      const { data } = await getRoom(roomId);
      this.currentRoom = data.room;
    },

    async joinRoom(roomId) {
      await joinRoomApi(roomId);
      if (this.currentRoomId === roomId) {
        await this.selectRoom(roomId);
      }
    },

    async leaveRoom(roomId) {
      await leaveRoomApi(roomId);
      if (this.currentRoomId === roomId) {
        this.currentRoomId = null;
        this.currentRoom = null;
      }
    },

    async deleteRoom(roomId) {
      await deleteRoomApi(roomId);
      this.rooms = this.rooms.filter(r => r.id !== roomId);
      if (this.currentRoomId === roomId) {
        this.currentRoomId = null;
        this.currentRoom = null;
      }
    },

    // ─── member management ───

    async fetchMembers(roomId) {
      this.membersLoading = true;
      try {
        const { data } = await getMembersApi(roomId, { limit: 200 });
        this.members = data.members;
      } finally {
        this.membersLoading = false;
      }
    },

    async setMemberRole(roomId, userId, role) {
      await setMemberRoleApi(roomId, userId, role);
      await this.fetchMembers(roomId);
    },

    async muteMember(roomId, userId) {
      await muteMemberApi(roomId, userId);
      await this.fetchMembers(roomId);
    },

    async unmuteMember(roomId, userId) {
      await unmuteMemberApi(roomId, userId);
      await this.fetchMembers(roomId);
    },

    async kickMember(roomId, userId) {
      await kickMemberApi(roomId, userId);
      await this.fetchMembers(roomId);
    },

    async fetchBannedMembers(roomId) {
      const { data } = await getBannedMembersApi(roomId);
      this.bannedMembers = data.bans;
    },

    async unbanMember(roomId, userId) {
      await unbanMemberApi(roomId, userId);
      this.bannedMembers = this.bannedMembers.filter(b => b.user_id !== userId);
    },

    clearCurrentRoom() {
      this.currentRoomId = null;
      this.currentRoom = null;
      this.members = [];
      this.bannedMembers = [];
    },

    async joinByInviteCode(inviteCode) {
      const { data } = await joinByInviteCodeApi(inviteCode);
      const existingRoom = this.rooms.find(r => r.id === data.room.id);
      if (!existingRoom) {
        this.rooms.unshift(data.room);
      }
      return data.room;
    },

    async regenerateInviteCode(roomId) {
      const { data } = await regenerateInviteCodeApi(roomId);
      if (this.currentRoomId === roomId) {
        this.currentRoom = data.room;
      }
      const idx = this.rooms.findIndex(r => r.id === roomId);
      if (idx !== -1) {
        this.rooms[idx] = data.room;
      }
      return data.room;
    },
  },
});
