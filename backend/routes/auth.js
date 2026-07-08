const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { run, get, all, createVerifyCode, verifyCode, findOrCreateUser } = require('../database');
const { sendVerifyCode } = require('../email');
const { generateToken, authMiddleware } = require('../middleware/auth');

// -------- 发送验证码 --------
router.post('/send-code', async (req, res) => {
  const { email, phone, type = 'email' } = req.body;
  
  if (type === 'email' && !email) return res.status(400).json({ error: '请输入邮箱地址' });
  if (type === 'phone' && !phone) return res.status(400).json({ error: '请输入手机号' });
  
  const target = type === 'email' ? email : phone;
  const code = createVerifyCode(target, type);
  
  if (type === 'email') {
    const result = await sendVerifyCode(email, code);
    if (!result.success && !result.simulated) {
      return res.status(500).json({ error: '验证码发送失败: ' + result.error });
    }
  }
  
  const isSimulated = type === 'email' && (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@qq.com');
  res.json({ success: true, message: '验证码已发送', ...(isSimulated ? { debugCode: code } : {}) });
});

// -------- 邮箱注册 --------
router.post('/register', async (req, res) => {
  const { username, email, code, password } = req.body;
  if (!username || !email || !code || !password) return res.status(400).json({ error: '请填写所有必填字段' });
  if (!email.endsWith('@qq.com')) return res.status(400).json({ error: '请使用 QQ 邮箱注册' });
  if (password.length < 6) return res.status(400).json({ error: '密码至少 6 个字符' });
  if (!verifyCode(email, code, 'email')) return res.status(400).json({ error: '验证码错误或已过期' });
  
  const existing = get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return res.status(400).json({ error: '该邮箱已被注册' });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  run('INSERT INTO users (username, email, password, provider) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, 'email']);
  const user = get('SELECT id, username, email, provider, created_at FROM users WHERE email = ?', [email]);
  if (!user) return res.status(500).json({ error: '用户创建失败' });
  const token = generateToken(user);
  
  res.json({ success: true, message: '注册成功', user, token });
});

// -------- 邮箱登录 --------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: '请输入邮箱和密码' });
  
  const user = get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(400).json({ error: '邮箱未注册' });
  if (!user.password) return res.status(400).json({ error: '该账号使用第三方登录，请选择对应方式登录' });
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: '密码错误' });
  
  const token = generateToken(user);
  res.json({ success: true, message: '登录成功', user: { id: user.id, username: user.username, email: user.email, provider: 'email' }, token });
});

// -------- 手机号登录 --------
router.post('/phone-login', (req, res) => {
  const { phone, code, areaCode = '86' } = req.body;
  if (!phone || !code) return res.status(400).json({ error: '请输入手机号和验证码' });
  if (!verifyCode(phone, code, 'phone')) return res.status(400).json({ error: '验证码错误或已过期' });
  
  const fullPhone = `+${areaCode} ${phone}`;
  const username = `玩家${phone.slice(-4)}`;
  const user = findOrCreateUser({ username, phone: fullPhone, provider: 'phone' });
  const token = generateToken(user);
  
  res.json({ success: true, message: '登录成功', user: { id: user.id, username: user.username, phone: user.phone, provider: 'phone' }, token });
});

// -------- Microsoft OAuth --------
router.get('/oauth/microsoft', (req, res) => {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  if (!clientId) return res.status(501).json({ error: 'Microsoft OAuth 未配置（需在 .env 中填写 MICROSOFT_CLIENT_ID）' });
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/microsoft/callback';
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=XboxLive.signin%20offline_access&response_mode=query`;
  res.json({ url: authUrl });
});

// -------- QQ OAuth --------
router.get('/oauth/qq', (req, res) => {
  const appId = process.env.QQ_APP_ID;
  if (!appId) return res.status(501).json({ error: 'QQ OAuth 未配置（需在 .env 中填写 QQ_APP_ID）' });
  const redirectUri = process.env.QQ_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/qq/callback';
  const authUrl = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=get_user_info`;
  res.json({ url: authUrl });
});

// -------- 获取当前用户 --------
router.get('/me', authMiddleware, (req, res) => { res.json({ user: req.user }); });

// -------- 登出 --------
router.post('/logout', (req, res) => { res.json({ success: true, message: '已退出登录' }); });

module.exports = router;
