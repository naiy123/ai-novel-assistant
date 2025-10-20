import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据库文件路径
const DB_PATH = path.join(__dirname, '..', 'database.db')

// 创建数据库连接
export const db = new Database(DB_PATH)

/**
 * 初始化数据库表结构
 */
export function initDatabase() {
  console.log('📦 初始化数据库...')

  // 创建用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 创建小说表
  db.exec(`
    CREATE TABLE IF NOT EXISTS novels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      cover_image TEXT,
      genre TEXT,
      status TEXT DEFAULT 'writing',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  // 创建章节表
  db.exec(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      novel_id INTEGER NOT NULL,
      chapter_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      word_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
    )
  `)

  // 创建人物卡表
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      novel_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      personality TEXT,
      appearance TEXT,
      background TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
    )
  `)

  // 创建物品卡表
  db.exec(`
    CREATE TABLE IF NOT EXISTS item_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      novel_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      function TEXT,
      rarity TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
    )
  `)

  // 创建背景卡表
  db.exec(`
    CREATE TABLE IF NOT EXISTS scene_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      novel_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      atmosphere TEXT,
      time_period TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
    )
  `)

  // 创建 API 配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      api_key TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  console.log('✅ 数据库初始化完成')
}

// 导出数据库实例供其他模块使用
export default db

