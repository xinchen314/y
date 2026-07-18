// ============================================================
// CraftVerse MC 假人/压测服务
// Express + mineflayer
// 用法: node bot-server.js
// ============================================================

const express = require('express');
const cors = require('cors');
const mineflayer = require('mineflayer');
const crypto = require('crypto');
const path = require('path');

// ---- 配置 ----
const CONFIG = {
  port: 3141,                    // API 服务端口
  apiPassword: '!a1s2d3f4',       // API 访问密码
  mc: {
    host: 'pm.rainplay.cn',   // MC 服务器地址
    port: 54160,                 // MC 服务器端口
    version: '1.21.1',           // MC 版本（与服务器实际版本一致，握手必需）
    auth: 'offline',              // 离线模式（ cracked 服务器）
  },
  bot: {
    regPassword: 'dd314159',     // 注册密码
    loginPassword: 'dd314159',   // 登录密码
    spawnDelay: 5000,            // 进入后等待毫秒数再执行命令
    maxBotsPerUser: 20,           // 每个用户最大假人数
  },
};

// ---- 全局状态 ----
// bots[botId] = { id, username, ownerUser, status, bot, startTime, lastAction }
const bots = {};

// ---- 随机用户名生成 ----
function randomUsername() {
  const adjectives = ['Cool', 'Epic', 'Pro', 'Swift', 'Brave', 'Mighty', 'Shadow', 'Crystal', 'Frost', 'Blaze', 'Storm', 'Mystic', 'Nova', 'Zen', 'Apex'];
  const nouns = ['Miner', 'Builder', 'Hunter', 'Knight', 'Wizard', 'Ninja', 'Dragon', 'Wolf', 'Tiger', 'Phoenix', 'Hunter', 'Scout', 'Guard', 'Ranger', 'Knight'];
  const num = Math.floor(Math.random() * 999);
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  // MC 用户名限制: 3-16 字符, 仅字母数字下划线
  let name = adj + noun + num;
  if (name.length > 16) name = name.substring(0, 16);
  return name;
}

// ---- 创建单个假人 ----
function createBot(ownerUser, customName) {
  const username = customName || randomUsername();
  const botId = 'bot_' + crypto.randomBytes(4).toString('hex');

  const bot = mineflayer.createBot({
    host: CONFIG.mc.host,
    port: CONFIG.mc.port,
    username: username,
    version: CONFIG.mc.version,
    auth: CONFIG.mc.auth,
    hideErrors: false,
  });

  const botInfo = {
    id: botId,
    username: username,
    ownerUser: ownerUser,
    status: 'connecting',
    bot: bot,
    startTime: Date.now(),
    lastAction: '正在连接服务器...',
    regDone: false,
    loginDone: false,
  };

  bots[botId] = botInfo;

  // ---- 事件处理 ----
  bot.on('login', () => {
    botInfo.status = 'online';
    botInfo.lastAction = '已进入服务器';
    console.log('[Bot] ' + username + ' 已进入服务器');
  });

  bot.on('spawn', () => {
    botInfo.status = 'online';
    botInfo.lastAction = '已生成，等待 5 秒后注册...';
    console.log('[Bot] ' + username + ' 生成完毕，5 秒后执行注册/登录');

    setTimeout(() => {
      if (botInfo.status === 'offline' || !bot.entity) return;
      // 先注册
      bot.chat('/reg ' + CONFIG.bot.regPassword + ' ' + CONFIG.bot.regPassword);
      botInfo.lastAction = '已发送 /reg';
      botInfo.regDone = true;
      console.log('[Bot] ' + username + ' 已发送 /reg');

      // 短暂等待后登录
      setTimeout(() => {
        if (botInfo.status === 'offline' || !bot.entity) return;
        bot.chat('/l ' + CONFIG.bot.loginPassword);
        botInfo.lastAction = '已发送 /l';
        botInfo.loginDone = true;
        botInfo.status = 'active';
        console.log('[Bot] ' + username + ' 已发送 /l，假人激活');
      }, 1000);
    }, CONFIG.bot.spawnDelay);
  });

  bot.on('kicked', (reason) => {
    botInfo.status = 'kicked';
    botInfo.lastAction = '被踢出: ' + (typeof reason === 'string' ? reason : JSON.stringify(reason));
    console.log('[Bot] ' + username + ' 被踢出: ' + reason);
    // 5 秒后从列表移除
    setTimeout(() => { if (bots[botId]) delete bots[botId]; }, 5000);
  });

  bot.on('error', (err) => {
    botInfo.status = 'error';
    botInfo.lastAction = '错误: ' + err.message;
    console.error('[Bot] ' + username + ' 错误:', err.message);
  });

  bot.on('end', () => {
    botInfo.status = 'offline';
    botInfo.lastAction = '已断开连接';
    console.log('[Bot] ' + username + ' 已断开');
    setTimeout(() => { if (bots[botId]) delete bots[botId]; }, 3000);
  });

  return botInfo;
}

