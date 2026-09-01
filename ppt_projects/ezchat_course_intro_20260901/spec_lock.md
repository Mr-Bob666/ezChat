<!-- ppt-master-schema: spec-lock/v1 -->
# Execution Lock

## canvas
- viewBox: 0 0 1280 720
- format: PPT 16:9

## communication
- primary_language: zh-CN
- audience: 数据结构课程教师与同学；具备基础编程知识，重点关注项目如何构建、课程知识如何落地，以及系统是否形成完整闭环
- objective: 用 6–8 分钟课堂讲解让听众理解 ezChat 从需求到架构、从核心流程到数据结构应用的构建思路，并能复述三类通信职责和三类核心数据结构的工程作用。
- core_message: ezChat 的构建核心是职责分层、协议分工与数据结构支撑：让账户、房间、消息和语音通话形成一个可扩展的实时聊天闭环
- consumption_mode: presentation

## mode
- mode: custom
- mode_references: narrative
- mode_behavior: 以 narrative 的情境—问题—解决为推进方式，从校园沟通需求切入，逐步揭示分层、实时通信和数据结构如何解决问题；关键转折用短问题承接，结尾回到完整演示闭环。

## visual_style
- visual_style: custom
- visual_style_references: sketch-notes
- visual_style_behavior: 采用 sketch-notes 的温暖纸张底色、轻微手绘线条、柔和色块和少量涂鸦标记；页面保持宽松留白，通过手绘箭头和圈注突出因果与先后关系。

## colors
- background: #FFF9EE
- secondary_bg: #F2ECD8
- primary: #2F5D62
- accent: #E76F51
- secondary_accent: #E9C46A
- body_text: #263238
- secondary_text: #5D696B
- divider: #D7CBB5

## typography
- font_family: "Microsoft YaHei", "Trebuchet MS", sans-serif
- title_family: KaiTi, "Trebuchet MS", serif
- body_family: "Microsoft YaHei", "Trebuchet MS", sans-serif
- code_family: Consolas, "Microsoft YaHei", monospace
- body: 30
- title: 52
- subtitle: 40
- annotation: 24
- code_label: 24
- footer_page_number: 16

## icons
- library: tabler-outline
- stroke_width: 2
- inventory: tabler-outline/message-circle, tabler-outline/database, tabler-outline/server, tabler-outline/users, tabler-outline/phone, tabler-outline/shield-lock, tabler-outline/arrows-exchange, tabler-outline/route

## images
- p03-structure: images/image_002.png | source=user | crop=no-crop
- p02-login: images/image_003.png | source=user | crop=no-crop
- p02-chat: images/image_004.png | source=user | crop=no-crop
- p06-call: images/image_007.png | source=user | crop=no-crop

## page_rhythm
- P01: anchor
- P02: dense
- P03: dense
- P04: anchor
- P05: dense
- P06: anchor
- P07: breathing

## pptx_structure
- mode: flat

## forbidden
- `mask`, `<style>`, `class`, external CSS, `<foreignObject>`, `textPath`, `@font-face`, `<animate*>`, `<set>`, `<script>` / event attributes, `<iframe>`
- HTML named entities in text; write typography as raw Unicode and escape XML reserved characters
- 不用写得过于复杂 (user)
- 截图保持完整、不裁切 (user)
- 不新增网络图片或 AI 图片 (user)
