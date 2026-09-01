<template>
  <div class="landing-page" ref="rootEl">
    <!-- ============================================================
         NAV
    ============================================================ -->
    <nav class="nav" :class="{ scrolled }">
      <div class="nav-inner">
        <div class="nav-logo">
          <span class="nav-mark"><img :src="logoUrl" alt="ezChat" /></span>
          <span>ezChat</span>
        </div>
        <div class="nav-links">
          <a href="#features">特性</a>
          <a href="#demo">演示</a>
          <a href="#stats">数据</a>
          <a href="#how">开始</a>
        </div>
        <div class="nav-cta">
          <button class="btn btn-ghost" @click="goLogin">登录</button>
          <button class="btn btn-primary" @click="goRegister">
            免费注册 <ArrowIcon />
          </button>
        </div>
      </div>
    </nav>

    <!-- ============================================================
         HERO
    ============================================================ -->
    <section class="hero" ref="heroEl">
      <div class="hero-mesh"></div>
      <div class="hero-grid"></div>
      <div class="hero-spot"></div>
      <div class="hero-orbit"></div>
      <div class="hero-watermark"><img :src="logoUrl" alt="" /></div>
      <div class="hero-stars">
        <span v-for="(s, i) in stars" :key="i" :style="{
          top: s.top + '%', left: s.left + '%',
          animationDelay: s.delay + 's',
          width: s.size + 'px', height: s.size + 'px',
        }"></span>
      </div>

      <div class="wrap hero-inner">
        <div>
          <span class="eyebrow"><span class="eyebrow-dot"></span> 12,438 人正在 ezChat 上聊天</span>
          <h1>
            <span class="h1-word accent">实时</span>
            <span class="h1-word sep"></span>
            <span class="h1-word accent">畅聊</span>
            <span class="h1-word sep"></span>
            <br />
            <span class="h1-word accent">无界沟通</span>
          </h1>
          <p class="lede">
            为新一代团队与社群打造的实时聊天平台。毫秒级消息送达、清晰的语音通话、私密邀请码房间 —— 所有沟通，都在 ezChat。
          </p>
          <div class="hero-ctas">
            <button class="btn btn-primary btn-lg lg-glow" v-magnetic="0.3" @click="goRegister">
              立即开始聊天 <ArrowIcon />
            </button>
            <button class="btn btn-ghost-hero btn-lg" v-magnetic="0.2" @click="scrollToDemo">
              <PlayIcon /> 观看演示
            </button>
          </div>
          <div class="hero-meta">
            <span><span class="check">✓</span> 30 秒注册</span>
            <span><span class="check">✓</span> 无需下载客户端</span>
            <span><span class="check">✓</span> 端到端加密</span>
          </div>
        </div>

        <div class="hero-card-stack">
          <div class="float-card fc-1">
            <div class="fc-av">林</div>
            <div class="fc-body">
              <div class="fc-name"><strong>林小满</strong><span>11:24</span></div>
              <div>新产品的发布会日程发到群里啦 🎉</div>
            </div>
          </div>
          <div class="float-card fc-2">
            <div class="fc-av green">江</div>
            <div class="fc-body">
              <div class="fc-name"><strong>江砚</strong><span>11:25</span></div>
              <div>已收到，今晚同步给市场组。</div>
            </div>
          </div>
          <div class="float-card fc-3">
            <div class="fc-av purple">Z</div>
            <div class="fc-body">
              <div class="fc-name"><strong>Zoe</strong><span>11:26</span></div>
              <div>方便上语音对一下细节吗？</div>
            </div>
          </div>
          <div class="float-card fc-4">
            <div class="fc-av amber">陈</div>
            <div class="fc-body">
              <div class="fc-name"><strong>陈一行</strong><span>11:27</span></div>
              <div>没问题，房间码 <code style="font-family:var(--font-mono);color:#5fb1ff">K7-29A</code></div>
            </div>
          </div>
        </div>
      </div>

      <div class="hero-scroll">
        <span>向下滚动</span>
        <ScrollDownIcon />
      </div>
    </section>

    <!-- ============================================================
         MARQUEE
    ============================================================ -->
    <div class="marquee">
      <div class="marquee-track">
        <span v-for="(s, i) in marqueeItems" :key="i"><span class="dot">●</span> {{ s }}</span>
      </div>
    </div>

    <!-- ============================================================
         FEATURES
    ============================================================ -->
    <section id="features" class="sec-pad">
      <div class="wrap">
        <div class="reveal">
          <span class="sec-eyebrow"><span class="bar"></span>特性</span>
          <h2 class="sec-title">为沟通而生的<br/>所有<span style="color:var(--brand)">核心能力</span></h2>
          <p class="sec-sub">不止于聊天工具。ezChat 整合了实时消息、语音通话、房间管理与隐私保护，为现代团队提供完整的协作沟通体验。</p>
        </div>

        <div class="features-grid">
          <!-- Rooms tall -->
          <div class="feature-card fc-tall reveal" data-d="1" v-tilt="6" v-cursor-glow>
            <div class="f-ico"><RoomsIcon /></div>
            <div class="f-title">公开 / 私密房间体系</div>
            <div class="f-text">公开房间自由加入，私密房间通过邀请码加入。一个账户管理所有社群与团队对话。</div>
            <div class="room-visual">
              <div class="room-chip"><span class="dot"></span> 产品讨论 <small>128</small></div>
              <div class="room-chip"><span class="dot"></span> 设计评审 <small>42</small></div>
              <div class="room-chip lock"><span class="dot"></span> 内部·K7-29A <small>🔒</small></div>
              <div class="room-chip"><span class="dot"></span> 闲聊频道 <small>·</small></div>
            </div>
          </div>

          <!-- Voice wide -->
          <div class="feature-card fc-wide reveal" data-d="2" v-tilt="6" v-cursor-glow>
            <div class="f-ico"><MicIcon /></div>
            <div class="f-title">高清语音通话</div>
            <div class="f-text">基于 WebRTC 的端到端语音传输，房间内一键发起语音会话，低延迟、高清晰度。</div>
            <div class="voice-visual">
              <div class="voice-ring"></div>
              <div class="voice-ring r2"></div>
              <div class="voice-ring r3"></div>
              <div class="voice-mic"><MicIcon /></div>
              <div class="voice-bars">
                <span v-for="i in 7" :key="i"></span>
              </div>
            </div>
          </div>

          <!-- Lightning third -->
          <div class="feature-card fc-third reveal" data-d="1" v-tilt="6" v-cursor-glow>
            <div class="f-ico"><LightningIcon /></div>
            <div class="f-title">毫秒级实时</div>
            <div class="f-text">基于 Socket.io 的双向通信，消息送达 &lt; 50ms。</div>
          </div>

          <!-- Users third -->
          <div class="feature-card fc-third reveal" data-d="2" v-tilt="6" v-cursor-glow>
            <div class="f-ico"><UsersIcon /></div>
            <div class="f-title">在线状态实时同步</div>
            <div class="f-text">谁在线、谁正在输入，全部实时可见。</div>
            <div class="presence-stack">
              <div class="av">林</div>
              <div class="av p2">江</div>
              <div class="av p3">Z</div>
              <div class="av p4">陈</div>
              <div class="av more">+12</div>
            </div>
          </div>

          <!-- Shield third -->
          <div class="feature-card fc-third reveal" data-d="3" v-tilt="6" v-cursor-glow>
            <div class="f-ico"><ShieldIcon /></div>
            <div class="f-title">隐私与安全</div>
            <div class="f-text">邀请码私密房间、密码哈希加盐、消息传输加密。</div>
            <div class="shield-vis">
              <ShieldIcon />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         LIVE CHAT DEMO
    ============================================================ -->
    <section id="demo" class="sec-pad demo-sec">
      <div class="wrap">
        <div class="reveal" style="max-width:740px">
          <span class="sec-eyebrow"><span class="bar"></span>实时演示</span>
          <h2 class="sec-title">完整的<span style="color:var(--brand)">聊天体验</span>，<br/>实时呈现</h2>
          <p class="sec-sub">下方是 ezChat 完整工作台的实时演示 —— 这正是你登录后看到的界面。从房间侧栏到成员列表，一切都在原生 Web 中流畅运行。</p>
        </div>

        <div class="demo-shell reveal" data-d="2">
          <aside class="demo-side">
            <h6>我的房间</h6>
            <div class="demo-room active"><span class="hashicon">#</span> 产品讨论 <span class="unread">3</span></div>
            <div class="demo-room"><span class="hashicon">#</span> 设计评审</div>
            <div class="demo-room"><span class="hashicon">#</span> 闲聊频道</div>
            <h6 style="margin-top:12px">私密房间</h6>
            <div class="demo-room"><span class="hashicon">🔒</span> 内部·K7-29A</div>
            <div class="demo-room"><span class="hashicon">🔒</span> 项目 Aurora</div>
          </aside>

          <div class="demo-main">
            <div class="demo-head">
              <span class="hashicon head-hash">#</span>
              <div>
                <h5>产品讨论</h5>
                <div style="font-size:12px;color:var(--muted)">23 人在线 · 公开房间</div>
              </div>
              <span class="live">实时连接</span>
            </div>
            <div class="demo-stream">
              <template v-for="(m, idx) in shown" :key="m.id">
                <div v-if="m.who === 'typing'" class="msg">
                  <div class="msg-av">江</div>
                  <div class="msg-body">
                    <div class="msg-meta"><strong>江砚</strong> <span>正在输入...</span></div>
                    <div class="msg-bubble">
                      <span class="typing-dots"><span></span><span></span><span></span></span>
                    </div>
                  </div>
                </div>
                <div v-else class="msg" :class="{ me: m.me }">
                  <div class="msg-av" :class="m.av">{{ m.name.charAt(0) }}</div>
                  <div class="msg-body">
                    <div class="msg-meta"><strong>{{ m.name }}</strong> <span>{{ '11:2' + idx }}</span></div>
                    <div class="msg-bubble">{{ m.text }}</div>
                  </div>
                </div>
              </template>
            </div>
            <div class="demo-input">
              <input class="input" placeholder="在 # 产品讨论 中输入消息…" readonly />
              <button class="send"><SendIcon /></button>
            </div>
          </div>

          <aside class="demo-members">
            <h6>在线 · 4</h6>
            <div class="demo-member"><span class="av g">林</span> 林小满</div>
            <div class="demo-member"><span class="av">江</span> 江砚</div>
            <div class="demo-member"><span class="av p">Z</span> Zoe</div>
            <div class="demo-member"><span class="av a">陈</span> 陈一行</div>
            <h6 style="margin-top:14px">离线 · 2</h6>
            <div class="demo-member off"><span class="av g">王</span> 王锐</div>
            <div class="demo-member off"><span class="av">M</span> Mira</div>
          </aside>
        </div>
      </div>
    </section>

    <!-- ============================================================
         STATS
    ============================================================ -->
    <section id="stats" class="stats-sec">
      <div class="wrap">
        <div class="stats-grid">
          <div class="stat reveal">
            <div class="stat-num"><Counter :to="50" suffix="ms" /></div>
            <div class="stat-lbl">平均消息送达延迟</div>
          </div>
          <div class="stat reveal" data-d="1">
            <div class="stat-num"><Counter :to="99" suffix=".9%" /></div>
            <div class="stat-lbl">服务可用性 SLA</div>
          </div>
          <div class="stat reveal" data-d="2">
            <div class="stat-num"><Counter :to="12438" /></div>
            <div class="stat-lbl">活跃用户</div>
          </div>
          <div class="stat reveal" data-d="3">
            <div class="stat-num"><Counter :to="2400000" suffix="+" /></div>
            <div class="stat-lbl">累计消息送达</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         HOW
    ============================================================ -->
    <section id="how" class="sec-pad">
      <div class="wrap">
        <div class="reveal" style="max-width:740px">
          <span class="sec-eyebrow"><span class="bar"></span>开始</span>
          <h2 class="sec-title">三步开始你的<br/><span style="color:var(--brand)">第一次对话</span></h2>
        </div>
        <div class="how-grid">
          <svg class="how-line-svg" ref="lineEl" viewBox="0 0 1000 40" preserveAspectRatio="none">
            <path d="M 20 20 Q 250 -10 500 20 T 980 20" />
            <circle cx="333" cy="16" r="5" />
            <circle cx="666" cy="24" r="5" />
          </svg>
          <div class="how-card reveal" data-d="1">
            <div class="how-num">01 / 注册</div>
            <h4>用邮箱创建账户</h4>
            <p>30 秒完成注册，无需手机号、无需邀请。一个邮箱，一个账户。</p>
          </div>
          <div class="how-card reveal" data-d="2">
            <div class="how-num">02 / 加入</div>
            <h4>加入或创建房间</h4>
            <p>浏览公开房间自由加入，或使用邀请码加入私密房间，也可创建自己的房间。</p>
          </div>
          <div class="how-card reveal" data-d="3">
            <div class="how-num">03 / 畅聊</div>
            <h4>开始实时沟通</h4>
            <p>发送文字、上传图片、一键发起语音通话。你想表达的，ezChat 都能承载。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         CTA
    ============================================================ -->
    <section class="cta-sec">
      <div class="cta-mesh"></div>
      <div class="wrap cta-inner reveal">
        <h2>准备好<br/><span class="accent">开始畅聊了吗？</span></h2>
        <p>一切高端的沟通体验，都从一次注册开始。30 秒后，你就在房间里了。</p>
        <div class="cta-actions">
          <button class="btn btn-primary btn-lg lg-glow" v-magnetic="0.3" @click="goRegister">
            免费创建账户 <ArrowIcon />
          </button>
          <button class="btn btn-ghost-hero btn-lg" v-magnetic="0.2" @click="goLogin">
            浏览公开房间
          </button>
        </div>
      </div>
    </section>

    <!-- ============================================================
         FOOTER
    ============================================================ -->
    <footer>
      <div class="wrap">
        <div class="footer-grid">
          <div class="footer-brand">
            <h6>
              <span class="nav-mark" style="width:28px;height:28px"><img :src="logoUrl" alt="ezChat" /></span>
              ezChat
            </h6>
            <p>新一代实时聊天平台。让团队、社群与朋友之间的沟通，再无界限。</p>
          </div>
          <div class="footer-col">
            <h6>产品</h6>
            <a href="#features">特性</a>
            <a href="#demo">演示</a>
            <a href="#">定价</a>
            <a href="#">更新日志</a>
          </div>
          <div class="footer-col">
            <h6>资源</h6>
            <a href="#">文档</a>
            <a href="#">API</a>
            <a href="#">状态</a>
            <a href="#">支持</a>
          </div>
          <div class="footer-col">
            <h6>公司</h6>
            <a href="#">关于</a>
            <a href="#">博客</a>
            <a href="#">隐私</a>
            <a href="#">条款</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 ezChat. All rights reserved.</span>
          <span>Built with Vue 3 · WebSocket · WebRTC</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, h, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import logoUrl from '../assets/images/landing-logo.png';

