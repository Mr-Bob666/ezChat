# <u>房间删除功能</u>

### 后端改动

1. `server/src/models/RoomMember.js` — 新增字段：

- `role`: ENUM(`owner`, `admin`, `member`)，默认 `member`
- `is_muted`: BOOLEAN，默认 `false`
- `server/src/models/RoomBan.js` — 新建黑名单模型：

- 记录 `room_id`, `user_id`, `banned_by`, `reason`
- `server/src/models/index.js` — 新增 RoomBan 模型关联
- `server/src/services/roomService.js` — 核心业务逻辑：

- `createRoom` — 创建者自动设为 `owner` 角色
- `joinRoom` — 加入前检查黑名单，被拉黑的用户无法加入
- `leaveRoom` — 房主不能离开房间
- `setRole` — 房主可设任何人为管理员/成员；管理员不能改其他管理员或房主
- `muteMember` / `unmuteMember` — 禁言/取消禁言（需比目标角色更高）
- `kickMember` — 踢出并自动加入黑名单
- `getBannedMembers` / `unbanMember` — 只有房主可查看和解除黑名单
- `getMembers` — 按 owner > admin > member 排序
- `server/src/controllers/roomController.js` — 新增 6 个控制器，操作后通过 Socket.IO 广播实时事件
- `server/src/routes/rooms.js` — 新增路由：

- `PUT /:roomId/members/:userId/role` — 修改角色
- `POST /:roomId/members/:userId/mute` / `unmute` — 禁言/取消
- `POST /:roomId/members/:userId/kick` — 踢出
- `GET /:roomId/bans` / `DELETE /:roomId/bans/:userId` — 黑名单管理
- `server/src/socket/handlers.js` — 发送消息前检查禁言状态

### 前端改动

8. `client/src/services/rooms.js` — 新增所有管理 API 调用
9. `client/src/stores/rooms.js` — 新增 `members`, `bannedMembers` 状态和对应 actions
10. `client/src/components/chat/MemberPanel.vue` — 右侧成员面板：

- 按角色分组显示（房主、管理员、成员）
- 房主可打开黑名单管理对话框
- `client/src/components/chat/MemberItem.vue` — 成员列表项：

- 显示在线状态、禁言标签
- hover 时显示操作按钮（下拉菜单：设为管理员、取消管理员、禁言、踢出）
- 根据权限自动控制可见操作项
- `client/src/views/ChatView.vue` — 布局调整，聊天窗口右侧集成 MemberPanel
- `client/src/components/chat/MessageInput.vue` — 被禁言时输入框禁用并显示提示
- `client/src/components/chat/ChatWindow.vue` — 样式调整适配 flex 布局

### 权限矩阵

| 操作            | 房主           | 管理员 | 成员   |
| :-------------- | :------------- | :----- | :----- |
| 设置/取消管理员 | 可以操作所有人 | 不可以 | 不可以 |
| 禁言            | 管理员+成员    | 仅成员 | 不可以 |
| 踢出(+拉黑)     | 管理员+成员    | 仅成员 | 不可以 |
| 查看/解除黑名单 | 可以           | 不可以 | 不可以 |





# <u>头像功能</u>

### 后端改动

1. 安装 `multer` — 用于处理文件上传
2. `server/src/middleware/upload.js`（新文件）— Multer 配置：
   - 头像保存到 `server/uploads/avatars/` 目录
   - 文件名格式：`{userId}_{timestamp}.{ext}`
   - 仅允许 jpg/png/gif/webp 格式，最大 2MB
3. `server/src/app.js` — 添加静态文件服务，将 `/uploads` 目录映射为可访问 URL
4. `server/src/routes/auth.js` — 新增路由 `POST /api/auth/avatar`（需认证）
5. `server/src/controllers/authController.js` — 新增 `uploadAvatar` 控制器方法
6. `server/src/services/authService.js` — 新增 `updateAvatar` 方法更新用户的 `avatar_url`
7. `server/src/socket/index.js` — `user:online` 事件增加 `avatar_url` 字段

### 前端改动

1. `client/src/services/auth.js` — 新增 `uploadAvatar(file)` API 调用
2. `client/src/stores/auth.js` — 新增 `avatarUrl` getter 和 `updateAvatar` action
3. `client/src/components/common/AvatarUpload.vue`（新文件）— 个人设置弹窗：
   - 显示当前头像，hover 时显示"更换头像"遮罩
   - 支持预览选中图片、文件大小校验
   - 展示用户名和邮箱信息
4. `client/src/components/common/AppHeader.vue` — 头像使用真实 `avatar_url`，下拉菜单新增"个人设置"入口
5. `client/src/components/common/MessageBubble.vue` — 消息气泡的头像支持显示真实图片
6. `client/src/components/chat/MemberItem.vue` — 成员列表头像支持显示真实图片
7. `client/src/components/chat/OnlineUsers.vue` — 在线用户列表新增头像显示
8. `client/vite.config.js` — 开发代理新增 `/uploads` 路径

### 使用方式

点击顶栏右上角头像 → 下拉菜单选择「个人设置」→ 点击头像选择图片 → 保存即可。所有聊天消息、成员列表、在线用户列表都会自动展示新头像。