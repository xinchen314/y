const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'craftverse.db');
const dbDir = path.dirname(dbPath);

let db = null;
let dbReady = false;

// 初始化数据库（异步，因为 sql.js 是 WASM）
async function initDatabase() {
  if (db) return db;

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // 明确指定 sql.js WASM 路径，避免自动查找失败
  let SQL;
  try {
    SQL = require('sql.js');
    // 如果 require 返回的是工厂函数（新版本 sql.js 行为），调用它
    if (typeof SQL === 'function') {
      SQL = await SQL({
        locateFile: file => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file)
      });
    } else if (typeof SQL === 'object' && typeof SQL.default === 'function') {
      SQL = await SQL.default({
        locateFile: file => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file)
      });
    }
  } catch (initErr) {
    console.error('[DB] sql.js WASM 初始化失败:', initErr.message);
    console.error('[DB] 尝试降级到内存数据库模式...');

    // 创建一个最简单的内存兼容对象
    db = createFallbackDb();
    dbReady = true;
    console.log('[DB] ⚠️ 已降级到内存数据库（数据不会持久化）');
    return db;
  }

  // 尝试从文件加载已有数据库
  let buffer = null;
  if (fs.existsSync(dbPath)) {
    try {
      buffer = fs.readFileSync(dbPath);
    } catch (readErr) {
      console.warn('[DB] 读取数据库文件失败，使用空数据库:', readErr.message);
    }
  }

  db = new SQL.Database(buffer);

  // 建表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      password TEXT,
      provider TEXT DEFAULT 'email',
      provider_id TEXT,
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS verify_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target TEXT NOT NULL,
      code TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'email',
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player TEXT NOT NULL,
      reason TEXT NOT NULL,
      banned_by TEXT,
      status TEXT DEFAULT '封禁中',
      ban_date TEXT DEFAULT (datetime('now')),
      unban_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // 保存到文件
  saveDb();

  dbReady = true;
  console.log('[DB] 数据库初始化完成');
  return db;
}

// 保存数据库到文件
function saveDb() {
  if (!db || !dbReady) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (e) {
    console.warn('[DB] 保存数据库文件失败:', e.message);
  }
}

function isReady() {
  return dbReady && db !== null;
}

// -------- 降级内存数据库（当 sql.js WASM 加载失败时使用）--------
function createFallbackDb() {
  const store = {
    users: [],
    verify_codes: [],
    bans: [],
    settings: [],
  };

  return {
    run: (sql, params) => {
      // 简单解析 SQL 语句类型
      const upper = sql.trim().toUpperCase();
      if (upper.startsWith('CREATE TABLE')) return;
      console.log('[DB-FALLBACK] run:', sql.slice(0, 60), params);
    },
    exec: (sql) => {
      console.log('[DB-FALLBACK] exec:', sql.slice(0, 60));
      return [];
    },
    prepare: () => ({ bind: () => {}, step: () => false, get: () => [], free: () => {}, getColumnNames: () => [] }),
    export: () => Buffer.from(''),
  };
}

// -------- 包装的查询方法（兼容 better-sqlite3 风格）--------

function prepare(sql) {
  if (!db) { console.warn('[DB] 数据库未初始化'); return { bind: () => {}, step: () => false, get: () => [], free: () => {}, getColumnNames: () => [] }; }
  return db.prepare(sql);
}

function run(sql, params = []) {
  if (!db) { console.warn('[DB] 数据库未初始化:', sql.slice(0, 60)); return { lastInsertRowid: 0 }; }
  try {
    db.run(sql, params);
    try { saveDb(); } catch (e) { /* 保存失败可忽略 */ }
    return { lastInsertRowid: db.exec("SELECT last_insert_rowid() as id")[0]?.values?.[0]?.[0] || 0 };
  } catch (err) {
    throw err;
  }
}

function get(sql, params = []) {
  if (!db) { console.warn('[DB] 数据库未初始化:', sql.slice(0, 60)); return undefined; }
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const cols = stmt.getColumnNames();
    const vals = stmt.get();
    stmt.free();
    const row = {};
    cols.forEach((c, i) => { row[c] = vals[i]; });
    return row;
  }
  stmt.free();
  return undefined;
}

function all(sql, params = []) {
  if (!db) { console.warn('[DB] 数据库未初始化:', sql.slice(0, 60)); return []; }
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  const cols = stmt.getColumnNames();
  while (stmt.step()) {
    const vals = stmt.get();
    const row = {};
    cols.forEach((c, i) => { row[c] = vals[i]; });
    rows.push(row);
  }
  stmt.free();
  return rows;
}

function count(sql, params = []) {
  return get(sql, params)?.count || 0;
}

// -------- 工具函数 --------

function generateCode(length = 6) {
  return Math.random().toString().slice(2, 2 + length);
}

function createVerifyCode(target, type = 'email', minutes = 10) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  run('INSERT INTO verify_codes (target, code, type, expires_at) VALUES (?, ?, ?, ?)', [target, code, type, expiresAt]);
  return code;
}

function verifyCode(target, code, type = 'email') {
  const row = get(
    'SELECT * FROM verify_codes WHERE target = ? AND code = ? AND type = ? AND used = 0 AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1',
    [target, code, type]
  );
  if (row) {
    run('UPDATE verify_codes SET used = 1 WHERE id = ?', [row.id]);
    return true;
  }
  return false;
}

function findOrCreateUser({ username, email, phone, provider, providerId }) {
  let user = null;
  if (email) user = get('SELECT * FROM users WHERE email = ?', [email]);
  else if (phone) user = get('SELECT * FROM users WHERE phone = ?', [phone]);
  else if (providerId) user = get('SELECT * FROM users WHERE provider_id = ?', [providerId]);

  if (!user) {
    const result = run(
      'INSERT INTO users (username, email, phone, provider, provider_id) VALUES (?, ?, ?, ?, ?)',
      [username, email || null, phone || null, provider || 'email', providerId || null]
    );
    user = get('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);
  }
  return user;
}

// 定时自动保存（每 30 秒）
setInterval(() => saveDb(), 30000);

module.exports = {
  initDatabase,
  db,
  dbReady,
  run,
  get,
  all,
  count,
  saveDb,
  isReady,
  generateCode,
  createVerifyCode,
  verifyCode,
  findOrCreateUser,
};