// ---- 停止假人 ----
function stopBot(botId) {
  const info = bots[botId];
  if (!info) return false;
  try {
    info.bot.quit('Bye');
  } catch (e) {}
  info.status = 'offline';
  delete bots[botId];
  return true;
}

// ---- Express 服务 ----
const app = express();
app.use(cors());
app.use(express.json());

// 鉴权中间件
function authMiddleware(req, res, next) {
  const password = req.headers['x-bot-password'] || req.body.password || req.query.password;
  if (password !== CONFIG.apiPassword) {
    return res.status(401).json({ error: '密码错误' });
  }
  next();
}

// 健康检查（无需密码）
app.get('/api/health', (req, res) => {
  const activeBots = Object.values(bots).filter(b => b.status === 'active' || b.status === 'online');
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    totalBots: Object.keys(bots).length,
    activeBots: activeBots.length,
    mcServer: CONFIG.mc.host + ':' + CONFIG.mc.port,
  });
});

// 启动假人
app.post('/api/bots/start', authMiddleware, (req, res) => {
  const { username, count, customNames } = req.body;
  if (!username) return res.status(400).json({ error: '缺少用户名' });

  // 检查该用户的假人数量
  const userBots = Object.values(bots).filter(b => b.ownerUser === username);
  if (userBots.length >= CONFIG.bot.maxBotsPerUser) {
    return res.status(429).json({ error: '已达到最大假人数限制 (' + CONFIG.bot.maxBotsPerUser + ')' });
  }

  const num = Math.min(parseInt(count) || 1, CONFIG.bot.maxBotsPerUser - userBots.length);
  const results = [];

  for (let i = 0; i < num; i++) {
    const customName = (customNames && customNames[i]) ? customNames[i] : null;
    const info = createBot(username, customName);
    results.push({
      id: info.id,
      username: info.username,
      status: info.status,
    });
  }

  res.json({
    success: true,
    message: '已启动 ' + results.length + ' 个假人',
    bots: results,
  });
});

// 停止假人
app.post('/api/bots/stop', authMiddleware, (req, res) => {
  const { username, botId } = req.body;
  if (!username) return res.status(400).json({ error: '缺少用户名' });

  if (botId && botId !== 'all') {
    // 停止指定假人
    const info = bots[botId];
    if (!info || info.ownerUser !== username) {
      return res.status(404).json({ error: '未找到该假人或无权操作' });
    }
    stopBot(botId);
    return res.json({ success: true, message: '已停止假人 ' + info.username });
  } else {
    // 停止该用户所有假人
    const userBotIds = Object.values(bots)
      .filter(b => b.ownerUser === username)
      .map(b => b.id);
    userBotIds.forEach(id => stopBot(id));
    return res.json({ success: true, message: '已停止 ' + userBotIds.length + ' 个假人', stopped: userBotIds.length });
  }
});

// 查询假人状态
app.get('/api/bots/status', authMiddleware, (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: '缺少用户名' });

  const userBots = Object.values(bots)
    .filter(b => b.ownerUser === username)
    .map(b => ({
      id: b.id,
      username: b.username,
      status: b.status,
      lastAction: b.lastAction,
      regDone: b.regDone,
      loginDone: b.loginDone,
      uptime: Math.floor((Date.now() - b.startTime) / 1000),
    }));

  res.json({
    total: userBots.length,
    active: userBots.filter(b => b.status === 'active').length,
    bots: userBots,
  });
});

// ---- 启动服务 ----
app.listen(CONFIG.port, () => {
  console.log('============================================');
  console.log('  CraftVerse MC 假人服务已启动');
  console.log('  端口: ' + CONFIG.port);
  console.log('  MC 服务器: ' + CONFIG.mc.host + ':' + CONFIG.mc.port);
  console.log('  版本: ' + CONFIG.mc.version);
  console.log('  密码: ' + CONFIG.apiPassword);
  console.log('  最大假人/用户: ' + CONFIG.bot.maxBotsPerUser);
  console.log('============================================');
  console.log('');
  console.log('API 列表:');
  console.log('  GET  /api/health          健康检查');
  console.log('  POST /api/bots/start      启动假人');
  console.log('  POST /api/bots/stop       停止假人');
  console.log('  GET  /api/bots/status     查询状态');
  console.log('');
});
