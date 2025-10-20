import logo from './logo.svg';
import './App.css';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Editor from './components/Editor';

function App() {
  return (
    <div className="min-h-screen h-screen w-screen p-4">
      <div className="h-full w-full grid grid-cols-[16rem_1fr] gap-4">
        <Sidebar />
        <main className="h-full flex flex-col gap-4">
          <Topbar />
          <div className="flex-1 flex gap-4 overflow-hidden">
            <Editor />
            <aside className="w-72 shrink-0 glass-panel rounded-xl p-3 space-y-3 overflow-auto">
              <div className="text-sm text-slate-400">工具面板</div>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-left">AI对话</button>
                <button className="w-full px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-left">素材库</button>
                <button className="w-full px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-left">大纲与设定</button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
