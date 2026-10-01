import React, { useState } from 'react';
import { LogMessage } from '../types/game';
import { ScrollText, Trash2, ShieldAlert, Sparkles, Trophy } from 'lucide-react';

interface Props {
  logs: LogMessage[];
  onClearLogs: () => void;
}

export const LogPanel: React.FC<Props> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<'all' | 'gain' | 'danger' | 'breakthrough'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'gain') return log.type === 'gain' || log.type === 'gold';
    if (filter === 'danger') return log.type === 'danger';
    if (filter === 'breakthrough') return log.type === 'breakthrough';
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-[#0b0e14] border-l border-[#21262d] w-full text-xs select-none">
      {/* 標題與清空 */}
      <div className="p-3 border-b border-[#21262d] flex items-center justify-between bg-[#121620]">
        <div className="flex items-center gap-1.5 font-serif font-bold text-amber-300">
          <ScrollText className="w-4 h-4 text-amber-400" />
          九天造化錄 · 傳書
        </div>
        <button
          onClick={onClearLogs}
          title="清空傳書"
          className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-[#21262d] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 篩選標籤 */}
      <div className="flex items-center gap-1 p-1.5 bg-[#0e1219] border-b border-[#21262d] text-[11px]">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-0.5 rounded transition-colors ${
            filter === 'all' ? 'bg-[#21262d] text-amber-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('gain')}
          className={`px-2 py-0.5 rounded transition-colors ${
            filter === 'gain' ? 'bg-[#21262d] text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          收穫
        </button>
        <button
          onClick={() => setFilter('danger')}
          className={`px-2 py-0.5 rounded transition-colors ${
            filter === 'danger' ? 'bg-[#21262d] text-rose-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          殺機
        </button>
        <button
          onClick={() => setFilter('breakthrough')}
          className={`px-2 py-0.5 rounded transition-colors ${
            filter === 'breakthrough' ? 'bg-[#21262d] text-purple-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          破境
        </button>
      </div>

      {/* 日誌訊息串流 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredLogs.map((log) => {
          let borderCol = 'border-slate-700 text-slate-300';
          if (log.type === 'gain') borderCol = 'border-emerald-500/70 text-emerald-300';
          else if (log.type === 'gold') borderCol = 'border-amber-500/70 text-amber-300';
          else if (log.type === 'danger') borderCol = 'border-rose-500/70 text-rose-300';
          else if (log.type === 'breakthrough') borderCol = 'border-purple-500/70 text-purple-300';

          return (
            <div
              key={log.id}
              className={`border-l-2 pl-2 py-0.5 text-[11px] leading-relaxed ${borderCol}`}
            >
              <div className="text-[10px] text-slate-500 font-mono mb-0.5">
                {log.year}年 {log.month}月
              </div>
              <div>{log.text}</div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="py-8 text-center text-slate-600 text-[11px]">
            尚無此類傳書記錄
          </div>
        )}
      </div>
    </div>
  );
};
