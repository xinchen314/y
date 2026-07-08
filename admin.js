// ============================================================
// CraftVerse MC 服务器官网 - 管理后台脚本
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // -------- 从 SettingsManager 获取 --------
  function getCfg(path) { return SettingsManager.get(path); }

  // ======== 管理员密码验证 ========
  const passwordOverlay = document.getElementById('passwordOverlay');
  const passwordInput = document.getElementById('adminPassword');
  const passwordSubmit = document.getElementById('passwordSubmit');
  const passwordError = document.getElementById('passwordError');
  const adminContent = document.getElementById('adminContent');

  if (sessionStorage.getItem('admin_verified') === 'true') {
    passwordOverlay?.classList.add('hidden');
    adminContent?.classList.remove('hidden');
  }

  passwordSubmit?.addEventListener('click', () => {
    const pwd = passwordInput.value.trim();
    const correctPwd = getCfg('admin.password');
    if (pwd === correctPwd) {
      passwordError.style.display = 'none';
      passwordOverlay.classList.add('hidden');
      adminContent.classList.remove('hidden');
      sessionStorage.setItem('admin_verified', 'true');
      loadAllAdminData();
    } else {
      passwordError.textContent = '密码错误，请重试';
      passwordError.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
  passwordInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') passwordSubmit.click();
  });

  // ======== 导航切换 ========
  const navItems = document.querySelectorAll('.admin-nav-item');
  const pages = document.querySelectorAll('.admin-page');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      pages.forEach(p => { p.style.display = p.id === page ? 'block' : 'none'; });
      // 切换到设置页时刷新表单
      if (page === 'page-settings') {
        populateSettingsForm();
        populateServerForm();
        populateEmailForm();
        populateApiForm();
      }
      // 切换到内容管理时加载编辑器
      if (page === 'page-content') {
        loadContentEditor();
      }
    });
  });

  // ======== 加载所有后台数据 ========
  function loadAllAdminData() {
    loadBanTable();
    loadStats();
    loadServerInfo();
    loadConfigInfo();
    loadUsers();
    populateSettingsForm();
    populateServerForm();
    populateEmailForm();
    populateApiForm();
  }

  // ======== 封禁列表管理 ========
  function loadBanTable() {
    const tbody = document.getElementById('adminBanTableBody');
    if (!tbody) return;
    const bans = JSON.parse(localStorage.getItem('mc_bans') || '[]');
    if (bans.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#8892B0;padding:40px;">暂无封禁记录</td></tr>`;
      return;
    }
    tbody.innerHTML = bans.map((b, i) => `
      <tr>
        <td>${b.player}</td>
        <td>${b.reason}</td>
        <td>${b.date}</td>
        <td><span class="status-${b.status === '封禁中' ? 'banned' : 'unbanned'}">${b.status}</span></td>
        <td>
          <div class="actions">
            ${b.status === '封禁中' ? `<button class="btn btn-sm btn-outline" onclick="unbanPlayer(${i})">解封</button>` : ''}
            <button class="btn btn-sm btn-danger" onclick="deleteBan(${i})">删除</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // 添加封禁
  const addBanForm = document.getElementById('addBanForm');
  addBanForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const player = document.getElementById('banPlayer').value.trim();
    const reason = document.getElementById('banReason').value.trim();
    if (!player || !reason) { showToast('请填写玩家名和封禁原因', 'error'); return; }
    const bans = JSON.parse(localStorage.getItem('mc_bans') || '[]');
    bans.push({ player, reason, date: new Date().toISOString().split('T')[0], status: '封禁中' });
    localStorage.setItem('mc_bans', JSON.stringify(bans));
    addBanForm.reset();
    loadBanTable();
    loadStats();
    showToast(`已封禁玩家 ${player}`, 'success');
  });

  window.unbanPlayer = function(index) {
    const bans = JSON.parse(localStorage.getItem('mc_bans') || '[]');
    if (bans[index]) {
      bans[index].status = '已解封';
      bans[index].unbanDate = new Date().toISOString().split('T')[0];
      localStorage.setItem('mc_bans', JSON.stringify(bans));
      loadBanTable();
      showToast(`已解封玩家 ${bans[index].player}`, 'info');
    }
  };

  window.deleteBan = function(index) {
    if (!confirm('确定要删除这条封禁记录吗？')) return;
    const bans = JSON.parse(localStorage.getItem('mc_bans') || '[]');
    if (bans[index]) {
      const name = bans[index].player;
      bans.splice(index, 1);
      localStorage.setItem('mc_bans', JSON.stringify(bans));
      loadBanTable();
      showToast(`已删除 ${name} 的封禁记录`, 'success');
    }
  };

  // ======== 统计数据 ========
  function loadStats() {
    const users = JSON.parse(localStorage.getItem('mc_users') || '[]');
    const bans = JSON.parse(localStorage.getItem('mc_bans') || '[]');
    const activeBans = bans.filter(b => b.status === '封禁中').length;
    document.getElementById('statTotalUsers').textContent = users.length || 0;
    document.getElementById('statTotalBans').textContent = bans.length || 0;
    document.getElementById('statActiveBans').textContent = activeBans || 0;
    document.getElementById('statOnline').textContent = getCfg('server.playerOnline') || 0;
  }

  // ======== 用户管理 ========
  function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    const users = JSON.parse(localStorage.getItem('mc_users') || '[]');
    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#8892B0;padding:40px;">暂无注册用户</td></tr>`;
      return;
    }
    tbody.innerHTML = users.map((u, i) => `
      <tr><td>${u.username}</td><td>${u.email}</td><td>${new Date(u.registeredAt).toLocaleDateString('zh-CN')}</td><td><button class="btn btn-sm btn-danger" onclick="deleteUser(${i})">删除</button></td></tr>
    `).join('');
  }

  window.deleteUser = function(index) {
    if (!confirm('确定要删除该用户吗？')) return;
    const users = JSON.parse(localStorage.getItem('mc_users') || '[]');
    if (users[index]) {
      users.splice(index, 1);
      localStorage.setItem('mc_users', JSON.stringify(users));
      loadUsers();
      loadStats();
      showToast('用户已删除', 'success');
    }
  };

  // ======== 服务器信息显示 ========
  function loadServerInfo() {
    const infoEl = document.getElementById('serverInfo');
    if (!infoEl) return;
    const s = getCfg('server');
    const addrs = (s.addresses || []).map(a => `${a.label}: ${a.address}`).join('<br>');
    infoEl.innerHTML = `
      <div class="config-section"><div class="config-label">服务器名称</div><div class="config-value">${s.name}</div></div>
      <div class="config-section"><div class="config-label">服务器地址</div><div class="config-value">${addrs || s.ip}</div></div>
      <div class="config-section"><div class="config-label">Minecraft 版本</div><div class="config-value">${s.version}</div></div>
      <div class="config-section"><div class="config-label">在线人数</div><div class="config-value">${s.playerOnline}</div></div>
      <div class="config-section"><div class="config-label">描述</div><div class="config-value">${s.description}</div></div>
      <div class="config-section"><div class="config-label">服务器图标</div><div class="config-value">将图标文件放入 assets/images/，路径在「网站设置」中配置</div></div>
    `;
  }

  // ======== 配置总览显示 ========
  function loadConfigInfo() {
    const configEl = document.getElementById('configInfo');
    if (!configEl) return;
    const adminPwd = getCfg('admin.password');
    const smtp = getCfg('email.smtp');
    const api = getCfg('banApi');
    configEl.innerHTML = `
      <div class="config-section">
        <div class="config-label">管理员密码</div>
        <div class="config-value" style="color:var(--accent-gold);font-family:var(--font-mono);font-size:15px;">
          ${adminPwd.substring(0, 8)}...（可在「网站设置」中修改）
        </div>
      </div>
      <div class="config-section">
        <div class="config-label">QQ 邮箱 SMTP</div>
        <div class="config-value">服务器: ${smtp.host}:${smtp.port}<br>账号: ${smtp.user}<br><span style="color:var(--accent-gold);">→ 可在「邮箱配置」中修改</span></div>
      </div>
      <div class="config-section">
        <div class="config-label">封禁列表 API</div>
        <div class="config-value">模式: ${api.mode === 'local' ? '本地存储' : '远程 API'}<br>可在「API 配置」中切换和修改</div>
      </div>
      <div style="background:#1a1f35;border-radius:var(--radius-sm);padding:16px;margin-top:8px;">
        <div class="config-label" style="color:var(--accent-gold);">★ 所有设置可编辑</div>
        <div class="config-value">所有配置都可直接在后台「网站设置」「邮箱配置」「API 配置」页面修改，修改后自动保存到浏览器本地存储，刷新页面后生效。</div>
      </div>
    `;
  }

  // ======== 网站设置表单 ========
  function populateSettingsForm() {
    const s = getCfg('server');
    document.getElementById('set_serverName').value = s.name;
    document.getElementById('set_serverVersion').value = s.version;
    document.getElementById('set_serverTagline').value = s.tagline;
    document.getElementById('set_serverDesc').value = s.description;
    document.getElementById('set_playerOnline').value = s.playerOnline;
    document.getElementById('set_totalPlayers').value = s.totalPlayers;
    document.getElementById('set_uptimeRate').value = s.uptimeRate;
    document.getElementById('set_stableDays').value = s.stableDays;
    document.getElementById('set_adminPassword').value = '';
    document.getElementById('adminPasswordStatus').style.display = 'none';
    renderAddressEditor();
  }

  // -------- 多地址编辑器 --------
  function renderAddressEditor() {
    const container = document.getElementById('addressesEditor');
    if (!container) return;
    const addresses = getCfg('server.addresses') || [];
    container.innerHTML = addresses.map((a, i) => `
      <div class="admin-form-row" style="align-items:center;background:#131726;border-radius:6px;padding:12px;">
        <div class="form-group" style="flex:0.3;">
          <input type="text" class="form-input addr-label" value="${a.label}" placeholder="标签（如 Java 版）" data-idx="${i}">
        </div>
        <div class="form-group" style="flex:0.5;">
          <input type="text" class="form-input addr-address" value="${a.address}" placeholder="地址" data-idx="${i}">
        </div>
        <button class="btn btn-sm btn-danger" onclick="removeAddressRow(${i})" style="flex:0;padding:8px 12px;">✕</button>
      </div>
    `).join('');
  }

  // 添加地址行
  window.addAddressRow = function() {
    const addr = getCfg('server.addresses') || [];
    addr.push({ label: '新地址', address: '' });
    SettingsManager.set('server.addresses', addr);
    renderAddressEditor();
    showToast('已添加新地址行', 'info');
  };

  // 删除地址行
  window.removeAddressRow = function(index) {
    const addr = getCfg('server.addresses') || [];
    addr.splice(index, 1);
    SettingsManager.set('server.addresses', addr);
    renderAddressEditor();
    showToast('已删除地址', 'info');
  };

  // 保存网站设置
  document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    // 收集地址编辑器的数据
    const addrLabels = document.querySelectorAll('#addressesEditor .addr-label');
    const addrAddrs = document.querySelectorAll('#addressesEditor .addr-address');
    const addresses = [];
    addrLabels.forEach((el, i) => {
      const label = el.value.trim();
      const addr = addrAddrs[i]?.value.trim();
      if (addr) addresses.push({ label: label || '地址 ' + (i + 1), address: addr });
    });

    const updates = {
      server: {
        name: document.getElementById('set_serverName').value.trim(),
        ip: addresses.length > 0 ? addresses[0].address : '',
        addresses: addresses,
        version: document.getElementById('set_serverVersion').value.trim(),
        tagline: document.getElementById('set_serverTagline').value.trim(),
        description: document.getElementById('set_serverDesc').value.trim(),
        playerOnline: parseInt(document.getElementById('set_playerOnline').value) || 0,
        totalPlayers: parseInt(document.getElementById('set_totalPlayers').value) || 0,
        uptimeRate: document.getElementById('set_uptimeRate').value.trim(),
        stableDays: parseInt(document.getElementById('set_stableDays').value) || 0,
      }
    };

    // 如果修改了管理员密码
    const newPwd = document.getElementById('set_adminPassword').value.trim();
    if (newPwd) {
      updates.admin = { password: newPwd };
      document.getElementById('adminPasswordStatus').textContent = '✅ 密码已更新！请使用新密码重新登录';
      document.getElementById('adminPasswordStatus').style.display = 'block';
    }

    SettingsManager.update(updates);
    showToast('网站设置已保存 ✓', 'success');
    loadServerInfo();
    loadStats();
  });

  // ======== 邮箱配置表单 ========
  function populateEmailForm() {
    const smtp = getCfg('email.smtp');
    document.getElementById('set_smtpHost').value = smtp.host;
    document.getElementById('set_smtpPort').value = smtp.port;
    document.getElementById('set_smtpUser').value = smtp.user;
    document.getElementById('set_smtpPass').value = smtp.pass !== 'your_smtp_key' ? smtp.pass : '';
    document.getElementById('set_smtpPass').placeholder = smtp.pass !== 'your_smtp_key' ? '已配置（输入以修改）' : '输入 QQ 邮箱 SMTP 授权码';
    document.getElementById('set_codeExpire').value = getCfg('email.verifyCodeExpire');
    document.getElementById('emailStatus').style.display = 'none';
  }

  document.getElementById('saveEmailBtn')?.addEventListener('click', () => {
    const pass = document.getElementById('set_smtpPass').value.trim();
    const updates = {
      email: {
        smtp: {
          host: document.getElementById('set_smtpHost').value.trim(),
          port: parseInt(document.getElementById('set_smtpPort').value) || 465,
          user: document.getElementById('set_smtpUser').value.trim(),
          pass: pass || getCfg('email.smtp.pass'),
        },
        verifyCodeExpire: parseInt(document.getElementById('set_codeExpire').value) || 300,
      }
    };
    SettingsManager.update(updates);
    document.getElementById('emailStatus').textContent = '✅ 邮箱配置已保存！';
    document.getElementById('emailStatus').style.display = 'block';
    showToast('邮箱配置已保存 ✓', 'success');
  });

  // ======== API 配置表单 ========
  function populateApiForm() {
    const api = getCfg('banApi');
    document.querySelectorAll('input[name="apiMode"]').forEach(r => {
      r.checked = r.value === api.mode;
    });
    document.getElementById('set_apiEndpoint').value = api.endpoint;
    document.getElementById('set_apiKey').value = api.apiKey !== 'your_api_key_here' ? api.apiKey : '';
    document.getElementById('set_apiKey').placeholder = api.apiKey !== 'your_api_key_here' ? '已配置（输入以修改）' : '输入 API 密钥';
    document.getElementById('apiStatus').style.display = 'none';
  }

  document.getElementById('saveApiBtn')?.addEventListener('click', () => {
    const mode = document.querySelector('input[name="apiMode"]:checked')?.value || 'local';
    const keyInput = document.getElementById('set_apiKey').value.trim();
    const updates = {
      banApi: {
        mode,
        endpoint: document.getElementById('set_apiEndpoint').value.trim(),
        apiKey: keyInput || getCfg('banApi.apiKey'),
      }
    };
    SettingsManager.update(updates);
    document.getElementById('apiStatus').textContent = '✅ API 配置已保存！当前模式：' + (mode === 'local' ? '本地存储' : '远程 API');
    document.getElementById('apiStatus').style.display = 'block';
    showToast('API 配置已保存 ✓', 'success');
  });

  // ======== 内容管理 ========
  function loadContentEditor() {
    const area = document.getElementById('contentEditorArea');
    if (!area) return;

    // 构建所有可编辑内容卡片
    area.innerHTML = `
      ${renderFeaturesCard()}
      ${renderAnnouncementsCard()}
      ${renderTeamCard()}
      ${renderRulesCard()}
      ${renderTimelineCard()}
      ${renderFAQCard()}
      ${renderVoteSitesCard()}
      ${renderGameModesCard()}
      ${renderGalleryCard()}
    `;
  }

  function toggleCard(headerEl) {
    const body = headerEl.parentElement.querySelector('.card-body');
    if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
  }

  // -------- 特色 Features --------
  function renderFeaturesCard() {
    const items = getCfg('features') || [];
    return `
      <div class="admin-card">
        <div class="admin-card-title" style="cursor:pointer;user-select:none;" onclick="toggleCard(this)">
          ⛏️ 网站特色 (${items.length}) <span style="font-size:12px;color:var(--text-secondary);">点击展开/收起</span>
        </div>
        <div class="card-body">
          ${items.map((item, i) => `
            <div class="content-item" style="background:#131726;border-radius:6px;padding:12px;margin-bottom:8px;">
              <div class="admin-form-row">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">图标 (emoji)</label>
                  <input type="text" class="form-input feat-icon" value="${item.icon}" data-idx="${i}" style="width:60px;">
                </div>
                <div class="form-group" style="flex:2;">
                  <label class="form-label">标题</label>
                  <input type="text" class="form-input feat-title" value="${item.title}" data-idx="${i}">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">描述</label>
                <textarea class="form-input feat-desc" data-idx="${i}" rows="2">${item.desc}</textarea>
              </div>
              <button class="btn btn-sm btn-danger" onclick="removeContentItem('features',${i})">✕ 删除</button>
            </div>
          `).join('')}
          <button class="btn btn-sm btn-secondary" onclick="addContentItem('features')" style="margin-top:4px;">➕ 添加特色</button>
        </div>
      </div>`;
  }

  function renderAnnouncementsCard() {
    const items = getCfg('announcements') || [];
    return `
      <div class="admin-card">
        <div class="admin-card-title" style="cursor:pointer;user-select:none;" onclick="toggleCard(this)">
          📢 服务器公告 (${items.length}) <span style="font-size:12px;color:var(--text-secondary);">点击展开/收起</span>
        </div>
        <div class="card-body">
          ${items.map((item, i) => `
            <div class="content-item" style="background:#131726;border-radius:6px;padding:12px;margin-bottom:8px;">
              <div class="form-group">
                <label class="form-label">日期</label>
                <input type="text" class="form-input ann-date" value="${item.date}" data-idx="${i}" placeholder="2026.07.01">
              </div>
              <div class="form-group">
                <label class="form-label">标题</label>
                <input type="text" class="form-input ann-title" value="${item.title}" data-idx="${i}">
              </div>
              <div class="form-group">
                <label class="form-label">内容</label>
                <textarea class="form-input ann-content" data-idx="${i}" rows="2">${item.content}</textarea>
              </div>
              <button class="btn btn-sm btn-danger" onclick="removeContentItem('announcements',${i})">✕ 删除</button>
            </div>
          `).join('')}
          <button class="btn btn-sm btn-secondary" onclick="addContentItem('announcements')" style="margin-top:4px;">➕ 添加公告</button>
        </div>
      </div>`;
  }

  function renderTeamCard() {
    const items = getCfg('team') || [];
    return `
      <div class="admin-card">
        <div class="admin-card-title" style="cursor:pointer;user-select:none;" onclick="toggleCard(this)">
          👥 管理团队 (${items.length}) <span style="font-size:12px;color:var(--text-secondary);">点击展开/收起</span>
        </div>
        <div class="card-body">
          ${items.map((item, i) => `
            <div class="content-item" style="background:#131726;border-radius:6px;padding:12px;margin-bottom:8px;">
              <div class="admin-form-row">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">名称</label>
                  <input type="text" class="form-input team-name" value="${item.name}" data-idx="${i}">
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">职位</label>
                  <input type="text" class="form-input team-role" value="${item.role}" data-idx="${i}">
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">头像路径</label>
                  <input type="text" class="form-input team-avatar" value="${item.avatar}" data-idx="${i}" placeholder="留空用首字母">
                </div>
              </div>
              <button class="btn btn-sm btn-danger" onclick="removeContentItem('team',${i})">✕ 删除</button>
            </div>
          `).join('')}
          <button class="btn btn-sm btn-secondary" onclick="addContentItem('team')" style="margin-top:4px;">➕ 添加成员</button>
        </div>
      </div>`;
  }

  function renderRulesCard() {
    const items = getCfg('rules') || [];
    return `
      <div class="admin-card">
        <div class="admin-card-title" style="cursor:pointer;user-select:none;" onclick="toggleCard(this)">
          📜 服务器规则 (${items.length}) <span style="font-size:12px;color:var(--text-secondary);">点击展开/收起</span>
        </div>
        <div class="card-body">
          ${items.map((item, i) => `
            <div class="content-item" style="background:#131726;border-radius:6px;padding:12px;margin-bottom:8px;display:flex;gap:8px;align-items:center;">
              <span style="color:var(--accent-gold);font-weight:700;font-size:16px;">${i+1}.</span>
              <textarea class="form-input rule-text" data-idx="${i}" rows="1" style="flex:1;">${item}</textarea>
              <button class="btn btn-sm btn-danger" onclick="removeContentItem('rules',${i})">✕</button>
            </div>
          `).join('')}
          <button class="btn btn-sm btn-secondary" onclick="addContentItem('rules')" style="margin-top:4px;">➕ 添加规则</button>
        </div>
      </div>`;
  }

  function renderTimelineCard() {
    const items = getCfg('timeline') || [];
    return `
      <div class="admin-card">
        <div class="admin-card-title" style="cursor:pointer;user-select:none;" onclick="toggleCard(this)">
          📅 发展历程 (${items.length}) <span style="font-size:12px;color:var(--text-secondary);">点击展开/收起</span>
        </div>
        <div class="card-body">
          ${items.map((item, i) => `
            <div class="content-item" style="background:#131726;border-radius:6px;padding:12px;margin-bottom:8px;">
              <div class="admin-form-row">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">日期</label>
                  <input type="text" class="form-input tl-date" value="${item.date}" data-idx="${i}" placeholder="2026.03">
                </div>
                <div class="form-group" style="flex:2;">
                  <label class="form-label">标题</label>
                  <input type="text" class="form-input tl-title" value="${item.title}" data-idx="${i}">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">描述</label>
                <textarea class="form-input tl-desc" data-idx="${i}" rows="2">${item.desc}</textarea>
              </div>
              <button class="btn btn-sm btn-danger" onclick="removeContentItem('timeline',${i})">✕ 删除</button>
            </div>
          `).join('')}
          <button class="btn btn-sm btn-secondary" onclick="addContentItem('timeline')" style="margin-top:4px;">➕ 添加事件</button>
        </div>
      </div>`;
  }

  function renderFAQCard() {
    const items = getCfg('faq') || [];
    return `
      <div class="admin-card">
        <div class="admin-card-title" style="cursor:pointer;user-select:none;" onclick="toggleCard(this)">
          ❓ 常见问题 FAQ (${items.length}) <span style="font-size:12px;color:var(--text-secondary);">点击展开/收起</span>
        </div>
        <div class="card-body">
          ${items.map((item, i) => `
            <div class="content-item" style="background:#131726;border-radius:6px;padding:12px;margin-bottom:8px;">
              <div class="form-group">
                <label class="form-label">问题</label>
                <input type="text" class="form-input faq-q" value="${item.q}" data-idx="${i}">
              </div>
              <div class="form-group">
                <label class="form-label">回答</label>
                <textarea class="form-input faq-a" data-idx="${i}" rows="2">${item.a}</textarea>
              </div>
              <button class="btn btn-sm btn-danger" onclick="removeContentItem('faq',${i})">✕ 删除</button>
            </div>
          `).join('')}
          <button class="btn btn-sm btn-secondary" onclick="addContentItem('faq')" style="margin-top:4px;">➕ 添加问答</button>
        </div>
      </div>`;
  }

  function renderVoteSitesCard() {
    const items = getCfg('voteSites') || [];
    return `
      <div class="admin-card">
        <div class="admin-card-title" style="cursor:pointer;user-select:none;" onclick="toggleCard(this)">
          🗳️ 投票站点 (${items.length}) <span style="font-size:12px;color:var(--text-secondary);">点击展开/收起</span>
        </div>
        <div class="card-body">
          ${items.map((item, i) => `
            <div class="content-item" style="background:#131726;border-radius:6px;padding:12px;margin-bottom:8px;">
              <div class="admin-form-row">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">名称</label>
                  <input type="text" class="form-input vote-name" value="${item.name}" data-idx="${i}">
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">图标</label>
                  <input type="text" class="form-input vote-icon" value="${item.icon}" data-idx="${i}" style="width:60px;">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">描述</label>
                <textarea class="form-input vote-desc" data-idx="${i}" rows="2">${item.desc}</textarea>
              </div>
              <div class="form-group">
                <label class="form-label">链接 URL</label>
                <input type="text" class="form-input vote-url" value="${item.url}" data-idx="${i}">
              </div>
              <button class="btn btn-sm btn-danger" onclick="removeContentItem('voteSites',${i})">✕ 删除</button>
            </div>
          `).join('')}
          <button class="btn btn-sm btn-secondary" onclick="addContentItem('voteSites')" style="margin-top:4px;">➕ 添加站点</button>
        </div>
      </div>`;
  }

  function renderGameModesCard() {
    const items = getCfg('gameModes') || [];
    return `
      <div class="admin-card">
        <div class="admin-card-title" style="cursor:pointer;user-select:none;" onclick="toggleCard(this)">
          🎮 游戏模式 (${items.length}) <span style="font-size:12px;color:var(--text-secondary);">点击展开/收起</span>
        </div>
        <div class="card-body">
          ${items.map((item, i) => `
            <div class="content-item" style="background:#131726;border-radius:6px;padding:12px;margin-bottom:8px;">
              <div class="admin-form-row">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">名称</label>
                  <input type="text" class="form-input gm-name" value="${item.name}" data-idx="${i}">
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">图标</label>
                  <input type="text" class="form-input gm-icon" value="${item.icon}" data-idx="${i}" style="width:60px;">
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">标识</label>
                  <input type="text" class="form-input gm-id" value="${item.id}" data-idx="${i}" placeholder="英文标识">
                </div>
              </div>
              <div class="admin-form-row">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">在线人数</label>
                  <input type="number" class="form-input gm-players" value="${item.players}" data-idx="${i}">
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">评分</label>
                  <input type="number" class="form-input gm-rating" value="${item.rating}" data-idx="${i}" step="0.1" min="0" max="5">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">描述</label>
                <textarea class="form-input gm-desc" data-idx="${i}" rows="2">${item.desc}</textarea>
              </div>
              <button class="btn btn-sm btn-danger" onclick="removeContentItem('gameModes',${i})">✕ 删除</button>
            </div>
          `).join('')}
          <button class="btn btn-sm btn-secondary" onclick="addContentItem('gameModes')" style="margin-top:4px;">➕ 添加模式</button>
        </div>
      </div>`;
  }

  function renderGalleryCard() {
    const items = getCfg('gallery') || [];
    return `
      <div class="admin-card">
        <div class="admin-card-title" style="cursor:pointer;user-select:none;" onclick="toggleCard(this)">
          🖼️ 图库 (${items.length}) <span style="font-size:12px;color:var(--text-secondary);">点击展开/收起</span>
        </div>
        <div class="card-body">
          ${items.map((item, i) => `
            <div class="content-item" style="background:#131726;border-radius:6px;padding:12px;margin-bottom:8px;">
              <div class="admin-form-row">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">标签</label>
                  <input type="text" class="form-input gal-label" value="${item.label}" data-idx="${i}">
                </div>
                <div class="form-group" style="flex:2;">
                  <label class="form-label">图片路径</label>
                  <input type="text" class="form-input gal-image" value="${item.image}" data-idx="${i}" placeholder="assets/images/xxx.jpg">
                </div>
              </div>
              <button class="btn btn-sm btn-danger" onclick="removeContentItem('gallery',${i})">✕ 删除</button>
            </div>
          `).join('')}
          <button class="btn btn-sm btn-secondary" onclick="addContentItem('gallery')" style="margin-top:4px;">➕ 添加图片</button>
        </div>
      </div>`;
  }

  // -------- 通用添加/删除 --------
  const contentDefaults = {
    features: { icon: '⭐', title: '新特色', desc: '描述文字' },
    announcements: { date: new Date().toISOString().split('T')[0].replace(/-/g,'.'), title: '新公告', content: '公告内容' },
    team: { name: '新成员', role: '职位', avatar: '' },
    rules: '新规则内容',
    timeline: { date: '2026.07', title: '新事件', desc: '事件描述' },
    faq: { q: '新问题', a: '回答内容' },
    voteSites: { name: '新站点', icon: '🌐', desc: '站点描述', url: '#' },
    gameModes: { id: 'newmode', name: '新模式', icon: '🎮', desc: '模式描述', players: 0, rating: 4.5 },
    gallery: { label: '新图片', image: 'assets/images/placeholder.jpg' },
  };

  window.addContentItem = function(key) {
    const items = getCfg(key) || [];
    const defaults = contentDefaults[key];
    if (defaults) {
      items.push(JSON.parse(JSON.stringify(defaults)));
      SettingsManager.set(key, items);
      loadContentEditor();
    }
  };

  window.removeContentItem = function(key, index) {
    if (!confirm('确定要删除此项吗？')) return;
    const items = getCfg(key) || [];
    items.splice(index, 1);
    SettingsManager.set(key, items);
    loadContentEditor();
  };

  // -------- 收集并保存所有内容 --------
  function collectContentItems(key, selectors) {
    const items = [];
    // 按 data-idx 排序
    const firstSelector = selectors[0];
    const elements = document.querySelectorAll(firstSelector);
    const count = elements.length;
    for (let i = 0; i < count; i++) {
      const item = {};
      for (const sel of selectors) {
        const el = document.querySelector(sel + `[data-idx="${i}"]`);
        if (el) {
          if (key === 'rules') {
            items.push(el.value);
            continue;
          }
          // 驼峰转对象属性
          const propMap = {
            'feat-icon': 'icon', 'feat-title': 'title', 'feat-desc': 'desc',
            'ann-date': 'date', 'ann-title': 'title', 'ann-content': 'content',
            'team-name': 'name', 'team-role': 'role', 'team-avatar': 'avatar',
            'rule-text': '',
            'tl-date': 'date', 'tl-title': 'title', 'tl-desc': 'desc',
            'faq-q': 'q', 'faq-a': 'a',
            'vote-name': 'name', 'vote-icon': 'icon', 'vote-desc': 'desc', 'vote-url': 'url',
            'gm-name': 'name', 'gm-icon': 'icon', 'gm-id': 'id', 'gm-players': 'players', 'gm-rating': 'rating', 'gm-desc': 'desc',
            'gal-label': 'label', 'gal-image': 'image',
          };
          const prop = propMap[sel.split('.').pop().split(' ')[0]];
          if (prop) item[prop] = el.value;
        }
      }
      if (key !== 'rules') items.push(item);
    }
    return items;
  }

  window.saveAllContent = function() {
    const updates = {};

    const sections = {
      features: ['.feat-icon', '.feat-title', '.feat-desc'],
      announcements: ['.ann-date', '.ann-title', '.ann-content'],
      team: ['.team-name', '.team-role', '.team-avatar'],
      rules: ['.rule-text'],
      timeline: ['.tl-date', '.tl-title', '.tl-desc'],
      faq: ['.faq-q', '.faq-a'],
      voteSites: ['.vote-name', '.vote-icon', '.vote-desc', '.vote-url'],
      gameModes: ['.gm-name', '.gm-icon', '.gm-id', '.gm-players', '.gm-rating', '.gm-desc'],
      gallery: ['.gal-label', '.gal-image'],
    };

    for (const [key, selectors] of Object.entries(sections)) {
      updates[key] = collectContentItems(key, selectors);
    }

    SettingsManager.update(updates);
    showToast('✅ 所有内容已保存！刷新首页即可看到变化', 'success');
  };

  window.clearAllData = function() {
    if (!confirm('确定要清除所有本地数据吗？包括用户、封禁记录、所有设置。此操作不可逆！')) return;
    if (!confirm('再次确认：所有数据将被永久删除！')) return;
    localStorage.removeItem('mc_users');
    localStorage.removeItem('mc_bans');
    localStorage.removeItem('mc_current_user');
    localStorage.removeItem('mc_settings'); // 清除设置
    loadAllAdminData();
    showToast('所有本地数据已清除', 'success');
  };

  // ======== 退出登录 ========
  window.adminLogout = function() {
    sessionStorage.removeItem('admin_verified');
    location.reload();
  };

  // ======== 重置为默认配置 ========
  window.resetSettings = function() {
    if (!confirm('确定要重置所有设置为默认值吗？')) return;
    SettingsManager.reset();
    showToast('已重置为默认配置', 'success');
    loadAllAdminData();
  };

  // ======== Toast ========
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  window.showToast = showToast;

  // 安全提醒
  console.log('%c⚠️ 安全提醒', 'font-size:24px;font-weight:bold;color:#FF4757;');
  console.log('%c管理员密码、QQ邮箱授权码、API密钥等敏感信息存储在浏览器 localStorage 中。', 'font-size:14px;color:#8892B0;');
  console.log('%c请勿在浏览器控制台中输入不可信的代码。', 'font-size:14px;color:#8892B0;');
});
