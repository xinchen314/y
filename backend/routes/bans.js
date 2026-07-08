const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const { adminMiddleware } = require('../middleware/auth');

// 获取封禁列表
router.get('/', (req, res) => {
  const bans = all('SELECT * FROM bans ORDER BY created_at DESC');
  res.json({ bans });
});

// 添加封禁
router.post('/', adminMiddleware, (req, res) => {
  const { player, reason } = req.body;
  if (!player || !reason) return res.status(400).json({ error: '请填写玩家名和封禁原因' });
  const result = run('INSERT INTO bans (player, reason, banned_by, status) VALUES (?, ?, ?, ?)', [player, reason, req.body.bannedBy || '管理员', '封禁中']);
  const ban = get('SELECT * FROM bans WHERE id = ?', [result.lastInsertRowid]);
  res.json({ success: true, message: `已封禁 ${player}`, ban });
});

// 解封
router.patch('/:id/unban', adminMiddleware, (req, res) => {
  const ban = get('SELECT * FROM bans WHERE id = ?', [req.params.id]);
  if (!ban) return res.status(404).json({ error: '封禁记录不存在' });
  run('UPDATE bans SET status = ?, unban_date = datetime("now") WHERE id = ?', ['已解封', req.params.id]);
  const updated = get('SELECT * FROM bans WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: `已解封 ${ban.player}`, ban: updated });
});

// 删除封禁
router.delete('/:id', adminMiddleware, (req, res) => {
  const ban = get('SELECT * FROM bans WHERE id = ?', [req.params.id]);
  if (!ban) return res.status(404).json({ error: '封禁记录不存在' });
  run('DELETE FROM bans WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: `已删除 ${ban.player} 的封禁记录` });
});

// 统计
router.get('/stats', (req, res) => {
  const totalUsers = get('SELECT COUNT(*) as count FROM users');
  const totalBans = get('SELECT COUNT(*) as count FROM bans');
  const activeBans = get("SELECT COUNT(*) as count FROM bans WHERE status = '封禁中'");
  res.json({ stats: { totalUsers: totalUsers?.count || 0, totalBans: totalBans?.count || 0, activeBans: activeBans?.count || 0 } });
});

module.exports = router;
