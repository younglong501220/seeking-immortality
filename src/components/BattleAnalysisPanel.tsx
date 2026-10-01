import React from 'react';
import { CombatTurnMetric, EnemyActor, PlayerState } from '../types/game';
import {
  ComposedChart,
  Bar,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Sword,
  Zap,
  Activity,
  Award,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface Props {
  player: PlayerState;
  enemy: EnemyActor;
  currentTurn: number;
  turnMetrics: CombatTurnMetric[];
  currentTurnDealt: number;
  currentTurnQiSpent: number;
  currentTurnSpellsCount: number;
  currentTurnCombosCount: number;
  onBackToCombat?: () => void;
}

export const BattleAnalysisPanel: React.FC<Props> = ({
  player,
  enemy,
  currentTurn,
  turnMetrics,
  currentTurnDealt,
  currentTurnQiSpent,
  currentTurnSpellsCount,
  currentTurnCombosCount,
  onBackToCombat,
}) => {
  // Combine finalized turns with ongoing turn data for real-time visualization
  const fullTurnData = [...turnMetrics];
  const hasCurrentTurnActive =
    currentTurnDealt > 0 || currentTurnQiSpent > 0 || currentTurnSpellsCount > 0;

  if (hasCurrentTurnActive || fullTurnData.length === 0) {
    fullTurnData.push({
      turn: currentTurn,
      damageDealt: currentTurnDealt,
      damageReceived: 0,
      qiSpent: currentTurnQiSpent,
      spellsCastCount: currentTurnSpellsCount,
      combosCount: currentTurnCombosCount,
    });
  }

  // Calculate aggregates & cumulative stats
  let cumulativeDealt = 0;
  let cumulativeReceived = 0;

  const chartData = fullTurnData.map((m) => {
    cumulativeDealt += m.damageDealt;
    cumulativeReceived += m.damageReceived;
    const efficiency =
      m.qiSpent > 0 ? parseFloat((m.damageDealt / m.qiSpent).toFixed(1)) : m.damageDealt;

    return {
      name: `第 ${m.turn} 輪`,
      turn: m.turn,
      damageDealt: m.damageDealt,
      damageReceived: m.damageReceived,
      qiSpent: m.qiSpent,
      efficiency,
      cumDealt: cumulativeDealt,
      cumReceived: cumulativeReceived,
      spellsCount: m.spellsCastCount,
      combosCount: m.combosCount,
      isOngoing: m.turn === currentTurn,
    };
  });

  const totalDealt = chartData.reduce((acc, cur) => acc + cur.damageDealt, 0);
  const totalReceived = chartData.reduce((acc, cur) => acc + cur.damageReceived, 0);
  const totalQi = chartData.reduce((acc, cur) => acc + cur.qiSpent, 0);
  const totalCombos = chartData.reduce((acc, cur) => acc + cur.combosCount, 0);
  const avgEfficiency =
    totalQi > 0 ? (totalDealt / totalQi).toFixed(1) : (totalDealt || 0).toString();
  const peakDamage = Math.max(0, ...chartData.map((d) => d.damageDealt));
  const peakTurn = chartData.find((d) => d.damageDealt === peakDamage)?.turn || currentTurn;

  return (
    <div className="space-y-5 select-none pb-6">
      {/* 頂部總結標題列 */}
      <div className="bg-[#111722] border border-[#2d3748] rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                鬥法覆盤 · 戰況即時分析
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-600/40 font-mono">
                當前第 {currentTurn} 輪
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-serif font-bold text-white flex items-center gap-2 mt-0.5">
              <span>對決強敵：{enemy.name}</span>
              <span className="text-xs text-rose-400 font-sans font-normal">
                ({enemy.realm} · 敵殘血 {enemy.hp}/{enemy.maxHp})
              </span>
            </h2>
          </div>
        </div>

        {onBackToCombat && (
          <button
            onClick={onBackToCombat}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
          >
            <Sword className="w-3.5 h-3.5" />
            返回鬥法出招
          </button>
        )}
      </div>

      {/* 戰鬥關鍵績效指標卡 (KPI Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-[#161c26] p-3 rounded-xl border border-emerald-500/30 shadow-sm">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Sword className="w-3 h-3 text-emerald-400" /> 累計造成傷害
          </span>
          <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5 block">
            {totalDealt} <span className="text-[10px] text-slate-400 font-sans">點</span>
          </span>
          <span className="text-[9px] text-emerald-500/80 font-mono">敵手破防打擊</span>
        </div>

        <div className="bg-[#161c26] p-3 rounded-xl border border-rose-500/30 shadow-sm">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> 累計承受傷害
          </span>
          <span className="text-xl font-mono font-bold text-rose-400 mt-0.5 block">
            {totalReceived} <span className="text-[10px] text-slate-400 font-sans">點</span>
          </span>
          <span className="text-[9px] text-rose-400/80 font-mono">真元護體承受</span>
        </div>

        <div className="bg-[#161c26] p-3 rounded-xl border border-cyan-500/30 shadow-sm">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" /> 真元消耗總計
          </span>
          <span className="text-xl font-mono font-bold text-cyan-300 mt-0.5 block">
            {totalQi} <span className="text-[10px] text-slate-400 font-sans">點靈氣</span>
          </span>
          <span className="text-[9px] text-cyan-400/80 font-mono">五行靈氣引動</span>
        </div>

        <div className="bg-[#161c26] p-3 rounded-xl border border-amber-500/30 shadow-sm">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-amber-400" /> 平均施法轉化率
          </span>
          <span className="text-xl font-mono font-bold text-amber-300 mt-0.5 block">
            {avgEfficiency} <span className="text-[10px] text-slate-400 font-sans">傷/靈</span>
          </span>
          <span className="text-[9px] text-amber-400/80 font-mono">每點靈氣威力</span>
        </div>

        <div className="bg-[#161c26] p-3 rounded-xl border border-purple-500/30 shadow-sm">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-purple-400" /> 單輪最高爆發
          </span>
          <span className="text-xl font-mono font-bold text-purple-300 mt-0.5 block">
            {peakDamage} <span className="text-[10px] text-slate-400 font-sans">點</span>
          </span>
          <span className="text-[9px] text-purple-400/80 font-mono">於第 {peakTurn} 輪打出</span>
        </div>

        <div className="bg-[#161c26] p-3 rounded-xl border border-yellow-500/30 shadow-sm">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-400" /> 五行連擊觸發
          </span>
          <span className="text-xl font-mono font-bold text-yellow-300 mt-0.5 block">
            {totalCombos} <span className="text-[10px] text-slate-400 font-sans">次</span>
          </span>
          <span className="text-[9px] text-yellow-400/80 font-mono">相生妙法共鳴</span>
        </div>
      </div>

      {/* 圖表一：每輪攻防數值與靈氣效率 (Per-Turn Damage & Efficiency ComposedChart) */}
      <div className="bg-[#111722] border border-[#2d3748] rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-serif font-bold text-slate-100">
              每輪攻防對比與真元效率 (Damage & Qi Efficiency Per Turn)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            長條：造成/承受傷害 (左軸) · 折線：每點靈氣威力 (右軸)
          </span>
        </div>

        <div className="h-64 w-full bg-[#090d14] rounded-lg p-2 border border-slate-800/80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#8b949e" fontSize={11} tickLine={false} />
              <YAxis
                yAxisId="left"
                stroke="#8b949e"
                fontSize={11}
                tickLine={false}
                label={{ value: '傷害數值', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#38bdf8"
                fontSize={11}
                tickLine={false}
                label={{ value: '傷/靈 效率', angle: 90, position: 'insideRight', fill: '#38bdf8', fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#161f2e] border border-amber-500/60 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="font-serif font-bold text-amber-300 flex items-center justify-between gap-4">
                          <span>{d.name} {d.isOngoing ? '(進行中)' : ''}</span>
                          <span className="text-[10px] font-mono text-cyan-300">靈氣消耗: {d.qiSpent}</span>
                        </div>
                        <div className="text-emerald-400 font-mono">
                          ⚔️ 造成傷害: {d.damageDealt} 點
                        </div>
                        <div className="text-rose-400 font-mono">
                          🛡️ 承受傷害: {d.damageReceived} 點
                        </div>
                        <div className="text-cyan-300 font-mono font-bold pt-1 border-t border-slate-700">
                          ⚡ 真元效率: {d.efficiency} 點威能 / 靈氣
                        </div>
                        {d.combosCount > 0 && (
                          <div className="text-amber-400 text-[10px]">
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
                wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                iconType="circle"
              />
              <Bar
                yAxisId="left"
                dataKey="damageDealt"
                name="造成傷害"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                yAxisId="left"
                dataKey="damageReceived"
                name="承受傷害"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="efficiency"
                name="真元效率(傷/靈)"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#38bdf8' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 圖表二：累積攻防走勢曲線 (Cumulative Battle Trajectory AreaChart) */}
      <div className="bg-[#111722] border border-[#2d3748] rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-serif font-bold text-slate-100">
              累積戰損走勢曲線 (Cumulative Damage Trajectory)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            綠域為累計對敵輸出 · 紅域為累計自身損耗
          </span>
        </div>

        <div className="h-52 w-full bg-[#090d14] rounded-lg p-2 border border-slate-800/80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="cumDealtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cumRecvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#8b949e" fontSize={11} tickLine={false} />
              <YAxis stroke="#8b949e" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#161f2e] border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="font-serif font-bold text-slate-200">{d.name} 累計戰況</div>
                        <div className="text-emerald-400 font-mono">累計輸出: {d.cumDealt} 點</div>
                        <div className="text-rose-400 font-mono">累計承傷: {d.cumReceived} 點</div>
                        <div className="text-amber-300 font-mono">淨輸出差額: +{d.cumDealt - d.cumReceived} 點</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Area
                type="monotone"
                dataKey="cumDealt"
                name="累計對敵輸出"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cumDealtGrad)"
              />
              <Area
                type="monotone"
                dataKey="cumReceived"
                name="累計承受傷害"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cumRecvGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 輪次詳細戰況覆盤清單 */}
      <div className="bg-[#111722] border border-[#2d3748] rounded-xl p-4 shadow-lg">
        <h3 className="text-sm font-serif font-bold text-slate-200 mb-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          全輪次法訣施展覆盤清單 (Turn Log Table)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-[#0b0e14] text-[11px] text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">輪次</th>
                <th className="py-2 px-3 text-emerald-400">造成傷害</th>
                <th className="py-2 px-3 text-rose-400">承受傷害</th>
                <th className="py-2 px-3 text-cyan-300">消耗靈氣</th>
                <th className="py-2 px-3 text-amber-300">真元轉化比</th>
                <th className="py-2 px-3 text-yellow-300">連擊次數</th>
                <th className="py-2 px-3 text-right">戰況評價</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {chartData.map((d) => {
                const diff = d.damageDealt - d.damageReceived;
                let rating = '勢均力敵';
                let ratingColor = 'text-slate-400';
                if (diff >= 25) {
                  rating = '天道壓制 · 狂勝';
                  ratingColor = 'text-emerald-400 font-bold';
                } else if (diff > 0) {
                  rating = '佔據優勢';
                  ratingColor = 'text-emerald-300';
                } else if (diff < -20) {
                  rating = '真元受損 · 告急';
                  ratingColor = 'text-rose-400 font-bold';
                } else if (diff < 0) {
                  rating = '處於下風';
                  ratingColor = 'text-rose-300';
                }

                return (
                  <tr key={d.turn} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-serif">
                      {d.name} {d.isOngoing && <span className="text-[10px] text-amber-400 ml-1">(當前)</span>}
                    </td>
                    <td className="py-2 px-3 font-bold text-emerald-400">{d.damageDealt}</td>
                    <td className="py-2 px-3 font-bold text-rose-400">{d.damageReceived}</td>
                    <td className="py-2 px-3 text-cyan-300">{d.qiSpent} 點</td>
                    <td className="py-2 px-3 text-amber-300 font-bold">{d.efficiency} 傷/靈</td>
                    <td className="py-2 px-3 text-yellow-300">{d.combosCount > 0 ? `${d.combosCount} 次` : '-'}</td>
                    <td className={`py-2 px-3 text-right ${ratingColor}`}>{rating}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
