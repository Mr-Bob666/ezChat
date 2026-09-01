const store = new Map();

const CODE_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function remainingCooldown(email) {
  const entry = store.get(email);
  if (!entry) return 0;
  const elapsed = Date.now() - entry.lastSentAt;
  return Math.max(0, Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000));
}

export function saveCode(email, code, type) {
  store.set(email, {
    code,
    type,
    expiresAt: Date.now() + CODE_TTL_MS,
    lastSentAt: Date.now(),
  });
}

export function verifyCode(email, code, type) {
  const entry = store.get(email);
  if (!entry) return false;
  if (entry.type !== type) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(email);
    return false;
  }
  return entry.code === String(code);
}

export function consumeCode(email) {
  store.delete(email);
}

setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of store) {
    if (now > entry.expiresAt + RESEND_COOLDOWN_MS) store.delete(email);
  }
}, 60_000).unref();
