# ezChat 在线聊天室 - 实现计划

## Context

从零搭建一个在线聊天室应用，支持多房间实时通信、用户认证、在线状态、消息历史等功能。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 + JavaScript | 3.5+ |
| UI 组件库 | Element Plus | 2.9+ |
| 状态管理 | Pinia | 2.2+ |
| 构建工具 | Vite | 6.0+ |
| 后端框架 | Node.js + Express | Express 4.21+ |
| ORM | Sequelize v6 | 6.37+ |
| 数据库 | MySQL | 5.7+ / 8.0+ |
| 实时通信 | Socket.IO v4 | 4.8+ |
| 认证 | JWT (jsonwebtoken) | 9.0+ |
| 密码加密 | bcryptjs | 2.4+ |
| 请求验证 | Joi | 17.13+ |

## 项目结构

```
ezChat/
├── package.json                    # 根: concurrently 启动前后端
├── .gitignore
├── .env.example
│
├── client/                         # Vue 3 前端
│   ├── package.json
│   ├── vite.config.js              # 代理 /api 和 /socket.io
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── router/index.js         # 路由 + 守卫
│       ├── stores/                  # Pinia
│       │   ├── auth.js
│       │   ├── rooms.js
│       │   ├── messages.js
│       │   └── users.js
│       ├── composables/
│       │   ├── useSocket.js         # Socket.IO 单例 composable
│       │   ├── useAuth.js
│       │   ├── useMessages.js
│       │   └── useOnlineUsers.js
│       ├── components/
│       │   ├── common/              # AppHeader, AppSidebar, MessageBubble
│       │   ├── chat/                # ChatWindow, MessageList, MessageInput, TypingIndicator, OnlineUsers
│       │   └── rooms/               # RoomList, RoomCard, CreateRoomDialog
│       ├── views/
│       │   ├── LoginView.vue
│       │   ├── RegisterView.vue
│       │   ├── ChatView.vue         # 主聊天页面
│       │   └── NotFoundView.vue
│       ├── services/                # api.js, auth.js, rooms.js, socket.js
│       ├── utils/
│       └── assets/styles/
│
└── server/                         # Express 后端
    ├── package.json
    ├── .env / .env.example
    └── src/
        ├── index.js                # 入口: HTTP + Socket.IO 服务器
        ├── app.js                  # Express 中间件 + 路由挂载
        ├── config/
        │   ├── index.js            # 环境变量加载
        │   └── database.js         # Sequelize 连接
        ├── middleware/
        │   ├── auth.js             # JWT 验证
        │   ├── errorHandler.js     # 全局错误处理
        │   └── validate.js         # Joi 请求验证
        ├── routes/                  # auth, rooms, messages
        ├── controllers/            # auth, room, message
        ├── services/               # auth, room, message (业务逻辑层)
        ├── models/                  # User, Room, RoomMember, Message + 关联定义
        ├── socket/
        │   ├── index.js            # Socket.IO 初始化 + JWT 认证中间件
        │   ├── handlers.js         # 事件处理器
        │   └── rooms.js            # 内存房间管理
        └── utils/                   # errors.js (自定义错误类), helpers.js
```

## 数据库设计

### users 表
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | |
| username | VARCHAR(50) | NOT NULL, UNIQUE | |
| email | VARCHAR(255) | NOT NULL, UNIQUE | |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 加密 |
| avatar_url | VARCHAR(500) | NULLABLE | 头像 |
| is_online | TINYINT(1) | DEFAULT 0 | 在线状态缓存 |
| last_seen | DATETIME | NULLABLE | 最后在线时间 |
| created_at / updated_at | DATETIME | 自动 | Sequelize 管理 |

### rooms 表
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | |
| name | VARCHAR(100) | NOT NULL | 房间名 |
| description | VARCHAR(500) | NULLABLE | 描述 |
| is_private | TINYINT(1) | DEFAULT 0 | 是否私密 |
| created_by | INT UNSIGNED | FK -> users.id | 创建者 |
| created_at / updated_at | DATETIME | 自动 | |