const router = useRouter();

/* ---------- icons (inline functional components) ---------- */
const ArrowIcon = defineComponent({ render: () =>
  h('svg', { viewBox: '0 0 24 24', width: 14, height: 14, fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'btn-arrow' },
    [h('path', { d: 'M5 12h14M13 5l7 7-7 7' })])
});
const PlayIcon = defineComponent({ render: () =>
  h('svg', { viewBox: '0 0 24 24', width: 14, height: 14 }, [
    h('circle', { cx: 12, cy: 12, r: 11, fill: 'currentColor', opacity: '.12' }),
    h('path', { d: 'M10 8.5v7l6-3.5-6-3.5Z', fill: 'currentColor' }),
  ])
});
const ScrollDownIcon = defineComponent({ render: () =>
  h('svg', { viewBox: '0 0 24 24', width: 14, height: 14, fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    [h('path', { d: 'M12 5v14M5 12l7 7 7-7' })])
});
const RoomsIcon = defineComponent({ render: () =>
  h('svg', { viewBox: '0 0 28 28', width: 26, height: 26 }, [
    h('rect', { x: 3, y: 5, width: 17, height: 12, rx: 3, fill: '#ffffff', opacity: '.25' }),
    h('rect', { x: 8, y: 10, width: 17, height: 13, rx: 3, fill: '#ffffff' }),
    h('path', { d: 'M8 23v-2.5l-3 2.5', fill: '#ffffff', stroke: '#ffffff', 'stroke-width': '1.5', 'stroke-linejoin': 'round' }),
    h('circle', { cx: 14, cy: 16.5, r: 1, fill: '#1d6fd1' }),
    h('circle', { cx: 18, cy: 16.5, r: 1, fill: '#1d6fd1' }),
    h('circle', { cx: 22, cy: 16.5, r: 1, fill: '#1d6fd1' }),
  ])
});
const MicIcon = defineComponent({ render: () =>
  h('svg', { viewBox: '0 0 32 32', width: 34, height: 34, fill: 'none' }, [
    h('rect', { x: 12, y: 3, width: 8, height: 16, rx: 4, fill: '#ffffff' }),
    h('path', { d: 'M7 14a9 9 0 0 0 18 0', stroke: '#ffffff', 'stroke-width': '2.2', 'stroke-linecap': 'round' }),
    h('path', { d: 'M16 23v5M11 28h10', stroke: '#ffffff', 'stroke-width': '2.2', 'stroke-linecap': 'round' }),
    h('circle', { cx: 16, cy: 9, r: 1.4, fill: '#1d6fd1' }),
  ])
});
const LightningIcon = defineComponent({ render: () =>
  h('svg', { viewBox: '0 0 28 28', width: 26, height: 26 }, [
    h('defs', [
      h('linearGradient', { id: 'bolt-hi', x1: '0', y1: '0', x2: '0', y2: '1' }, [
        h('stop', { offset: '0', 'stop-color': '#ffffff' }),
        h('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }),
      ]),
    ]),
    h('path', { d: 'M16 2 5 16h7l-2 10 12-14h-7l1-10Z', fill: '#ffffff' }),
    h('path', { d: 'M16 2 5 16h7l-2 10 12-14h-7l1-10Z', fill: 'url(#bolt-hi)', opacity: '.35' }),
  ])
});
const UsersIcon = defineComponent({ render: () =>
  h('svg', { viewBox: '0 0 28 28', width: 26, height: 26 }, [
    h('circle', { cx: 10, cy: 11, r: 4.5, fill: '#ffffff' }),
    h('circle', { cx: 19, cy: 9, r: 3.5, fill: '#ffffff', opacity: '.55' }),
    h('path', { d: 'M2 24c.6-4.4 4-7 8-7s7.4 2.6 8 7v1H2v-1Z', fill: '#ffffff' }),
    h('path', { d: 'M18 17c3.4.1 6 2.2 7 6v1h-5', fill: '#ffffff', opacity: '.55' }),
  ])
});
const ShieldIcon = defineComponent({ render: () =>
  h('svg', { viewBox: '0 0 28 28', width: 26, height: 26 }, [
    h('defs', [
      h('linearGradient', { id: 'sh-hi', x1: '0', y1: '0', x2: '0', y2: '1' }, [
        h('stop', { offset: '0', 'stop-color': '#ffffff' }),
        h('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }),
      ]),
    ]),
    h('path', { d: 'M14 2.5 4 6v8c0 6 4.5 9.5 10 11.5 5.5-2 10-5.5 10-11.5V6l-10-3.5Z', fill: '#ffffff' }),
    h('path', { d: 'M14 2.5 4 6v8c0 6 4.5 9.5 10 11.5 5.5-2 10-5.5 10-11.5V6l-10-3.5Z', fill: 'url(#sh-hi)', opacity: '.4' }),
    h('path', { d: 'm9.5 14 3 3 6-6.5', fill: 'none', stroke: '#1d6fd1', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  ])
});
const SendIcon = defineComponent({ render: () =>
  h('svg', { viewBox: '0 0 20 20', width: 16, height: 16 }, [
    h('path', { d: 'M2.5 9.5 17 3l-4 14-4-6.5-6.5-1Z', fill: '#ffffff' }),
    h('path', { d: 'm17 3-8 7.5', fill: 'none', stroke: '#1d6fd1', 'stroke-width': '1.2', 'stroke-linecap': 'round', opacity: '.5' }),
  ])
});

/* ---------- Counter sub-component ---------- */
const Counter = defineComponent({
  props: { to: { type: Number, required: true }, suffix: { type: String, default: '' }, dur: { type: Number, default: 1800 } },
  setup(props) {
    const val = ref(0);
    const el = ref(null);
    let io = null;
    let fb = null;
    onMounted(() => {
      const node = el.value;
      if (!node) return;
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        const t0 = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - t0) / props.dur);
          const eased = 1 - Math.pow(1 - t, 3);
          val.value = Math.floor(props.to * eased);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { start(); io.disconnect(); } });
      }, { threshold: 0.3 });
      io.observe(node);
      fb = setTimeout(start, 1500);
    });
    onBeforeUnmount(() => { io?.disconnect(); if (fb) clearTimeout(fb); });
    return () => h('span', { ref: el }, [
      val.value.toLocaleString(),
      h('span', { class: 'suf' }, props.suffix),
    ]);
  },
});

