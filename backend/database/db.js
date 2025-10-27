/**
 * 数据库适配器
 * 提供统一的数据库操作API，兼容SQLite
 */

import { getDB } from './sqlite.js'

/**
 * 插入数据
 */
export function insert(table, data) {
  const db = getDB()
  
  // 构建SQL
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map(() => '?').join(', ')
  const columns = keys.join(', ')
  
  const sql = `INSERT INTO ${convertTableName(table)} (${columns}) VALUES (${placeholders})`
  
  try {
    const result = db.prepare(sql).run(...values)
    return { lastInsertRowid: result.lastInsertRowid, changes: result.changes }
  } catch (error) {
    console.error(`插入数据失败 [${table}]:`, error.message)
    throw error
  }
}

/**
 * 查询所有数据
 */
export function selectAll(table, condition = {}) {
  const db = getDB()
  
  let sql = `SELECT * FROM ${convertTableName(table)}`
  const values = []
  
  // 添加条件
  if (Object.keys(condition).length > 0) {
    const whereClauses = Object.keys(condition).map(key => `${key} = ?`)
    sql += ' WHERE ' + whereClauses.join(' AND ')
    values.push(...Object.values(condition))
  }
  
  try {
    return db.prepare(sql).all(...values)
  } catch (error) {
    console.error(`查询数据失败 [${table}]:`, error.message)
    return []
  }
}

/**
 * 查询单条数据
 */
export function selectOne(table, condition) {
  const db = getDB()
  
  const whereClauses = Object.keys(condition).map(key => `${key} = ?`)
  const sql = `SELECT * FROM ${convertTableName(table)} WHERE ${whereClauses.join(' AND ')} LIMIT 1`
  const values = Object.values(condition)
  
  try {
    return db.prepare(sql).get(...values)
  } catch (error) {
    console.error(`查询单条数据失败 [${table}]:`, error.message)
    return null
  }
}

/**
 * 更新数据
 */
export function update(table, id, data) {
  const db = getDB()
  
  const keys = Object.keys(data)
  const values = Object.values(data)
  
  const setClauses = keys.map(key => `${key} = ?`).join(', ')
  const sql = `UPDATE ${convertTableName(table)} SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  
  try {
    const result = db.prepare(sql).run(...values, id)
    return { changes: result.changes }
  } catch (error) {
    console.error(`更新数据失败 [${table}]:`, error.message)
    return { changes: 0 }
  }
}

/**
 * 删除数据
 */
export function deleteRecord(table, id) {
  const db = getDB()
  
  const sql = `DELETE FROM ${convertTableName(table)} WHERE id = ?`
  
  try {
    const result = db.prepare(sql).run(id)
    return { changes: result.changes }
  } catch (error) {
    console.error(`删除数据失败 [${table}]:`, error.message)
    return { changes: 0 }
  }
}

/**
 * 转换表名（驼峰转下划线）
 */
function convertTableName(table) {
  const tableMap = {
    'users': 'users',
    'novels': 'novels',
    'chapters': 'chapters',
    'characterCards': 'character_cards',
    'itemCards': 'item_cards',
    'sceneCards': 'scene_cards',
    'apiConfigs': 'api_configs'
  }
  
  return tableMap[table] || table
}

/**
 * 执行自定义SQL查询
 */
export function query(sql, params = []) {
  const db = getDB()
  try {
    return db.prepare(sql).all(...params)
  } catch (error) {
    console.error('SQL查询失败:', error.message)
    return []
  }
}

/**
 * 执行自定义SQL（单条）
 */
export function queryOne(sql, params = []) {
  const db = getDB()
  try {
    return db.prepare(sql).get(...params)
  } catch (error) {
    console.error('SQL查询失败:', error.message)
    return null
  }
}

// 导出便捷方法
export const db = {
  insert,
  selectAll,
  selectOne,
  update,
  deleteRecord,
  query,
  queryOne
}

export default db