### room_members 表 (多对多中间表)
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | |
| room_id | INT UNSIGNED | FK -> rooms.id | |
| user_id | INT UNSIGNED | FK -> users.id | |
| joined_at | DATETIME | DEFAULT NOW | 加入时间 |
| left_at | DATETIME | NULLABLE | NULL = 仍在房间 |

### messages 表
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | |
| room_id | INT UNSIGNED | FK -> rooms.id | 所属房间 |
| user_id | INT UNSIGNED | FK -> users.id | 发送者 |
| content | TEXT | NOT NULL | 消息内容(≤2000字) |
| created_at / updated_at | DATETIME | 自动 | |

关键索引: `messages(room_id, created_at)` 复合索引(消息分页查询)

### Sequelize 关联定义
```
User.hasMany(Room, { foreignKey: 'created_by', as: 'ownedRooms' })
Room.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })
User.belongsToMany(Room, { through: RoomMember, foreignKey: 'user_id', as: 'joinedRooms' })
Room.belongsToMany(User, { through: RoomMember, foreignKey: 'room_id', as: 'members' })
Room.hasMany(Message, { foreignKey: 'room_id', as: 'messages' })
Message.belongsTo(Room, { foreignKey: 'room_id' })
User.hasMany(Message, { foreignKey: 'user_id', as: 'messages' })
Message.belongsTo(User, { foreignKey: 'user_id', as: 'sender' })
```

## API 设计

### REST 接口

**认证** `/api/auth`
- `POST /register` — 注册 `{ username, email, password }`
- `POST /login` — 登录 `{ email, password }` → `{ user, token }`
- `GET /me` — 获取当前用户 (需 JWT)

**房间** `/api/rooms`
- `GET /` — 公开房间列表 `?page=1&limit=20`
- `POST /` — 创建房间 `{ name, description, is_private }`
- `GET /:roomId` — 房间详情
- `POST /:roomId/join` — 加入房间
- `POST /:roomId/leave` — 离开房间
- `GET /:roomId/members` — 成员列表

**消息** `/api/rooms/:roomId/messages`
- `GET /` — 消息历史 `?before=<msgId>&limit=50` (游标分页)

### Socket.IO 事件

**客户端 → 服务端**
| 事件 | 数据 | 说明 |
|------|------|------|
| `room:join` | `{ roomId }` | 加入房间频道 |
| `room:leave` | `{ roomId }` | 离开房间频道 |
| `message:send` | `{ roomId, content }` | 发送消息 |
| `typing:start` | `{ roomId }` | 开始输入 |
| `typing:stop` | `{ roomId }` | 停止输入 |

**服务端 → 客户端**
| 事件 | 数据 | 说明 |
|------|------|------|
| `message:new` | `{ id, roomId, user, content, createdAt }` | 新消息广播 |
| `user:online` | `{ userId, username }` | 用户上线 |
| `user:offline` | `{ userId, username }` | 用户下线 |
| `typing:update` | `{ roomId, userId, username, isTyping }` | 输入状态 |
| `error` | `{ message }` | 错误 |

### Socket.IO 认证方式
JWT 通过 `socket.handshake.auth.token` 传递，在 `io.use()` 中间件中验证，用户信息存入 `socket.user`。Token 过期时客户端收到 `connect_error`，跳转登录页。

## 关键技术决策

| 决策 | 选择 | 原因 |
|------|------|------|
| ORM | Sequelize v6 (非 v7) | v7 尚不稳定，v6 文档完善、与 JS 配合好 |
| UI 库 | Element Plus | Vue 3 生态最完善，中文文档好，组件丰富 |
| 密码库 | bcryptjs | 纯 JS 无原生编译问题，Windows 友好 |
| Socket 认证 | handshake.auth | 官方推荐，避免 URL 泄露 Token |
| 开发端口 | 前端 5173 / 后端 3000 / MySQL 3306 | 标准默认 |
| Vite 代理 | 代理 /api 和 /socket.io | 避免开发时 CORS 问题 |

## 分阶段开发计划

### Phase 1: 项目初始化 + 用户认证
**目标**: 注册、登录、Token 持久化