/* ---------- nav scroll state ---------- */
const scrolled = ref(false);
function onScroll() { scrolled.value = window.scrollY > 60; }

/* ---------- hero ---------- */
const heroEl = ref(null);
const lineEl = ref(null);
const stars = computed(() => Array.from({ length: 40 }, () => ({
  top: Math.random() * 100,
  left: Math.random() * 100,
  delay: Math.random() * 4,
  size: Math.random() * 1.5 + 0.6,
})));

function onHeroMove(e) {
  const el = heroEl.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 100;
  const y = ((e.clientY - r.top) / r.height) * 100;
  el.style.setProperty('--mx', x + '%');
  el.style.setProperty('--my', y + '%');
}

/* ---------- marquee ---------- */
const marqueeItems = (() => {
  const items = [
    'WebSocket 实时通信',
    'Vue 3 + Element Plus',
    '端到端加密',
    'WebRTC 语音通话',
    '邀请码私密房间',
    '在线状态同步',
    '毫秒级消息送达',
    '无需客户端',
  ];
  return [...items, ...items];
})();

/* ---------- chat demo ---------- */
const DEMO_SCRIPT = [
  { who: 'lin',    name: '林小满', av: 'g', text: '大家看到刚刚那个交互草图了吗？我觉得过渡可以更顺一点。', delay: 1200 },
  { who: 'jiang',  name: '江砚',   av: '',  text: '我也是这个感觉，左上的 hover 太突兀。', delay: 1500 },
  { who: 'zoe',    name: 'Zoe',    av: 'p', text: '加个缓动吧，cubic-bezier(.22,.61,.36,1) 试试。', delay: 1500 },
  { who: 'me',     name: '我',     av: 'a', text: '收到，我先改一版到 staging，五分钟后开语音对一下。', delay: 1300, me: true },
  { who: 'lin',    name: '林小满', av: 'g', text: '好嘞！房间码我发邀请。', delay: 1200 },
  { who: 'typing', name: '江砚',   av: '',  text: '', delay: 1400 },
];
const shown = ref([]);
let demoTimer = null;
let demoIdx = 0;
let demoMsgId = 0;
function tickDemo() {
  const step = DEMO_SCRIPT[demoIdx % DEMO_SCRIPT.length];
  demoTimer = setTimeout(() => {
    shown.value = [...shown.value, { ...step, id: demoMsgId++ }].slice(-5);
    demoIdx++;
    tickDemo();
  }, step.delay);
}

