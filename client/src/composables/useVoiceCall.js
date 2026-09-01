import { reactive, computed } from 'vue';
import { getSocket } from '../services/socket.js';
import { ElMessage } from 'element-plus';

const ICE_SERVERS = [
  { urls: 'stun:bob666.xyz:3478' },
  {
    urls: [
      'turn:bob666.xyz:3478?transport=udp',
      'turn:bob666.xyz:3478?transport=tcp',
    ],
    username: 'ezchat',
    credential: 'ezchatTurnPass2026',
  },
];

// Shared singleton state so every component sees the same call
const state = reactive({
  status: 'idle', // idle | calling | incoming | connecting | connected
  peerId: null,
  peerName: '',
  peerAvatar: '',
  muted: false,
  duration: 0,
});

let peerConnection = null;
let localStream = null;
let remoteAudio = null;
let audioCtx = null;
let remoteSourceNode = null;
let durationTimer = null;
let pendingCandidates = [];

async function flushPendingCandidates() {
  if (!peerConnection) return;
  const queue = pendingCandidates;
  pendingCandidates = [];
  for (const c of queue) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(c));
    } catch (err) {
      console.warn('[VoiceCall] Failed to flush candidate:', err);
    }
  }
}

function resetState() {
  state.status = 'idle';
  state.peerId = null;
  state.peerName = '';
  state.peerAvatar = '';
  state.muted = false;
  state.duration = 0;
}

function startDurationTimer() {
  state.duration = 0;
  durationTimer = setInterval(() => {
    state.duration++;
  }, 1000);
}

function stopDurationTimer() {
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
}

function cleanup() {
  stopDurationTimer();
  pendingCandidates = [];
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
  if (remoteSourceNode) {
    try { remoteSourceNode.disconnect(); } catch (_) { /* noop */ }
    remoteSourceNode = null;
  }
  if (remoteAudio) {
    remoteAudio.srcObject = null;
    if (remoteAudio.parentNode) remoteAudio.parentNode.removeChild(remoteAudio);
    remoteAudio = null;
  }
  resetState();
}

/** End the current call and notify the peer */
function endCall() {
  if (state.status === 'idle') return;
  const socket = getSocket();
  if (socket && state.peerId) {
    socket.emit('call:end', { targetUserId: state.peerId });
  }
  cleanup();
}

function createPeerConnection() {
  if (!RTCPC) {
    throw new Error('浏览器不支持 WebRTC');
  }
  const pc = new RTCPC({ iceServers: ICE_SERVERS });
  const socket = getSocket();

  pc.onicecandidate = (e) => {
    if (e.candidate && state.peerId && socket) {
      socket.emit('call:ice-candidate', {
        targetUserId: state.peerId,
        candidate: e.candidate,
      });
    }
  };

  pc.ontrack = (e) => {
    const stream = e.streams[0];
    if (!remoteAudio) {
      remoteAudio = new Audio();
      remoteAudio.autoplay = true;
      remoteAudio.playsInline = true;
      remoteAudio.setAttribute('playsinline', '');
      document.body.appendChild(remoteAudio);
    }
    // Required on some browsers for MediaStream playback to start
    remoteAudio.srcObject = stream;
    const tryPlay = () => {
      const p = remoteAudio.play();
      if (p && p.catch) p.catch(() => {});
    };
    tryPlay();

    // iOS Safari fallback: route the remote stream through AudioContext,
    // which works even when <audio srcObject> silently fails.
    try {
      if (audioCtx) {
        if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
        if (remoteSourceNode) {
          try { remoteSourceNode.disconnect(); } catch (_) { /* noop */ }
        }
        remoteSourceNode = audioCtx.createMediaStreamSource(stream);
        remoteSourceNode.connect(audioCtx.destination);
      }
    } catch (err) {
      console.warn('[VoiceCall] AudioContext routing failed:', err);
    }

    // One more retry wired to the next user tap, just in case
    const retry = () => {
      tryPlay();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      document.removeEventListener('click', retry);
      document.removeEventListener('touchstart', retry);
    };
    document.addEventListener('click', retry, { once: true });
    document.addEventListener('touchstart', retry, { once: true });
  };

  pc.oniceconnectionstatechange = () => {
    const s = pc.iceConnectionState;
    console.log('[VoiceCall] ICE state:', s);
    if (s === 'disconnected' || s === 'failed' || s === 'closed') {
      endCall();
    }
  };

  return pc;
}

