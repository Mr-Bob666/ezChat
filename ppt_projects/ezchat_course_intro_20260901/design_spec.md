<!-- ppt-master-schema: design-spec/v1 -->
# ezChat课程项目介绍 - Design Spec

## I. Project Information

| Item | Value |
| --- | --- |
| Project Name | ezChat课程项目介绍 |
| Canvas Format | PPT 16:9，1280 × 720 |
| Page Count | 7 |
| Primary Language | zh-CN |
| Target Audience | 数据结构课程教师与同学；具备基础编程知识，重点关注项目如何构建、课程知识如何落地，以及系统是否形成完整闭环 |
| Communication Intent | 用简洁的课堂讲解说明 ezChat 从需求到架构、从核心流程到数据结构应用的构建思路，并用运行结果证明方案可实现 |
| Desired Audience Outcome | 听众能快速建立项目全貌，理解前后端分层、HTTP/Socket.IO/WebRTC 的职责划分，以及 Map、关系模型和有限状态机在真实功能中的作用 |
| Core Message / Ask / Action | ezChat 的构建核心是职责分层、协议分工与数据结构支撑：让账户、房间、消息和语音通话形成一个可扩展的实时聊天闭环 |
| Delivery Context | 主要用于有主讲的 6–8 分钟课程项目介绍；次要作为课后查看的简要项目说明 |
| Artifact Afterlife | 用于课程项目展示、评阅，以及后续演示时快速回顾系统结构与核心流程 |
| Reading Mode | presentation |
| Content Strategy | 平衡重组：保留实践报告中的事实、术语与功能关系，按课堂理解顺序重组为“问题—构建—验证”主线 |
| Design Style | 课堂手记：问题—解决叙事、暖纸底、轻手绘线条、柔和色块和少量圈注 |
| AI Image Acquisition Path | not applicable — provided images only |
| Generation Mode | continuous |
| Spec Refinement | disabled |
| Speaker Notes | enabled — final Stage-2 proactive policy |
| Custom Animations | disabled — final Stage-2 proactive policy |
| Narration Audio | disabled — final Stage-2 proactive policy |
| Created Date | 2026-09-01 |

## II. Canvas Specification

| Property | Value |
| --- | --- |
| Format | ppt169 |
| Dimensions | 1280 × 720 |
| viewBox | `0 0 1280 720` |
| Margins | 左右 64 px，上下 52 px |
| Content Area | x = 64–1216，y = 52–668 |

## III. Visual Theme

### Theme Style

- **Mode**: custom
- **Mode References**: narrative
- **Mode Behavior**: 以 narrative 的情境—问题—解决为推进方式，从校园沟通需求切入，逐步揭示分层、实时通信和数据结构如何解决问题；关键转折用短问题承接，结尾回到完整演示闭环。
- **Visual style**: custom
- **Visual Style References**: sketch-notes
- **Visual Style Behavior**: 采用 sketch-notes 的温暖纸张底色、轻微手绘线条、柔和色块和少量涂鸦标记；页面保持宽松留白，通过手绘箭头和圈注突出因果与先后关系。
- **Theme**: 一条珊瑚色手绘路径在关键页面中变化，用来承接“需求 → 架构 → 数据结构 → 实时流程 → 演示验证”的构建过程；截图以完整证据卡片出现。
- **Tone**: 亲切、易懂、有课堂感，同时保持工程关系准确。

### Color Scheme

| Role | HEX | Purpose |
| --- | --- | --- |
| Background | #FFF9EE | 暖纸主背景 |
| Secondary background | #F2ECD8 | 分区底色、浅色说明块 |
| Primary | #2F5D62 | 主要结构线、标题辅助色、核心节点 |
| Accent | #E76F51 | 关键路径、当前步骤、重要结论 |
| Secondary accent | #E9C46A | 提示块、轻量强调、辅助标记 |
| Body text | #263238 | 正文与主要标签 |
| Secondary text | #5D696B | 注释、说明、页脚 |
| Divider | #D7CBB5 | 细规则、边界与弱连接线 |

## IV. Typography System

### Font Plan