/* ---------- reveal observer ---------- */
let revealIO = null;
let revealFb = null;
function setupReveal(root) {
  const els = root.querySelectorAll('.reveal');
  revealFb = setTimeout(() => els.forEach((el) => el.classList.add('in')), 1200);
  revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el) => revealIO.observe(el));
}

/* ---------- how-line svg reveal ---------- */
let lineIO = null;
let lineFb = null;
function setupHowLine() {
  const el = lineEl.value;
  if (!el) return;
  lineIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { el.classList.add('in'); lineIO.disconnect(); }
    });
  }, { threshold: 0.3 });
  lineIO.observe(el);
  lineFb = setTimeout(() => el.classList.add('in'), 1800);
}

/* ---------- mount / unmount ---------- */
const rootEl = ref(null);
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  heroEl.value?.addEventListener('mousemove', onHeroMove);
  setupReveal(rootEl.value || document);
  setupHowLine();
  tickDemo();
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  heroEl.value?.removeEventListener('mousemove', onHeroMove);
  revealIO?.disconnect();
  if (revealFb) clearTimeout(revealFb);
  lineIO?.disconnect();
  if (lineFb) clearTimeout(lineFb);
  if (demoTimer) clearTimeout(demoTimer);
});

/* ---------- navigation ---------- */
function goLogin() { router.push('/login'); }
function goRegister() { router.push('/register'); }
function scrollToDemo() {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- directives ---------- */
const vMagnetic = {
  mounted(el, binding) {
    const strength = typeof binding.value === 'number' ? binding.value : 0.25;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onLeave = () => { el.style.transform = ''; };
    el.__magMove = onMove; el.__magLeave = onLeave;
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  },
  unmounted(el) {
    if (el.__magMove) el.removeEventListener('mousemove', el.__magMove);
    if (el.__magLeave) el.removeEventListener('mouseleave', el.__magLeave);
  },
};

const vTilt = {
  mounted(el, binding) {
    const maxDeg = typeof binding.value === 'number' ? binding.value : 6;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * maxDeg;
      const ry = (px - 0.5) * maxDeg;
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    };
    const onLeave = () => { el.style.transform = ''; };
    el.__tiltMove = onMove; el.__tiltLeave = onLeave;
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  },
  unmounted(el) {
    if (el.__tiltMove) el.removeEventListener('mousemove', el.__tiltMove);
    if (el.__tiltLeave) el.removeEventListener('mouseleave', el.__tiltLeave);
  },
};

const vCursorGlow = {
  mounted(el) {
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--cx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--cy', (e.clientY - r.top) + 'px');
    };
    el.__glowMove = onMove;
    el.addEventListener('mousemove', onMove);
  },
  unmounted(el) {
    if (el.__glowMove) el.removeEventListener('mousemove', el.__glowMove);
  },
};
</script>

<style scoped>
/* ============================================================
   Variables + reset (scoped to landing-page)
============================================================ */
.landing-page {
  --brand: #409eff;
  --brand-hi: #6cb4ff;
  --brand-lo: #1d6fd1;
  --brand-deep: #0a4ea8;
  --ink: #0b1e3f;
  --ink-2: #1a2e54;
  --ink-3: #475878;
  --muted: #6b7891;
  --hair: rgba(11, 30, 63, 0.08);
  --hair-2: rgba(11, 30, 63, 0.04);
  --bg: #ffffff;
  --bg-2: #f5f9ff;
  --bg-3: #eaf2ff;

  --hero-bg: #f7faff;
  --hero-ink: #0b1e3f;
  --hero-muted: #506480;
  --hero-hair: rgba(64, 158, 255, 0.18);

  --radius: 14px;
  --radius-lg: 20px;
  --shadow-card: 0 1px 2px rgba(11,30,63,.04), 0 8px 24px rgba(64,158,255,.08);
  --shadow-pop: 0 24px 60px -20px rgba(64,158,255,.30), 0 4px 12px rgba(11,30,63,.06);

  --font-sans: "Manrope", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-cn:   "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  font-feature-settings: "ss01","cv11";
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  min-height: 100vh;
}

.landing-page * { box-sizing: border-box; }
.landing-page a { color: inherit; text-decoration: none; }
.landing-page button { font: inherit; cursor: pointer; border: none; background: none; color: inherit; }
.landing-page img, .landing-page svg { display: block; max-width: 100%; }
.landing-page ::selection { background: rgba(64,158,255,.28); color: var(--ink); }

.wrap { max-width: 1240px; margin: 0 auto; padding: 0 28px; }

/* ============================================================
   NAV
============================================================ */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: 68px;
  display: flex; align-items: center; justify-content: center;
  transition: background .35s ease, backdrop-filter .35s ease, border-color .35s ease, box-shadow .35s ease;
  border-bottom: 1px solid transparent;
}
.nav.scrolled {
  background: rgba(255,255,255,.82);
  backdrop-filter: saturate(180%) blur(18px);
  -webkit-backdrop-filter: saturate(180%) blur(18px);
  border-bottom-color: var(--hair);
  box-shadow: 0 4px 24px rgba(64,158,255,.06);
}
.nav-inner {
  width: 100%; max-width: 1240px; padding: 0 28px;
  display: flex; align-items: center; justify-content: space-between;
}
.nav-logo {
  display: flex; align-items: center; gap: 10px;
  font-weight: 800; letter-spacing: -0.01em; font-size: 18px;
  color: var(--ink);
}
.nav-mark {
  width: 34px; height: 34px;
  display: grid; place-items: center; flex-shrink: 0;
  position: relative;
}
.nav-mark img,
.nav-mark svg {
  width: 100%; height: 100%; object-fit: contain;
  filter: drop-shadow(0 6px 14px rgba(64,158,255,.40));
}
.nav-links { display: flex; gap: 32px; font-size: 14px; color: var(--ink-3); }
.nav-links a { transition: color .2s; position: relative; font-weight: 500; }
.nav-links a:hover { color: var(--brand); }
.nav-cta { display: flex; align-items: center; gap: 12px; }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  height: 40px; padding: 0 18px;
  border-radius: 999px;
  font-weight: 600; font-size: 14px;
  transition: transform .2s ease, box-shadow .2s ease, background .2s ease, color .2s ease, border-color .2s ease;
  white-space: nowrap;
}
.btn:hover { transform: translateY(-1px); }
.btn-ghost {
  color: var(--ink); border: 1px solid var(--hair);
  background: rgba(255,255,255,.6);
}
.btn-ghost:hover { border-color: var(--brand); color: var(--brand); }
.btn-primary {
  background: linear-gradient(180deg, var(--brand-hi), var(--brand));
  color: #fff;
  box-shadow: 0 10px 24px rgba(64,158,255,.40), inset 0 1px 0 rgba(255,255,255,.40);
}
.btn-primary:hover {
  background: linear-gradient(180deg, var(--brand), var(--brand-lo));
  box-shadow: 0 14px 32px rgba(64,158,255,.50), inset 0 1px 0 rgba(255,255,255,.40);
}
.btn-lg { height: 52px; padding: 0 26px; font-size: 15px; border-radius: 999px; }
:deep(.btn-arrow) { transition: transform .25s ease; }
.btn:hover :deep(.btn-arrow) { transform: translateX(3px); }

