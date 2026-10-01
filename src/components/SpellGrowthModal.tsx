import React from 'react';
import { SpellCard, ElementType, PlayerState } from '../types/game';
import { getSpellMastery, getUpgradedSpell } from '../data/cultivation';
import { sound } from '../utils/audio';
import { QiRadarChart } from './QiRadarChart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { X, Sparkles, BookOpen, CheckCircle2, Lock, Zap, TrendingUp, Award } from 'lucide-react';

interface Props {
  spell: SpellCard;
  player: PlayerState;
  onClose: () => void;
  onPracticeSpell: (spellId: string) => void;
}

const ELEMENT_INFO: Record<ElementType, { name: string; color: string; border: string; bg: string }> = {
  metal: { name: '金', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-600' },
  wood: { name: '木', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-600' },
  water: { name: '水', color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-600' },
  fire: { name: '火', color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-600' },
  earth: { name: '土', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-600' },
};

export const SpellGrowthModal: React.FC<Props> = ({
  spell,
  player,
  onClose,
  onPracticeSpell,
}) => {
  const currentExp = player.spellProficiency?.[spell.id] || 0;
  const mastery = getSpellMastery(currentExp);
  const upgraded = getUpgradedSpell(spell, currentExp);
  const element = ELEMENT_INFO[spell.element];

  const basePower = spell.damage || spell.shield || spell.heal || 20;
  const totalCost = Object.values(spell.cost).reduce((a, b) => a + (b || 0), 0);

  // Generate 4-stage growth dataset for Recharts
  const chartData = [
    {
      stage: '初窺門徑',
      exp: 0,
      power: Math.round(basePower),
      cost: totalCost,
      boost: '0%',
      desc: '基礎威能初探',
      unlocked: currentExp >= 0,
    },
    {
      stage: '略有小成',
      exp: 5,
      power: Math.round(basePower * 1.25),
      cost: totalCost,
      boost: '+25%',
      desc: '威能淬鍊增幅 25%',
      unlocked: currentExp >= 5,
    },
    {
      stage: '融會大成',
      exp: 15,
      power: Math.round(basePower * 1.55),
      cost: totalCost >= 3 ? totalCost - 1 : totalCost,
      boost: '+55%',
      desc: totalCost >= 3 ? '威能激增 55% · 靈氣消耗 -1' : '威能激增 55%',
      unlocked: currentExp >= 15,
    },
    {
      stage: '出神入化·真訣',
      exp: 30,
      power: Math.round(basePower * 1.85),
      cost: Math.max(1, totalCost - 1),
      boost: '+85%',
      desc: '威能極限暴增 85% · 必減靈氣 · 通曉真意',
      unlocked: currentExp >= 30,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="relative max-w-3xl w-full rounded-2xl bg-[#0f141d] border-2 border-amber-500/70 p-5 md:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 標題與法術基底 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold text-white ${element.bg}`}>
                {element.name}行
              </span>
              <span className="text-xs text-amber-400 font-mono font-medium">{spell.rarity}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-600/40 font-serif">
                {mastery.tierName}
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mt-1 flex items-center gap-2">
              {spell.name}
              <span className="text-xs text-slate-400 font-sans font-normal">
                · 熟練度悟性圖譜
              </span>
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">當前實戰/推演累計</span>
            <span className="text-xl font-mono font-bold text-amber-300">
              {currentExp} <span className="text-xs text-slate-400 font-sans font-normal">次</span>
            </span>
          </div>
        </div>

        {/* 核心資訊儀表 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
          <div className="bg-[#161c26] p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">當前威能數值</span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              {upgraded.damage || upgraded.shield || upgraded.heal || basePower} 點
            </span>
          </div>
          <div className="bg-[#161c26] p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">靈氣真元消耗</span>
            <span className="text-lg font-mono font-bold text-amber-300">
              {Object.values(upgraded.cost).reduce((a, b) => a + (b || 0), 0)} 點靈氣
            </span>
          </div>
          <div className="bg-[#161c26] p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">累計傷害/護盾加成</span>
            <span className="text-lg font-mono font-bold text-cyan-400">
              +{mastery.tier === 3 ? '85%' : mastery.tier === 2 ? '55%' : mastery.tier === 1 ? '25%' : '0%'}
            </span>
          </div>
          <div className="bg-[#161c26] p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">距下個悟道大關</span>
            <span className="text-lg font-mono font-bold text-purple-400">
              {mastery.nextExp ? `${Math.max(0, mastery.nextExp - currentExp)} 次` : '已登真境'}
            </span>
          </div>
        </div>

        {/* Recharts 圖表視圖：成長曲線與靈氣雷達分配 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 bg-[#0b0f16] border border-slate-800/80 rounded-xl p-4 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-300">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                四重法道境界成長曲線 (Recharts 渲染)
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                實線為威力成長
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spellPowerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis
                    dataKey="stage"
                    stroke="#8b949e"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#8b949e"
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#161c26] border border-amber-500/60 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <div className="font-serif font-bold text-amber-300 flex items-center justify-between gap-3">
                              <span>{data.stage}</span>
                              <span className="text-[10px] text-slate-400 font-mono">門檻: {data.exp} 次</span>
                            </div>
                            <div className="text-emerald-400 font-mono">
                              預計威能: {data.power} ({data.boost})
                            </div>
                            <div className="text-amber-200/90 font-mono">
                              靈氣消耗: {data.cost} 點
                            </div>
                            <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-700">
                              {data.desc}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="power"
                    name="威能數值"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#spellPowerGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 靈氣屬性分配雷達圖 */}
          <div className="md:col-span-1 bg-[#0b0f16] border border-slate-800/80 rounded-xl p-3 shadow-inner flex flex-col justify-between">
            <div className="text-xs font-serif font-bold text-amber-300 mb-1 flex items-center justify-between">
              <span>五行靈氣構成 (RadarChart)</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <QiRadarChart cost={spell.cost} primaryColor="#f59e0b" height={150} />
            </div>
            <div className="text-[10px] text-slate-400 text-center font-mono">
              施法總需 {totalCost} 點真元靈氣
            </div>
          </div>
        </div>

        {/* 強化屬性階梯解鎖清單 */}
        <div className="mt-4 space-y-2">
          <span className="text-xs font-serif font-bold text-slate-300 block">
            解鎖強化屬性一覽
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {chartData.map((item, idx) => (
              <div
                key={item.stage}
                className={`p-2.5 rounded-lg border flex items-start gap-2.5 transition-all ${
                  item.unlocked
                    ? 'bg-emerald-950/20 border-emerald-500/50 text-slate-200'
                    : 'bg-[#11161f]/50 border-slate-800 text-slate-500'
                }`}
              >
                <div className="mt-0.5">
                  {item.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <strong className={item.unlocked ? 'text-amber-300 font-serif' : 'text-slate-400 font-serif'}>
                      {item.stage}
                    </strong>
                    <span className="text-[10px] font-mono">
                      {item.unlocked ? '已參透解鎖' : `需施展 ${item.exp} 次`}
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部按鈕區 */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            持有靈石: <strong className="text-amber-300 font-mono">{player.spiritStones}</strong> 顆
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onPracticeSpell(spell.id);
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-600/30 flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              閉關推演此術 (+3熟練 · 耗15石)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              關閉圖譜
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
