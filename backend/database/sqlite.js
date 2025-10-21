/**
 * SQLite 数据库模块
 * 使用 better-sqlite3 实现数据持久化
 */

import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'novel.db')

// 创建数据库连接
let db = null

/**
 * 获取数据库连接
 */
export function getDB() {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL') // 使用WAL模式提高并发性能
  }
  return db
}

/**
 * 初始化数据库表结构
 */
export function initDatabase() {
  console.log('📦 初始化 SQLite 数据库...')
  console.log('📁 数据库文件:', DB_PATH)
  
  const db = getDB()
  
  // 创建用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
      status TEXT DEFAULT 'draft',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)
  
  // 创建章节表
  db.exec(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      novel_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      chapter_number INTEGER NOT NULL,
      word_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
    )
  `)
  
  // 创建人物卡表
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      novel_id INTEGER,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      personality TEXT,
      appearance TEXT,
      background TEXT,
      other_info TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE SET NULL
    )
  `)
  
  // 创建物品卡表
  db.exec(`
    CREATE TABLE IF NOT EXISTS item_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      novel_id INTEGER,
      name TEXT NOT NULL,
      rarity TEXT,
      description TEXT,
      function TEXT,
      other_info TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE SET NULL
    )
  `)
  
  // 创建场景卡表
  db.exec(`
    CREATE TABLE IF NOT EXISTS scene_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      novel_id INTEGER,
      name TEXT NOT NULL,
      time_period TEXT,
      atmosphere TEXT,
      description TEXT,
      special_features TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE SET NULL
    )
  `)
  
  // 创建API配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider TEXT NOT NULL,
      api_key TEXT NOT NULL,
      model_name TEXT,
      base_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)
  
  console.log('✅ 数据库表结构创建完成')
  
  // 创建示例数据（如果没有用户）
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()
  
  if (userCount.count === 0) {
    console.log('📝 创建示例数据...')
    
    // 创建测试用户
    const insertUser = db.prepare(`
      INSERT INTO users (username, password, email)
      VALUES (?, ?, ?)
    `)
    
    const userResult = insertUser.run(
      'test',
      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // 123456
      'test@example.com'
    )
    
    const userId = userResult.lastInsertRowid
    
    // 创建示例人物卡
    const insertCharacter = db.prepare(`
      INSERT INTO character_cards (user_id, novel_id, name, age, gender, personality, appearance, background, other_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    insertCharacter.run(
      userId,
      1,
      '林小雨',
      18,
      '女',
      '外表柔弱内心坚强，聪明机智，善于察言观色。对朋友真诚，对敌人冷酷。有时会表现出超越年龄的成熟，但偶尔也会流露出少女的天真。',
      '十八岁少女，身材娇小玲珑，约一米六左右。一头乌黑的长发扎成马尾，刘海下是一双清澈明亮的大眼睛。皮肤白皙，五官精致，经常穿着淡蓝色的修身长裙，腰间佩戴一块古朴的玉佩。',
      '出身于江南林家，自幼父母双亡，由祖父抚养长大。祖父是一位隐世高人,传授了她不少本领。三年前祖父神秘失踪，她只身前往京城寻找线索，期间结识了一群志同道合的朋友。',
      '擅长琴棋书画，尤其精通古琴。身怀祖传的"清心诀"心法，能够凝神静气，感知他人情绪。最喜欢的食物是桂花糕，讨厌欺软怕硬的人。'
    )
    
    // 创建示例物品卡
    const insertItem = db.prepare(`
      INSERT INTO item_cards (user_id, novel_id, name, rarity, description, function, other_info)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    insertItem.run(
      userId,
      1,
      '碧玉清心佩',
      '传说',
      '一块温润如水的碧玉，呈椭圆形，约鸡蛋大小。玉佩表面光滑细腻，内部隐约可见流云般的纹理。中央刻着一个古老的"心"字，在月光下会泛出淡淡的青光。',
      '这是林家祖传之物，具有凝神静气的作用。佩戴者可以保持心境平和，不易被外界情绪影响。在危急时刻，玉佩会自动发热提醒主人。据说当持有者陷入极度危险时，玉佩还能激发出某种神秘的防护之力。',
      '玉佩已有三百年历史，历代只传林家嫡系女子。背面刻有"清心明志，不忘初心"八个小字。林小雨的祖父曾说，当玉佩彻底激活时，会揭示林家一个隐藏多年的秘密。'
    )
    
    // 创建示例场景卡
    const insertScene = db.prepare(`
      INSERT INTO scene_cards (user_id, novel_id, name, time_period, atmosphere, description, special_features)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    insertScene.run(
      userId,
      1,
      '清风阁茶楼',
      '古代京城',
      '茶楼内终年弥漫着淡淡的茶香，混合着檀香的味道。一楼喧闹热闹，能听到各种市井八卦和江湖传闻；二楼相对安静，时而传来琴音或低声交谈；三楼则寂静无声，给人一种神秘莫测的感觉。',
      '位于京城东市的一座三层木质阁楼，外观古朴典雅，飞檐翘角。一楼是普通的茶座，装饰简朴，常有市井百姓光顾。二楼是雅间，布置考究，多是富商文人聚集之处，每个雅间都有精致的屏风隔断，可以远眺街景。三楼只对贵客开放，需要特殊的令牌才能上去，据说那里隐藏着许多不为人知的秘密。',
      '茶楼的老板是一位神秘的白衣老者，无人知晓他的来历。店里的招牌是"云雾龙井"，据说喝过的人都会记忆深刻。更重要的是，这里是京城各方势力交换情报的中转站，许多江湖大事都是从这里传出去的。二楼的第七号雅间"听雨轩"，是林小雨常去的地方，她在那里经常能打听到关于祖父的消息。'
    )
    
    console.log('✅ 示例数据创建完成')
    console.log('   - 测试用户: test / 123456')
    console.log('   - 人物卡：林小雨')
    console.log('   - 物品卡：碧玉清心佩')
    console.log('   - 场景卡：清风阁茶楼')
  }
  
  console.log('✅ SQLite 数据库初始化完成')
  console.log('💾 数据将持久化保存，重启不会丢失')
}

/**
 * 关闭数据库连接
 */
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
    console.log('🔒 数据库连接已关闭')
  }
}

// 导出便捷方法
export const sqlite = {
  getDB,
  initDatabase,
  closeDatabase
}

export default sqlite

