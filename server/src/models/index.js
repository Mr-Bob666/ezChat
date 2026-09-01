import User from './User.js';
import Room from './Room.js';
import RoomMember from './RoomMember.js';
import RoomBan from './RoomBan.js';
import Message from './Message.js';

// User - Room (creator)
User.hasMany(Room, { foreignKey: 'created_by', as: 'ownedRooms' });
Room.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// User - Room (many-to-many through RoomMember)
User.belongsToMany(Room, { through: RoomMember, foreignKey: 'user_id', otherKey: 'room_id', as: 'joinedRooms' });
Room.belongsToMany(User, { through: RoomMember, foreignKey: 'room_id', otherKey: 'user_id', as: 'members' });

// RoomMember - User (direct association for includes with role)
RoomMember.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(RoomMember, { foreignKey: 'user_id' });

// Room - RoomBan
Room.hasMany(RoomBan, { foreignKey: 'room_id', as: 'bans' });
RoomBan.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
RoomBan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
RoomBan.belongsTo(User, { foreignKey: 'banned_by', as: 'bannedByUser' });

// Room - Message
Room.hasMany(Message, { foreignKey: 'room_id', as: 'messages' });
Message.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

// User - Message
User.hasMany(Message, { foreignKey: 'user_id', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'user_id', as: 'sender' });

export { User, Room, RoomMember, RoomBan, Message };