/* ============================================================
   HERO
============================================================ */
.hero {
  position: relative;
  min-height: 100vh;
  padding: 140px 0 80px;
  background: var(--hero-bg);
  color: var(--hero-ink);
  overflow: hidden;
  isolation: isolate;
}
.hero-mesh {
  position: absolute; inset: -10% -10% -10% -10%;
  z-index: -2;
  background:
    radial-gradient(50% 50% at 18% 28%, rgba(108,180,255,.55), transparent 60%),
    radial-gradient(45% 45% at 82% 22%, rgba(64,158,255,.40), transparent 65%),
    radial-gradient(45% 45% at 78% 80%, rgba(120,190,255,.45), transparent 60%),
    radial-gradient(40% 40% at 18% 88%, rgba(180,215,255,.55), transparent 65%),
    var(--hero-bg);
  filter: blur(60px) saturate(110%);
  animation: meshFloat 22s ease-in-out infinite alternate;
}
@keyframes meshFloat {
  0%   { transform: translate(0,0) scale(1); }
  50%  { transform: translate(-2%, 1.5%) scale(1.05); }
  100% { transform: translate(2%, -1%) scale(1.02); }
}
.hero-grid {
  position: absolute; inset: 0; z-index: -1;
  background-image:
    linear-gradient(rgba(64,158,255,.10) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64,158,255,.10) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 90%);
}
.hero-spot {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(600px 600px at var(--mx, 50%) var(--my, 35%), rgba(64,158,255,.18), transparent 60%);
  transition: background .15s linear;
}
.hero-stars {
  position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .9;
}
.hero-stars span {
  position: absolute; width: 3px; height: 3px;
  background: var(--brand); border-radius: 50%;
  box-shadow: 0 0 8px rgba(64,158,255,.6);
  animation: twinkle 4s ease-in-out infinite;
}
@keyframes twinkle {
  0%, 100% { opacity: .15; transform: scale(.7); }
  50%      { opacity: .85; transform: scale(1.3); }
}

.hero-inner {
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  gap: 60px;
  align-items: center;
}

.eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px; border-radius: 999px;
  background: rgba(255,255,255,.7);
  border: 1px solid var(--hero-hair);
  font-size: 12px; font-weight: 500; letter-spacing: .04em;
  color: var(--ink-2);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 14px rgba(64,158,255,.10);
  position: relative; overflow: hidden;
}
.eyebrow::after {
  content: "";
  position: absolute; top: 0; left: -30%;
  width: 30%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(64,158,255,.30), transparent);
  animation: eyebrowShine 5s ease-in-out infinite;
  pointer-events: none;
}
@keyframes eyebrowShine {
  0% { left: -30%; }
  55%, 100% { left: 130%; }
}
.eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,.20);
  animation: pulse 1.6s ease-out infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34,197,94,.45); }
  100% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
}

