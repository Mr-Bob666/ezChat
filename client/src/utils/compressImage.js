/**
 * Client-side image compression using Canvas API.
 *
 * Strategy:
 * 1. Keep the original resolution as much as possible.
 * 2. Binary-search for the highest JPEG/WebP quality that fits the size limit.
 * 3. Only shrink dimensions as a last resort, and do it gradually (10% steps).
 */

const MAX_DIMENSION = 4096;          // px — max width or height after resize
const MAX_FILE_SIZE = 9 * 1024 * 1024; // 9 MB — headroom under the 10 MB server limit
const MIN_QUALITY = 0.3;
const DIMENSION_STEP = 0.9;          // shrink 10% each round

// Check WebP support once
let webpSupported = null;
async function supportsWebP() {
  if (webpSupported != null) return webpSupported;
  try {
    const blob = await canvasToBlob(
      Object.assign(document.createElement('canvas'), { width: 1, height: 1 }),
      'image/webp', 0.5,
    );
    webpSupported = blob != null && blob.type === 'image/webp';
  } catch {
    webpSupported = false;
  }
  return webpSupported;
}

/**
 * Compress an image File/Blob so that it can be uploaded.
 * Returns a new File that is always ≤ MAX_FILE_SIZE.
 */
export async function compressImage(file, { maxSize = MAX_FILE_SIZE, maxDimension = MAX_DIMENSION } = {}) {
  if (!file.type.startsWith('image/')) {
    throw new Error('仅支持图片文件');
  }

  // GIF — don't re-encode (would lose animation)
  if (file.type === 'image/gif') {
    if (file.size <= maxSize) return file;
    throw new Error('GIF 图片过大，请选择更小的文件');
  }

  const bitmap = await loadImage(file);
  const useWebP = await supportsWebP();
  const outputType = useWebP ? 'image/webp' : 'image/jpeg';
  const ext = useWebP ? '.webp' : '.jpg';

  // Step 1: try original dimensions, binary-search for best quality
  let { width, height } = fitDimensions(bitmap.width, bitmap.height, maxDimension);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';

  const result = await tryAtScale(canvas, ctx, bitmap, width, height, outputType, maxSize);
  if (result) return blobToFile(result, stripExt(file.name) + ext, outputType);

  // Step 2: gradually shrink dimensions, binary-search quality at each step
  let scale = DIMENSION_STEP;
  while (scale >= 0.2) {
    const w = Math.max(100, Math.round(bitmap.width * scale));
    const h = Math.max(100, Math.round(bitmap.height * scale));
    const shrunk = await tryAtScale(canvas, ctx, bitmap, w, h, outputType, maxSize);
    if (shrunk) return blobToFile(shrunk, stripExt(file.name) + ext, outputType);
    scale *= DIMENSION_STEP;
  }

  // Step 3: absolute minimum — 100px on the long side
  const minW = Math.max(100, Math.min(bitmap.width, 100));
  const minH = Math.max(100, Math.min(bitmap.height, 100));
  canvas.width = minW;
  canvas.height = minH;
  ctx.drawImage(bitmap, 0, 0, minW, minH);
  const blob = await canvasToBlob(canvas, outputType, MIN_QUALITY);
  return blobToFile(blob, stripExt(file.name) + ext, outputType);
}

// ─── Binary search for quality at a given canvas size ──────

async function tryAtScale(canvas, ctx, bitmap, width, height, outputType, maxSize) {
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(bitmap, 0, 0, width, height);

  // Quick check: does max quality already fit?
  const maxQ = await canvasToBlob(canvas, outputType, 0.95);
  if (maxQ && maxQ.size <= maxSize) return maxQ;

  // Binary search between MIN_QUALITY and 0.95
  let lo = MIN_QUALITY;
  let hi = 0.95;
  let best = null;

  for (let i = 0; i < 6; i++) {  // ~6 iterations ≈ precision of ~1%
    const mid = (lo + hi) / 2;
    const blob = await canvasToBlob(canvas, outputType, mid);
    if (blob && blob.size <= maxSize) {
      best = blob;
      lo = mid;   // try higher quality
    } else {
      hi = mid;   // try lower quality
    }
  }
  return best;
}

// ─── helpers ────────────────────────────────────────────

function fitDimensions(w, h, maxDim) {
  if (w <= maxDim && h <= maxDim) return { width: w, height: h };
  const ratio = Math.min(maxDim / w, maxDim / h);
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(img.src); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error('图片加载失败')); };
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function blobToFile(blob, name, type) {
  return new File([blob], name, { type, lastModified: Date.now() });
}

function stripExt(name) {
  return name.replace(/\.[^.]+$/, '');
}
