import express from 'express'
import { selectAll, selectOne, insert, update, deleteRecord, query } from '../database/db.js'

const router = express.Router()

/**
 * 获取所有小说
 * GET /api/novels
 */
router.get('/', (req, res) => {
  try {
    // MVP 版本：返回所有小说，不做用户验证
    const novels = selectAll('novels')

    res.json({ novels })
  } catch (error) {
    console.error('获取小说列表错误:', error)
    res.status(500).json({ error: '获取小说列表失败' })
  }
})

/**
 * 获取单个小说详情
 * GET /api/novels/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    
    const novel = selectOne('novels', { id: parseInt(id) })
    
    if (!novel) {
      return res.status(404).json({ error: '小说不存在' })
    }

    // 获取该小说的章节
    const chapters = selectAll('chapters', { novel_id: parseInt(id) })

    res.json({ novel, chapters })
  } catch (error) {
    console.error('获取小说详情错误:', error)
    res.status(500).json({ error: '获取小说详情失败' })
  }
})

/**
 * 创建新小说
 * POST /api/novels
 */
router.post('/', (req, res) => {
  try {
    const { title, description, genre } = req.body
    
    if (!title) {
      return res.status(400).json({ error: '小说标题不能为空' })
    }

    // MVP 版本：默认用户 ID 为 1
    const result = insert('novels', {
      user_id: 1,
      title,
      description,
      genre,
      status: 'writing'
    })

    res.status(201).json({
      message: '创建成功',
      novelId: result.lastInsertRowid
    })
  } catch (error) {
    console.error('创建小说错误:', error)
    res.status(500).json({ error: '创建小说失败' })
  }
})

/**
 * 更新小说
 * PUT /api/novels/:id
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const { title, description, genre, status } = req.body

    const result = update('novels', id, { title, description, genre, status })

    if (result.changes === 0) {
      return res.status(404).json({ error: '小说不存在' })
    }

    res.json({ message: '更新成功' })
  } catch (error) {
    console.error('更新小说错误:', error)
    res.status(500).json({ error: '更新小说失败' })
  }
})

/**
 * 删除小说
 * DELETE /api/novels/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params

    const result = deleteRecord('novels', id)

    if (result.changes === 0) {
      return res.status(404).json({ error: '小说不存在' })
    }

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除小说错误:', error)
    res.status(500).json({ error: '删除小说失败' })
  }
})

/**
 * 获取章节列表
 * GET /api/novels/:id/chapters
 */
router.get('/:id/chapters', (req, res) => {
  try {
    const { id } = req.params
    
    const chapters = selectAll('chapters', { novel_id: parseInt(id) })

    res.json({ chapters })
  } catch (error) {
    console.error('获取章节列表错误:', error)
    res.status(500).json({ error: '获取章节列表失败' })
  }
})

/**
 * 创建新章节
 * POST /api/novels/:id/chapters
 */
router.post('/:id/chapters', (req, res) => {
  try {
    const { id } = req.params
    const { title, content, chapterNumber } = req.body

    if (!title) {
      return res.status(400).json({ error: '章节标题不能为空' })
    }

    const wordCount = content ? content.length : 0

    const result = insert('chapters', {
      novel_id: parseInt(id),
      chapter_number: chapterNumber,
      title,
      content,
      word_count: wordCount
    })

    res.status(201).json({
      message: '创建成功',
      chapterId: result.lastInsertRowid
    })
  } catch (error) {
    console.error('创建章节错误:', error)
    res.status(500).json({ error: '创建章节失败' })
  }
})

/**
 * 更新章节
 * PUT /api/novels/:novelId/chapters/:chapterId
 */
router.put('/:novelId/chapters/:chapterId', (req, res) => {
  try {
    const { chapterId } = req.params
    const { title, content, word_count } = req.body

    const result = update('chapters', chapterId, {
      title,
      content,
      word_count
    })

    if (result.changes === 0) {
      return res.status(404).json({ error: '章节不存在' })
    }

    res.json({ message: '更新成功' })
  } catch (error) {
    console.error('更新章节错误:', error)
    res.status(500).json({ error: '更新章节失败' })
  }
})

/**
 * 删除章节
 * DELETE /api/novels/:novelId/chapters/:chapterId
 */
router.delete('/:novelId/chapters/:chapterId', (req, res) => {
  try {
    const { chapterId } = req.params

    const result = deleteRecord('chapters', chapterId)

    if (result.changes === 0) {
      return res.status(404).json({ error: '章节不存在' })
    }

    res.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除章节错误:', error)
    res.status(500).json({ error: '删除章节失败' })
  }
})

export default router