| Role | Character (Reference) | Primary | English if non-English | Fallback tail |
| --- | --- | --- | --- | --- |
| Title | 温暖手写感、清楚 | KaiTi | Trebuchet MS | serif |
| Body | 清晰人文无衬线 | Microsoft YaHei | Trebuchet MS | sans-serif |
| Code | 等宽技术标签 | Consolas | Consolas | monospace |

- **Title stack**: KaiTi, "Trebuchet MS", serif
- **Body stack**: "Microsoft YaHei", "Trebuchet MS", sans-serif
- **Code stack**: Consolas, "Microsoft YaHei", monospace
- **Role rationale**: Code 用于 REST、Socket.IO、WebRTC、事件名、复杂度与模型名等重复出现的技术标识，帮助听众快速区分机制与解释性文字。

### Font Size Hierarchy

| Purpose | Anchor Size (px) |
| --- | ---: |
| Body | 30 |
| Title | 52 |
| Subtitle | 40 |
| Annotation | 24 |
| Code label | 24 |
| Footer / page number | 16 |

## V. Layout Principles

### Deck-wide Direction

- **Hierarchy direction**: 从一句判断或问题进入，先看中央关系或主截图，再沿手绘路径阅读两到四个支撑点，最后落到页尾小结。
- **Composition tendency**: 以路径、中心辐射、主证据加旁注和左右对照为主；避免所有页面都变成等权卡片网格。
- **Cross-page continuity**: 珊瑚色手绘路径、圈注和小型页码标记可跨页复用；架构与流程页强调关系，截图页强调完整界面证据，章节之间允许明显重置。
- **Spacing posture**: 随 page rhythm 变化；封面和结尾开放，架构与流程适中，数据结构页略密但不压缩正文。
- **Spacing anchors**: page margin 64 px；block gap 24 px；column gutter 36 px；corner radius 18 px；body leading 40 px。

## VI. Icon Usage Specification

- **Primary bundled library**: tabler-outline
- **Stroke Width**: 2

| Icon Path | Suitable Scenarios |
| --- | --- |
| tabler-outline/message-circle | 聊天、消息与产品主题 |
| tabler-outline/database | MySQL、持久化与关系模型 |
| tabler-outline/server | 后端服务与分层架构 |
| tabler-outline/users | 账户、成员与房间角色 |
| tabler-outline/phone | 一对一语音通话 |
| tabler-outline/shield-lock | JWT、权限与安全校验 |
| tabler-outline/arrows-exchange | 双向事件、信令交换与实时通信 |
| tabler-outline/route | 用户路径、构建步骤与演示闭环 |

## VIII. Image Resource List

| Filename | Dimensions | Ratio | Purpose | Type | Layout pattern | Crop Policy | Acquire Via | Status | Reference | text_policy | page_role |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| image_002.png | 1194 × 1864 | 0.64 | 展示实践报告中的项目目录结构 | Screenshot / diagram | 作为纵向证据插图，配合旁侧的简化分层说明 | no-crop | user | Existing | Extracted from the report after “项目结构如下” | n/a | local |
| image_003.png | 1835 × 1256 | 1.46 | 展示登录与注册入口 | Product screenshot | 完整截图置于轻量产品窗口框，并与用户路径起点对应 | no-crop | user | Existing | Extracted from the report’s login and registration section | n/a | local |
| image_004.png | 1819 × 1276 | 1.43 | 展示聊天主界面的房间、消息、成员三栏 | Product screenshot | 作为页面主证据，周围用简短圈注标识三栏职责 | no-crop | user | Existing | Extracted from the report’s chat main interface section | n/a | local |
| image_007.png | 637 × 612 | 1.04 | 展示语音通话界面与连接状态 | Product screenshot | 近方形完整截图与信令/媒体两条路径并置 | no-crop | user | Existing | Extracted from the report’s voice call section | n/a | local |

## IX. Content Outline

### Part 1: 从需求看项目

#### Slide 01 - 封面

