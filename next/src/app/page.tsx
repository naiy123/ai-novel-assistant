'use client';

import { useState } from 'react';
import { Loader2, Sparkles, BookOpen, Plus, FileText, Trash2, Edit2 } from 'lucide-react';

// 章节类型
interface Chapter {
  id: string;
  title: string;
  content: string;
  plot: string; // 本章剧情
}

export default function Home() {
  // 章节管理
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: '1', title: '第一章', content: '', plot: '' }
  ]);
  const [currentChapterId, setCurrentChapterId] = useState('1');
  
  // 全局设置
  const [apiKey, setApiKey] = useState('');
  const [storyBackground, setStoryBackground] = useState('');
  const [characterCards, setCharacterCards] = useState('');
  const [characterRelations, setCharacterRelations] = useState('');
  const [itemCards, setItemCards] = useState('');
  
  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // 获取当前章节
  const currentChapter = chapters.find(c => c.id === currentChapterId);

  // 新建章节
  const handleAddChapter = () => {
    const newId = String(chapters.length + 1);
    const newChapter: Chapter = {
      id: newId,
      title: `第${chapters.length + 1}章`,
      content: '',
      plot: ''
    };
    setChapters([...chapters, newChapter]);
    setCurrentChapterId(newId);
  };

  // 删除章节
  const handleDeleteChapter = (id: string) => {
    if (chapters.length <= 1) {
      alert('至少保留一个章节');
      return;
    }
    if (confirm('确定删除这个章节吗？')) {
      const newChapters = chapters.filter(c => c.id !== id);
      setChapters(newChapters);
      if (currentChapterId === id) {
        setCurrentChapterId(newChapters[0].id);
      }
    }
  };

  // 更新章节内容
  const updateChapterContent = (content: string) => {
    setChapters(chapters.map(c => 
      c.id === currentChapterId ? { ...c, content } : c
    ));
  };

  // 更新章节剧情
  const updateChapterPlot = (plot: string) => {
    setChapters(chapters.map(c => 
      c.id === currentChapterId ? { ...c, plot } : c
    ));
  };

  // 重命名章节
  const handleRenameChapter = (id: string) => {
    const chapter = chapters.find(c => c.id === id);
    if (!chapter) return;
    
    const newTitle = prompt('输入新的章节标题:', chapter.title);
    if (newTitle && newTitle.trim()) {
      setChapters(chapters.map(c => 
        c.id === id ? { ...c, title: newTitle.trim() } : c
      ));
    }
  };

  // AI 生成
  const handleGenerate = async () => {
    if (!apiKey) {
      setError('请输入 API Key');
      return;
    }

    if (!currentChapter?.plot && !storyBackground) {
      setError('请至少填写故事背景或本章剧情');
      return;
    }

    setIsGenerating(true);
    setError('');

    const timeout = setTimeout(() => {
      setError('生成超时（60秒），请检查网络连接或稍后重试');
      setIsGenerating(false);
    }, 60000);

    try {
      let prompt = '你是一位专业的网络小说作家，请根据以下信息续写小说内容。\n\n';
      
      if (storyBackground) {
        prompt += `【故事背景】\n${storyBackground}\n\n`;
      }
      
      if (characterCards) {
        prompt += `【角色卡】\n${characterCards}\n\n`;
      }
      
      if (characterRelations) {
        prompt += `【角色关系】\n${characterRelations}\n\n`;
      }
      
      if (itemCards) {
        prompt += `【本章词条卡】\n${itemCards}\n\n`;
      }

      // 添加前文内容作为上下文
      if (currentChapter && currentChapter.content) {
        const contextLength = 500;
        const context = currentChapter.content.slice(-contextLength);
        prompt += `【前文内容】\n${context}\n\n`;
      }
      
      if (currentChapter?.plot) {
        prompt += `【本章剧情】\n${currentChapter.plot}\n\n`;
      }
      
      prompt += '请根据以上信息，续写接下来的情节，字数500字左右。';

      console.log('📝 提示词长度:', prompt.length);
      console.log('📝 提示词预览:', prompt.substring(0, 200) + '...');

      const apiUrl = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-pro:streamGenerateContent?key=${apiKey}`;
      
      console.log('📡 开始调用 Gemini API...');
      console.log('🔗 API URL:', apiUrl.replace(apiKey, 'API_KEY_HIDDEN'));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
          }
        })
      });

      console.log('✅ API 响应状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 错误:', errorText);
        throw new Error(`API 错误 (${response.status}): ${errorText}`);
      }

      console.log('📥 开始读取流式响应...');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let buffer = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('📦 流式响应结束，共收到', chunkCount, '个数据块');
          break;
        }

        chunkCount++;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
      }

      // 解析完整的 JSON 数组
      try {
        console.log('📄 开始解析完整响应...');
        
        let jsonText = buffer.trim();
        
        if (jsonText.startsWith('[') && jsonText.endsWith(']')) {
          jsonText = jsonText.substring(1, jsonText.length - 1);
        }
        
        const jsonObjects = jsonText.split(/\}\s*,\s*\{/).map((str, index, array) => {
          if (index === 0) return str + '}';
          if (index === array.length - 1) return '{' + str;
          return '{' + str + '}';
        });

        console.log('📊 解析到', jsonObjects.length, '个响应对象');

        let fullText = '';
        for (const jsonStr of jsonObjects) {
          try {
            const data = JSON.parse(jsonStr.trim());
            if (data.candidates && data.candidates[0]) {
              const candidate = data.candidates[0];
              if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                  if (part.text) {
                    fullText += part.text;
                    console.log('📝 累计生成:', fullText.length, '字');
                  }
                }
              }
            }
          } catch (e) {
            console.log('⚠️ 解析单个对象失败:', e);
          }
        }

        // 将生成的内容追加到当前章节
        if (currentChapter && fullText) {
          const newContent = currentChapter.content + '\n\n' + fullText;
          updateChapterContent(newContent);
        }

      } catch (e) {
        console.error('❌ 解析响应失败:', e);
        throw new Error('解析 AI 响应失败: ' + (e instanceof Error ? e.message : '未知错误'));
      }

      console.log('✅ 生成完成');
      clearTimeout(timeout);
      setIsGenerating(false);

    } catch (err) {
      console.error('❌ 生成失败:', err);
      clearTimeout(timeout);
      setError(err instanceof Error ? err.message : '生成失败');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* 左侧：章节列表 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <BookOpen size={20} className="text-blue-600" />
              <span>章节列表</span>
            </h2>
            <span className="text-sm text-gray-500">{chapters.length} 章</span>
          </div>
          <button
            onClick={handleAddChapter}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 transform hover:scale-105"
          >
            <Plus size={18} />
            <span>新建章节</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className={`group relative p-3 rounded-xl border-2 transition-all cursor-pointer ${
                currentChapterId === chapter.id
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-500'
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setCurrentChapterId(chapter.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FileText size={16} className={currentChapterId === chapter.id ? 'text-blue-600' : 'text-gray-400'} />
                  <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameChapter(chapter.id);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChapter(chapter.id);
                    }}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {chapter.content ? `${chapter.content.length} 字` : '暂无内容'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧：编辑器和参数 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部标题 */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen size={32} className="text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI 小说创作助手
                  </h1>
                  <p className="text-sm text-gray-600">当前编辑：{currentChapter?.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：参数设置 */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 全局设置</h2>
                
                {/* API Key */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    🔑 API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="输入 Google Gemini API Key"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    获取：<a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 underline">Google AI Studio</a>
                  </p>
                </div>

                {/* 故事背景 */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    🌍 故事背景
                  </label>
                  <textarea
                    value={storyBackground}
                    onChange={(e) => setStoryBackground(e.target.value)}
                    placeholder="例如：这是一个玄幻修仙世界..."
                    rows={3}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none transition-all"
                  />
                  <span className="text-xs text-gray-500">{storyBackground.length} 字</span>
                </div>

                {/* 角色卡 */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    👥 角色卡
                  </label>
                  <textarea
                    value={characterCards}
                    onChange={(e) => setCharacterCards(e.target.value)}
                    placeholder="例如：李云飞：主角，20岁..."
                    rows={3}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none transition-all"
                  />
                  <span className="text-xs text-gray-500">{characterCards.length} 字</span>
                </div>

                {/* 角色关系 */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    🤝 角色关系
                  </label>
                  <textarea
                    value={characterRelations}
                    onChange={(e) => setCharacterRelations(e.target.value)}
                    placeholder="例如：李云飞与张师兄是同门..."
                    rows={2}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none transition-all"
                  />
                  <span className="text-xs text-gray-500">{characterRelations.length} 字</span>
                </div>

                {/* 本章词条卡 */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    📦 本章词条卡
                  </label>
                  <textarea
                    value={itemCards}
                    onChange={(e) => setItemCards(e.target.value)}
                    placeholder="例如：破天剑：上品法宝..."
                    rows={2}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none transition-all"
                  />
                  <span className="text-xs text-gray-500">{itemCards.length} 字</span>
                </div>
              </div>

              {/* 本章剧情 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📖 本章剧情</h2>
                <textarea
                  value={currentChapter?.plot || ''}
                  onChange={(e) => updateChapterPlot(e.target.value)}
                  placeholder="输入本章的剧情要点..."
                  rows={6}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none transition-all"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">本章剧情大纲</span>
                  <span className="text-xs text-gray-500">{currentChapter?.plot.length || 0} 字</span>
                </div>
              </div>

              {/* 生成按钮 */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg transform ${
                  isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105'
                } text-white`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>AI 生成中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>AI 生成续写</span>
                  </>
                )}
              </button>

              {/* 错误提示 */}
              {error && (
                <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                  <p className="text-sm text-red-800">{error}</p>
                  
                  {error.includes('API key') && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <p className="text-xs font-bold text-red-900 mb-1">💡 解决方法：</p>
                      <ul className="text-xs text-red-800 space-y-1 list-disc ml-4">
                        <li>检查 API Key 是否正确</li>
                        <li>确认从 Google AI Studio 获取</li>
                      </ul>
                    </div>
                  )}

                  {error.includes('429') && (
                    <div className="mt-2 pt-2 border-t border-yellow-300 bg-yellow-50 p-2 rounded">
                      <p className="text-xs font-bold text-yellow-900 mb-1">⚠️ 配额耗尽</p>
                      <p className="text-xs text-yellow-800">API Key 有效！等待几分钟后重试。</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 右侧：章节内容 */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">✍️ 章节内容</h2>
                  <span className="text-sm text-gray-500">
                    {currentChapter?.content.length || 0} 字
                  </span>
                </div>
                
                <textarea
                  value={currentChapter?.content || ''}
                  onChange={(e) => updateChapterContent(e.target.value)}
                  placeholder="AI 生成的内容会自动追加在这里，你也可以直接编辑..."
                  rows={20}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none transition-all font-mono text-sm leading-relaxed"
                />
              </div>

              {/* 使用说明 */}
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <h3 className="text-sm font-bold text-blue-900 mb-2">📚 使用说明</h3>
                <ol className="text-xs text-blue-800 space-y-1 list-decimal ml-4">
                  <li>左侧管理章节，点击切换当前章节</li>
                  <li>填写全局设置（故事背景、角色等）</li>
                  <li>填写本章剧情大纲</li>
                  <li>点击"AI 生成续写"</li>
                  <li>生成的内容会自动追加到章节内容中</li>
                  <li>可以手动编辑章节内容</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
