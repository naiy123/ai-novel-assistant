import React from 'react';

const chapters = [
  { id: '1', title: '第1章', updatedAt: '2025-10-18 00:06:47' },
  { id: '2', title: '第2章', updatedAt: '2025-10-18 00:10:02' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-full p-3 space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <span>新建作品</span>
        <button className="px-2 py-1 rounded-md bg-primary-500/20 text-primary-200 hover:bg-primary-500/30">新建章节</button>
      </div>
      <div className="glass-panel rounded-xl h-[calc(100%-2.5rem)] overflow-auto p-2">
        {chapters.map((c) => (
          <div key={c.id} className="group rounded-lg p-3 mb-2 bg-white/0 hover:bg-white/5 cursor-pointer border border-white/5 hover:border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary-500/20 text-primary-200 text-xs">{c.id}</span>
                <div className="font-medium text-slate-200">{c.title}</div>
              </div>
              <div className="text-[10px] text-slate-400">{c.updatedAt}</div>
            </div>
            <div className="mt-2 flex gap-2">
              <button className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10">续写</button>
              <button className="text-xs px-2 py-1 rounded bg-primary-500/20 text-primary-100 hover:bg-primary-500/30">生成</button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}


