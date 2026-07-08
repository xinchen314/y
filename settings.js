// ============================================================
// CraftVerse MC 服务器官网 - 设置管理器
// 所有设置可在管理后台修改并自动存储到 localStorage
// ============================================================
// 数据流：
//   config.js (默认值) → 首次加载时复制到 localStorage
//   → 管理后台修改 → 自动写入 localStorage → 全站生效
// ============================================================

const SettingsManager = {
  STORAGE_KEY: 'mc_settings',

  // -------- 初始化：将 config.js 的默认值写入 localStorage --------
  init() {
    const stored = localStorage.getItem(this.STORAGE_KEY);

    // 支持 ?reset=1 查询参数强制刷新
    if (typeof window !== 'undefined' && window.location.search.includes('reset=1')) {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('[Settings] 检测到 ?reset=1，已清除存储的设置');
    }

    const stored2 = localStorage.getItem(this.STORAGE_KEY); // re-check after possible removal
    if (!stored2) {
      // 首次运行：保存默认配置
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(CONFIG));
      console.log('[Settings] 已加载默认配置');
    }
    // 确保密码字段始终同步（用户不会意外丢失密码）
    this._syncPassword();
    return this.getAll();
  },

  // -------- 确保管理员密码字段存在 --------
  _syncPassword() {
    const settings = this.getAll();
    if (!settings.admin || !settings.admin.password) {
      settings.admin = settings.admin || {};
      settings.admin.password = CONFIG.admin.password;
      this.save(settings);
    }
  },

  // -------- 获取所有设置 --------
  getAll() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        // 深度合并：用存储的值覆盖 CONFIG 默认值
        return this._deepMerge(JSON.parse(JSON.stringify(CONFIG)), JSON.parse(stored));
      }
    } catch (e) {
      console.warn('[Settings] 读取失败，使用默认配置', e);
    }
    return JSON.parse(JSON.stringify(CONFIG));
  },

  // -------- 获取单一路径的值（如 "server.name", "email.smtp.pass"）--------
  get(path) {
    const settings = this.getAll();
    return path.split('.').reduce((obj, key) => {
      if (obj && typeof obj === 'object' && key in obj) return obj[key];
      return undefined;
    }, settings);
  },

  // -------- 设置单一路径的值 --------
  set(path, value) {
    const settings = this.getAll();
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!(key in obj)) obj[key] = {};
      return obj[key];
    }, settings);
    target[lastKey] = value;
    this.save(settings);
    return value;
  },

  // -------- 保存完整设置对象 --------
  save(settings) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      this._notifyChange(settings);
      return true;
    } catch (e) {
      console.error('[Settings] 保存失败', e);
      return false;
    }
  },

  // -------- 批量更新（传入对象，自动合并）--------
  update(updates) {
    const settings = this.getAll();
    const merged = this._deepMerge(settings, updates);
    return this.save(merged);
  },

  // -------- 重置为默认配置 --------
  reset() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(CONFIG));
    this._notifyChange(CONFIG);
    return JSON.parse(JSON.stringify(CONFIG));
  },

  // -------- 触发设置变更事件 --------
  _notifyChange(settings) {
    // 触发表面更新（用于动态页面）
    window.dispatchEvent(new CustomEvent('settings-changed', { detail: settings }));
  },

  // -------- 深度合并（source 为基础，overrides 覆盖）--------
  _deepMerge(source, overrides) {
    const result = JSON.parse(JSON.stringify(source));
    for (const key in overrides) {
      if (overrides.hasOwnProperty(key)) {
        if (
          overrides[key] &&
          typeof overrides[key] === 'object' &&
          !Array.isArray(overrides[key]) &&
          result[key] &&
          typeof result[key] === 'object' &&
          !Array.isArray(result[key])
        ) {
          result[key] = this._deepMerge(result[key], overrides[key]);
        } else {
          result[key] = JSON.parse(JSON.stringify(overrides[key]));
        }
      }
    }
    return result;
  },

  // -------- 便捷：获取用于显示的配置值（隐藏敏感信息）--------
  getDisplayValue(path) {
    const value = this.get(path);
    if (typeof value === 'string' && path.includes('password')) {
      return value.substring(0, 3) + '••••' + value.substring(value.length - 2);
    }
    if (typeof value === 'string' && path.includes('pass')) {
      return value.substring(0, 4) + '•••••';
    }
    if (typeof value === 'string' && path.includes('apiKey')) {
      return value.substring(0, 4) + '•••••';
    }
    return value;
  }
};

// -------- 页面加载时自动初始化 --------
(function initOnLoad() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SettingsManager.init());
  } else {
    SettingsManager.init();
  }
})();
