import React from 'react';

export default function Topbar() {
  return (
    <div className="h-12 glass-panel rounded-xl flex items-center justify-between px-4">
      <div className="flex items-center gap-2 text-slate-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-sm">AI写作</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 text-xs rounded bg-white/5 hover:bg-white/10">AI写作助手</button>
        <button className="px-3 py-1 text-xs rounded bg-white/5 hover:bg-white/10">AI长篇写作</button>
        <button className="px-3 py-1 text-xs rounded bg-white/5 hover:bg-white/10">提纲</button>
        <button className="px-3 py-1 text-xs rounded bg-primary-500/20 text-primary-100 hover:bg-primary-500/30">保存</button>
      </div>
    </div>
  );
}


