// ============================================================
// CraftVerse MC 服务器官网 - 全局配置文件
// ★ 你可以自由编辑以下所有内容 ★
// ============================================================

const CONFIG = {
  // -------- 服务器基础信息 --------
  server: {
    name: '§ 永恒森林',             // 服务器名称（显示在标题/页眉）
    ip: 'pm.rainplay.cn',          // 向后兼容：第一个地址
    addresses: [                    // 多地址列表
      { label: 'Java 版', address: 'pm.rainplay.cn:54160' },
    ],
    version: '1.21.1',              // Minecraft 版本
    tagline: '粘液科技 · 自动化 · 能源核心 — 在传送带与反应堆之间书写你的工业史诗',
    description: '基于 Slimefun 的工业科技生存服务器 · 1.21.1 Paper · pm.rainplay.cn:54160',
    playerOnline: 500,              // 当前在线人数（按 MOTD 显示）
    totalPlayers: 50,               // 累计注册玩家
    uptimeRate: '90%+',             // 在线率
    stableDays: 365,                // 稳定运行天数
  },

  // -------- 管理员密码保护 --------
  // 所有后台操作、API 修改封禁列表均需此密码
  admin: {
    password: '!a1s2d3f4',
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
  // 基于 MOTD 主题：粘液科技 / 自动化 / 能源核心
  features: [
    {
      icon: '⛏️',
      title: '纯净生存',
      desc: '原版生存作为一切的起点。所有工业发展都从这里一镐一镐挖出来。',
    },
    {
      icon: '🏭',
      title: '粘液科技',
      desc: '完整 Slimefun 科技树，从采矿、冶炼到精炼、加工，材料一步步成型。',
    },
    {
      icon: '⚙️',
      title: '自动化机械',
      desc: '机械臂、自动合成机、加工产线——让机器替你干那些重复的活。',
    },
    {
      icon: '⚡',
      title: '能源核心',
      desc: '搭建能量网络，给你的工业基地装上一颗稳定跳动的心脏。',
    },
    {
      icon: '🔋',
      title: '电力系统',
      desc: '从基础发电机到高级反应堆，多种发电方式自由选择。',
    },
    {
      icon: '🚚',
      title: '传送带物流',
      desc: '用传送带把矿石、锭块、成品从矿区一路运到你的工厂。',
    },
    {
      icon: '💰',
      title: '玩家经济',
      desc: '玩家间自由交易，服务器商店与拍卖行支持。',
    },
    {
      icon: '🏠',
      title: '领地保护',
      desc: '自助领地申请，保护你的工业基地不被误伤或恶意破坏。',
    },
  ],

  // -------- 服务器公告 --------
  announcements: [
    {
      date: '2026.07.10',
      title: '服务器升级至 1.21.1 Paper',
      content: '已升级到 Paper 1.21.1（协议 767），粘液科技与自动化插件同步适配，性能优化中。',
    },
    {
      date: '2026.07.05',
      title: '能源核心系统全面开放',
      content: '发电、能量传输、能源存储全链路打通，反应堆上线。造一座你的能源核心吧。',
    },
    {
      date: '2026.06.28',
      title: '自动化与传送带网络上线',
      content: '机械臂、自动合成机、加工机已开放；传送带可连接任意设备搭出你的产线。',
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

  // -------- 活动倒计时 --------
  // 倒计时到期后自动隐藏；如无活动可置空数组 []
  countdowns: [],

  // -------- 服务器实时状态查询 --------
  // 使用 MCSrvStat 免费 API（无需密钥）
  // 自动查询 Java 版 / 基岩版 在线状态
  serverStatus: {
    enabled: true,            // 开启实时查询
    javaHost: 'pm.rainplay.cn',      // Java 版地址
    javaPort: 54160,         // Java 版端口
    bedrockHost: 'bedrock.rainplay.cn', // 基岩版地址
    bedrockPort: 19132,       // 基岩版端口
    refreshInterval: 60,      // 自动刷新间隔（秒），最小 30
    showPlayerList: true,     // 显示在线玩家列表（头颅）
    maxPlayerHeads: 12,       // 最多显示多少个玩家头颅
  },

  // -------- 假人/Bot 压测服务 --------
  // 连接到 bot-server 后端（Express + mineflayer）
  botServer: {
    enabled: true,
    url: 'http://localhost:3141',   // bot-server API 地址
    password: '!a1s2d3f4',          // 对接后端 bot-server 的鉴权密码（与后台一致）
    maxBotsPerUser: 20,              // 每个用户最大假人数
    autoRefresh: 5000,               // 状态自动刷新间隔（毫秒）
  },

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
    { date: '2026.03', title: '服务器开服', desc: '永恒森林正式上线，Slimefun 粘液科技核心模块同步开启。' },
    { date: '2026.04', title: '经济与领地上线', desc: '玩家间交易系统与自助领地保护功能开放。' },
    { date: '2026.05', title: '传送带与机械', desc: '自动化机械与传送带物流网络进入测试。' },
    { date: '2026.06', title: '能源系统', desc: '电力系统上线，能源核心与反应堆正式可用。' },
    { date: '2026.07', title: '升级 1.21.1', desc: '服务端升级到 Paper 1.21.1，性能与粘液科技适配同步完成。' },
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
      id: 'industry',
      name: '工业科技',
      icon: '🏭',
      desc: '基于 Slimefun 的完整工业体系：采矿、冶炼、加工、自动化、发电、能源网络一应俱全。',
      players: 500,
      rating: 4.9,
    },
    {
      id: 'survival',
      name: '纯净生存',
      icon: '⛏️',
      desc: '原版生存玩法作为一切的起点，所有工业发展都从这里一镐一镐挖出来。',
      players: 500,
      rating: 4.8,
    },
  ],

  // -------- 版本更新日志 --------
  changelog: [
    {
      version: '1.21.1',
      date: '2026-07-10',
      changes: [
        { type: 'changed', text: '升级到 Paper 1.21.1，协议版本 767' },
        { type: 'added', text: '粘液科技插件适配 1.21.1' },
        { type: 'changed', text: '优化工业基地区块加载性能' },
        { type: 'fixed', text: '修复传送带偶发断连问题' },
      ],
    },
    {
      version: '1.21.0',
      date: '2026-07-05',
      changes: [
        { type: 'added', text: '能源核心系统全面开放（发电/传输/存储）' },
        { type: 'added', text: '上线高级反应堆配方' },
        { type: 'changed', text: '平衡发电机能量产出曲线' },
      ],
    },
    {
      version: '1.20.5',
      date: '2026-06-28',
      changes: [
        { type: 'added', text: '自动化机械全面上线（机械臂、自动合成机）' },
        { type: 'added', text: '传送带物流网络（多级速度）' },
        { type: 'added', text: '电力系统基础发电机与电缆' },
        { type: 'removed', text: '移除部分低利用率粘液物品' },
      ],
    },
    {
      version: '1.0.0',
      date: '2026-03-01',
      changes: [
        { type: 'added', text: '永恒森林正式开服' },
        { type: 'added', text: '初始生存世界开放' },
        { type: 'added', text: '基础经济与领地系统上线' },
        { type: 'added', text: 'Slimefun 粘液科技核心模块安装' },
      ],
    },
  ],
};

// 导出配置（根据环境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
