// ============================================================
// CraftVerse MC 服务器官网 - 全局配置文件
// ★ 你可以自由编辑以下所有内容 ★
// ============================================================

const CONFIG = {
  // -------- 服务器基础信息 --------
  server: {
    name: '§ CRAFTVERSE',           // 服务器名称（显示在标题/页眉）
    ip: 'play.craftverse.cn',       // 向后兼容：第一个地址
    addresses: [                    // 多地址列表
      { label: 'Java 版', address: 'play.craftverse.cn' },
      { label: '基岩版', address: 'bedrock.craftverse.cn' },
      { label: '备用地址', address: 'backup.craftverse.cn' },
    ],
    version: '1.21',                // Minecraft 版本
    tagline: '一个全新的 Minecraft 生存体验服务器',
    description: '纯净生存 + 特色模组 · 1.21 版本 · 长期稳定运营',
    playerOnline: 128,              // 当前在线人数（可实时更新）
    totalPlayers: 1284,             // 累计注册玩家
    uptimeRate: '99.9%',            // 在线率
    stableDays: 365,                // 稳定运行天数
  },

  // -------- 管理员密码保护 --------
  // 所有后台操作、API 修改封禁列表均需此密码
  admin: {
    password: '3.141592653589793238462643383279501',
  },

  // -------- QQ 邮箱登录配置 --------
  // 用于发送注册验证码/登录验证
  email: {
    smtp: {
      host: 'smtp.qq.com',          // QQ邮箱SMTP服务器
      port: 465,                    // SSL端口
      user: 'your_email@qq.com',    // ← 替换为你的QQ邮箱
      pass: 'your_smtp_key',        // ← 替换为SMTP授权码（在QQ邮箱设置-账户-生成）
    },
    verifyCodeExpire: 300,          // 验证码有效期（秒）
  },

  // -------- 封禁列表 API 配置 --------
  // 可通过 API 远程管理封禁列表
  banApi: {
    enabled: true,
    // 本地模式：使用 localStorage（无需后端，开箱即用）
    // 远程模式：配置下方 endpoint 后切换
    mode: 'local',                  // 'local' | 'remote'
    endpoint: 'https://your-api.com/api/bans',  // 远程 API 地址
    apiKey: 'your_api_key_here',    // ← 远程 API 鉴权密钥
  },

  // -------- 导航菜单 --------
  nav: [
    { label: '首页', id: 'hero' },
    { label: '特色', id: 'features' },
    { label: '公告', id: 'announcements' },
    { label: '数据', id: 'stats' },
    { label: '图库', id: 'gallery' },
    { label: '规则', id: 'rules' },
    { label: '团队', id: 'team' },
  ],

  // -------- 服务器特色 --------
  features: [
    {
      icon: '⛏️',
      title: '纯净生存',
      desc: '原版生存体验，保留 Minecraft 最纯粹的游戏乐趣。定期更新最新版本内容。',
    },
    {
      icon: '🏰',
      title: '冒险副本',
      desc: '专属设计的冒险副本系统，组队挑战强大 BOSS，获取稀有装备和材料。',
    },
    {
      icon: '🎮',
      title: '特色小游戏',
      desc: '空岛战争、饥饿游戏、跑酷等多种小游戏，随时切换放松心情。',
    },
    {
      icon: '🛡️',
      title: '反作弊系统',
      desc: '强大的反作弊保护，公平竞技环境，24 小时自动监测异常行为。',
    },
  ],

  // -------- 服务器公告 --------
  announcements: [
    {
      date: '2026.07.01',
      title: '服务器 1.21 版本升级完成',
      content: 'CraftVerse 已正式升级至 Minecraft 1.21 版本，新增试炼密室、微风人等新内容。',
    },
    {
      date: '2026.06.28',
      title: '暑期建筑大赛开启',
      content: '即日起至 7 月 31 日，参与建筑大赛赢取专属称号与游戏内奖励。',
    },
    {
      date: '2026.06.25',
      title: '新副本「远古遗迹」上线',
      content: '挑战全新团队副本，获取传说级装备与稀有材料。已有多支队伍通关。',
    },
  ],

  // -------- 管理团队 --------
  team: [
    { name: 'CraftMaster',  role: '服主 / 总管理', avatar: '' },
    { name: 'BuildWizard',  role: '建筑主管', avatar: '' },
    { name: 'TechNinja',    role: '技术管理', avatar: '' },
    { name: 'GameGuard',   role: '管理员', avatar: '' },
  ],

  // -------- 图库占位 --------
  // 替换为你的实际截图路径
  gallery: [
    { label: '服务器主城', image: 'assets/images/gallery-1.jpg' },
    { label: '建筑作品',  image: 'assets/images/gallery-2.jpg' },
    { label: '活动截图',  image: 'assets/images/gallery-3.jpg' },
    { label: '团队合影',  image: 'assets/images/gallery-4.jpg' },
  ],

  // -------- 服务器规则 --------
  rules: [
    '禁止使用作弊客户端、外挂、X-Ray 等第三方作弊工具',
    '禁止恶意破坏其他玩家建筑、盗窃他人财物',
    '禁止在聊天频道发布广告、辱骂、刷屏等行为',
    '请尊重管理员和其他玩家，共同维护良好游戏环境',
  ],

  // -------- 主题定制 --------
  // 可自由修改网站配色
  theme: {
    bgPrimary: '#0A0E1A',
    bgSecondary: '#131726',
    bgCard: '#1A1F35',
    accentGreen: '#44B37A',
    accentGold: '#FFD700',
    accentRed: '#FF4757',
    textPrimary: '#FFFFFF',
    textSecondary: '#8892B0',
    fontDisplay: "'Press Start 2P', monospace",
    fontBody: "'Inter', -apple-system, sans-serif",
    fontMono: "'VT323', monospace",
  },
  // -------- 服务器发展历程 --------
  timeline: [
    { date: '2026.03', title: '服务器开服', desc: 'CraftVerse 正式上线，首日即迎来 200+ 玩家加入。' },
    { date: '2026.04', title: '首个大型更新', desc: '新增冒险副本系统、经济插件和领地保护功能。' },
    { date: '2026.05', title: '社区突破 500 人', desc: 'QQ 群突破 500 人，举办首次建筑大赛活动。' },
    { date: '2026.06', title: '暑期大版本', desc: '升级 1.21 版本，新增小游戏大厅、全新副本和反作弊系统。' },
  ],

  // -------- 常见问题 FAQ --------
  faq: [
    { q: '服务器是什么版本？', a: '当前为 Minecraft Java Edition 1.21 版本，支持最新试炼密室等内容。' },
    { q: '如何加入服务器？', a: '复制上方服务器地址，打开 Minecraft → 多人游戏 → 添加服务器 → 粘贴地址即可。' },
    { q: '服务器支持基岩版吗？', a: '支持！我们有专门的基岩版入口，地址可在上方找到。' },
    { q: '有付费项目吗？', a: '服务器完全免费游玩。部分装饰性称号和特殊道具可在商城自愿购买。' },
    { q: '遇到违规玩家怎么办？', a: '可以截图留证后在 QQ 群联系管理员，或在网站封禁列表中查看处理结果。' },
  ],

  // -------- 投票站点 --------
  voteSites: [
    { name: 'MCBBS', icon: '🌐', desc: '在 MCBBS 投票支持我们，获得游戏内称号奖励。', url: '#' },
    { name: 'PlanetMC', icon: '⭐', desc: '在 Planet Minecraft 上为我们的服务器点赞。', url: '#' },
    { name: 'MinecraftServers', icon: '🏆', desc: '在 Minecraft Servers 投票并查看排名。', url: '#' },
  ],

  // -------- 游戏模式详情 --------
  gameModes: [
    {
      id: 'survival',
      name: '纯净生存',
      icon: '⛏️',
      desc: '原版生存体验，保留 Minecraft 最纯粹的游戏乐趣。定期更新最新版本内容，纯净无魔改。',
      players: 86,
      rating: 4.9,
    },
    {
      id: 'adventure',
      name: '冒险副本',
      icon: '⚔️',
      desc: '专属设计的冒险副本系统，包含远古遗迹、暗影城堡、冰霜洞穴等多个副本，组队挑战获取稀有装备。',
      players: 42,
      rating: 4.8,
    },
    {
      id: 'minigames',
      name: '休闲小游戏',
      icon: '🎯',
      desc: '空岛战争、饥饿游戏、跑酷、掘一死战等多种小游戏随时切换，放松心情的最佳选择。',
      players: 28,
      rating: 4.7,
    },
  ],
};

// 导出配置（根据环境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
