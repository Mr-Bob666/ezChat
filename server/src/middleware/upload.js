import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '../../uploads/avatars');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}_${Date.now()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = /\.(jpe?g|png|gif|webp)$/i;
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('仅支持 jpg/png/gif/webp 格式的图片'));
  }
}

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Message image upload
const messageImageDir = path.resolve(__dirname, '../../uploads/messages');

if (!fs.existsSync(messageImageDir)) {
  fs.mkdirSync(messageImageDir, { recursive: true });
}

const messageImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, messageImageDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}_${Date.now()}${ext}`);
  },
});

export const uploadMessageImage = multer({
  storage: messageImageStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