- **Audience move**: 只知道项目名称 → 期待理解一个实时聊天系统如何由课程知识逐层构建
- **Relationships**: 数据结构课程实践 link 全栈实时聊天工程实现；三种通信协议 link 五张核心数据表
- **Layout**: 大标题与“一间聊天室 · 三种协议 · 五张表”形成主焦点，手绘消息路径从角落穿过三个小节点，留出明显呼吸感。
- **Title**: ezChat：从数据结构到实时聊天系统
- **Core message**: 一个可用的聊天室，背后是职责分层、协议分工与数据结构协作。
- **Content**: 课程：数据结构课程实践 · 项目：ezChat 在线聊天室 · 学生：谢模彦 · 构建主线：需求 → 架构 → 数据结构 → 实时流程 → 验证
- **Cover impact**: binding hook = “一间聊天室 · 三种协议 · 五张表”；composition Reference = 标题与三枚协议/数据节点沿手绘路径展开。

#### Slide 02 - 项目目标与功能闭环

- **Audience move**: 把 ezChat 看成若干功能 → 理解用户从进入系统到实时交流的完整闭环
- **Relationships**: 注册/登录 → 创建或加入房间 → 发送消息 → 成员治理 → 发起语音通话；账户 membership 房间；角色 parent 权限操作
- **Layout**: 聊天主界面截图承担主证据，登录截图作为路径起点；四个短标注围绕界面指出房间、消息、成员与语音。
- **Title**: 一个可用的聊天室，要闭环哪些事？
- **Core message**: 项目不是只做消息框，而是把身份、房间、治理、实时消息和语音连成一条用户路径。
- **Content**: 场景：校园或小团队即时沟通 · 账户：注册/JWT/头像 · 房间：公开/私密/邀请码 · 治理：owner/admin/member、禁言、踢出、黑名单 · 通信：消息/在线/输入状态/一对一语音
- **Images**: image_003.png + image_004.png；登录入口引向聊天主界面，聊天截图为主、登录截图为辅，均完整显示且不裁切。

### Part 2: 从架构看构建

#### Slide 03 - 总体架构与协议分工

- **Audience move**: 知道系统功能 → 理解为什么前后端分离，以及三类通信各自承担什么职责
- **Relationships**: Vue components → Pinia/composables → REST/Socket clients → Express routes/controllers/services/models → MySQL；HTTP contrast Socket.IO contrast WebRTC；Socket.IO link WebRTC signaling
- **Layout**: 左侧为前端—通信—后端—存储的横向分层关系，右侧完整放置纵向项目目录截图；手绘箭头只高亮当前请求或事件的流向。
- **Title**: 把不同类型的通信，交给最合适的协议
- **Core message**: HTTP 处理请求响应，Socket.IO 负责实时事件，WebRTC 直传音频；分层让每个模块只承担一种主要职责。
- **Content**: 前端：Vue 3 / Pinia / 组件与 composables · 后端：Router → Controller → Service → Model · HTTP：认证、房间、历史、上传 · Socket.IO：消息、在线、输入状态、通话信令 · WebRTC：浏览器间 P2P 音频 · 存储：MySQL + 头像文件
- **Images**: image_002.png；完整展示项目目录结构，作为分层设计的源材料证据。

#### Slide 04 - 数据结构如何落地

- **Audience move**: 看到工程分层 → 能把课程中的数据结构映射到具体系统任务
- **Relationships**: Map link 在线用户定向定位；五张关系表 link 身份/成员/消息/黑名单持久化；idle → calling → connecting → connected → idle；三类结构 contrast 不同运行任务
- **Layout**: 以三个大小不同的知识岛呈现 Map、关系模型、状态机；中央用一句结论连接三者，状态机沿手绘路径展示顺序。
- **Title**: 数据结构不是附加项，而是系统的运行骨架
- **Core message**: Map 管“快速定位”，关系模型管“长期状态”，有限状态机管“过程正确性”。
- **Content**: Map：userId → socketId，平均 O(1) 定向推送 · 关系模型：User / Room / RoomMember / RoomBan / Message 五表 · FSM：idle / calling / connecting / connected / idle 驱动语音 UI · 辅助结构：消息按 roomId 分组、Set 去重、ICE 候选数组缓存

