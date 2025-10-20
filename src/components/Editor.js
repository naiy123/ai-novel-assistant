import React from 'react';

export default function Editor() {
  return (
    <section className="flex-1 h-full flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary-500/20 text-primary-200 grid place-items-center">✦</div>
            <input
              className="flex-1 bg-transparent outline-none text-lg font-semibold placeholder:text-slate-500"
              placeholder="第1章"
            />
            <div className="text-sm text-slate-400">3 / 35</div>
          </div>
        </div>
        <div className="col-span-1">
          <div className="glass-panel rounded-xl h-full flex items-center justify-end gap-2 px-3">
            <button className="px-3 py-1 text-xs rounded bg-white/5 hover:bg-white/10">撤销</button>
            <button className="px-3 py-1 text-xs rounded bg-white/5 hover:bg-white/10">重做</button>
            <button className="px-3 py-1 text-xs rounded bg-white/5 hover:bg-white/10">统计</button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl flex-1 overflow-hidden">
        <textarea
          className="w-full h-full bg-transparent outline-none resize-none p-6 leading-8 text-slate-200 placeholder:text-slate-500"
          placeholder="请输入章节内容"
        />
      </div>
    </section>
  );
}


