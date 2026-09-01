import nodemailer from 'nodemailer';
import config from '../config/index.js';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!config.mail.user || !config.mail.pass) {
      throw new Error('邮件服务未配置 (MAIL_USER / MAIL_PASS)');
    }
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      auth: { user: config.mail.user, pass: config.mail.pass },
    });
  }
  return transporter;
}

export async function sendVerificationCode(email, code, type) {
  const subject = type === 'reset' ? 'ezChat 找回密码验证码' : 'ezChat 注册验证码';
  const html = `
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border:1px solid #eee;border-radius:8px">
      <h2 style="margin:0 0 16px;color:#303133">${subject}</h2>
      <p style="color:#606266">您的验证码为：</p>
      <p style="font-size:36px;letter-spacing:10px;font-weight:700;color:#2b7de9;text-align:center;margin:24px 0">${code}</p>
      <p style="color:#909399;font-size:13px">验证码 5 分钟内有效。如非本人操作，请忽略此邮件。</p>
    </div>
  `;
  await getTransporter().sendMail({
    from: `"ezChat" <${config.mail.from}>`,
    to: email,
    subject,
    html,
  });
}