// Resolve RTCPeerConnection with vendor-prefix fallbacks
const RTCPC =
  window.RTCPeerConnection ||
  window.webkitRTCPeerConnection ||
  window.mozRTCPeerConnection ||
  null;

function checkWebRTCSupport() {
  const issues = [];
  if (!window.isSecureContext) {
    issues.push(`当前页面非安全上下文 (${location.protocol}//${location.host})，需 HTTPS 或 localhost`);
  }
  if (!RTCPC) {
    issues.push('RTCPeerConnection 不可用（请确认浏览器支持 WebRTC 且未禁用）');
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    issues.push('getUserMedia 不可用');
  }
  // Print a diagnostic snapshot to the console for debugging
  console.log('[VoiceCall] Diagnostic:', {
    origin: location.origin,
    isSecureContext: window.isSecureContext,
    RTCPeerConnection: !!window.RTCPeerConnection,
    webkitRTCPeerConnection: !!window.webkitRTCPeerConnection,
    mozRTCPeerConnection: !!window.mozRTCPeerConnection,
    mediaDevices: !!navigator.mediaDevices,
    getUserMedia: !!navigator.mediaDevices?.getUserMedia,
    userAgent: navigator.userAgent,
  });
  return issues;
}

// Must be called synchronously inside a user gesture (click/tap) so the
// audio element gets unlocked on iOS/mobile before the mic permission
// prompt breaks the gesture chain.
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

function primeRemoteAudio() {
  // Unlock <audio> element (used on desktop / Android)
  if (!remoteAudio) {
    remoteAudio = new Audio();
    remoteAudio.autoplay = true;
    remoteAudio.playsInline = true;
    remoteAudio.setAttribute('playsinline', '');
    remoteAudio.muted = false;
    document.body.appendChild(remoteAudio);
  }
  try {
    remoteAudio.src = SILENT_WAV;
    const p = remoteAudio.play();
    if (p && p.catch) p.catch(() => {});
  } catch (_) { /* ignore */ }

  // Also create + resume AudioContext — required for iOS Safari to play
  // MediaStream audio reliably. Must be done inside a user gesture.
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC && !audioCtx) {
      audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  } catch (_) { /* ignore */ }
}

async function getLocalAudioStream() {
  if (!localStream) {
    const issues = checkWebRTCSupport();
    if (issues.length) {
      throw new Error(issues.join('；'));
    }
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  }
  return localStream;
}

// ---- Public API ----

