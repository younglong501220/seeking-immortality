import React, { useState } from 'react';
import { PlayerState, RetreatRecord } from '../types/game';
import { SPIRIT_ARRAY_CONFIGS, getArrayTier } from '../data/spiritArray';
import { sound } from '../utils/audio';
import {
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
  Sparkles,
  Zap,
  TrendingUp,
  CircleDot,
  Gem,
  ArrowUpRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface Props {
  player: PlayerState;
  onUpgradeArray: () => void;
}

export const SpiritGatheringArrayPanel: React.FC<Props> = ({
  player,
  onUpgradeArray,
}) => {
  const currentLevel = player.gatheringArrayLevel || 0;
  const currentTier = getArrayTier(currentLevel);
  const nextTier = SPIRIT_ARRAY_CONFIGS[currentLevel + 1] || null;
  const isMaxLevel = !nextTier;
  const canAfford = nextTier ? player.spiritStones >= nextTier.upgradeCost : false;

  // Generate or use past 7 meditation sessions
  const retreatHistory = player.retreatHistory || [];
  
  // Synthesize or supplement up to 7 records if the player is new
  const historyToDisplay: RetreatRecord[] = (() => {
    if (retreatHistory.length >= 7) {
      return retreatHistory.slice(-7);
    }
    const needed = 7 - retreatHistory.length;
    const baseSamples: RetreatRecord[] = [];
    const baseExp = currentLevel >= 2 ? 80 : 25;
    for (let i = needed; i >= 1; i--) {
      const pseudoSession = Math.max(1, (retreatHistory[0]?.session || 1) - i);
      const bonusPct = currentTier.bonusPercent;
      const finalVal = Math.floor(baseExp * (1 + bonusPct / 100));
      baseSamples.push({
        session: pseudoSession,
        year: Math.max(1, 15 - Math.floor(i / 2)),
        month: ((i * 3) % 12) + 1,
        expGained: baseExp,
        arrayBonusPercent: bonusPct,
        finalExp: finalVal,
        arrayLevel: currentLevel,
      });
    }
    return [...baseSamples, ...retreatHistory].slice(-7);
  })();

  const chartData = historyToDisplay.map((rec, idx) => {
    const bonusExp = Math.max(0, rec.finalExp - rec.expGained);
    return {
      sessionName: `第${rec.session || idx + 1}次`,
      session: rec.session || idx + 1,
      baseExp: rec.expGained,
      bonusExp: bonusExp,
      finalExp: rec.finalExp,
      bonusPercent: rec.arrayBonusPercent,
      dateText: `${rec.year}年${rec.month}月`,
      levelName: getArrayTier(rec.arrayLevel).name,
    };
  });

  const totalExpLast7 = chartData.reduce((acc, d) => acc + d.finalExp, 0);
  const totalBonusLast7 = chartData.reduce((acc, d) => acc + d.bonusExp, 0);
  const avgExpLast7 = Math.round(totalExpLast7 / chartData.length);

  return (
    <div className="bg-[#121722] border-2 border-emerald-900/50 rounded-2xl p-5 shadow-2xl space-y-6 relative overflow-hidden">
      {/* 背景陣法太極淡光紋飾 */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* 標題與簡介 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/40 flex items-center justify-center text-emerald-200 shadow-lg shadow-emerald-900/40">
            <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-serif font-black text-slate-100 tracking-wide flex items-center gap-2">
                洞府靈脈 · 聚靈法陣
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                階位：{currentTier.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              引周天太虛靈脈灌頂，大幅提升「靜心閉關」時所凝練之天地道行修為。
            </p>
          </div>
        </div>

        {/* 擁有靈石 */}
        <div className="flex items-center gap-2 bg-[#0c1017] px-3 py-1.5 rounded-lg border border-slate-800">
          <Gem className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400">儲備靈石：</span>
          <span className="font-mono font-bold text-amber-300 text-sm">{player.spiritStones}</span>
        </div>
      </div>

      {/* 陣法核心互動區 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* 左側：八卦太極陣法核心盤面 */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0b0f17] to-[#070a10] border border-slate-800/90 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          {/* 聚靈光環 */}
          <div className="relative w-40 h-40 flex items-center justify-center my-2">
            {/* 外圈陣法符文輪 */}
            <div
              className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/40 animate-spin"
              style={{ animationDuration: '24s' }}
            />
            {/* 次圈光紋 */}
            <div
              className="absolute inset-3 rounded-full border border-teal-500/30 animate-spin"
              style={{ animationDuration: '16s', animationDirection: 'reverse' }}
            />
            {/* 核心靈液台 */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-900 border-2 border-emerald-400/60 flex flex-col items-center justify-center text-center shadow-lg shadow-emerald-500/20 z-10">
              <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">
                {currentTier.runeText}
              </span>
              <span className="text-xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                +{currentTier.bonusPercent}%
              </span>
              <span className="text-[9px] text-slate-400 font-serif">修為轉化</span>
            </div>
          </div>

          <div className="text-center space-y-1 mt-1 z-10 w-full px-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-serif font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>當前靈效：閉關修為獲取增強 +{currentTier.bonusPercent}%</span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              {currentTier.desc}
            </p>
          </div>

          {/* 升級進度階梯點 */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80 w-full justify-center">
            {SPIRIT_ARRAY_CONFIGS.map((tier) => (
              <div
                key={tier.level}
                title={`${tier.name} (+${tier.bonusPercent}%)`}
                className={`w-4 h-1.5 rounded-full transition-all ${
                  tier.level <= currentLevel
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 右側：投入靈石升級與下一階屬性 */}
        <div className="lg:col-span-7 bg-[#0d121c] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-serif">陣法晉階推演：</span>
              <span className="font-mono text-emerald-400 text-xs">
                {isMaxLevel ? '天道圓滿' : `下一階：${nextTier?.name}`}
              </span>
            </div>

            {nextTier ? (
              <div className="bg-[#141b27] border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CircleDot className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-serif font-bold text-slate-200">
                      {nextTier.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
                    提升至 +{nextTier.bonusPercent}% 效率
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {nextTier.desc}
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>
                    需消耗靈石：<strong className="text-amber-300 font-mono">{nextTier.upgradeCost}</strong> 顆
                  </span>
                  <span>
                    靈石差額：
                    <strong className={canAfford ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                      {canAfford ? '充足可昇華' : `尚缺 ${nextTier.upgradeCost - player.spiritStones} 顆`}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-950/40 via-amber-950/40 to-slate-900 border border-amber-500/40 rounded-lg p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-serif font-black">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  九霄通天造化神陣已臻至境！
                </div>
                <p className="text-xs text-slate-400">
                  靈脈聚靈陣已凝練至五階圓滿，享天地靈脈極限加成 +320%！
                </p>
              </div>
            )}
          </div>

          {/* 升級按鈕 */}
          {!isMaxLevel && nextTier && (
            <button
              onClick={onUpgradeArray}
              disabled={!canAfford}
              className={`w-full py-2.5 px-4 rounded-xl font-serif font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                canAfford
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-900/50 hover:scale-[1.01]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/80 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              投入 {nextTier.upgradeCost} 靈石 · 銘刻符印升級靈陣
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 過去 7 次閉關修為增長曲線 (Recharts AreaChart) */}
      <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-serif font-bold text-slate-200">
              過去 7 次靜心閉關 · 修為增長演化曲線 (AreaChart)
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>
              7次累計: <strong className="text-emerald-400">+{totalExpLast7}</strong> 點
            </span>
            <span>·</span>
            <span>
              靈陣額外增幅: <strong className="text-teal-300">+{totalBonusLast7}</strong> 點
            </span>
            <span>·</span>
            <span>
              均次獲取: <strong className="text-cyan-300">+{avgExpLast7}</strong> 點
            </span>
          </div>
        </div>

        {/* AreaChart Container */}
        <div className="h-64 w-full bg-[#07090e] rounded-lg p-2 border border-slate-800/80 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
            >
              <defs>
                {/* 最終總修為漸變面 */}
                <linearGradient id="expFinalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                {/* 靈陣賦能額外修為漸變面 */}
                <linearGradient id="expBonusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="sessionName"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#10b981"
                fontSize={10}
                tickLine={false}
                label={{
                  value: '吸收修為 (點)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#10b981',
                  fontSize: 10,
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#111722] border border-emerald-500/60 p-2.5 rounded-lg shadow-2xl text-xs space-y-1">
                        <div className="font-serif font-bold text-amber-300 flex items-center justify-between gap-4">
                          <span>{d.sessionName} 靜心閉關</span>
                          <span className="text-[10px] text-slate-400 font-mono">{d.dateText}</span>
                        </div>
                        <div className="text-emerald-400 font-mono font-bold text-sm">
                          ✨ 最終沉澱修為: +{d.finalExp} 點
                        </div>
                        <div className="text-slate-300 font-mono text-[11px] pt-1 border-t border-slate-700/80">
                          基礎吞吐: +{d.baseExp} 點
                        </div>
                        <div className="text-cyan-300 font-mono text-[11px]">
                          ⚡ 靈陣加成: +{d.bonusExp} 點 (+{d.bonusPercent}%)
                        </div>
                        <div className="text-slate-400 text-[10px] font-serif">
                          所承靈陣：{d.levelName}
                        </div>
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
              <Area
                type="monotone"
                dataKey="finalExp"
                name="最終獲取總修為 (點)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expFinalGrad)"
                dot={{ r: 4, fill: '#10b981', stroke: '#064e3b', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="bonusExp"
                name="聚靈陣額外賦能 (點)"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expBonusGrad)"
                dot={{ r: 3, fill: '#06b6d4' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            翠綠面積：閉關大周天總修為增長
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            蔚藍面積：聚靈陣帶來的額外造化修為
          </span>
        </div>
      </div>
    </div>
  );
};