### Part 3: 从流程看实时性

#### Slide 05 - 消息处理链路

- **Audience move**: 理解静态架构 → 能追踪一条消息从输入到其他客户端显示的完整链路
- **Relationships**: MessageInput → message:send → 身份/禁言/限流校验 → Message 入库 → room broadcast message:new → Pinia append → MessageList refresh；步骤为严格 order
- **Layout**: 一条连续手绘路线贯穿七个步骤，校验节点用强调色圈出，入库与广播分成两个相邻转折点。
- **Title**: 一条消息如何安全地到达房间？
- **Core message**: 先校验、再落库、后广播，保证实时体验与业务规则同时成立。
- **Content**: 1 输入提交 · 2 Socket 发出 message:send · 3 成员身份/禁言/限流检查 · 4 Sequelize 写入 Message · 5 io.to(room) 广播 message:new · 6 Pinia 按房间追加 · 7 Vue 响应式刷新；历史消息则通过 REST 分页读取

#### Slide 06 - 语音通话链路

- **Audience move**: 把实时通信等同于服务器广播 → 区分信令交换与媒体传输，并理解通话状态机
- **Relationships**: call:initiate → call:accept → offer → answer → ICE exchange → connected；Socket.IO link 信令；WebRTC link P2P 音频；两条路径 contrast 控制信息与媒体流
- **Layout**: 左侧用语音通话截图作为状态证据，右侧上下分为“Socket.IO 信令”和“WebRTC 音频”两条路径，底部收束为五状态生命周期。
- **Title**: 语音为何走 P2P，而不是让服务器搬运音频？
- **Core message**: 服务器只定位用户并转发信令，音频在浏览器之间直传；Map 与状态机共同保证呼叫过程可控。
- **Content**: userSocketMap 定位目标 socket · offer/answer/ICE 由 Socket.IO 转发 · RTCPeerConnection 建立音频通道 · HTTPS 提供浏览器安全上下文 · cleanup 释放连接与媒体流
- **Images**: image_007.png；完整展示语音来电/通话状态，与两条通信路径并置且不裁切。

### Part 4: 用演示验证设计

#### Slide 07 - 演示闭环与总结

- **Audience move**: 分别理解各模块 → 能用一条演示路线验证系统，并记住项目构建原则
- **Relationships**: 双账号登录 → 私密房间/邀请码 → 实时文字与图片 → 禁言/踢出/黑名单 → 语音通话；每一步分别 link 身份、持久化、实时事件、权限与 P2P 通信
- **Layout**: 四步演示路线沿宽幅手绘路径展开，底部以完整技术链作为总结，最后一个强调色圈注落在“职责清晰”。
- **Title**: 用一个双账号演示，验证整个构建闭环
- **Core message**: 最好的项目介绍不是罗列功能，而是让一次演示同时验证数据、实时性、权限和语音链路。
- **Content**: ① A 创建私密房间，B 用邀请码加入 · ② 实时发文字/图片并观察在线与输入状态 · ③ 房主禁言/解除/踢出，验证权限闭环 · ④ 发起、接听、静音、挂断语音；总结链：组件化界面 → Pinia 分域状态 → REST → Socket.IO → WebRTC → MySQL
- **Closing impact**: binding takeaway = “不是堆功能，而是让每个机制承担清晰职责”；composition Reference = 演示路线在结尾汇成一条完整构建链。

## X. Speaker Notes Requirements

- **Generation**: enabled
- **Filename**: match each SVG filename under `notes/`
- **Content**: 以实践报告和已核对的项目代码为事实基础；逐页补充概念解释、页面转场、关键事件名与演示提示，不引入未经验证的性能数值、测试覆盖率或安全承诺。
- **Total duration**: 6–8 minutes
- **Notes style**: conversational and instructional；先提出听众可能的问题，再用当前页机制回答，结尾自然引到下一页。
- **Presentation purpose**: 用简洁的课堂讲解说明 ezChat 从需求到架构、从核心流程到数据结构应用的构建思路，并用运行结果证明方案可实现。