export function useVoiceCall() {
  /** Caller: initiate a call to targetUser */
  function startCall(targetUserId, targetUserName, targetUserAvatar) {
    if (state.status !== 'idle') return;
    const socket = getSocket();
    if (!socket) return;

    const issues = checkWebRTCSupport();
    if (issues.length) {
      ElMessage.error('无法发起通话: ' + issues.join('；'));
      return;
    }

    state.status = 'calling';
    state.peerId = targetUserId;
    state.peerName = targetUserName;
    state.peerAvatar = targetUserAvatar || '';

    primeRemoteAudio();
    socket.emit('call:initiate', { targetUserId });
  }

  /** Callee: accept the incoming call */
  function acceptCall() {
    if (state.status !== 'incoming') return;
    const socket = getSocket();
    if (!socket) return;

    state.status = 'connecting';
    primeRemoteAudio();
    socket.emit('call:accept', { callerId: state.peerId });
  }

  /** Callee: reject the incoming call */
  function rejectCall() {
    if (state.status !== 'incoming') return;
    const socket = getSocket();
    if (socket) {
      socket.emit('call:reject', { callerId: state.peerId });
    }
    cleanup();
  }

  /** Toggle mute */
  function toggleMute() {
    state.muted = !state.muted;
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = !state.muted;
      });
    }
  }

  /** Format duration as mm:ss */
  const formattedDuration = computed(() => {
    const m = Math.floor(state.duration / 60).toString().padStart(2, '0');
    const s = (state.duration % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  // ---- Socket event handlers (call once on mount) ----

  function registerSocketEvents() {
    const socket = getSocket();
    if (!socket) return;

    // Incoming call
    socket.on('call:incoming', ({ callerId, callerName, callerAvatar }) => {
      console.log('[VoiceCall] Incoming call from', callerName);
      if (state.status !== 'idle') {
        // Already in a call — auto-reject
        socket.emit('call:reject', { callerId });
        return;
      }
      state.status = 'incoming';
      state.peerId = callerId;
      state.peerName = callerName;
      state.peerAvatar = callerAvatar || '';
    });

    // Call accepted — caller creates offer
    socket.on('call:accepted', async () => {
      console.log('[VoiceCall] Call accepted, creating offer...');
      state.status = 'connecting';
      try {
        const stream = await getLocalAudioStream();
        peerConnection = createPeerConnection();
        stream.getTracks().forEach((t) => peerConnection.addTrack(t, stream));

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        console.log('[VoiceCall] Offer created, sending...');
        socket.emit('call:offer', {
          targetUserId: state.peerId,
          offer: peerConnection.localDescription,
        });
      } catch (err) {
        console.error('[VoiceCall] Failed to create offer:', err);
        ElMessage.error('通话失败: ' + err.message);
        endCall();
      }
    });

    // Call rejected
    socket.on('call:rejected', () => {
      console.log('[VoiceCall] Call rejected');
      ElMessage.info('对方已拒绝通话');
      cleanup();
    });

    // Receive offer (callee side)
    socket.on('call:offer', async ({ callerId, offer }) => {
      console.log('[VoiceCall] Received offer from', callerId);
      try {
        const stream = await getLocalAudioStream();
        peerConnection = createPeerConnection();
        stream.getTracks().forEach((t) => peerConnection.addTrack(t, stream));

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        await flushPendingCandidates();
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log('[VoiceCall] Answer created, sending...');
        socket.emit('call:answer', {
          targetUserId: callerId,
          answer: peerConnection.localDescription,
        });

        state.status = 'connected';
        startDurationTimer();
      } catch (err) {
        console.error('[VoiceCall] Failed to handle offer:', err);
        ElMessage.error('通话连接失败: ' + err.message);
        endCall();
      }
    });

    // Receive answer (caller side)
    socket.on('call:answer', async ({ answer }) => {
      console.log('[VoiceCall] Received answer');
      try {
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          await flushPendingCandidates();
          state.status = 'connected';
          startDurationTimer();
          console.log('[VoiceCall] Connected!');
        }
      } catch (err) {
        console.error('[VoiceCall] Failed to handle answer:', err);
        ElMessage.error('通话连接失败: ' + err.message);
        endCall();
      }
    });

    // ICE candidate
    socket.on('call:ice-candidate', async ({ candidate }) => {
      if (!candidate) return;
      // Buffer candidates that arrive before peerConnection / remoteDescription
      // is ready — critical on mobile where mic-permission prompt delays PC setup
      if (!peerConnection || !peerConnection.remoteDescription) {
        pendingCandidates.push(candidate);
        return;
      }
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('[VoiceCall] Failed to add ICE candidate:', err);
      }
    });

    // Remote side ended the call
    socket.on('call:ended', () => {
      console.log('[VoiceCall] Remote side ended call');
      ElMessage.info('对方已挂断');
      cleanup();
    });

    // Error from server
    socket.on('call:error', ({ message }) => {
      console.error('[VoiceCall] Server error:', message);
      ElMessage.error(message);
      cleanup();
    });
  }

  function unregisterSocketEvents() {
    const socket = getSocket();
    if (!socket) return;
    socket.off('call:incoming');
    socket.off('call:accepted');
    socket.off('call:rejected');
    socket.off('call:offer');
    socket.off('call:answer');
    socket.off('call:ice-candidate');
    socket.off('call:ended');
    socket.off('call:error');
  }

  return {
    state,
    formattedDuration,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    registerSocketEvents,
    unregisterSocketEvents,
  };
}
