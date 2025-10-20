/**
 * 简单的内存数据库（MVP 版本）
 * 数据存储在内存中，重启后会丢失
 * 后续可以升级为真实数据库
 */

// 内存数据存储
const db = {
  users: [],
  novels: [],
  chapters: [],
  characterCards: [],
  itemCards: [],
  sceneCards: [],
  apiConfigs: []
}

// 自增 ID 计数器
const counters = {
  users: 1,
  novels: 1,
  chapters: 1,
  characterCards: 1,
  itemCards: 1,
  sceneCards: 1,
  apiConfigs: 1
}

/**
 * 插入数据
 */
export function insert(table, data) {
  const id = counters[table]++
  const record = { id, ...data, created_at: new Date().toISOString() }
  db[table].push(record)
  return { lastInsertRowid: id, changes: 1 }
}

/**
 * 查询所有数据
 */
export function selectAll(table, condition = {}) {
  let results = [...db[table]]
  
  // 简单的条件过滤
  Object.keys(condition).forEach(key => {
    results = results.filter(item => item[key] === condition[key])
  })
  
  return results
}

/**
 * 查询单条数据
 */
export function selectOne(table, condition) {
  return db[table].find(item => {
    return Object.keys(condition).every(key => item[key] === condition[key])
  })
}

/**
 * 更新数据
 */
export function update(table, id, data) {
  const index = db[table].findIndex(item => item.id === parseInt(id))
  if (index === -1) {
    return { changes: 0 }
  }
  
  db[table][index] = {
    ...db[table][index],
    ...data,
    updated_at: new Date().toISOString()
  }
  
  return { changes: 1 }
}

/**
 * 删除数据
 */
export function deleteRecord(table, id) {
  const index = db[table].findIndex(item => item.id === parseInt(id))
  if (index === -1) {
    return { changes: 0 }
  }
  
  db[table].splice(index, 1)
  return { changes: 1 }
}

/**
 * 初始化数据库（创建一个默认用户和示例卡片）
 */
export function initDatabase() {
  console.log('📦 初始化内存数据库...')
  
  // 创建一个默认用户（用于 MVP 测试）
  if (db.users.length === 0) {
    const userResult = insert('users', {
      username: 'test',
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // 123456
      email: 'test@example.com'
    })
    const userId = userResult.lastInsertRowid
    
    // 创建示例人物卡（作者级别共享，但兼容按novel_id查询）
    insert('characterCards', {
      user_id: userId,
      novel_id: 1, // 兼容旧的按小说查询方式
      name: '林小雨',
      personality: '外表柔弱内心坚强，聪明机智，善于察言观色。对朋友真诚，对敌人冷酷。有时会表现出超越年龄的成熟，但偶尔也会流露出少女的天真。',
      appearance: '十八岁少女，身材娇小玲珑，约一米六左右。一头乌黑的长发扎成马尾，刘海下是一双清澈明亮的大眼睛。皮肤白皙，五官精致，经常穿着淡蓝色的修身长裙，腰间佩戴一块古朴的玉佩。',
      background: '出身于江南林家，自幼父母双亡，由祖父抚养长大。祖父是一位隐世高人,传授了她不少本领。三年前祖父神秘失踪，她只身前往京城寻找线索，期间结识了一群志同道合的朋友。',
      other_info: '擅长琴棋书画，尤其精通古琴。身怀祖传的"清心诀"心法，能够凝神静气，感知他人情绪。最喜欢的食物是桂花糕，讨厌欺软怕硬的人。'
    })
    
    // 创建示例物品卡
    insert('itemCards', {
      user_id: userId,
      novel_id: 1, // 兼容旧的按小说查询方式
      name: '碧玉清心佩',
      description: '一块温润如水的碧玉，呈椭圆形，约鸡蛋大小。玉佩表面光滑细腻，内部隐约可见流云般的纹理。中央刻着一个古老的"心"字，在月光下会泛出淡淡的青光。',
      function: '这是林家祖传之物，具有凝神静气的作用。佩戴者可以保持心境平和，不易被外界情绪影响。在危急时刻，玉佩会自动发热提醒主人。据说当持有者陷入极度危险时，玉佩还能激发出某种神秘的防护之力。',
      other_info: '玉佩已有三百年历史，历代只传林家嫡系女子。背面刻有"清心明志，不忘初心"八个小字。林小雨的祖父曾说，当玉佩彻底激活时，会揭示林家一个隐藏多年的秘密。'
    })
    
    // 创建示例背景卡（场景卡）
    insert('sceneCards', {
      user_id: userId,
      novel_id: 1, // 兼容旧的按小说查询方式
      name: '清风阁茶楼',
      description: '位于京城东市的一座三层木质阁楼，外观古朴典雅，飞檐翘角。一楼是普通的茶座，装饰简朴，常有市井百姓光顾。二楼是雅间，布置考究，多是富商文人聚集之处，每个雅间都有精致的屏风隔断，可以远眺街景。三楼只对贵客开放，需要特殊的令牌才能上去，据说那里隐藏着许多不为人知的秘密。',
      atmosphere: '茶楼内终年弥漫着淡淡的茶香，混合着檀香的味道。一楼喧闹热闹，能听到各种市井八卦和江湖传闻；二楼相对安静，时而传来琴音或低声交谈；三楼则寂静无声，给人一种神秘莫测的感觉。窗外是繁华的东市街道，人来人往，与楼内的静谧形成鲜明对比。',
      special_features: '茶楼的老板是一位神秘的白衣老者，无人知晓他的来历。店里的招牌是"云雾龙井"，据说喝过的人都会记忆深刻。更重要的是，这里是京城各方势力交换情报的中转站，许多江湖大事都是从这里传出去的。二楼的第七号雅间"听雨轩"，是林小雨常去的地方，她在那里经常能打听到关于祖父的消息。'
    })
    
    console.log('✅ 创建了示例卡片模板：')
    console.log('   - 人物卡：林小雨')
    console.log('   - 物品卡：碧玉清心佩')
    console.log('   - 场景卡：清风阁茶楼')
  }
  
  console.log('✅ 内存数据库初始化完成')
  console.log('ℹ️  提示：使用内存存储，数据重启后会丢失')
}

// 导出数据库对象（供调试使用）
export { db }