.hero h1 {
  margin-top: 24px;
  font-family: var(--font-cn);
  font-weight: 900;
  font-size: clamp(48px, 6.6vw, 92px);
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: var(--ink);
}
.hero h1 .accent {
  background: linear-gradient(120deg, var(--brand-lo) 0%, var(--brand) 40%, var(--brand-hi) 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;
  animation: shimmer 6s linear infinite;
}
@keyframes shimmer {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}
.hero h1 .sep {
  display: inline-block; vertical-align: middle;
  width: .12em; height: .14em; border-radius: 999px;
  background: var(--brand);
  margin: 0 .08em; transform: translateY(.18em);
  box-shadow: 0 0 24px rgba(64,158,255,.55);
}

.hero p.lede {
  margin-top: 28px;
  font-size: 18px; line-height: 1.7;
  color: var(--hero-muted);
  max-width: 520px;
}

.hero-ctas {
  margin-top: 36px; display: flex; gap: 14px; align-items: center; flex-wrap: wrap;
}
.btn-primary.lg-glow { position: relative; }
.btn-primary.lg-glow::before {
  content: ""; position: absolute; inset: -2px; border-radius: inherit;
  background: conic-gradient(from var(--ang, 0deg), transparent 60%, var(--brand-hi) 75%, transparent 90%);
  z-index: -1; opacity: .9;
  animation: rotateGlow 4s linear infinite;
  filter: blur(6px);
}
@property --ang {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@keyframes rotateGlow { to { --ang: 360deg; } }
.btn-ghost-hero {
  color: var(--ink); border: 1px solid var(--hero-hair);
  background: rgba(255,255,255,.65);
  backdrop-filter: blur(8px);
}
.btn-ghost-hero:hover { background: #fff; border-color: var(--brand); color: var(--brand); }

.hero-meta {
  margin-top: 28px;
  display: flex; gap: 28px; flex-wrap: wrap;
  color: var(--muted); font-size: 13px;
}
.hero-meta .check { color: var(--brand); margin-right: 6px; font-weight: 700; }

.hero-card-stack {
  position: relative;
  height: 540px;
  perspective: 1400px;
}
.float-card {
  position: absolute;
  background: rgba(255,255,255,.88);
  border: 1px solid var(--hero-hair);
  backdrop-filter: blur(22px) saturate(140%);
  -webkit-backdrop-filter: blur(22px) saturate(140%);
  border-radius: 18px;
  padding: 14px 18px;
  box-shadow:
    0 28px 60px -22px rgba(11,30,63,.18),
    0 6px 16px rgba(64,158,255,.12),
    inset 0 1px 0 rgba(255,255,255,.9);
  animation: floaty 6s ease-in-out infinite;
  display: flex; gap: 12px; align-items: flex-start;
  min-width: 220px;
}
.float-card::before {
  content: ""; position: absolute; inset: -10px;
  border-radius: 22px;
  background: radial-gradient(circle at 50% 0%, rgba(64,158,255,.20), transparent 60%);
  z-index: -1; opacity: 0;
  transition: opacity .4s;
}
.float-card:hover::before { opacity: 1; }
@keyframes floaty {
  0%, 100% { transform: translateY(0) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); }
  50%      { transform: translateY(-10px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); }
}
.fc-1 { top: 20px;   left: 20px;  --rx: 4deg; --ry: -10deg; animation-delay: 0s; }
.fc-2 { top: 130px;  right: 0;    --rx: -2deg; --ry: 8deg;  animation-delay: 1.2s; }
.fc-3 { top: 260px;  left: 50px;  --rx: 3deg;  --ry: -6deg; animation-delay: 2.4s; }
.fc-4 { top: 380px;  right: 30px; --rx: -3deg; --ry: 8deg;  animation-delay: 3.0s; }
.fc-av {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--brand-hi), var(--brand-deep));
  display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 13px;
}
.fc-av.green { background: linear-gradient(135deg, #4ade80, #16a34a); }
.fc-av.purple { background: linear-gradient(135deg, #a78bfa, #6d28d9); }
.fc-av.amber  { background: linear-gradient(135deg, #fbbf24, #d97706); }
.fc-body { font-size: 13px; line-height: 1.5; color: var(--ink-2); }
.fc-name { display: flex; gap: 8px; align-items: baseline; margin-bottom: 4px; }
.fc-name strong { font-size: 13px; font-weight: 700; color: var(--ink); }
.fc-name span { font-size: 11px; color: var(--muted); font-family: var(--font-mono); }

.hero-scroll {
  position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
  color: var(--muted); font-size: 12px; letter-spacing: .12em;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  animation: bob 2s ease-in-out infinite;
}
@keyframes bob { 0%,100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, 6px); } }

.hero-watermark {
  position: absolute;
  right: -180px; top: 50%;
  width: 720px; height: 720px;
  transform: translateY(-50%);
  z-index: -1;
  pointer-events: none;
  opacity: .05;
  animation: wmDrift 30s ease-in-out infinite alternate, spin 80s linear infinite;
}
.hero-watermark img { width: 100%; height: 100%; filter: blur(.5px); }
@keyframes wmDrift {
  0%   { transform: translate(0, -50%) scale(1); }
  100% { transform: translate(-30px, -45%) scale(1.05); }
}

.h1-word {
  display: inline-block;
  animation: wordIn .9s cubic-bezier(.2,.8,.2,1) backwards;
  will-change: transform;
}
@keyframes wordIn {
  from { transform: translateY(28px) rotate(1deg); }
  to   { transform: translateY(0) rotate(0); }
}
.h1-word:nth-child(1) { animation-delay: .15s; }
.h1-word:nth-child(2) { animation-delay: .28s; }
.h1-word:nth-child(3) { animation-delay: .42s; }
.h1-word:nth-child(4) { animation-delay: .55s; }
.h1-word:nth-child(5) { animation-delay: .70s; }
.h1-word:nth-child(6) { animation-delay: .84s; }

.hero h1 .h1-word.accent {
  animation: wordIn .9s cubic-bezier(.2,.8,.2,1) backwards, shimmer 6s linear infinite;
}

.hero .eyebrow,
.hero p.lede,
.hero-ctas,
.hero-meta {
  animation: fadeUp .8s cubic-bezier(.22,.61,.36,1) backwards;
}
.hero .eyebrow   { animation-delay: 0s; }
.hero p.lede     { animation-delay: 1.0s; }
.hero-ctas       { animation-delay: 1.15s; }
.hero-meta       { animation-delay: 1.30s; }
@keyframes fadeUp {
  from { transform: translateY(14px); }
  to   { transform: translateY(0); }
}

.hero-orbit {
  position: absolute;
  width: 360px; height: 360px;
  border-radius: 50%;
  border: 1px dashed rgba(64,158,255,.25);
  top: 14%; right: 8%;
  z-index: -1;
  pointer-events: none;
  animation: spin 60s linear infinite;
}
.hero-orbit::before,
.hero-orbit::after {
  content: "";
  position: absolute;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 14px rgba(64,158,255,.7);
}
.hero-orbit::before { top: -6px; left: 50%; transform: translateX(-50%); }
.hero-orbit::after  { bottom: -6px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background: var(--brand-hi); }

.nav-mark { transition: transform .3s; }
.nav-logo:hover .nav-mark { animation: markPop .6s cubic-bezier(.34,1.56,.64,1); }
@keyframes markPop {
  0% { transform: scale(1) rotate(0); }
  40% { transform: scale(1.12) rotate(-8deg); }
  100% { transform: scale(1) rotate(0); }
}

/* ============================================================
   MARQUEE
============================================================ */
.marquee {
  background: var(--bg-2);
  color: var(--ink-3);
  border-top: 1px solid var(--hair);
  border-bottom: 1px solid var(--hair);
  padding: 28px 0;
  overflow: hidden;
  white-space: nowrap;
}
.marquee-track {
  display: inline-flex; gap: 64px; align-items: center;
  animation: scroll 36s linear infinite;
  font-size: 14px; letter-spacing: .04em; font-weight: 500;
}
.marquee-track > * { display: inline-flex; gap: 10px; align-items: center; }
.marquee-track .dot { color: var(--brand); }
@keyframes scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ============================================================
   SECTION COMMONS
============================================================ */
section { position: relative; }
.sec-pad { padding: 120px 0; }

.sec-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--brand);
}
.sec-eyebrow .bar { width: 24px; height: 1px; background: var(--brand); }

.sec-title {
  font-family: var(--font-cn); font-weight: 800;
  font-size: clamp(36px, 4vw, 56px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-top: 16px;
}
.sec-sub {
  margin-top: 18px;
  font-size: 17px; color: var(--muted); line-height: 1.65;
  max-width: 640px;
}

.reveal { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.22,.61,.36,1), transform .8s cubic-bezier(.22,.61,.36,1); }
.reveal.in { opacity: 1; transform: none; }
.reveal[data-d="1"] { transition-delay: .08s; }
.reveal[data-d="2"] { transition-delay: .16s; }
.reveal[data-d="3"] { transition-delay: .24s; }
.reveal[data-d="4"] { transition-delay: .32s; }

.reveal.in .sec-eyebrow .bar {
  animation: barGrow .8s cubic-bezier(.22,.61,.36,1) forwards;
  transform-origin: left;
}
@keyframes barGrow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

/* ============================================================
   FEATURES
============================================================ */
.features-grid {
  margin-top: 64px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}
.feature-card {
  position: relative;
  background: var(--bg);
  border: 1px solid var(--hair);
  border-radius: var(--radius-lg);
  padding: 32px;
  overflow: hidden;
  transition: transform .35s ease, border-color .35s ease, box-shadow .35s ease;
  transform-style: preserve-3d;
  perspective: 1000px;
}
.feature-card:hover { transform: translateY(-4px); border-color: rgba(64,158,255,.45); box-shadow: var(--shadow-pop); }
.feature-card::before {
  content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0;
  background: radial-gradient(400px 200px at var(--cx,50%) var(--cy,50%), rgba(64,158,255,.10), transparent 70%);
  transition: opacity .3s;
}
.feature-card:hover::before { opacity: 1; }
.fc-tall  { grid-column: span 5; min-height: 380px; }
.fc-wide  { grid-column: span 7; min-height: 380px; }
.fc-third { grid-column: span 4; min-height: 280px; }
.f-ico {
  width: 56px; height: 56px; border-radius: 14px;
  background: linear-gradient(135deg, var(--brand-hi), var(--brand-deep));
  color: #fff; display: grid; place-items: center;
  box-shadow:
    0 12px 28px rgba(64,158,255,.38),
    inset 0 1px 0 rgba(255,255,255,.35),
    inset 0 -10px 24px rgba(10,78,168,.30);
  margin-bottom: 24px;
  position: relative;
  transition: transform .5s cubic-bezier(.34,1.56,.64,1);
}
.f-ico::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,.45), transparent 70%);
  pointer-events: none;
}
.feature-card:hover .f-ico { transform: scale(1.08) rotate(-6deg) translateZ(20px); }
.f-title {
  font-weight: 800; font-size: 22px; letter-spacing: -.01em;
  margin-bottom: 10px;
  color: var(--ink);
  transition: transform .4s ease;
}
.feature-card:hover .f-title { transform: translateZ(12px); }
.f-text {
  color: var(--muted); line-height: 1.65; font-size: 15px; max-width: 380px;
  transition: transform .4s ease;
}
.feature-card:hover .f-text  { transform: translateZ(6px); }

.room-visual {
  position: absolute; left: 32px; right: 32px; bottom: 32px;
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
}
.room-chip {
  border: 1px solid var(--hair);
  border-radius: 10px; padding: 10px 12px;
  display: flex; align-items: center; gap: 10px;
  font-size: 13px;
  background: var(--bg);
  transition: transform .25s ease, border-color .25s ease;
  color: var(--ink-2);
}
.room-chip:hover { transform: translateX(2px); border-color: rgba(64,158,255,.4); }
.room-chip .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); }
.room-chip.lock .dot { background: var(--ink-3); }
.room-chip small { color: var(--muted); margin-left: auto; font-family: var(--font-mono); font-size: 11px; }
.feature-card:hover .room-chip {
  animation: chipNudge .5s ease both;
}
.feature-card:hover .room-chip:nth-child(1) { animation-delay: 0s; }
.feature-card:hover .room-chip:nth-child(2) { animation-delay: .07s; }
.feature-card:hover .room-chip:nth-child(3) { animation-delay: .14s; }
.feature-card:hover .room-chip:nth-child(4) { animation-delay: .21s; }
@keyframes chipNudge {
  0%   { transform: translateX(0); }
  50%  { transform: translateX(4px); }
  100% { transform: translateX(0); }
}

