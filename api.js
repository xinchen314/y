// ============================================================
// CraftVerse API 客户端
// 自动检测后端是否可用，不可用则回退到 localStorage
// ============================================================

const API = {
  baseURL: window.location.origin + '/api',
  token: localStorage.getItem('mc_api_token') || null,
  available: false,

  // -------- 初始化：检测后端 --------
  async init() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseURL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        this.available = true;
        console.log('[API] 后端连接成功');
        return true;
      }
    } catch (e) {
      // 后端不可用
    }
    console.log('[API] 后端不可用，使用 localStorage 模式');
    return false;
  },

  // -------- 请求封装 --------
  async request(method, path, body = null) {
    if (!this.available) throw new Error('API unavailable');

    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${this.baseURL}${path}`, opts);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || '请求失败');
    return data;
  },

  // -------- Auth API --------
  auth: {
    sendCode: (email) => API.request('POST', '/auth/send-code', { email, type: 'email' }),
    register: (username, email, code, password) =>
      API.request('POST', '/auth/register', { username, email, code, password }),
    login: (email, password) => API.request('POST', '/auth/login', { email, password }),
    phoneLogin: (phone, code) => API.request('POST', '/auth/phone-login', { phone, code }),
    me: () => API.request('GET', '/auth/me'),
    oauthMicrosoft: () => API.request('GET', '/auth/oauth/microsoft'),
    oauthQQ: () => API.request('GET', '/auth/oauth/qq'),
  },

  // -------- Ban API --------
  bans: {
    list: () => API.request('GET', '/bans'),
    create: (player, reason, adminPassword) =>
      API.request('POST', '/bans', { player, reason, adminPassword }),
    unban: (id, adminPassword) =>
      API.request('PATCH', `/bans/${id}/unban`, { adminPassword }),
    delete: (id, adminPassword) =>
      API.request('DELETE', `/bans/${id}`, { adminPassword }),
    stats: () => API.request('GET', '/bans/stats'),
  },

  // -------- 保存 token --------
  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('mc_api_token', token);
    else localStorage.removeItem('mc_api_token');
  },
};
