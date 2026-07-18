// ============================================================
// 永恒森林 MC 服务器官网 - 主站交互脚本
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
      '<p class="auth-subtitle">' + (isLogin ? '登录永恒森林服务器' : '加入永恒森林大家庭') + '</p>' +
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
    // 广播登录态变化，供假人面板等模块实时响应
    window.dispatchEvent(new CustomEvent('mc-user-changed', { detail: user || null }));
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
  // 💬 玩家评论区（含点赞 / 排序 + 滑块验证）
  // =========================================================
  let commentSortMode = 'newest'; // 'newest' | 'hottest'
  let captchaVerified = false;    // 滑块验证状态
  let captchaToken = null;        // 验证通过后的 token（含校验和）
  let resetCaptchaFn = null;      // 外部可调用的重置函数

  // ---- 拼图滑块验证码 ----
  function initCaptcha() {
    const wrap = document.getElementById('captchaCanvasWrap');
    const canvas = document.getElementById('captchaCanvas');
    const sliderBar = document.getElementById('captchaContainer');
    const slider = document.getElementById('captchaSlider');
    const track = document.getElementById('captchaTrack');
    const text = document.getElementById('captchaText');
    const hint = document.getElementById('captchaHint');
    const refresh = document.getElementById('captchaRefresh');
    if (!canvas || !slider || !wrap) return;

    const ctx = canvas.getContext('2d');
    const CW = canvas.width;   // 画布逻辑宽
    const CH = canvas.height;  // 画布逻辑高
    const PIECE_SIZE = 44;      // 拼图块尺寸
    const TOLERANCE = 10;       // 对齐容差（像素，放宽方便人类操作）

    let gapX = 0;              // 缺口 X 位置（随机）
    let puzzleX = 0;           // 拼图块当前 X（跟随滑块）
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let dragStartTime = 0;
    let trajectory = [];       // 拖拽轨迹 [{x, y, t}]
    let bgImageData = null;    // 背景图像缓存

    // --- 简易校验和 ---
    function makeChecksum(val) {
      const str = String(val) + 'cv_salt_2026';
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h + str.charCodeAt(i)) | 0;
      }
      return h;
    }

    // --- 生成随机背景 ---
    function generateBackground() {
      // 随机渐变背景
      const hue1 = Math.floor(Math.random() * 360);
      const hue2 = (hue1 + 40 + Math.random() * 60) % 360;
      const grad = ctx.createLinearGradient(0, 0, CW, CH);
      grad.addColorStop(0, 'hsl(' + hue1 + ', 50%, 25%)');
      grad.addColorStop(0.5, 'hsl(' + ((hue1 + hue2) / 2) + ', 40%, 20%)');
      grad.addColorStop(1, 'hsl(' + hue2 + ', 55%, 30%)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CW, CH);

      // 随机几何装饰
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const shape = Math.random();
        const x = Math.random() * CW;
        const y = Math.random() * CH;
        const r = 10 + Math.random() * 30;
        if (shape < 0.33) {
          ctx.arc(x, y, r, 0, Math.PI * 2);
        } else if (shape < 0.66) {
          ctx.rect(x - r, y - r, r * 2, r * 2);
        } else {
          ctx.moveTo(x, y - r);
          ctx.lineTo(x + r, y + r);
          ctx.lineTo(x - r, y + r);
          ctx.closePath();
        }
        ctx.fillStyle = 'hsla(' + (hue1 + Math.random() * 60) + ', 60%, 50%, ' + (0.08 + Math.random() * 0.12) + ')';
        ctx.fill();
      }

      // 随机噪点
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.06) + ')';
        ctx.fillRect(Math.random() * CW, Math.random() * CH, 2, 2);
      }
    }


    // --- 拼图路径定义（复用） ---
    function puzzlePath(px, py, s, bump) {
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + s / 2 - bump, py);
      ctx.arc(px + s / 2, py, bump, Math.PI, 0, false);
      ctx.lineTo(px + s / 2 + bump, py);
      ctx.lineTo(px + s, py);
      ctx.lineTo(px + s, py + s / 2 - bump);
      ctx.arc(px + s, py + s / 2, bump, -Math.PI / 2, Math.PI / 2, false);
      ctx.lineTo(px + s, py + s);
      ctx.lineTo(px + s / 2 + bump, py + s);
      ctx.arc(px + s / 2, py + s, bump, 0, Math.PI, false);
      ctx.lineTo(px, py + s);
      ctx.lineTo(px, py + s / 2 + bump);
      ctx.arc(px, py + s / 2, bump, Math.PI / 2, -Math.PI / 2, false);
      ctx.closePath();
    }

    // --- 缺口脉冲动画 ---
    let pulseAnimId = null;
    function startPulse() {
      if (pulseAnimId) return;
      function pulse() {
        if (captchaVerified) { stopPulse(); return; }
        if (isDragging) { pulseAnimId = requestAnimationFrame(pulse); return; }
        const t = performance.now() / 600;
        const alpha = 0.5 + 0.4 * Math.abs(Math.sin(t));
        redrawWithPulse(alpha);
        pulseAnimId = requestAnimationFrame(pulse);
      }
      pulse();
    }
    function stopPulse() {
      if (pulseAnimId) { cancelAnimationFrame(pulseAnimId); pulseAnimId = null; }
    }

    function redrawWithPulse(gapAlpha) {
      if (bgImageData) {
        ctx.putImageData(bgImageData, 0, 0);
      } else {
        generateBackground();
        bgImageData = ctx.getImageData(0, 0, CW, CH);
      }
      // 缺口（带脉冲发光）
      const y = (CH - PIECE_SIZE) / 2;
      const s = PIECE_SIZE;
      const bump = 8;
      puzzlePath(gapX, y, s, bump);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 200, 50, ' + gapAlpha + ')';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 200, 50, ' + (gapAlpha * 0.9) + ')';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('对准这里', gapX + s / 2, y - 6);
      // 拼图块
      drawPiece(puzzleX);
    }

    // --- 绘制缺口（静态版） ---
    function drawGap(x) {
      ctx.save();
      const y = (CH - PIECE_SIZE) / 2;
      const s = PIECE_SIZE;
      const bump = 8;
      puzzlePath(x, y, s, bump);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 200, 50, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 200, 50, 0.8)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('对准这里', x + s / 2, y - 6);
      ctx.restore();
    }

    // --- 绘制可拖动的拼图块 ---
    function drawPiece(x) {
      ctx.save();
      const y = (CH - PIECE_SIZE) / 2;
      const s = PIECE_SIZE;
      const bump = 8;
      puzzlePath(x, y, s, bump);
      // 裁剪后绘制对应区域的背景
      ctx.save();
      ctx.clip();
      if (bgImageData) {
        ctx.putImageData(bgImageData, 0, 0);
      }
      ctx.restore();
      // 描边
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // --- 全量重绘（带脉冲） ---
    function redraw() {
      const t = performance.now() / 600;
      const alpha = 0.5 + 0.4 * Math.abs(Math.sin(t));
      redrawWithPulse(alpha);
    }

    // --- 初始化新的拼图 ---
    function newPuzzle() {
      captchaVerified = false;
      captchaToken = null;
      stopPulse();
      generateBackground();
      bgImageData = ctx.getImageData(0, 0, CW, CH);
      // 随机缺口位置（范围：PIECE_SIZE ~ CW - PIECE_SIZE * 2）
      gapX = PIECE_SIZE + Math.random() * (CW - PIECE_SIZE * 3);
      puzzleX = 0;
      // 重绘
      ctx.putImageData(bgImageData, 0, 0);
      drawGap(gapX);
      drawPiece(0);
      // 启动脉冲
      startPulse();
      // 重置滑块
      currentX = 0;
      slider.style.left = '0px';
      track.style.width = '0%';
      slider.className = 'captcha-slider';
      track.className = 'captcha-track';
      slider.innerHTML = '→';
      text.textContent = '向右拖动滑块';
      text.classList.remove('hidden');
      hint.textContent = '拖动下方滑块完成拼图验证';
      hint.className = 'captcha-hint-overlay';
    }

    function getMaxX() { return sliderBar.offsetWidth - slider.offsetWidth; }

    // --- 轨迹分析：检测是否为人类操作 ---
    function analyzeTrajectory(traj) {
      if (traj.length < 5) return { isBot: true, reason: '轨迹点过少' };
      // 1. 时间检查：太快 = 机器人
      const totalTime = traj[traj.length - 1].t - traj[0].t;
      if (totalTime < 400) return { isBot: true, reason: '操作过快（' + totalTime + 'ms）' };
      // 2. 轨迹直线度检测：计算 Y 方向抖动
      let yVariance = 0;
      let yMean = 0;
      traj.forEach(p => yMean += p.y);
      yMean /= traj.length;
      traj.forEach(p => yVariance += Math.pow(p.y - yMean, 2));
      yVariance /= traj.length;
      if (yVariance < 2) return { isBot: true, reason: '轨迹过于笔直（无自然抖动）' };
      // 3. 速度变化检测：人类有加速减速
      let prevSpeed = 0;
      let directionChanges = 0;
      for (let i = 1; i < traj.length; i++) {
        const dx = traj[i].x - traj[i - 1].x;
        const dt = Math.max(traj[i].t - traj[i - 1].t, 1);
        const speed = Math.abs(dx / dt);
        if (prevSpeed > 0 && Math.abs(speed - prevSpeed) > 0.5) directionChanges++;
        prevSpeed = speed;
      }
      if (directionChanges < 2) return { isBot: true, reason: '速度变化不自然' };
      return { isBot: false, reason: '通过' };
    }

    function onStart(e) {
      if (captchaVerified) return;
      isDragging = true;
      startX = (e.touches ? e.touches[0].clientX : e.clientX) - currentX;
      dragStartTime = performance.now();
      trajectory = [{ x: currentX, y: 0, t: dragStartTime }];
      slider.style.transition = 'none';
      track.style.transition = 'none';
      text.classList.add('hidden');
      hint.className = 'captcha-hint-overlay';
      hint.textContent = '验证中...';
      e.preventDefault();
    }

    function onMove(e) {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? (e.touches[0].clientY || 0) : (e.clientY || 0);
      const maxX = getMaxX();
      currentX = Math.max(0, Math.min(clientX - startX, maxX));
      slider.style.left = currentX + 'px';
      track.style.width = (currentX / maxX * 100) + '%';
      // 拼图块跟随滑块
      puzzleX = (currentX / maxX) * (CW - PIECE_SIZE);
      redraw();
      // 实时距离提示
      const diff = puzzleX - gapX;
      if (diff > 30) hint.textContent = '还差 ' + Math.round(diff) + 'px，继续往右拖';
      else if (diff > 12) hint.textContent = '快到了！再往右一点点';
      else if (diff >= -10 && diff <= 10) hint.textContent = '对齐了！松手验证';
      else if (diff < -10 && diff >= -30) hint.textContent = '稍微过了，往左回一点点';
      else if (diff < -30) hint.textContent = '过太多了，往左拖回一些';
      // 记录轨迹
      trajectory.push({ x: currentX, y: clientY, t: performance.now() });
      if (currentX > 5) text.classList.add('hidden');
      else text.classList.remove('hidden');
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      slider.style.transition = 'left 0.3s ease';
      track.style.transition = 'width 0.3s ease';
      trajectory.push({ x: currentX, y: 0, t: performance.now() });

      // 1. 轨迹分析
      const analysis = analyzeTrajectory(trajectory);
      if (analysis.isBot) {
        failCaptcha('检测到机器人行为：' + analysis.reason);
        return;
      }

      // 2. 拼图对齐检测
      const diff = Math.abs(puzzleX - gapX);
      if (diff <= TOLERANCE) {
        // 验证通过
        captchaVerified = true;
        captchaToken = makeChecksum(gapX);
        stopPulse();
        slider.classList.add('success');
        track.classList.add('success');
        slider.innerHTML = '✓';
        slider.style.left = getMaxX() + 'px';
        track.style.width = '100%';
        // 拼图对齐到目标位置
        puzzleX = gapX;
        redraw();
        text.textContent = '验证通过 ✓';
        text.classList.remove('hidden');
        hint.textContent = '验证成功！可以发表评论了';
        hint.className = 'captcha-hint-overlay success';
        showToast('拼图验证通过！', 'success');
      } else {
        failCaptcha('拼图未对齐（偏差 ' + Math.round(diff) + 'px，容差 ' + TOLERANCE + 'px）');
      }
    }

    function failCaptcha(reason) {
      slider.classList.add('error');
      track.classList.add('error');
      hint.textContent = '验证失败：' + reason;
      hint.className = 'captcha-hint-overlay error';
      showToast('验证失败：' + reason, 'error');
      setTimeout(() => { resetCaptcha(); }, 600);
    }

    function resetCaptcha() {
      newPuzzle();
    }

    // 暴露给外部调用
    resetCaptchaFn = resetCaptcha;

    // 绑定事件
    slider.addEventListener('mousedown', onStart);
    slider.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);

    // 刷新
    refresh?.addEventListener('click', () => {
      resetCaptcha();
      showToast('验证码已刷新', 'info');
    });

    // 窗口 resize 时重绘
    window.addEventListener('resize', () => {
      if (!captchaVerified) {
        const newMax = getMaxX();
        if (currentX > newMax) {
          currentX = newMax;
          slider.style.left = currentX + 'px';
          track.style.width = '100%';
        }
        redraw();
      }
    });

    // 初始化第一张拼图
    newPuzzle();
  }

  function initComments() {
    const textarea = document.getElementById('commentInput');
    const submitBtn = document.getElementById('commentSubmit');
    const listEl = document.getElementById('commentList');
    if (!textarea || !submitBtn || !listEl) return;

    // 插入排序标签
    const sortTabs = document.createElement('div');
    sortTabs.className = 'comment-sort-tabs';
    sortTabs.innerHTML =
      '<button class="comment-sort-tab active" data-sort="newest">最新</button>' +
      '<button class="comment-sort-tab" data-sort="hottest">最热</button>';
    listEl.parentNode.insertBefore(sortTabs, listEl);

    sortTabs.querySelectorAll('.comment-sort-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        sortTabs.querySelectorAll('.comment-sort-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        commentSortMode = tab.dataset.sort;
        renderComments();
      });
    });

    function getLikedComments() {
      return JSON.parse(localStorage.getItem('mc_liked_comments') || '[]');
    }

    function renderComments() {
      let comments = JSON.parse(localStorage.getItem('mc_comments') || '[]');
      if (comments.length === 0) {
        listEl.innerHTML = '<div class="comment-empty">还没有评论，快来抢沙发吧！</div>';
        return;
      }
      // 排序
      if (commentSortMode === 'hottest') {
        comments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      }
      const likedIds = getLikedComments();
      listEl.innerHTML = comments.map((c, i) => {
        const cid = c.id || ('c_' + i);
        const liked = likedIds.includes(cid);
        return '<div class="comment-item">' +
          '<div class="comment-header">' +
            '<div class="comment-avatar">' + (c.name || 'U').charAt(0).toUpperCase() + '</div>' +
            '<div>' +
              '<div class="comment-name">' + c.name + '</div>' +
              '<div class="comment-time">' + c.time + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="comment-text">' + c.text + '</div>' +
          '<div class="comment-actions">' +
            '<button class="comment-like-btn' + (liked ? ' liked' : '') + '" data-cid="' + cid + '" data-idx="' + i + '">' +
              '<span class="like-icon">' + (liked ? '❤️' : '🤍') + '</span>' +
              '<span class="comment-like-count">' + (c.likes || 0) + '</span>' +
            '</button>' +
            '<span class="comment-delete-btn" data-idx="' + i + '">删除</span>' +
          '</div>' +
        '</div>';
      }).join('');

      // 绑定点赞
      listEl.querySelectorAll('.comment-like-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const cid = btn.dataset.cid;
          const idx = parseInt(btn.dataset.idx);
          const comments = JSON.parse(localStorage.getItem('mc_comments') || '[]');
          let likedIds = getLikedComments();
          if (likedIds.includes(cid)) {
            likedIds = likedIds.filter(id => id !== cid);
            comments[idx].likes = Math.max(0, (comments[idx].likes || 0) - 1);
          } else {
            likedIds.push(cid);
            comments[idx].likes = (comments[idx].likes || 0) + 1;
          }
          localStorage.setItem('mc_comments', JSON.stringify(comments));
          localStorage.setItem('mc_liked_comments', JSON.stringify(likedIds));
          renderComments();
        });
      });

      // 绑定删除
      listEl.querySelectorAll('.comment-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          if (!confirm('确定要删除这条评论吗？')) return;
          const comments = JSON.parse(localStorage.getItem('mc_comments') || '[]');
          comments.splice(idx, 1);
          localStorage.setItem('mc_comments', JSON.stringify(comments));
          renderComments();
          showToast('评论已删除', 'info');
        });
      });
    }

    submitBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      if (!text) { showToast('请输入评论内容', 'error'); return; }
      if (text.length > 500) { showToast('评论最多 500 字', 'error'); return; }
      // 人机验证检查（双重校验：变量 + token）
      if (!captchaVerified || !captchaToken) { showToast('请先完成拼图验证！', 'error'); return; }
      const user = JSON.parse(localStorage.getItem('mc_current_user') || 'null');
      const comments = JSON.parse(localStorage.getItem('mc_comments') || '[]');
      comments.unshift({
        id: 'c_' + Date.now(),
        name: user ? (user.username || user.email) : '游客',
        text: text.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
        time: new Date().toLocaleString('zh-CN'),
        likes: 0,
      });
      localStorage.setItem('mc_comments', JSON.stringify(comments));
      textarea.value = '';
      // 重置验证码
      captchaVerified = false;
      captchaToken = null;
      if (resetCaptchaFn) resetCaptchaFn();
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
    if (!items.length) { container.innerHTML = '<div class="comment-empty">暂无更新日志</div>'; return; }
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
  // 📈 阅读进度条
  // =========================================================
  function initReadProgress() {
    const bar = document.getElementById('readProgressBar');
    if (!bar) return;
    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(100, progress) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // =========================================================
  // ⌨️ 打字机效果（Hero 副标题）
  // =========================================================
  function initTypewriter() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;
    const originalText = subtitle.textContent;
    if (!originalText) return;

    let i = 0;
    subtitle.textContent = '';
    subtitle.style.visibility = 'visible';

    function type() {
      if (i < originalText.length) {
        subtitle.textContent = originalText.substring(0, i + 1);
        i++;
        // 换行/空格快一点，标点慢一点
        const ch = originalText[i - 1];
        let delay = 40;
        if (ch === ' ' || ch === '·') delay = 20;
        if (ch === '，' || ch === '。' || ch === '·' || ch === '+') delay = 80;
        setTimeout(type, delay);
      } else {
        // 加光标
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        cursor.textContent = '';
        subtitle.appendChild(cursor);
        // 6 秒后移除光标
        setTimeout(() => { if (cursor.parentNode) cursor.remove(); }, 6000);
      }
    }
    // 延迟启动，等粒子动画初始化
    setTimeout(type, 500);
  }

  // =========================================================
  // ⏰ 活动倒计时
  // =========================================================
  function initCountdowns() {
    const container = document.getElementById('countdownGrid');
    if (!container) return;
    const countdowns = CONFIG.countdowns || [];
    if (!countdowns.length) {
      container.parentElement.parentElement.style.display = 'none';
      return;
    }

    function renderCountdowns() {
      const now = Date.now();
      const active = countdowns.filter(c => new Date(c.endDate).getTime() > now);
      if (active.length === 0) {
        container.parentElement.parentElement.style.display = 'none';
        return;
      }
      container.innerHTML = active.map((c, idx) => {
        const diff = new Date(c.endDate).getTime() - now;
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return '<div class="countdown-card">' +
          '<div class="countdown-card-title">' + c.title + '</div>' +
          '<div class="countdown-card-subtitle">' + c.subtitle + '</div>' +
          '<div class="countdown-timer" data-end="' + c.endDate + '">' +
            '<div class="countdown-unit"><div class="countdown-number">' + String(days).padStart(2, '0') + '</div><div class="countdown-label">天</div></div>' +
            '<div class="countdown-unit"><div class="countdown-number">' + String(hours).padStart(2, '0') + '</div><div class="countdown-label">时</div></div>' +
            '<div class="countdown-unit"><div class="countdown-number">' + String(mins).padStart(2, '0') + '</div><div class="countdown-label">分</div></div>' +
            '<div class="countdown-unit"><div class="countdown-number">' + String(secs).padStart(2, '0') + '</div><div class="countdown-label">秒</div></div>' +
          '</div>' +
          (c.ctaLink ? '<a href="' + c.ctaLink + '" class="countdown-cta">' + (c.ctaText || '了解') + ' →</a>' : '') +
        '</div>';
      }).join('');
    }

    renderCountdowns();
    setInterval(renderCountdowns, 1000);
  }

  // =========================================================
  // 📊 服务器实时状态查询（MCSrvStat API）
  // =========================================================
  async function initServerStatus() {
    const container = document.getElementById('serverStatusContainer');
    if (!container) return;
    const cfg = CONFIG.serverStatus;
    if (!cfg || !cfg.enabled) { container.style.display = 'none'; return; }
    let prevServerOnline = undefined; // 追踪上次状态，用于桌面通知

    function renderStatusCard(state) {
      const badge = state.online
        ? '<span class="server-status-badge online"><span class="status-dot"></span> 在线</span>'
        : '<span class="server-status-badge offline"><span class="status-dot"></span> 离线</span>';

      const motdHtml = state.online && state.motd
        ? '<div class="server-status-motd">' + state.motd.replace(/\n/g, '<br>') + '</div>'
        : '';

      const playersStr = state.online && state.maxPlayers != null
        ? state.players + ' / ' + state.maxPlayers
        : '--';

      const versionStr = state.online && state.version ? state.version : '--';

      const iconHtml = state.icon
        ? '<img src="' + state.icon + '" alt="服务器图标">'
        : '🎮';

      // 玩家头颅
      let headsHtml = '';
      if (state.online && cfg.showPlayerList && state.playerList && state.playerList.length > 0) {
        const maxHeads = cfg.maxPlayerHeads || 12;
        const shown = state.playerList.slice(0, maxHeads);
        const remaining = state.playerList.length - shown.length;
        headsHtml = '<div class="player-heads-section">' +
          '<div class="player-heads-title">在线玩家 (' + state.playerList.length + ')</div>' +
          '<div class="player-heads">' +
            shown.map(p =>
              '<div class="player-head" title="' + p + '">' +
                '<img src="https://mc-heads.net/avatar/' + encodeURIComponent(p) + '/40" alt="' + p + '" loading="lazy">' +
                '<div class="player-head-tooltip">' + p + '</div>' +
              '</div>'
            ).join('') +
            (remaining > 0 ? '<div class="player-heads-more">+' + remaining + '</div>' : '') +
          '</div></div>';
      }

      container.innerHTML =
        '<div class="server-status-card">' +
          '<div class="server-status-header">' +
            '<div class="server-status-icon">' + iconHtml + '</div>' +
            '<div class="server-status-info">' +
              '<div class="server-status-name">' + (state.name || cfg.javaHost) + '</div>' +
              '<div class="server-status-meta">' +
                '<span>👥 ' + playersStr + '</span>' +
                '<span>📦 ' + versionStr + '</span>' +
                '<span>🌐 ' + cfg.javaHost + (cfg.javaPort !== 25565 ? ':' + cfg.javaPort : '') + '</span>' +
                badge +
              '</div>' +
            '</div>' +
          '</div>' +
          motdHtml +
          headsHtml +
        '</div>';
    }

    // 加载中状态
    container.innerHTML =
      '<div class="server-status-card">' +
        '<div class="server-status-header">' +
          '<div class="server-status-icon">🎮</div>' +
          '<div class="server-status-info">' +
            '<div class="server-status-name">' + cfg.javaHost + '</div>' +
            '<div class="server-status-meta"><span class="server-status-badge loading"><span class="status-dot"></span> 查询中...</span></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    async function queryServer() {
      try {
        const host = cfg.javaHost;
        const port = cfg.javaPort;
        const url = 'https://api.mcsrvstat.us/3/' + host + (port !== 25565 ? ':' + port : '');
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        // 桌面通知：状态变化检测
        if (typeof prevServerOnline !== 'undefined') {
          const nowOnline = !!data.online;
          if (prevServerOnline !== nowOnline && Notification.permission === 'granted') {
            new Notification('永恒森林 服务器状态变化', {
              body: nowOnline
                ? '服务器已上线！快来玩吧！ (在线 ' + (data.players ? data.players.online : 0) + ' 人)'
                : '服务器已离线，请稍后再试',
              icon: 'assets/images/favicon.png',
            });
          }
          prevServerOnline = nowOnline;
        } else {
          prevServerOnline = !!data.online;
        }

        if (data.online) {
          const motd = data.motd ? (data.motd.clean || data.motd.raw || []).join('\n') : '';
          const playerList = data.players && data.players.list
            ? data.players.list.map(p => (typeof p === 'string' ? p : p.name))
            : [];
          renderStatusCard({
            online: true,
            name: data.hostname || host,
            motd: motd,
            players: data.players ? data.players.online : 0,
            maxPlayers: data.players ? data.players.max : 0,
            version: data.version || '--',
            icon: data.icon ? 'data:image/png;base64,' + data.icon : null,
            playerList: playerList,
          });
        } else {
          renderStatusCard({ online: false, name: host });
        }
      } catch (err) {
        console.warn('[ServerStatus] 查询失败:', err);
        renderStatusCard({ online: false, name: cfg.javaHost });
      }
    }

    queryServer();
    // 定时刷新
    const interval = Math.max(30, cfg.refreshInterval || 60);
    setInterval(queryServer, interval * 1000);
  }

  // =========================================================
  // 🔢 数字滚动动画
  // =========================================================
  function initCountUp() {
    const statValues = document.querySelectorAll('.stat-value');
    if (!statValues.length) return;

    function animateCount(el, target, duration) {
      const isFloat = String(target).includes('.');
      const isPercent = String(target).includes('%');
      const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
      if (isNaN(num)) { el.textContent = target; return; }

      let start = 0;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(num * eased);
        let display = current.toLocaleString();
        if (isFloat) display = current.toFixed(1);
        if (isPercent) display += '%';
        el.textContent = display;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target; // 最终精确值
      }
      requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.textContent;
          if (target && target !== '0') {
            animateCount(el, target, 1500);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statValues.forEach(el => observer.observe(el));
  }

  // =========================================================
  // 🖼️ 图片灯箱 (Lightbox)
  // =========================================================
  function initLightbox() {
    const overlay = document.getElementById('lightboxOverlay');
    const img = document.getElementById('lightboxImage');
    const caption = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    if (!overlay || !img) return;

    let currentIdx = 0;
    let galleryImages = [];

    // 收集图库图片
    function collectImages() {
      galleryImages = [];
      document.querySelectorAll('.gallery-item img').forEach(galleryImg => {
        const src = galleryImg.getAttribute('src');
        const label = galleryImg.parentElement.querySelector('.gallery-label');
        galleryImages.push({
          src: src,
          caption: label ? label.textContent : '',
        });
      });
    }

    function openLightbox(idx) {
      collectImages();
      if (galleryImages.length === 0) return;
      currentIdx = Math.max(0, Math.min(idx, galleryImages.length - 1));
      showImage();
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function showImage() {
      const item = galleryImages[currentIdx];
      img.src = item.src;
      caption.textContent = item.caption || '';
    }

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    function nextImage() {
      currentIdx = (currentIdx + 1) % galleryImages.length;
      showImage();
    }

    function prevImage() {
      currentIdx = (currentIdx - 1 + galleryImages.length) % galleryImages.length;
      showImage();
    }

    // 绑定图库点击
    document.addEventListener('click', (e) => {
      const galleryImg = e.target.closest('.gallery-item img');
      if (galleryImg) {
        const items = Array.from(document.querySelectorAll('.gallery-item img'));
        const idx = items.indexOf(galleryImg);
        if (idx >= 0) openLightbox(idx);
      }
    });

    closeBtn?.addEventListener('click', closeLightbox);
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) closeLightbox();
    });
    nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
    prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });

    // 键盘控制
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    });
  }

  // =========================================================
  // 👀 访问计数器
  // =========================================================
  function initVisitCounter() {
    const el = document.getElementById('visitCount');
    if (!el) return;
    let visits = parseInt(localStorage.getItem('mc_visits') || '0') + 1;
    localStorage.setItem('mc_visits', String(visits));
    // 数字滚动动画
    const duration = 1500;
    const startTime = performance.now();
    function animate(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(visits * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(animate);
      else el.textContent = visits.toLocaleString();
    }
    requestAnimationFrame(animate);
  }

  // =========================================================
  // 🎮 Konami Code 彩蛋（Matrix 雨效果）
  // =========================================================
  function initKonamiCode() {
    const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let konamiIdx = 0;
    const canvas = document.getElementById('konamiCanvas');
    const hint = document.getElementById('konamiHint');
    if (!canvas) return;
    let matrixActive = false;
    let matrixAnimId = null;

    document.addEventListener('keydown', (e) => {
      // 忽略在 input/textarea 中的按键
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[konamiIdx]) {
        konamiIdx++;
        if (konamiIdx === KONAMI.length) {
          konamiIdx = 0;
          triggerMatrix();
        }
      } else {
        konamiIdx = (key === KONAMI[0]) ? 1 : 0;
      }
    });

    function triggerMatrix() {
      if (matrixActive) {
        // 关闭
        stopMatrix();
        return;
      }
      matrixActive = true;
      canvas.classList.add('active');
      hint.classList.add('active');
      setTimeout(() => hint.classList.remove('active'), 3000);

      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const fontSize = 16;
      const cols = Math.floor(canvas.width / fontSize);
      const drops = new Array(cols).fill(1);
      const chars = 'MCRAFTVERSE0123456789@#$%&*+='.split('');

      function draw() {
        ctx.fillStyle = 'rgba(10, 14, 26, 0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#44B37A';
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < cols; i++) {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
        matrixAnimId = requestAnimationFrame(draw);
      }
      draw();

      // 点击关闭
      const closeHandler = (e) => {
        if (matrixActive && e.key === 'Escape') {
          stopMatrix();
          document.removeEventListener('keydown', closeHandler);
        }
      };
      document.addEventListener('keydown', closeHandler);
      canvas.addEventListener('click', stopMatrix, { once: true });
    }

    function stopMatrix() {
      matrixActive = false;
      canvas.classList.remove('active');
      hint.classList.remove('active');
      if (matrixAnimId) cancelAnimationFrame(matrixAnimId);
    }

    window.addEventListener('resize', () => {
      if (matrixActive) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    });
  }

  // =========================================================
  // 🔍 页内搜索
  // =========================================================
  function initPageSearch() {
    const input = document.getElementById('pageSearchInput');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;

    // 收集可搜索的板块内容
    const searchIndex = [
      { id: 'hero', label: '首页', title: '永恒森林 MC 服务器', desc: '粘液科技 自动化 能源核心 pm.rainplay.cn' },
      { id: 'modes', label: '游戏模式', title: '探索永恒森林', desc: '工业科技 纯净生存 Slimefun' },
      { id: 'features', label: '游戏特色', title: '为什么选择永恒森林', desc: '粘液科技 自动化 能源核心 传送带 电力 经济 领地' },
      { id: 'announcements', label: '公告', title: '最新公告', desc: '1.21.1升级 能源核心 自动化上线' },
      { id: 'stats', label: '数据', title: '服务器运行状态', desc: '注册玩家 在线人数 在线率 运行天数' },
      { id: 'gallery', label: '图库', title: '玩家作品展示', desc: '主城 建筑 活动 团队' },
      { id: 'timeline', label: '历程', title: '永恒森林 的成长故事', desc: '开服 粘液科技 传送带 能源 1.21.1' },
      { id: 'vote', label: '投票', title: '为我们投票', desc: 'MCBBS PlanetMC MinecraftServers' },
      { id: 'faq', label: 'FAQ', title: '常见问题', desc: '版本 加入方法 付费 违规' },
      { id: 'changelog', label: '日志', title: '版本更新记录', desc: '1.21.1 1.21 1.20 1.0 更新日志' },
      { id: 'comments', label: '留言', title: '社区交流', desc: '玩家留言评论' },
      { id: 'rules', label: '规则', title: '服务器规范', desc: '作弊 破坏 广告 封禁名单' },
      { id: 'team', label: '团队', title: '管理团队', desc: 'CraftMaster BuildWizard TechNinja GameGuard' },
    ];

    function highlight(text, query) {
      if (!query) return text;
      const idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx < 0) return text;
      return text.substring(0, idx) +
        '<span class="search-result-highlight">' + text.substring(idx, idx + query.length) + '</span>' +
        text.substring(idx + query.length);
    }

    function search(query) {
      query = query.trim();
      if (!query) { results.classList.remove('active'); return; }
      const q = query.toLowerCase();
      const matches = searchIndex.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q)
      ).slice(0, 8);

      if (matches.length === 0) {
        results.innerHTML = '<div class="search-no-results">没有找到「' + query + '」相关内容</div>';
      } else {
        results.innerHTML = matches.map(m =>
          '<div class="search-result-item" data-target="' + m.id + '">' +
            '<div class="search-result-label">' + m.label + '</div>' +
            '<div class="search-result-title">' + highlight(m.title, query) + '</div>' +
            '<div class="search-result-desc">' + highlight(m.desc, query) + '</div>' +
          '</div>'
        ).join('');
      }
      results.classList.add('active');

      // 绑定点击跳转
      results.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const target = document.getElementById(item.dataset.target);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // 短暂高亮
            target.style.transition = 'box-shadow 0.5s';
            target.style.boxShadow = '0 0 30px rgba(68, 179, 122, 0.4)';
            setTimeout(() => { target.style.boxShadow = ''; }, 1500);
          }
          results.classList.remove('active');
          input.value = '';
        });
      });
    }

    let searchTimer;
    input.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => search(input.value), 200);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim()) search(input.value);
    });

    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrapper')) {
        results.classList.remove('active');
      }
    });

    // ESC 关闭
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        results.classList.remove('active');
        input.blur();
      }
    });
  }

  // =========================================================
  // 🔔 桌面通知
  // =========================================================
  function initNotifyBell() {
    const bell = document.getElementById('notifyBell');
    if (!bell) return;

    // 检查之前是否已授权
    if (Notification.permission === 'granted') {
      bell.classList.add('active');
      bell.title = '桌面通知已开启';
    } else if (Notification.permission === 'denied') {
      bell.title = '桌面通知已被浏览器拒绝';
    }

    bell.addEventListener('click', async () => {
      if (!('Notification' in window)) {
        showToast('你的浏览器不支持桌面通知', 'error');
        return;
      }
      if (Notification.permission === 'granted') {
        bell.classList.toggle('active');
        if (bell.classList.contains('active')) {
          new Notification('永恒森林 服务器', {
            body: '桌面通知已开启！服务器状态变化时将通知你。',
            icon: 'assets/images/favicon.png',
          });
          showToast('桌面通知已开启', 'success');
        } else {
          showToast('桌面通知已关闭', 'info');
        }
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          bell.classList.add('active');
          new Notification('永恒森林 服务器', {
            body: '欢迎！你将收到服务器上线/离线等通知。',
            icon: 'assets/images/favicon.png',
          });
          showToast('桌面通知已开启！', 'success');
        } else {
          showToast('通知权限被拒绝', 'error');
        }
      } else {
        showToast('请在浏览器设置中手动开启通知权限', 'info');
      }
    });
  }

  // =========================================================
  // 🤖 假人/Bot 压测控制台
  // 仅登录用户可见，且只能管理/查看自己的假人
  // =========================================================
  function initBotPanel() {
    const cfg = CONFIG.botServer;
    if (!cfg || !cfg.enabled) return;

    const panel = document.getElementById('botPanelContent');
    const loginRequired = document.getElementById('botLoginRequired');
    if (!panel || !loginRequired) return;

    const badge = document.getElementById('botServerBadge');
    const statusText = document.getElementById('botServerStatusText');
    const serverInfo = document.getElementById('botServerInfo');
    const startBtn = document.getElementById('botStartBtn');
    const stopAllBtn = document.getElementById('botStopAllBtn');
    const refreshBtn = document.getElementById('botRefreshBtn');
    const table = document.getElementById('botTable');
    const tbody = document.getElementById('botTableBody');
    const listEmpty = document.getElementById('botListEmpty');
    const listCount = document.getElementById('botListCount');

    let ownerUser = null;
    let selectedCount = 10;
    let refreshTimer = null;

    function getCurrentUser() {
      try {
        return JSON.parse(localStorage.getItem('mc_current_user') || 'null');
      } catch (e) { return null; }
    }

    // ---- 数量选择器 ----
    function setupCountSelector() {
      const btns = document.querySelectorAll('.bot-count-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedCount = parseInt(btn.dataset.count) || 1;
        });
      });
      const active = document.querySelector('.bot-count-btn.active');
      if (active) selectedCount = parseInt(active.dataset.count) || 1;
    }
    setupCountSelector();

    // ---- 工具函数 ----
    function escapeHtml(str) {
      return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
    function formatUptime(sec) {
      if (sec == null) return '--';
      const m = Math.floor(sec / 60), s = sec % 60;
      return m > 0 ? (m + '分' + s + '秒') : (s + '秒');
    }
    function statusLabel(s) {
      const map = {
        connecting: '连接中', online: '已连接', active: '运行中',
        offline: '已离线', kicked: '被踢出', error: '错误',
      };
      return map[s] || s;
    }

    // ---- API 封装 ----
    async function api(path, options) {
      options = options || {};
      const headers = Object.assign({ 'x-bot-password': cfg.password }, options.headers || {});
      const res = await fetch(cfg.url + path, Object.assign({}, options, { headers }));
      if (!res.ok) {
        let msg = '请求失败 (' + res.status + ')';
        try { const j = await res.json(); if (j && j.error) msg = j.error; } catch (e) {}
        throw new Error(msg);
      }
      return res.json();
    }

    // ---- 健康检查 ----
    async function checkHealth() {
      try {
        const res = await fetch(cfg.url + '/api/health');
        const data = await res.json();
        if (badge) { badge.className = 'bot-server-badge online'; }
        if (statusText) statusText.textContent = '已连接';
        if (serverInfo) serverInfo.textContent = '目标: ' + data.mcServer + ' · 在线假人: ' + data.activeBots;
      } catch (e) {
        if (badge) { badge.className = 'bot-server-badge offline'; }
        if (statusText) statusText.textContent = '未连接';
        if (serverInfo) serverInfo.textContent = '请先启动后端: node bot-server/bot-server.js';
      }
    }

    // ---- 渲染假人列表 ----
    function renderBots(list) {
      list = list || [];
      if (listCount) listCount.textContent = list.length;
      if (!list.length) {
        if (table) table.style.display = 'none';
        if (listEmpty) listEmpty.style.display = 'block';
        return;
      }
      if (listEmpty) listEmpty.style.display = 'none';
      if (table) table.style.display = 'table';
      if (tbody) {
        tbody.innerHTML = list.map(b =>
          '<tr>' +
            '<td class="bot-cell-name">' + escapeHtml(b.username) + '</td>' +
            '<td><span class="bot-status-badge ' + b.status + '">' + statusLabel(b.status) + '</span></td>' +
            '<td class="bot-cell-action">' + escapeHtml(b.lastAction || '--') + '</td>' +
            '<td>' + (b.regDone ? '✅' : '⏳') + '</td>' +
            '<td>' + (b.loginDone ? '✅' : '⏳') + '</td>' +
            '<td>' + formatUptime(b.uptime) + '</td>' +
            '<td><button class="bot-stop-btn" data-id="' + b.id + '">停止</button></td>' +
          '</tr>'
        ).join('');
        tbody.querySelectorAll('.bot-stop-btn').forEach(btn => {
          btn.addEventListener('click', () => stopBot(btn.dataset.id));
        });
      }
    }

    // ---- 拉取状态 ----
    async function refreshStatus() {
      if (!ownerUser) return;
      try {
        const data = await api('/api/bots/status?username=' + encodeURIComponent(ownerUser));
        renderBots(data.bots || []);
      } catch (e) {
        if (window.showToast) window.showToast(e.message || '刷新失败', 'error');
      }
    }

    // ---- 启动假人 ----
    async function startBots() {
      if (!ownerUser) return;
      if (startBtn) startBtn.disabled = true;
      try {
        const data = await api('/api/bots/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: ownerUser, count: selectedCount }),
        });
        if (window.showToast) window.showToast(data.message || '已启动假人', 'success');
        refreshStatus();
      } catch (e) {
        if (window.showToast) window.showToast(e.message || '启动失败', 'error');
      } finally {
        if (startBtn) startBtn.disabled = false;
      }
    }

    // ---- 停止全部 ----
    async function stopAll() {
      if (!ownerUser) return;
      try {
        await api('/api/bots/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: ownerUser, botId: 'all' }),
        });
        if (window.showToast) window.showToast('已停止全部假人', 'success');
        refreshStatus();
      } catch (e) {
        if (window.showToast) window.showToast(e.message || '停止失败', 'error');
      }
    }

    // ---- 停止单个 ----
    async function stopBot(id) {
      if (!ownerUser) return;
      try {
        await api('/api/bots/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: ownerUser, botId: id }),
        });
        renderBots([]);
        refreshStatus();
      } catch (e) {
        if (window.showToast) window.showToast(e.message || '停止失败', 'error');
      }
    }

    // ---- 登录态切换 ----
    function applyLoginState() {
      const user = getCurrentUser();
      if (!user) {
        ownerUser = null;
        loginRequired.style.display = 'flex';
        panel.style.display = 'none';
        if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
        return;
      }
      ownerUser = user.id || user.username || user.email || 'unknown';
      loginRequired.style.display = 'none';
      panel.style.display = 'block';
      checkHealth();
      refreshStatus();
      if (!refreshTimer) {
        refreshTimer = setInterval(() => { if (ownerUser) refreshStatus(); }, cfg.autoRefresh || 5000);
      }
    }

    // ---- 事件绑定 ----
    if (startBtn) startBtn.addEventListener('click', startBots);
    if (stopAllBtn) stopAllBtn.addEventListener('click', stopAll);
    if (refreshBtn) refreshBtn.addEventListener('click', refreshStatus);
    window.addEventListener('mc-user-changed', applyLoginState);

    applyLoginState();
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
    // 第一轮新增功能
    initReadProgress();
    initTypewriter();
    initCountdowns();
    initCountUp();
    initLightbox();
    initServerStatus();
    // 第二轮新增功能
    initCaptcha();
    initVisitCounter();
    initKonamiCode();
    initPageSearch();
    initNotifyBell();
    initBotPanel();
  }, 100);
});