服务端:
1. 初始化 `/server` npm 项目，安装依赖
2. 配置环境变量 + Sequelize 连接
3. 创建 User 模型 + 迁移 (bcrypt beforeCreate hook)
4. 实现认证控制器/服务/路由 (register, login, me)
5. 全局错误处理中间件 + 自定义错误类
6. 测试: curl 注册、登录、获取个人信息

前端:
1. `npm create vue@latest` 初始化 `/client` (选 JS + Pinia + Router)
2. 安装 axios, 配置 Axios 实例 (baseURL, JWT 拦截器, 401 处理)
3. 实现 LoginView / RegisterView
4. Pinia auth store (login/register/logout/fetchMe, localStorage 持久化)
5. 路由守卫 (未登录跳转 /login)
6. ChatView 占位页 ("已登录" + 登出按钮)

**交付**: 用户可注册、登录、Token 刷新不丢失、登出

### Phase 2: 房间 CRUD + 加入/离开
**目标**: 浏览、创建、加入、离开房间

服务端:
1. Room + RoomMember 模型 + 迁移
2. 房间控制器/服务/路由
3. 加入/离开逻辑
4. 验证: 房间名必填 + 长度限制

前端:
1. rooms store
2. ChatView 布局: 侧边栏 + 主内容区
3. RoomList / RoomCard / CreateRoomDialog 组件
4. 点击房间设置 currentRoom

**交付**: 用户可浏览房间列表、创建房间、加入/离开

### Phase 3: Socket.IO 实时消息
**目标**: 实时收发消息

服务端:
1. 安装 socket.io, 创建 Socket.IO 服务器 (与 Express 共享 HTTP)
2. JWT 认证中间件 (io.use)
3. 事件处理器: room:join, room:leave, message:send
4. Message 模型 + 迁移
5. 消息持久化 + 广播 message:new

前端:
1. `services/socket.js` Socket.IO 客户端单例
2. `composables/useSocket.js` + `useMessages.js`
3. ChatWindow / MessageList / MessageBubble / MessageInput 组件
4. 切换房间: leave 旧房间 → join 新房间 → 加载历史消息

**交付**: 两个浏览器窗口可实时聊天

### Phase 4: 在线状态 + 输入指示
**目标**: 显示在线用户和输入状态

服务端:
1. 连接时标记在线 + 广播 user:online
2. 断开时标记离线 + 广播 user:offline
3. typing:start/stop 广播

前端:
1. `composables/useOnlineUsers.js`
2. OnlineUsers 组件
3. TypingIndicator 组件
4. 输入时发送 typing:start, 3秒无操作发送 typing:stop (防抖)

**交付**: 在线状态和输入指示器正常工作

### Phase 5: 优化与完善
**目标**: 生产级体验

1. 游标分页加载历史消息 (向上滚动加载更多)
2. 新消息自动滚动到底部
3. 响应式设计 (移动端侧边栏折叠)
4. 错误提示 Toast (ElMessage)
5. 加载状态 / 骨架屏
6. 消息时间戳 + 日期分隔线
7. XSS 防护 (Vue 默认转义 + 服务端输入校验)
8. 消息发送限流 (2秒内最多5条)
9. Token 过期优雅处理
10. 种子数据 (General, Random, Tech Talk 公共房间)

## 验证方式

1. **Phase 1**: 注册用户 → 登录 → 刷新页面仍保持登录 → 登出
2. **Phase 2**: 创建房间 → 查看公开房间列表 → 加入房间 → 离开房间
3. **Phase 3**: 两个浏览器标签页同时登录不同用户 → 在同一房间发消息 → 对方实时收到
4. **Phase 4**: 用户上线时其他用户看到在线标识 → 输入时显示"正在输入"
5. **Phase 5**: 滚动加载历史消息 → 移动端布局正常 → 发送超快消息被限流

## 服务端 .env 模板

```
PORT=3000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ezchat
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 启动步骤

1. 确保 MySQL 运行
2. 修改 [server/.env](vscode-webview://0k2tlhroc57p7rkirgcnomhm5ijmr20s7p8ibjq9l9hntkj1e9ru/server/.env) 中的 `DB_PASSWORD`
3. 创建数据库: `CREATE DATABASE ezchat;`
4. 运行 `npm run dev` (同时启动前后端)
5. 访问 [http://localhost:5173](http://localhost:5173/)