.voice-visual {
  position: absolute; right: 32px; top: 50%; transform: translateY(-50%);
  width: 280px; height: 220px;
  display: grid; place-items: center;
}
.voice-ring {
  position: absolute;
  width: 200px; height: 200px; border-radius: 50%;
  border: 1px solid rgba(64,158,255,.30);
  animation: ringPulse 3s ease-out infinite;
}
.voice-ring.r2 { animation-delay: 1s; }
.voice-ring.r3 { animation-delay: 2s; }
@keyframes ringPulse {
  0%   { transform: scale(.6); opacity: .8; }
  100% { transform: scale(1.5); opacity: 0; }
}
.voice-mic {
  position: relative; z-index: 2;
  width: 84px; height: 84px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-hi), var(--brand-deep));
  display: grid; place-items: center;
  color: #fff;
  box-shadow: 0 18px 40px rgba(64,158,255,.45);
}
.voice-bars {
  position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 4px; align-items: end; height: 28px;
}
.voice-bars span {
  width: 3px; background: var(--brand); border-radius: 2px;
  animation: bars 1.1s ease-in-out infinite;
}
.voice-bars span:nth-child(1) { animation-delay: 0s; }
.voice-bars span:nth-child(2) { animation-delay: .1s; }
.voice-bars span:nth-child(3) { animation-delay: .2s; }
.voice-bars span:nth-child(4) { animation-delay: .3s; }
.voice-bars span:nth-child(5) { animation-delay: .15s; }
.voice-bars span:nth-child(6) { animation-delay: .25s; }
.voice-bars span:nth-child(7) { animation-delay: .05s; }
@keyframes bars {
  0%, 100% { height: 6px; }
  50%      { height: 100%; }
}

