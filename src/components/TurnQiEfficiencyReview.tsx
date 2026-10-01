import React, { useState } from 'react';
import { CombatTurnMetric } from '../types/game';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  Activity,
  Sword,
  Sparkles,
} from 'lucide-react';

interface Props {
  currentTurn: number;
  turnMetrics: CombatTurnMetric[];
  currentTurnDealt: number;
  currentTurnQiSpent: number;
  currentTurnSpellsCount: number;
  currentTurnCombosCount: number;
  defaultExpanded?: boolean;
}

export const TurnQiEfficiencyReview: React.FC<Props> = ({
  currentTurn,
  turnMetrics = [],
  currentTurnDealt = 0,
  currentTurnQiSpent = 0,
  currentTurnSpellsCount = 0,
  currentTurnCombosCount = 0,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  // Combine past completed turns with current ongoing turn
  const fullTurns = [...turnMetrics];
  const hasCurrentActivity =
    currentTurnDealt > 0 || currentTurnQiSpent > 0 || currentTurnSpellsCount > 0;

  if (hasCurrentActivity || fullTurns.length === 0) {
    fullTurns.push({
      turn: currentTurn,
      damageDealt: currentTurnDealt,
      damageReceived: 0,
      qiSpent: currentTurnQiSpent,
      spellsCastCount: currentTurnSpellsCount,
      combosCount: currentTurnCombosCount,
    });
  }

  const chartData = fullTurns.map((t) => {
    const efficiency =
      t.qiSpent > 0 ? parseFloat((t.damageDealt / t.qiSpent).toFixed(1)) : t.damageDealt;

    return {
      name: `第${t.turn}輪`,
      turn: t.turn,
      qiSpent: t.qiSpent,
      damageDealt: t.damageDealt,
      efficiency,
      combosCount: t.combosCount,
      spellsCount: t.spellsCastCount,
      isCurrent: t.turn === currentTurn,
    };
  });

  const totalQiSpent = chartData.reduce((acc, c) => acc + c.qiSpent, 0);
  const totalDamageDealt = chartData.reduce((acc, c) => acc + c.damageDealt, 0);
  const avgEfficiency =
    totalQiSpent > 0
      ? (totalDamageDealt / totalQiSpent).toFixed(1)
      : totalDamageDealt.toString();
  const highestEfficiency = Math.max(...chartData.map((d) => d.efficiency));

  return (
    <div className="bg-[#10151f] border border-[#263142] rounded-xl shadow-md overflow-hidden transition-all duration-300">
      {/* 摺疊面板標頭 (Accordion Header) */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full px-4 py-2.5 flex items-center justify-between bg-gradient-to-r from-[#141b28] via-[#101622] to-[#141b28] hover:bg-[#1a2333] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-sm">
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-slate-100 flex items-center gap-1.5">
                戰局回顧 · 靈氣消耗與傷害效率
                <span className="text-[10px] text-amber-400 font-sans font-normal hidden sm:inline">
                  (ComposedChart 組合圖)
                </span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-700/50 font-mono">
                {chartData.length} 輪歷程
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
              <span>
                累計靈氣: <strong className="text-cyan-300">{totalQiSpent}</strong> 點
              </span>
              <span>·</span>
              <span>
                總輸出: <strong className="text-emerald-400">{totalDamageDealt}</strong> 點
              </span>
              <span>·</span>
              <span>
                均效: <strong className="text-amber-300">{avgEfficiency}</strong> 傷/靈
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-[11px] hidden md:inline font-serif text-amber-300/80">
            {isExpanded ? '收起回顧圖表' : '展開圖表詳情'}
          </span>
          <div className="p-1 rounded bg-slate-800/80 text-slate-300">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* 展開之 ComposedChart 內容區 */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-800 bg-[#0a0e16]/80 space-y-3 animate-fadeIn">
          {/* 快速數據條 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-[#121824] p-2 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> 總消耗靈氣
              </span>
              <span className="font-mono font-bold text-cyan-300">{totalQiSpent} 點</span>
            </div>
            <div className="bg-[#121824] p-2 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Sword className="w-3 h-3 text-emerald-400" /> 造成總傷害
              </span>
              <span className="font-mono font-bold text-emerald-400">{totalDamageDealt} 點</span>
            </div>
            <div className="bg-[#121824] p-2 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-amber-400" /> 平均每輪效率
              </span>
              <span className="font-mono font-bold text-amber-300">{avgEfficiency} 傷/靈</span>
            </div>
            <div className="bg-[#121824] p-2 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" /> 單輪最高效率
              </span>
              <span className="font-mono font-bold text-yellow-300">{highestEfficiency} 傷/靈</span>
            </div>
          </div>

          {/* Recharts ComposedChart: 柱狀圖(靈氣消耗) + 折線圖(傷害效率) */}
          <div className="h-56 w-full bg-[#070b12] rounded-lg p-2 border border-slate-800/90 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#8b949e"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#38bdf8"
                  fontSize={10}
                  tickLine={false}
                  label={{
                    value: '消耗靈氣',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#38bdf8',
                    fontSize: 9,
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f59e0b"
                  fontSize={10}
                  tickLine={false}
                  label={{
                    value: '效率(傷/靈)',
                    angle: 90,
                    position: 'insideRight',
                    fill: '#f59e0b',
                    fontSize: 9,
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#141b27] border border-cyan-500/60 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                          <div className="font-serif font-bold text-amber-300 flex items-center justify-between gap-3">
                            <span>{d.name} {d.isCurrent ? '(本輪即時)' : ''}</span>
                            <span className="text-[10px] text-cyan-300 font-mono">
                              靈氣: {d.qiSpent} 點
                            </span>
                          </div>
                          <div className="text-emerald-400 font-mono">
                            ⚔️ 造成傷害: {d.damageDealt} 點
                          </div>
                          <div className="text-amber-300 font-mono font-bold pt-0.5 border-t border-slate-700">
                            ⚡ 傷害效率: {d.efficiency} 點威能 / 靈氣
                          </div>
                          {d.combosCount > 0 && (
                            <div className="text-yellow-400 text-[10px]">
                              🔥 觸發五行相生連擊 {d.combosCount} 式
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                  iconType="circle"
                />
                <Bar
                  yAxisId="left"
                  dataKey="qiSpent"
                  name="靈氣消耗 (點)"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="efficiency"
                  name="傷害效率 (傷/靈)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f59e0b' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
            <span>天藍色長條：該回合所耗五行靈氣總量</span>
            <span>金黃色曲線：每點真元所換取之殺傷威能</span>
          </div>
        </div>
      )}
    </div>
  );
};
