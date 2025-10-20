import express from 'express'
import { selectAll, insert, deleteRecord } from '../database/memoryDB.js'

const router = express.Router()

/**
 * 获取某个小说的所有人物卡
 * GET /api/cards/characters/:novelId
 */
router.get('/characters/:novelId', (req, res) => {
  try {
    const { novelId } = req.params
    
    const characters = selectAll('characterCards', { novel_id: parseInt(novelId) })

    res.json({ characters })
  } catch (error) {
    console.error('获取人物卡错误:', error)
    res.status(500).json({ error: '获取人物卡失败' })
  }
})

/**
 * 创建人物卡
 * POST /api/cards/characters
 */
router.post('/characters', (req, res) => {
  try {
    const { novelId, name, age, gender, personality, appearance, background } = req.body

    if (!novelId || !name) {
      return res.status(400).json({ error: '小说 ID 和人物名称不能为空' })
    }

    const result = insert('characterCards', {
      novel_id: parseInt(novelId),
      name,
      age,
      gender,
      personality,
      appearance,
      background
    })

    res.status(201).json({
      message: '创建成功',
      characterId: result.lastInsertRowid
    })
  } catch (error) {
    console.error('创建人物卡错误:', error)
    res.status(500).json({ error: '创建人物卡失败' })
  }
})

/**
 * 获取某个小说的所有物品卡
 * GET /api/cards/items/:novelId
 */
router.get('/items/:novelId', (req, res) => {
  try {
    const { novelId } = req.params
    
    const items = selectAll('itemCards', { novel_id: parseInt(novelId) })

    res.json({ items })
  } catch (error) {
    console.error('获取物品卡错误:', error)
    res.status(500).json({ error: '获取物品卡失败' })
  }
})

/**
 * 创建物品卡
 * POST /api/cards/items
 */
router.post('/items', (req, res) => {
  try {
    const { novelId, name, description, function: itemFunction, rarity } = req.body

    if (!novelId || !name) {
      return res.status(400).json({ error: '小说 ID 和物品名称不能为空' })
    }

    const result = insert('itemCards', {
      novel_id: parseInt(novelId),
      name,
      description,
      function: itemFunction,
      rarity
    })

    res.status(201).json({
      message: '创建成功',
      itemId: result.lastInsertRowid
    })
  } catch (error) {
    console.error('创建物品卡错误:', error)
    res.status(500).json({ error: '创建物品卡失败' })
  }
})

/**
 * 获取某个小说的所有背景卡
 * GET /api/cards/scenes/:novelId
 */
router.get('/scenes/:novelId', (req, res) => {
  try {
    const { novelId } = req.params
    
    const scenes = selectAll('sceneCards', { novel_id: parseInt(novelId) })

    res.json({ scenes })
  } catch (error) {
    console.error('获取背景卡错误:', error)
    res.status(500).json({ error: '获取背景卡失败' })
  }
})

/**
 * 创建背景卡
 * POST /api/cards/scenes
 */
router.post('/scenes', (req, res) => {
  try {
    const { novelId, name, description, atmosphere, timePeriod } = req.body

    if (!novelId || !name) {
      return res.status(400).json({ error: '小说 ID 和场景名称不能为空' })
    }

    const result = insert('sceneCards', {
      novel_id: parseInt(novelId),
      name,
      description,
      atmosphere,
      time_period: timePeriod
    })

    res.status(201).json({
      message: '创建成功',
      sceneId: result.lastInsertRowid
    })
  } catch (error) {
    console.error('创建背景卡错误:', error)
    res.status(500).json({ error: '创建背景卡失败' })
  }
})

/**
 * 删除人物卡
 * DELETE /api/cards/characters/:id
 */
router.delete('/characters/:id', (req, res) => {
  try {
    const { id } = req.params
    
    const result = deleteRecord('characterCards', id)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '人物卡不存在' })
    }

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除人物卡错误:', error)
    res.status(500).json({ error: '删除人物卡失败' })
  }
})

/**
 * 删除物品卡
 * DELETE /api/cards/items/:id
 */
router.delete('/items/:id', (req, res) => {
  try {
    const { id } = req.params
    
    const result = deleteRecord('itemCards', id)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '物品卡不存在' })
    }

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除物品卡错误:', error)
    res.status(500).json({ error: '删除物品卡失败' })
  }
})

/**
 * 删除背景卡
 * DELETE /api/cards/scenes/:id
 */
router.delete('/scenes/:id', (req, res) => {
  try {
    const { id } = req.params
    
    const result = deleteRecord('sceneCards', id)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '背景卡不存在' })
    }

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除背景卡错误:', error)
    res.status(500).json({ error: '删除背景卡失败' })
  }
})

export default router

