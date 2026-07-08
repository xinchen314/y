require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// -------- 中间件 --------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------- 静态文件：前端网站 --------
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// -------- API 路由 --------
const { isReady } = require('./database');
const authRoutes = require('./routes/auth');
const banRoutes = require('./routes/bans');

// 数据库健康检查中间件
app.use('/api', (req, res, next) => {
  if (!isReady() && !req.path.startsWith('/health')) {
    return res.status(503).json({ error: '数据库正在初始化或不可用，请稍后再试' });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/bans', banRoutes);


app.get('/api/health', (req, res) => {
  try {
    const count = require('./database').get('SELECT COUNT(*) as count FROM users');
    res.json({ status: 'ok', users: count?.count || 0, uptime: process.uptime() });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// -------- 其他所有路由返回前端页面 --------
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// -------- 启动 --------
async function start() {
  try {
    await initDatabase();
    console.log('[DB] 数据库初始化成功');
  } catch (err) {
    console.error('[DB] 数据库初始化失败（网站仍可访问，但 API 功能不可用）:', err.message);
    // 不退出进程，让静态网站仍可访问
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('═══════════════════════════════════');
    console.log('  CraftVerse 服务器已启动！');
    console.log(`  🌐 网站: http://0.0.0.0:${PORT}`);
    console.log(`  📡 API: http://0.0.0.0:${PORT}/api`);
    console.log('═══════════════════════════════════');
  });
}

start().catch(err => {
  console.error('❌ 启动失败:', err.message);
  console.error('完整错误:', err.stack);

  // 即使启动失败，也尝试启动 HTTP 服务器（仅提供静态页面）
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ 降级模式: 仅提供静态页面 (端口 ${PORT})`);
    });
  } catch (fatalErr) {
    console.error('❌ 致命错误，无法启动服务器:', fatalErr.message);
    process.exit(1);
  }
});