.presence-stack {
  position: absolute; right: 32px; bottom: 32px;
  display: flex;
  padding-left: 10px;
}
.presence-stack .av {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid var(--bg);
  margin-left: -10px;
  background: linear-gradient(135deg, var(--brand-hi), var(--brand-deep));
  display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 13px;
}
.presence-stack .av.p2 { background: linear-gradient(135deg, #4ade80, #16a34a); }
.presence-stack .av.p3 { background: linear-gradient(135deg, #a78bfa, #6d28d9); }
.presence-stack .av.p4 { background: linear-gradient(135deg, #fbbf24, #d97706); }
.presence-stack .av.more { background: var(--bg-3); color: var(--ink); font-size: 11px; }

.shield-vis {
  position: absolute; right: 32px; bottom: 32px;
  width: 110px; height: 110px;
  display: grid; place-items: center;
  color: var(--brand);
}
.shield-vis::before {
  content: ""; position: absolute; inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, var(--brand) 0deg, transparent 80deg, var(--brand) 360deg);
  filter: blur(14px); opacity: .35;
  animation: spin 6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ============================================================
   LIVE CHAT DEMO
============================================================ */
.demo-sec {
  background: linear-gradient(180deg, var(--bg-2) 0%, #ffffff 100%);
  border-top: 1px solid var(--hair);
}
.demo-shell {
  margin-top: 72px;
  border: 1px solid var(--hair);
  border-radius: 24px;
  background: var(--bg);
  box-shadow: 0 50px 100px -40px rgba(64,158,255,.30), 0 20px 40px -20px rgba(11,30,63,.10);
  overflow: hidden;
  display: grid;
  grid-template-columns: 240px 1fr 220px;
  height: 540px;
  position: relative;
}
.demo-shell::before {
  content: ""; position: absolute; inset: -100px;
  background: radial-gradient(400px 200px at 50% 0%, rgba(64,158,255,.18), transparent 70%);
  pointer-events: none;
  z-index: 0;
}
.demo-side {
  background: var(--bg-2);
  border-right: 1px solid var(--hair);
  padding: 18px 14px;
  display: flex; flex-direction: column; gap: 4px;
  font-size: 14px;
  z-index: 1;
}
.demo-side h6 {
  text-transform: uppercase; letter-spacing: .12em; font-size: 11px;
  color: var(--muted); padding: 8px 10px;
}
.demo-room {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 8px;
  color: var(--ink-3); cursor: pointer;
  transition: background .2s;
  position: relative; overflow: hidden;
}
.demo-room:hover { background: rgba(64,158,255,.08); }
.demo-room.active {
  background: linear-gradient(180deg, var(--brand-hi), var(--brand));
  color: #fff;
  box-shadow: 0 6px 14px rgba(64,158,255,.30);
}
.demo-room .hashicon {
  width: 22px; height: 22px; border-radius: 6px;
  background: rgba(64,158,255,.15); color: var(--brand);
  display: grid; place-items: center; font-weight: 700; font-size: 13px;
  flex-shrink: 0;
}
.demo-room.active .hashicon { background: rgba(255,255,255,.22); color: #fff; }
.demo-room .unread {
  margin-left: auto;
  background: var(--brand); color: #fff;
  font-size: 11px; padding: 1px 7px; border-radius: 10px; font-weight: 700;
}
.demo-room.active .unread { background: #fff; color: var(--brand); }

.demo-main {
  display: flex; flex-direction: column;
  z-index: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.demo-head {
  padding: 16px 24px;
  border-bottom: 1px solid var(--hair);
  display: flex; align-items: center; gap: 12px;
}
.head-hash {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(64,158,255,.15); color: var(--brand);
  display: grid; place-items: center; font-weight: 700;
}
.demo-head h5 { font-size: 15px; font-weight: 700; color: var(--ink); }
.demo-head .live {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--muted);
  margin-left: auto;
}
.demo-head .live::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%;
  background: #22c55e; box-shadow: 0 0 0 4px rgba(34,197,94,.18);
}
.demo-stream {
  flex: 1;
  min-height: 0;
  padding: 24px;
  overflow: hidden;
  display: flex; flex-direction: column; justify-content: flex-end;
  gap: 18px;
  background:
    radial-gradient(circle at 100% 0%, rgba(64,158,255,.05), transparent 50%),
    var(--bg);
}
.demo-head, .demo-input { flex-shrink: 0; }
.msg {
  display: flex; gap: 12px;
  animation: msgIn .5s cubic-bezier(.2,.8,.2,1) both;
}
@keyframes msgIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.msg-av {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-hi), var(--brand-deep));
  display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 13px; flex-shrink: 0;
}
.msg-av.g { background: linear-gradient(135deg, #4ade80, #16a34a); }
.msg-av.p { background: linear-gradient(135deg, #a78bfa, #6d28d9); }
.msg-av.a { background: linear-gradient(135deg, #fbbf24, #d97706); }
.msg-body { flex: 1; min-width: 0; }
.msg-meta { display: flex; gap: 8px; align-items: baseline; margin-bottom: 4px; }
.msg-meta strong { font-size: 14px; font-weight: 700; color: var(--ink); }
.msg-meta span { font-size: 11px; color: var(--muted); font-family: var(--font-mono); }
.msg-bubble {
  display: inline-block;
  padding: 10px 14px;
  background: var(--bg-2);
  border-radius: 4px 14px 14px 14px;
  font-size: 14px; line-height: 1.55;
  max-width: 540px;
  color: var(--ink-2);
}
.msg.me .msg-bubble {
  background: linear-gradient(180deg, var(--brand-hi), var(--brand));
  color: #fff; border-radius: 14px 4px 14px 14px;
  box-shadow: 0 8px 18px rgba(64,158,255,.30);
}

.typing-dots { display: inline-flex; gap: 4px; align-items: center; padding: 4px 0; }
.typing-dots span {
  width: 7px; height: 7px; border-radius: 50%; background: var(--ink-3);
  animation: blink 1.2s ease-in-out infinite;
}
.typing-dots span:nth-child(2) { animation-delay: .18s; }
.typing-dots span:nth-child(3) { animation-delay: .36s; }
@keyframes blink {
  0%, 100% { opacity: .25; transform: scale(.9); }
  50%      { opacity: 1; transform: scale(1.1); }
}

.demo-input {
  border-top: 1px solid var(--hair);
  padding: 14px 20px;
  display: flex; align-items: center; gap: 10px;
  background: var(--bg);
}
.demo-input .input {
  flex: 1; height: 40px; padding: 0 14px;
  border-radius: 999px;
  background: var(--bg-2);
  border: 1px solid var(--hair);
  font-size: 14px; color: var(--ink);
}
.demo-input .input::placeholder { color: var(--muted); }
.demo-input .send {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(180deg, var(--brand-hi), var(--brand)); color: #fff;
  display: grid; place-items: center;
  box-shadow: 0 6px 14px rgba(64,158,255,.40);
}

.demo-members {
  background: var(--bg-2);
  border-left: 1px solid var(--hair);
  padding: 18px 14px;
  font-size: 14px;
  z-index: 1;
  overflow: hidden;
}
.demo-members h6 {
  text-transform: uppercase; letter-spacing: .12em; font-size: 11px;
  color: var(--muted); padding: 4px 6px 14px;
}
.demo-member {
  display: flex; align-items: center; gap: 10px;
  padding: 6px;
  border-radius: 8px;
  color: var(--ink-3);
}
.demo-member .av {
  position: relative;
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-hi), var(--brand-deep));
  display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 12px;
}
.demo-member .av.g { background: linear-gradient(135deg, #4ade80, #16a34a); }
.demo-member .av.p { background: linear-gradient(135deg, #a78bfa, #6d28d9); }
.demo-member .av.a { background: linear-gradient(135deg, #fbbf24, #d97706); }
.demo-member .av::after {
  content: ""; position: absolute; right: -2px; bottom: -2px;
  width: 10px; height: 10px; border-radius: 50%;
  border: 2px solid var(--bg-2);
  background: #22c55e;
}
.demo-member.off .av::after { background: #c1c8d3; }

/* ============================================================
   STATS
============================================================ */
.stats-sec {
  background: linear-gradient(180deg, #ffffff 0%, var(--bg-3) 50%, #ffffff 100%);
  color: var(--ink);
  padding: 100px 0;
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--hair);
  border-bottom: 1px solid var(--hair);
}
.stats-sec::before {
  content: ""; position: absolute; inset: -50%;
  background:
    radial-gradient(40% 40% at 25% 60%, rgba(64,158,255,.22), transparent 60%),
    radial-gradient(40% 40% at 80% 30%, rgba(120,180,255,.20), transparent 60%);
  filter: blur(60px);
  pointer-events: none;
}
.stats-grid {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0;
}
.stat {
  padding: 24px 32px;
  border-left: 1px solid var(--hair);
}
.stat:first-child { border-left: none; padding-left: 0; }
.stat-num {
  font-family: var(--font-sans);
  font-weight: 800;
  font-size: clamp(40px, 4.4vw, 60px);
  letter-spacing: -0.02em;
  line-height: 1;
  background: linear-gradient(160deg, var(--brand-lo) 0%, var(--brand) 60%, var(--brand-hi) 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100% !important;
  animation: shimmer 5s linear infinite;
}
.stat-num :deep(.suf) { color: var(--brand); -webkit-text-fill-color: var(--brand); }
.stat-lbl {
  margin-top: 12px;
  font-size: 14px;
  color: var(--muted);
}

/* ============================================================
   HOW
============================================================ */
.how-grid {
  margin-top: 72px;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  position: relative;
}
.how-line-svg {
  position: absolute;
  top: 64px; left: 4%; right: 4%;
  height: 40px;
  width: 92%;
  pointer-events: none;
  z-index: 0;
}
.how-line-svg path {
  fill: none;
  stroke: var(--brand);
  stroke-width: 2;
  stroke-dasharray: 4 6;
  stroke-linecap: round;
  stroke-dashoffset: 1200;
  opacity: .55;
  transition: stroke-dashoffset 2.2s cubic-bezier(.22,.61,.36,1);
}
.how-line-svg.in path { stroke-dashoffset: 0; }
.how-line-svg circle {
  fill: var(--brand);
  opacity: 0;
  transition: opacity .3s ease;
}
.how-line-svg.in circle { opacity: 1; }
.how-line-svg circle:nth-of-type(1) { transition-delay: .8s; }
.how-line-svg circle:nth-of-type(2) { transition-delay: 1.4s; }
.how-card {
  position: relative;
  z-index: 1;
  background: var(--bg);
  padding: 36px 28px;
  border: 1px solid var(--hair);
  border-radius: var(--radius-lg);
  transition: transform .3s, box-shadow .3s, border-color .3s;
}
.how-card:hover { transform: translateY(-4px); border-color: rgba(64,158,255,.4); box-shadow: var(--shadow-pop); }
.how-num {
  font-family: var(--font-mono);
  font-size: 13px; color: var(--brand);
  margin-bottom: 24px; letter-spacing: .1em;
  font-weight: 600;
}
.how-card h4 { font-size: 22px; font-weight: 800; letter-spacing: -.01em; margin-bottom: 10px; color: var(--ink); }
.how-card p { color: var(--muted); line-height: 1.65; font-size: 15px; }

/* ============================================================
   CTA
============================================================ */
.cta-sec {
  padding: 120px 0;
  background: linear-gradient(180deg, #ffffff 0%, var(--bg-3) 70%, #d9e8ff 100%);
  color: var(--ink);
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--hair);
}
.cta-mesh {
  position: absolute; inset: -20%;
  background:
    radial-gradient(45% 45% at 25% 50%, rgba(64,158,255,.45), transparent 60%),
    radial-gradient(40% 40% at 75% 50%, rgba(120,180,255,.50), transparent 65%),
    radial-gradient(35% 35% at 50% 30%, rgba(108,180,255,.35), transparent 60%);
  filter: blur(70px) saturate(125%);
  animation: meshFloat 16s ease-in-out infinite alternate;
  pointer-events: none;
}
.cta-inner {
  position: relative; z-index: 1;
  text-align: center;
}
.cta-inner h2 {
  font-family: var(--font-cn);
  font-weight: 900;
  font-size: clamp(40px, 5vw, 72px);
  line-height: 1.05; letter-spacing: -.02em;
  color: var(--ink);
}
.cta-inner h2 .accent {
  background: linear-gradient(120deg, var(--brand-lo) 0%, var(--brand) 50%, var(--brand-hi) 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.cta-inner p { margin-top: 20px; color: var(--muted); font-size: 18px; max-width: 560px; margin-left: auto; margin-right: auto; }
.cta-actions { margin-top: 36px; display: inline-flex; gap: 14px; }

/* ============================================================
   FOOTER
============================================================ */
footer {
  background: var(--bg-2);
  color: var(--muted);
  padding: 60px 0 36px;
  border-top: 1px solid var(--hair);
}
.footer-grid {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
}
.footer-brand h6 {
  color: var(--ink); font-size: 18px; font-weight: 800;
  display: flex; align-items: center; gap: 10px;
}
.footer-brand p { margin-top: 14px; font-size: 13px; line-height: 1.7; max-width: 280px; color: var(--muted); }
.footer-col h6 { color: var(--ink); font-size: 13px; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: .1em; }
.footer-col a { display: block; font-size: 14px; line-height: 2.1; color: var(--muted); transition: color .2s; }
.footer-col a:hover { color: var(--brand); }
.footer-bottom {
  margin-top: 48px; padding-top: 24px;
  border-top: 1px solid var(--hair);
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;
  font-size: 12px; color: var(--muted);
}

/* ============================================================
   Responsive
============================================================ */
@media (max-width: 980px) {
  .hero-inner { grid-template-columns: 1fr; gap: 40px; }
  .hero-card-stack { height: 380px; }
  .features-grid > * { grid-column: span 12 !important; min-height: auto; }

  .room-visual,
  .voice-visual,
  .presence-stack,
  .shield-vis {
    position: static;
    margin-top: 24px;
    transform: none;
    inset: auto;
    width: auto;
  }
  .voice-visual { height: 200px; }
  .presence-stack { width: max-content; }
  .shield-vis { width: 110px; height: 110px; }

  .demo-shell { grid-template-columns: 1fr; grid-template-rows: auto 1fr; height: auto; }
  .demo-side, .demo-members { display: none; }
  .demo-stream { padding: 16px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .stat { border-left: none; padding: 16px; }
  .how-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .nav-links { display: none; }
}
</style>
