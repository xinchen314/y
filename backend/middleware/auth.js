const jwt = require('jsonwebtoken');
const { db } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// 生成 JWT Token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 验证 Token 中间件
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录或登录已过期' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, username, email, phone, provider, avatar, created_at FROM users WHERE id = ?').get(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token 无效或已过期' });
  }
}

// 管理员验证中间件
function adminMiddleware(req, res, next) {
  const adminPwd = process.env.ADMIN_PASSWORD || '3.141592653589793238462643383279501';
  
  // 从 Header 或 Body 获取管理员密码
  const pwd = req.headers['x-admin-password'] || req.body?.adminPassword;
  
  if (pwd === adminPwd) {
    req.isAdmin = true;
    return next();
  }
  
  // 也支持 Token 中包含 isAdmin
  if (req.user && req.user.is_admin) {
    req.isAdmin = true;
    return next();
  }
  
  return res.status(403).json({ error: '管理员密码错误' });
}

module.exports = { generateToken, authMiddleware, adminMiddleware };
