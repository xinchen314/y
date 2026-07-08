const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  
  if (!SMTP_USER || SMTP_USER === 'your_email@qq.com') {
    return null;
  }
  
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT) || 465,
    secure: parseInt(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  
  return transporter;
}

async function sendVerifyCode(email, code) {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Email] SMTP not configured. Would send code ${code} to ${email}`);
    return { success: true, simulated: true };
  }
  
  try {
    await transport.sendMail({
      from: `"CraftVerse" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'CraftVerse 邮箱验证码',
      html: `
        <div style="background:#0A0E1A;padding:40px;font-family:'Inter',sans-serif;">
          <div style="max-width:480px;margin:0 auto;background:#1A1F35;border-radius:16px;padding:32px;border:1px solid rgba(68,179,122,0.2);">
            <h1 style="color:#44B37A;font-size:20px;margin:0 0 16px;">CraftVerse</h1>
            <p style="color:#8892B0;font-size:14px;line-height:1.6;">你的邮箱验证码为：</p>
            <div style="background:#131726;border-radius:8px;padding:16px;text-align:center;margin:16px 0;">
              <span style="font-family:'VT323',monospace;font-size:36px;color:#44B37A;letter-spacing:8px;">${code}</span>
            </div>
            <p style="color:#8892B0;font-size:13px;">验证码有效期为 10 分钟，请勿泄露给他人。</p>
            <p style="color:#5a5f7a;font-size:12px;margin-top:16px;">CraftVerse MC 服务器 · play.craftverse.cn</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Code sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendVerifyCode, getTransporter };
