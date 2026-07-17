// ============================================================
// CraftVerse MC 服务器官网 - 主站交互脚本
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // -------- 初始化 API 连接（不阻塞页面渲染）--------
  API.init().then(available => {
    if (available) console.log('[API] 后端连接成功');
  });

  // -------- 从 SettingsManager 获取配置 --------
  function getCfg(path) { return SettingsManager.get(path); }

  // -------- 渲染多地址 + 复制 --------
  function renderAddresses() {
    const container = document.getElementById('heroAddresses');
    if (!container) return;
    const addresses = getCfg('server.addresses');
    if (!addresses || !addresses.length) return;

    container.innerHTML = addresses.map((addr, i) => `
      <div class="hero-ip" data-addr-index="${i}">
        <span class="hero-ip-label">${addr.label}</span>
        <span class="hero-ip-value">${addr.address}</span>
        <span class="hero-ip-copy" data-addr="${addr.address}">复制</span>
      </div>
    `).join('');

    // 绑定复制事件
    container.querySelectorAll('.hero-ip-copy').forEach(btn => {
      btn.addEventListener('click', async function () {
        const addr = this.dataset.addr;
        try {
          await navigator.clipboard.writeText(addr);
          this.textContent = '已复制 ✓';
          this.classList.add('copied');
          showToast(`${addr} 已复制到剪贴板！`, 'success');
          setTimeout(() => {
            this.textContent = '复制';
            this.classList.remove('copied');
          }, 2000);
        } catch {
          showToast('复制失败，请手动复制', 'error');
        }
      });
    });
  }

  // =========================================================
  // 📦 内容渲染函数（从 CONFIG 读取数据填充页面）
  // =========================================================

  // -------- 服务器基本信息 --------
  function renderServerInfo() {
    const srv = getCfg('server');
    // 标题
    document.querySelectorAll('[data-server-name]').forEach(el => {
      el.textContent = srv.name;
    });
    // 描述
    document.querySelectorAll('[data-server-desc]').forEach(el => {
      el.textContent = srv.description;
    });
    // 统计数据
    const statEls = document.querySelectorAll('[data-stat]');
    statEls.forEach(el => {
      const key = el.dataset.stat;
      if (key === 'total') el.textContent = srv.totalPlayers?.toLocaleString() || '0';
      else if (key === 'online') el.textContent = srv.playerOnline || '0';
      else if (key === 'uptime') el.textContent = srv.uptimeRate || '99.9%';
      else if (key === 'days') el.textContent = srv.stableDays || '0';
    });
    // 页面标题
    if (srv.name) document.title = srv.name + ' 服务器';
  }

  // -------- 游戏模式 --------
  function renderGameModes() {
    const tabsContainer = document.getElementById('modeTabs');
    const detailsContainer = document.getElementById('modeDetails');
    const modes = CONFIG.gameModes;
    if (!tabsContainer || !modes || !modes.length) return;

    // 标签页
    tabsContainer.innerHTML = modes.map((m, i) =>
      '<button class="mode-tab' + (i === 0 ? ' active' : '') + '" data-mode="' + m.id + '">' +
        m.icon + ' ' + m.name +
      '</button>'
    ).join('');

    // 详情
    detailsContainer.innerHTML = modes.map((m, i) =>
      '<div class="mode-detail' + (i === 0 ? ' active' : '') + '" id="mode-' + m.id + '">' +
        '<div class="mode-detail-icon">' + m.icon + '</div>' +
        '<h3 class="mode-detail-title">' + m.name + '</h3>' +
        '<p class="mode-detail-desc">' + m.desc + '</p>' +
        '<div class="mode-detail-meta">' +
          '<span>👤 ' + (m.players || 0) + ' 人在线</span>' +
          '<span>⭐ ' + (m.rating || '--') + ' / 5.0</span>' +
        '</div>' +
      '</div>'
    ).join('');

    // 重新绑定点击事件
    initModeTabs();
  }

  // -------- 特色卡片 --------
  function renderFeatures() {
    const grid = document.getElementById('featuresGrid');
    const items = CONFIG.features;
    if (!grid || !items || !items.length) return;
    grid.innerHTML = items.map(f =>
      '<div class="feature-card">' +
        '<div class="feature-icon">' + f.icon + '</div>' +
        '<h3 class="feature-title">' + f.title + '</h3>' +
        '<p class="feature-desc">' + f.desc + '</p>' +
      '</div>'
    ).join('');
  }

  // -------- 公告 --------
  function renderAnnouncements() {
    const grid = document.getElementById('announcementsGrid');
    const items = CONFIG.announcements;
    if (!grid || !items || !items.length) return;
    grid.innerHTML = items.map(a =>
      '<div class="announce-card">' +
        '<div class="announce-date">' + a.date + '</div>' +
        '<h3 class="announce-title">' + a.title + '</h3>' +
        '<p class="announce-content">' + a.content + '</p>' +
      '</div>'
    ).join('');
  }

  // -------- 图库 --------
  function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    const items = CONFIG.gallery;
    if (!grid || !items || !items.length) return;
    grid.innerHTML = items.map(g =>
      '<div class="gallery-item">' +
        '<img src="' + g.image + '" alt="' + g.label + '" loading="lazy" onerror="this.style.display=\'none\'">' +
        '<div class="gallery-label">' + g.label + '</div>' +
      '</div>'
    ).join('');
  }

  // -------- 发展历程 --------
  function renderTimeline() {
    const container = document.getElementById('timelineContent');
    const items = CONFIG.timeline;
    if (!container || !items || !items.length) return;
    container.innerHTML = items.map((t, i) =>
      '<div class="timeline-item' + (i % 2 === 0 ? '' : ' timeline-right') + '">' +
        '<div class="timeline-dot"></div>' +
        '<div class="timeline-content">' +
          '<div class="timeline-date">' + t.date + '</div>' +
          '<h3 class="timeline-title">' + t.title + '</h3>' +
          '<p class="timeline-desc">' + t.desc + '</p>' +
        '</div>' +
      '</div>'
    ).join('');
  }

  // -------- 投票站点 --------
  function renderVoteSites() {
    const grid = document.getElementById('voteGrid');
    const items = CONFIG.voteSites;
    if (!grid || !items || !items.length) return;
    grid.innerHTML = items.map(v =>
      '<a href="' + (v.url || '#') + '" class="vote-card" target="_blank" rel="noopener">' +
        '<div class="vote-icon">' + v.icon + '</div>' +
        '<h3 class="vote-name">' + v.name + '</h3>' +
        '<p class="vote-desc">' + v.desc + '</p>' +
        '<span class="vote-btn">去投票 →</span>' +
      '</a>'
    ).join('');
  }

  // -------- FAQ --------
  function renderFAQ() {
    const list = document.getElementById('faqList');
    const items = CONFIG.faq;
    if (!list || !items || !items.length) return;
    list.innerHTML = items.map(f =>
      '<div class="faq-item">' +
        '<div class="faq-question">' +
          '<span>' + f.q + '</span>' +
          '<span class="faq-arrow">▼</span>' +
        '</div>' +
        '<div class="faq-answer"><p>' + f.a + '</p></div>' +
      '</div>'
    ).join('');
  }

  // -------- 规则列表 --------
  function renderRules() {
    const list = document.getElementById('rulesList');
    const items = CONFIG.rules;
    if (!list || !items || !items.length) return;
    list.innerHTML = items.map(r =>
      '<div class="rule-item">' +
        '<span class="rule-icon">📜</span>' +
        '<span class="rule-text">' + r + '</span>' +
      '</div>'
    ).join('');
  }

  // -------- 管理团队 --------
  function renderTeam() {
    const grid = document.getElementById('teamGrid');
    const items = CONFIG.team;
    if (!grid || !items || !items.length) return;
    grid.innerHTML = items.map(t =>
      '<div class="team-card">' +
        '<div class="team-avatar">' +
          (t.avatar ? '<img src="' + t.avatar + '" alt="' + t.name + '">' : '<span class="team-avatar-letter">' + t.name.charAt(0) + '</span>') +
        '</div>' +
        '<h3 class="team-name">' + t.name + '</h3>' +
        '<p class="team-role">' + t.role + '</p>' +
      '</div>'
    ).join('');
  }

  // -------- 导航滚动高亮 --------
  let navLinks = [];
  let sections = [];
  function initNavHighlight() {
    navLinks = document.querySelectorAll('.nav a');
    sections = document.querySelectorAll('.section[id], .hero[id]');
    updateNavHighlight();

    // 绑定点击事件
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
  function updateNavHighlight() {
    let current = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150) current = section.id;
    });
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
  }
  window.addEventListener('scroll', updateNavHighlight);

  // -------- Supabase Auth 登录 --------
  const SUPABASE_URL = SUPABASE_CONFIG.url;
  const SUPABASE_KEY = SUPABASE_CONFIG.anonKey;
  let authMode = 'login';
  let enabledProviders = [];

  const supabaseAuth = {
    async getSettings() {
      const res = await fetch(SUPABASE_URL + '/auth/v1/settings', {
        headers: { 'apikey': SUPABASE_KEY },
      });
      return res.json();
    },
    async signIn(email, password) {
      const res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return res.json();
    },
    async signUp(email, password) {
      const res = await fetch(SUPABASE_URL + '/auth/v1/signup', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return res.json();
    },
    async getUser(accessToken) {
      const res = await fetch(SUPABASE_URL + '/auth/v1/user', {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + accessToken },
      });
      return res.json();
    },
    oauthUrl(provider) {
      const redirect = encodeURIComponent(window.location.origin + '/');
      return SUPABASE_URL + '/auth/v1/authorize?provider=' + provider + '&redirect_to=' + redirect;
    },
  };

  const OAUTH_PROVIDERS = [
    { id: 'azure', name: 'Microsoft', icon: '<svg width="20" height="20" viewBox="0 0 23 23"><path fill="#fff" d="M.08 10.72l8.6-1.16v8.34L.08 19.2v-8.48zm10.52-9.78L22.92 0v10.22l-12.32.5V.94zM22.92 11.5V23l-12.32-2.08V11.5h12.32zM.08 11.5V23l8.6-1.34v-8.4L.08 11.5z"/></svg>' },
    { id: 'google', name: 'Google', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>' },
    { id: 'github', name: 'GitHub', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>' },
    { id: 'discord', name: 'Discord', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.054C.556 10.13-.325 15.74.1 21.28a.08.08 0 0 0 .032.055 20.06 20.06 0 0 0 6.037 3.054.076.076 0 0 0 .082-.028c.465-.637.88-1.31 1.244-2.005.06-.11.034-.24-.06-.31A13.26 13.26 0 0 1 5.86 20.56a.08.08 0 0 1-.008-.124c.262-.196.525-.399.773-.607a.074.074 0 0 1 .076-.046c3.278.892 6.768.892 10.01 0a.076.076 0 0 1 .078.046c.248.208.512.411.773.607a.08.08 0 0 1-.006.124 12.9 12.9 0 0 1-1.614 1.53.077.077 0 0 0-.004.117c.326.34.634.698.928 1.072a.075.075 0 0 0 .081.028 20.02 20.02 0 0 0 6.214-3.054.076.076 0 0 0 .03-.056c.524-6.28-.876-11.88-3.675-16.857a.063.063 0 0 0-.03-.052zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/></svg>' },
    { id: 'twitter', name: 'Twitter/X', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
  ];

  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const authModal = document.getElementById('authModal');
  const modalClose = document.getElementById('authModalClose');

  (async function initSupabaseAuth() {
    try {
      const settings = await supabaseAuth.getSettings();
      enabledProviders = Object.entries(settings.external || {})
        .filter(([, v]) => v === true)
        .map(([k]) => k);
    } catch (e) {
      console.warn('[Auth] 获取 Supabase 提供商配置失败:', e);
    }
  })();

  function openAuthModal(mode) {
    authMode = mode || 'login';
    authModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderAuthForm();
  }

  function getOAuthButton(provider) {
    const p = OAUTH_PROVIDERS.find(x => x.id === provider);
    if (!p) return '';
    const enabled = enabledProviders.includes(provider);
    return '<button class="auth-social-btn' + (enabled ? '' : ' disabled') + '" data-provider="' + p.id + '" ' +
      (enabled ? '' : 'title="未在 Supabase 后台配置（可在认证 → Providers 中启用）"') + '>' +
      p.icon + '<span>' + p.name + '</span>' +
      (enabled ? '' : '<span style="font-size:10px;color:#556;margin-left:auto;">未配置</span>') +
    '</button>';
  }

  function renderAuthForm() {
    const container = document.getElementById('authFormContainer');
    if (!container) return;
    const isLogin = authMode === 'login';
    const socialIds = OAUTH_PROVIDERS.map(p => p.id);
    const availableSocials = socialIds.filter(id => enabledProviders.includes(id));
    const showSocial = availableSocials.length > 0 || true;

    let html = '<div class="auth-card-inner">';
    html += '<div class="auth-header">' +
      '<div class="auth-logo"><svg width="40" height="40" viewBox="0 0 24 24"><path fill="#44B37A" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>' +
      '<h2 class="auth-title">' + (isLogin ? '欢迎回来' : '创建账户') + '</h2>' +
      '<p class="auth-subtitle">' + (isLogin ? '登录 CraftVerse 服务器' : '加入 CraftVerse 大家庭') + '</p>' +
    '</div>';

    if (showSocial) {
      html += '<div class="auth-social-section">' +
        '<div class="auth-divider"><span>社交账号登录</span></div>' +
        '<div class="auth-social-buttons">';
      socialIds.forEach(id => { html += getOAuthButton(id); });
      html += '</div></div>';
    }

    html += '<div class="auth-divider"><span>或使用邮箱</span></div>' +
    '<div class="auth-fields">' +
      '<div class="auth-field-wrap">' +
        '<label class="auth-field-label">邮箱地址</label>' +
        '<input type="email" id="authEmail" class="auth-input" placeholder="your@email.com" />' +
      '</div>' +
      '<div class="auth-field-wrap">' +
        '<label class="auth-field-label">密码</label>' +
        '<input type="password" id="authPassword" class="auth-input" placeholder="••••••••" />' +
      '</div>' +
      (!isLogin ? '<div class="auth-field-wrap">' +
        '<label class="auth-field-label">确认密码</label>' +
        '<input type="password" id="authConfirmPwd" class="auth-input" placeholder="再次输入密码" />' +
      '</div>' : '') +
    '</div>' +
    '<button id="authSubmitBtn" class="auth-btn-primary">' + (isLogin ? '登 录' : '注 册') + '</button>' +
    '<div id="authError" class="auth-error"></div>' +
    '<div class="auth-switch">' +
      (isLogin ? '还没有账户？<a href="#" id="switchAuthMode">立即注册</a>' : '已有账户？<a href="#" id="switchAuthMode">立即登录</a>') +
    '</div>';

    html += '</div>';
    container.innerHTML = html;

    document.getElementById('switchAuthMode')?.addEventListener('click', (e) => {
      e.preventDefault();
      authMode = authMode === 'login' ? 'register' : 'login';
      renderAuthForm();
    });
    document.getElementById('authSubmitBtn')?.addEventListener('click', handleAuthSubmit);
    document.getElementById('authEmail')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuthSubmit(); });
    document.getElementById('authPassword')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuthSubmit(); });
    const confirmEl = document.getElementById('authConfirmPwd');
    if (confirmEl) confirmEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAuthSubmit(); });

    document.querySelectorAll('.auth-social-btn:not(.disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = supabaseAuth.oauthUrl(btn.dataset.provider);
      });
    });
    document.querySelectorAll('.auth-social-btn.disabled').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast('该登录方式未在 Supabase 后台启用，请前往 Authentication → Providers 配置', 'info');
      });
    });
  }

  async function handleAuthSubmit() {
    const email = document.getElementById('authEmail')?.value.trim();
    const password = document.getElementById('authPassword')?.value;
    const confirmPwd = document.getElementById('authConfirmPwd')?.value;
    const errorEl = document.getElementById('authError');
    const btn = document.getElementById('authSubmitBtn');

    if (!email || !password) { showAuthError('请填写邮箱和密码'); return; }
    if (!email.includes('@')) { showAuthError('请输入有效的邮箱地址'); return; }
    if (password.length < 6) { showAuthError('密码至少 6 个字符'); return; }
    if (authMode === 'register' && password !== confirmPwd) { showAuthError('两次密码不一致'); return; }

    btn.disabled = true;
    btn.textContent = '处理中...';
    errorEl.style.display = 'none';

    try {
      let result;
      if (authMode === 'login') {
        result = await supabaseAuth.signIn(email, password);
      } else {
        result = await supabaseAuth.signUp(email, password);
      }

      if (!result || result.error) {
        const msg = result?.error_description || result?.error?.message || result?.msg || '操作失败';
        showAuthError(msg);
        btn.disabled = false;
        btn.textContent = authMode === 'login' ? '登 录' : '注 册';
        return;
      }

      if (result.access_token) {
        const userData = await supabaseAuth.getUser(result.access_token);
        const user = {
          id: userData.id || result.user?.id || email,
          email,
          username: email.split('@')[0],
          provider: 'supabase',
          accessToken: result.access_token,
        };
        localStorage.setItem('mc_current_user', JSON.stringify(user));
        localStorage.setItem('mc_supabase_token', result.access_token);
        localStorage.setItem('mc_supabase_refresh', result.refresh_token || '');
        updateUserUI(user);
        closeAuthModal();
        showToast('欢迎' + (authMode === 'login' ? '回来' : '加入') + '！', 'success');
      } else if (authMode === 'register') {
        showAuthError('注册成功！请查看邮箱确认链接');
        btn.disabled = false;
        btn.textContent = '注 册';
      }
    } catch (err) {
      showAuthError('网络错误，请检查连接后重试');
      btn.disabled = false;
      btn.textContent = authMode === 'login' ? '登 录' : '注 册';
    }

    function showAuthError(msg) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      errorEl.style.color = '#FF6B6B';
    }
  }

  function closeAuthModal() {
    authModal?.classList.remove('active');
    document.body.style.overflow = '';
  }

  loginBtn?.addEventListener('click', () => openAuthModal('login'));
  registerBtn?.addEventListener('click', () => openAuthModal('register'));
  modalClose?.addEventListener('click', closeAuthModal);

  function updateUserUI(user) {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;
    if (user) {
      const letter = (user.username || user.email || 'U').charAt(0).toUpperCase();
      headerActions.innerHTML =
        '<span style="width:28px;height:28px;border-radius:50%;background:var(--accent-green);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--bg-primary);">' + letter + '</span>' +
        '<span style="font-size:14px;color:var(--accent-green);font-weight:600;">' + (user.username || user.email) + '</span>' +
        '<button class="btn btn-outline" onclick="logout()">退出</button>';
    } else {
      headerActions.innerHTML =
        '<button class="btn btn-secondary" id="loginBtn">登录</button>' +
        '<button class="btn btn-primary" id="registerBtn">注册</button>';
      document.getElementById('loginBtn')?.addEventListener('click', () => openAuthModal('login'));
      document.getElementById('registerBtn')?.addEventListener('click', () => openAuthModal('register'));
    }
  }

  window.logout = function() {
    localStorage.removeItem('mc_current_user');
    localStorage.removeItem('mc_supabase_token');
    localStorage.removeItem('mc_supabase_refresh');
    location.reload();
  };

  (async function restoreSession() {
    const token = localStorage.getItem('mc_supabase_token');
    const savedUser = JSON.parse(localStorage.getItem('mc_current_user') || 'null');
    if (token && savedUser) {
      try {
        const userData = await supabaseAuth.getUser(token);
        if (userData && userData.id) {
          updateUserUI(savedUser);
          return;
        }
      } catch (e) {}
      localStorage.removeItem('mc_supabase_token');
      localStorage.removeItem('mc_current_user');
    } else if (savedUser && !token) {
      updateUserUI(savedUser);
    }
  })();

  // -------- Toast 消息 --------
  window.showToast = function(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
  };

  // -------- 封禁名单加载 --------
  function loadBanList() {
    const tbody = document.getElementById('banTableBody');
    if (!tbody) return;
    const bans = JSON.parse(localStorage.getItem('mc_bans') || '[]');
    if (bans.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-secondary);">暂无封禁记录</td></tr>';
      return;
    }
    tbody.innerHTML = bans.map(b =>
      '<tr>' +
        '<td>' + (b.player || '--') + '</td>' +
        '<td>' + (b.reason || '--') + '</td>' +
        '<td>' + (b.date || '--') + '</td>' +
        '<td><span class="' + (b.status === '封禁中' ? 'status-banned' : 'status-unbanned') + '">' + (b.status || '封禁中') + '</span></td>' +
      '</tr>'
    ).join('');
  }
  loadBanList();

  // =========================================================
  // 🎮 游戏模式标签页
  // =========================================================
  function initModeTabs() {
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.mode;
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.mode-detail').forEach(d => d.classList.remove('active'));
        const detail = document.getElementById('mode-' + target);
        if (detail) detail.classList.add('active');
      });
    });
  }

  // =========================================================
  // 📋 FAQ 手风琴
  // =========================================================
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.parentElement;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // =========================================================
  // ✨ 粒子背景
  // =========================================================
  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const count = 35;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        a: Math.random() * 0.5 + 0.2,
      });
    }
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(68, 179, 122, ' + p.a + ')';
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(68, 179, 122, ' + (0.1 * (1 - dist / 150)) + ')';
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // =========================================================
  // 🔄 滚动淡入效果
  // =========================================================
  function initScrollReveal() {
    const elements = document.querySelectorAll('.section-title, .mode-card, .feature-card, .announce-card, .timeline-item, .stat-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
  }

  // =========================================================
  // 🌓 主题切换（深色/浅色/跟随系统）
  // =========================================================
  function initThemeToggle() {
    const saved = localStorage.getItem('mc_theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // 监听系统主题变化（仅当用户未手动选择时）
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('mc_theme')) {
          document.documentElement.setAttribute('data-theme', e.matches ? 'light' : 'dark');
        }
      });
    }

    // 绑定切换按钮
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('mc_theme', next);
        showToast(next === 'light' ? '已切换至浅色模式' : '已切换至深色模式', 'info');
      });
    }
  }

  // =========================================================
  // 📱 移动端菜单
  // =========================================================
  function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    if (!menuBtn) return;

    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('active');
      if (mobileNav) mobileNav.classList.toggle('active');
    });

    // 点击导航链接后关闭菜单
    if (mobileNav) {
      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          menuBtn.classList.remove('active');
          mobileNav.classList.remove('active');
          const target = document.querySelector(link.getAttribute('href'));
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
  }

  // =========================================================
  // ⬆️ 滚动到顶部按钮
  // =========================================================
  function initScrollTop() {
    const btn = document.querySelector('.scroll-top-btn');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================
  // 💬 玩家评论区
  // =========================================================
  function initComments() {
    const textarea = document.getElementById('commentInput');
    const submitBtn = document.getElementById('commentSubmit');
    const listEl = document.getElementById('commentList');
    if (!textarea || !submitBtn || !listEl) return;

    function renderComments() {
      const comments = JSON.parse(localStorage.getItem('mc_comments') || '[]');
      if (comments.length === 0) {
        listEl.innerHTML = '<div class="comment-empty">还没有评论，快来抢沙发吧！</div>';
        return;
      }
      listEl.innerHTML = comments.map(c =>
        '<div class="comment-item">' +
          '<div class="comment-header">' +
            '<div class="comment-avatar">' + (c.name || 'U').charAt(0).toUpperCase() + '</div>' +
            '<div>' +
              '<div class="comment-name">' + c.name + '</div>' +
              '<div class="comment-time">' + c.time + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="comment-text">' + c.text + '</div>' +
        '</div>'
      ).join('');
    }

    submitBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      if (!text) { showToast('请输入评论内容', 'error'); return; }
      if (text.length > 500) { showToast('评论最多 500 字', 'error'); return; }
      const user = JSON.parse(localStorage.getItem('mc_current_user') || 'null');
      const comments = JSON.parse(localStorage.getItem('mc_comments') || '[]');
      comments.unshift({
        name: user ? (user.username || user.email) : '游客',
        text: text.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
        time: new Date().toLocaleString('zh-CN'),
      });
      localStorage.setItem('mc_comments', JSON.stringify(comments));
      textarea.value = '';
      renderComments();
      showToast('评论发布成功！', 'success');
    });

    renderComments();
  }

  // =========================================================
  // 📋 版本更新日志渲染
  // =========================================================
  function renderChangelog() {
    const container = document.getElementById('changelogGrid');
    if (!container) return;
    const items = CONFIG.changelog || [];
    if (!items.length) return;
    container.innerHTML = items.map(c =>
      '<div class="changelog-item">' +
        '<div class="changelog-version">v' + c.version + '</div>' +
        '<div class="changelog-date">' + c.date + '</div>' +
        '<ul class="changelog-list">' +
          (c.changes || []).map(ch => '<li class="' + (ch.type || '') + '">' + ch.text + '</li>').join('') +
        '</ul>' +
      '</div>'
    ).join('');
  }

  // =========================================================
  // 🚀 初始化所有内容渲染 + 高级效果
  // =========================================================
  // 首次渲染所有内容
  renderServerInfo();
  renderAddresses();
  renderGameModes();
  renderFeatures();
  renderAnnouncements();
  renderGallery();
  renderTimeline();
  renderVoteSites();
  renderFAQ();
  renderRules();
  renderTeam();
  renderChangelog();

  // 延迟启动视觉效果（不阻塞 DOM 渲染）
  setTimeout(() => {
    initThemeToggle();
    initMobileMenu();
    initScrollTop();
    initComments();
    initParticles();
    initScrollReveal();
    initFAQ();
    initModeTabs();
    initNavHighlight();
  }, 100);
});

