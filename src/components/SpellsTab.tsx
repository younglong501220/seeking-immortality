import React, { useState, useEffect, useRef } from 'react';
import { PlayerState, SpellCard, ElementType } from '../types/game';
import { ALL_SPELLS, getUpgradedSpell, getSpellMastery } from '../data/cultivation';
import { sound } from '../utils/audio';
import { SpellGrowthModal } from './SpellGrowthModal';
import { QiRadarChart } from './QiRadarChart';
import { SpellProgressComposedChart } from './SpellProgressComposedChart';
import { SpellCardParticleBorder } from './SpellCardParticleBorder';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import {
  Scroll,
  Sparkles,
  Plus,
  Trash2,
  BookOpen,
  TrendingUp,
  LayoutGrid,
  BarChart3,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface Props {
  player: PlayerState;
  onToggleSpellInDeck: (spellId: string) => void;
  onPracticeSpell: (spellId: string) => void;
}

const ELEMENT_LABELS: Record<ElementType, { name: string; color: string; border: string; bg: string; hex: string }> = {
  metal: { name: '金', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-600', hex: '#d97706' },
  wood: { name: '木', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-600', hex: '#059669' },
  water: { name: '水', color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-600', hex: '#2563eb' },
  fire: { name: '火', color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-600', hex: '#e11d48' },
  earth: { name: '土', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-600', hex: '#9333ea' },
};

export const SpellsTab: React.FC<Props> = ({
  player,
  onToggleSpellInDeck,
  onPracticeSpell,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('cards');
  const [globalCardChartType, setGlobalCardChartType] = useState<'composed' | 'radar'>('radar');
  const [cardChartOverrides, setCardChartOverrides] = useState<Record<string, 'composed' | 'radar'>>({});
  const [filterElement, setFilterElement] = useState<string>('all');
  const [modalSpell, setModalSpell] = useState<SpellCard | null>(null);
  const [selectedDashboardSpellId, setSelectedDashboardSpellId] = useState<string>('金刃術');

  // Track proficiency upgrades for card edge particle animations & tier leap effects
  const prevProfRef = useRef<Record<string, number>>({ ...(player.spellProficiency || {}) });
  const [upgradedSpellEffects, setUpgradedSpellEffects] = useState<Record<string, {
    timestamp: number;
    expGained: number;
    isTierCross: boolean;
    oldTier: number;
    newTier: number;
    oldTierName: string;
    newTierName: string;
  }>>({});

  useEffect(() => {
    const prevProf = prevProfRef.current;
    const currentProf = player.spellProficiency || {};

    Object.keys(currentProf).forEach((spellId) => {
      const prevExp = prevProf[spellId] || 0;
      const curExp = currentProf[spellId] || 0;

      if (curExp > prevExp) {
        const oldMastery = getSpellMastery(prevExp);
        const newMastery = getSpellMastery(curExp);
        const isTierCross = newMastery.tier > oldMastery.tier;

        setUpgradedSpellEffects((prev) => ({
          ...prev,
          [spellId]: {
            timestamp: Date.now(),
            expGained: curExp - prevExp,
            isTierCross,
            oldTier: oldMastery.tier,
            newTier: newMastery.tier,
            oldTierName: oldMastery.tierName,
            newTierName: newMastery.tierName,
          },
        }));

        if (isTierCross) {
          sound.playBreakthrough();
        } else {
          sound.playFire();
        }

        setTimeout(() => {
          setUpgradedSpellEffects((prev) => {
            const next = { ...prev };
            delete next[spellId];
            return next;
          });
        }, 3600);
      }
    });

    prevProfRef.current = { ...currentProf };
  }, [player.spellProficiency]);

  const handlePracticeWithAnim = (spellId: string) => {
    const curExp = player.spellProficiency?.[spellId] || 0;
    const nextExp = curExp + 3;
    const oldMastery = getSpellMastery(curExp);
    const newMastery = getSpellMastery(nextExp);
    const isTierCross = newMastery.tier > oldMastery.tier;

    setUpgradedSpellEffects((prev) => ({
      ...prev,
      [spellId]: {
        timestamp: Date.now(),
        expGained: 3,
        isTierCross,
        oldTier: oldMastery.tier,
        newTier: newMastery.tier,
        oldTierName: oldMastery.tierName,
        newTierName: newMastery.tierName,
      },
    }));

    if (isTierCross) {
      sound.playBreakthrough();
    } else {
      sound.playFire();
    }

    setTimeout(() => {
      setUpgradedSpellEffects((prev) => {
        const next = { ...prev };
        delete next[spellId];
        return next;
      });
    }, 3600);

    onPracticeSpell(spellId);
  };

  // Count instances in player deck
  const deckCounts: Record<string, number> = {};
  player.deck.forEach((id) => {
    deckCounts[id] = (deckCounts[id] || 0) + 1;
  });

  const uniqueKnownSpells = Array.from(new Set(player.deck));

  const filteredSpells = Object.values(ALL_SPELLS).filter((sp) => {
    if (filterElement !== 'all' && sp.element !== filterElement) return false;
    return true;
  });

  // Prepare data for the Macro BarChart (all known spells)
  const macroChartData = uniqueKnownSpells.map((spellId) => {
    const sp = ALL_SPELLS[spellId];
    const exp = player.spellProficiency?.[spellId] || 0;
    const mastery = getSpellMastery(exp);
    return {
      id: spellId,
      name: sp?.name || spellId,
      exp: exp,
      element: sp?.element || 'metal',
      tierName: mastery.tierName,
      color: sp ? ELEMENT_LABELS[sp.element].hex : '#d97706',
    };
  });

  // Selected spell for macro trend area chart
  const activeFocusSpell = ALL_SPELLS[selectedDashboardSpellId] || ALL_SPELLS[uniqueKnownSpells[0]] || ALL_SPELLS['金刃術'];
  const activeFocusExp = player.spellProficiency?.[activeFocusSpell.id] || 0;
  const activeFocusMastery = getSpellMastery(activeFocusExp);
  const activeFocusBasePower = activeFocusSpell.damage || activeFocusSpell.shield || activeFocusSpell.heal || 20;
  const activeFocusCost = Object.values(activeFocusSpell.cost).reduce((a, b) => a + (b || 0), 0);

  const focusTrendData = [
    {
      stage: '初窺門徑',
      exp: 0,
      power: Math.round(activeFocusBasePower),
      cost: activeFocusCost,
      boost: '0%',
      unlocked: activeFocusExp >= 0,
    },
    {
      stage: '略有小成',
      exp: 5,
      power: Math.round(activeFocusBasePower * 1.25),
      cost: activeFocusCost,
      boost: '+25%',
      unlocked: activeFocusExp >= 5,
    },
    {
      stage: '融會大成',
      exp: 15,
      power: Math.round(activeFocusBasePower * 1.55),
      cost: activeFocusCost >= 3 ? activeFocusCost - 1 : activeFocusCost,
      boost: '+55%',
      unlocked: activeFocusExp >= 15,
    },
    {
      stage: '出神入化·真訣',
      exp: 30,
      power: Math.round(activeFocusBasePower * 1.85),
      cost: Math.max(1, activeFocusCost - 1),
      boost: '+85%',
      unlocked: activeFocusExp >= 30,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 抬頭概覽與視圖切換 */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1 block">
              神通妙法 · 熟練度與成長趨勢
            </span>
            <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
              <Scroll className="w-6 h-6 text-amber-400" />
              周天神通真傳 · 悟道研習
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              臨敵出招累積熟練度，由「初窺門徑」步步晉升「出神入化·真訣」，威力暴增並減免靈氣！
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 視圖切換鈕 */}
            <div className="flex items-center bg-[#0d1117] p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'cards'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                卡牌牌組視圖
              </button>
              <button
                onClick={() => setViewMode('charts')}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'charts'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                成長圖表儀表 (Recharts)
              </button>
            </div>

            {/* 卡牌內嵌圖表全域切換 */}
            {viewMode === 'cards' && (
              <div className="hidden lg:flex items-center bg-[#0d1117] p-1 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400 px-1.5">卡牌圖表：</span>
                <button
                  type="button"
                  onClick={() => setGlobalCardChartType('radar')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                    globalCardChartType === 'radar'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  五行消耗雷達 (Radar)
                </button>
                <button
                  type="button"
                  onClick={() => setGlobalCardChartType('composed')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                    globalCardChartType === 'composed'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  熟練組合圖 (Composed)
                </button>
              </div>
            )}

            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 block">出戰牌組</span>
              <span className="text-lg font-mono font-bold text-amber-300">
                {player.deck.length} <span className="text-xs text-slate-400 font-sans font-normal">張手牌</span>
              </span>
            </div>
          </div>
        </div>

        {/* 熟練度境界說明 */}
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-[#0d1117] p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">一階 · 0-4 次</span>
            <strong className="text-slate-300 font-serif">初窺門徑</strong>
            <p className="text-[10px] text-slate-500 mt-0.5">基礎法訣威能</p>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-emerald-900/50">
            <span className="text-emerald-500 block text-[10px]">二階 · 5 次</span>
            <strong className="text-emerald-300 font-serif">略有小成</strong>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">威能/護盾/治療 +25%</p>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-blue-900/50">
            <span className="text-blue-500 block text-[10px]">三階 · 15 次</span>
            <strong className="text-blue-300 font-serif">融會大成</strong>
            <p className="text-[10px] text-blue-400/80 mt-0.5">威力 +55%，高費消耗-1</p>
          </div>
          <div className="bg-[#0d1117] p-2 rounded border border-purple-900/50">
            <span className="text-purple-500 block text-[10px]">極階 · 30 次</span>
            <strong className="text-purple-300 font-serif">出神入化·真訣</strong>
            <p className="text-[10px] text-purple-400/80 mt-0.5">威力 +85%，必定降1靈氣</p>
          </div>
        </div>
      </div>

      {/* 模式一：成長圖表儀表大盤 (Charts Dashboard) */}
      {viewMode === 'charts' && (
        <div className="space-y-6">
          {/* 已知神通熟練度柱狀對比圖 */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-sm font-serif font-bold text-amber-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  已掌握神通 · 熟練度實戰鍛造分布 (Recharts 柱狀圖)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  點擊下方柱條可切換聚焦檢視該神通的專屬成長軌跡曲線。
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> 略有小成 (5次)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" /> 融會大成 (15次)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" /> 真訣 (30次)
                </span>
              </div>
            </div>

            <div className="h-64 w-full bg-[#0d1117] rounded-lg p-2 border border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macroChartData} margin={{ top: 15, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#8b949e"
                    fontSize={11}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    tickLine={false}
                  />
                  <YAxis stroke="#8b949e" fontSize={11} tickLine={false} />
                  <ReferenceLine y={5} stroke="#10b981" strokeDasharray="3 3" label={{ value: '小成', fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={15} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: '大成', fill: '#3b82f6', fontSize: 10 }} />
                  <ReferenceLine y={30} stroke="#a855f7" strokeDasharray="3 3" label={{ value: '真訣', fill: '#a855f7', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#161c26] border border-amber-500/60 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <div className="font-serif font-bold text-amber-300">{d.name}</div>
                            <div className="text-slate-300">熟練次數: <span className="font-mono font-bold text-white">{d.exp} 次</span></div>
                            <div className="text-emerald-400">當前境界: {d.tierName}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="exp"
                    name="熟練度"
                    radius={[4, 4, 0, 0]}
                    onClick={(entry) => {
                      if (entry && entry.id) {
                        setSelectedDashboardSpellId(entry.id);
                        sound.playCard();
                      }
                    }}
                  >
                    {macroChartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={entry.id === selectedDashboardSpellId ? '#fbbf24' : entry.color}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 單一聚焦神通四重境界折線走勢 */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded font-bold text-white ${ELEMENT_LABELS[activeFocusSpell.element].bg}`}>
                  {ELEMENT_LABELS[activeFocusSpell.element].name}行
                </span>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    {activeFocusSpell.name}
                    <span className="text-xs text-amber-300 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-600/40">
                      {activeFocusMastery.tierName}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeFocusSpell.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPracticeSpell(activeFocusSpell.id)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-1 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  閉關推演此術 (+3熟練 · 耗15石)
                </button>
              </div>
            </div>

            {/* Recharts 成長趨勢曲線 */}
            <div className="h-56 w-full bg-[#0d1117] rounded-lg p-2 border border-slate-800 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={focusTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="macroFocusGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ELEMENT_LABELS[activeFocusSpell.element].hex} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={ELEMENT_LABELS[activeFocusSpell.element].hex} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="stage" stroke="#8b949e" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8b949e" fontSize={11} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#161c26] border border-amber-500/60 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <div className="font-serif font-bold text-amber-300">{d.stage}</div>
                            <div className="text-emerald-400 font-mono">預計威能: {d.power} ({d.boost})</div>
                            <div className="text-amber-200/90 font-mono">靈氣消耗: {d.cost} 點</div>
                            <div className="text-[11px] text-slate-400">所需門檻: 累計 {d.exp} 次施展</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="power"
                    name="威能"
                    stroke={ELEMENT_LABELS[activeFocusSpell.element].hex}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#macroFocusGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 階梯解鎖屬性 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              {focusTrendData.map((d) => (
                <div
                  key={d.stage}
                  className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    d.unlocked
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-[#0d1117] border-slate-800 text-slate-500'
                  }`}
                >
                  <div>
                    <strong className="font-serif block mb-0.5">{d.stage}</strong>
                    <span className="text-[10px] block opacity-80">威能: {d.power} ({d.boost})</span>
                  </div>
                  {d.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 模式二：經典卡牌牌組視圖 (Cards View) */}
      {viewMode === 'cards' && (
        <>
          {/* 當前出戰牌組 (Active Deck) */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-md">
            <h2 className="text-sm font-serif font-bold text-amber-300 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                出戰神通牌組 (當前戰鬥卡組)
              </span>
              <span className="text-xs text-slate-400 font-normal">
                點擊可移出牌庫（至少保留 4 張）
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(deckCounts).map(([spellId, count]) => {
                const rawSpell = ALL_SPELLS[spellId];
                if (!rawSpell) return null;
                const exp = player.spellProficiency?.[spellId] || 0;
                const spell = getUpgradedSpell(rawSpell, exp);
                const element = ELEMENT_LABELS[spell.element];
                const animState = upgradedSpellEffects[spellId];

                return (
                  <div
                    key={spellId}
                    className={`p-3.5 rounded-lg bg-[#0d1117] relative overflow-visible flex flex-col justify-between transition-all duration-300 ${
                      spell.mastery.tier === 3
                        ? 'border-2 border-purple-400 shadow-md shadow-purple-950/50'
                        : spell.mastery.tier === 2
                        ? 'border border-amber-500/80 shadow-sm shadow-amber-950/40'
                        : spell.mastery.tier === 1
                        ? 'border border-emerald-500/60 shadow-sm shadow-emerald-950/30'
                        : 'border border-slate-800'
                    }`}
                  >
                    {/* 卡片邊緣粒子特效與品階跨越漸變動畫 */}
                    <SpellCardParticleBorder
                      isActive={!!animState}
                      tier={spell.mastery.tier}
                      oldTier={animState?.oldTier}
                      isTierCross={animState?.isTierCross}
                      expGained={animState?.expGained}
                      oldTierName={animState?.oldTierName}
                      newTierName={animState?.newTierName}
                    />

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-serif font-bold text-slate-100 text-sm truncate mr-1">
                          {spell.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border shrink-0 ${element.border} ${element.color}`}>
                          {element.name}
                        </span>
                      </div>

                      <div className="text-[10px] text-amber-400/90 font-mono mb-1">
                        消耗：
                        {Object.entries(spell.cost).map(([e, c]) => (
                          <span key={e} className="mr-1.5">
                            {ELEMENT_LABELS[e as ElementType]?.name}×{c}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2 mb-1">
                        {spell.desc}
                      </p>

                      {/* 圖表展示區：切換「熟練組合圖 (ComposedChart)」與「五行雷達圖」 */}
                      <div className="flex items-center justify-between text-[10px] mt-2 mb-1 border-t border-slate-800/80 pt-1">
                        <span className="text-slate-400 font-serif">圖表視圖：</span>
                        <div className="flex gap-1 bg-[#0b0e14] p-0.5 rounded border border-slate-800">
                          <button
                            type="button"
                            onClick={() => setCardChartOverrides(prev => ({ ...prev, [spellId]: 'radar' }))}
                            className={`px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 transition-colors ${
                              (cardChartOverrides[spellId] ?? globalCardChartType) === 'radar'
                                ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            五行雷達
                          </button>
                          <button
                            type="button"
                            onClick={() => setCardChartOverrides(prev => ({ ...prev, [spellId]: 'composed' }))}
                            className={`px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 transition-colors ${
                              (cardChartOverrides[spellId] ?? globalCardChartType) === 'composed'
                                ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <TrendingUp className="w-2.5 h-2.5" />
                            熟練組合圖
                          </button>
                        </div>
                      </div>

                      {(cardChartOverrides[spellId] ?? globalCardChartType) === 'radar' ? (
                        <QiRadarChart cost={spell.cost} primaryColor={element.hex} height={115} />
                      ) : (
                        <SpellProgressComposedChart
                          spell={rawSpell}
                          currentExp={exp}
                          primaryColor={element.hex}
                          height={105}
                        />
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      {/* 熟練度進度條 */}
                      <div className="mb-2">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                          <span className="text-amber-300">{spell.mastery.tierName}</span>
                          <span>{spell.mastery.currentExp}{spell.mastery.nextExp ? `/${spell.mastery.nextExp}` : ' (圓滿)'}</span>
                        </div>
                        {spell.mastery.nextExp && (
                          <div className="w-full bg-[#161b22] h-1.5 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
                              style={{ width: `${spell.mastery.progressPercent}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs gap-1">
                        <button
                          onClick={() => setModalSpell(rawSpell)}
                          className="px-1.5 py-0.5 rounded bg-[#161c26] hover:bg-[#202735] text-amber-300 border border-slate-700 text-[10px] flex items-center gap-1 transition-colors"
                          title="查看該神通之成長曲線圖"
                        >
                          <TrendingUp className="w-3 h-3 text-amber-400" />
                          圖表
                        </button>

                        <button
                          onClick={() => handlePracticeWithAnim(spellId)}
                          className="px-1.5 py-0.5 rounded bg-[#1c2330] hover:bg-[#253042] text-amber-300 border border-amber-600/40 text-[10px] flex items-center gap-0.5 transition-colors"
                          title="耗費1月與15靈石閉關推演此術，熟練度+3"
                        >
                          <BookOpen className="w-2.5 h-2.5 text-amber-400" />
                          推演(+3)
                        </button>

                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 font-mono text-[11px]">×{count}</span>
                          <button
                            onClick={() => {
                              sound.playCard();
                              onToggleSpellInDeck(spellId);
                            }}
                            title="移出一張"
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 萬法寶庫與推演修行 (Spells Library & Practice) */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-serif font-bold text-slate-200 flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-emerald-400" />
                  九州神通寶庫 · 閉關推演研習
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  點擊各神通的「圖表視圖」可細閱其在 Recharts 曲線中的威能成長與解鎖屬性！
                </p>
              </div>

              {/* 元素篩選 */}
              <div className="flex items-center gap-1 p-1 bg-[#0d1117] rounded-lg border border-slate-800">
                {['all', 'metal', 'wood', 'water', 'fire', 'earth'].map((elem) => (
                  <button
                    key={elem}
                    onClick={() => setFilterElement(elem)}
                    className={`px-2.5 py-1 text-xs rounded transition-colors ${
                      filterElement === elem
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {elem === 'all' ? '全部' : ELEMENT_LABELS[elem as ElementType]?.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSpells.map((rawSp) => {
                const exp = player.spellProficiency?.[rawSp.id] || 0;
                const sp = getUpgradedSpell(rawSp, exp);
                const isKnown = uniqueKnownSpells.includes(rawSp.id);
                const element = ELEMENT_LABELS[rawSp.element];
                const animState = upgradedSpellEffects[rawSp.id];

                return (
                  <div
                    key={rawSp.id}
                    className={`p-3.5 rounded-lg border transition-all duration-300 relative overflow-visible flex flex-col justify-between ${
                      isKnown
                        ? sp.mastery.tier === 3
                          ? 'bg-[#181326] border-2 border-purple-400 shadow-md shadow-purple-950/50'
                          : sp.mastery.tier === 2
                          ? 'bg-[#191520] border border-amber-500/80 shadow-sm shadow-amber-950/40'
                          : sp.mastery.tier === 1
                          ? 'bg-[#0e171b] border border-emerald-500/60 shadow-sm shadow-emerald-950/30'
                          : 'bg-[#0d1117] border-slate-700/80 hover:border-slate-500'
                        : 'bg-[#0a0d12]/50 border-slate-800/60 opacity-60'
                    }`}
                  >
                    {/* 卡片邊緣粒子特效與品階跨越漸變動畫 */}
                    <SpellCardParticleBorder
                      isActive={!!animState}
                      tier={sp.mastery.tier}
                      oldTier={animState?.oldTier}
                      isTierCross={animState?.isTierCross}
                      expGained={animState?.expGained}
                      oldTierName={animState?.oldTierName}
                      newTierName={animState?.newTierName}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-serif font-bold text-sm text-slate-100 flex items-center gap-1.5 truncate mr-1">
                          {sp.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border shrink-0 ${element.border} ${element.color}`}>
                          {element.name}行
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mb-1 leading-relaxed">
                        {sp.desc}
                      </p>

                      {/* 圖表展示區：切換「熟練組合圖 (ComposedChart)」與「五行雷達圖」 */}
                      <div className="flex items-center justify-between text-[10px] mt-2 mb-1 border-t border-slate-800/80 pt-1">
                        <span className="text-slate-400 font-serif">圖表視圖：</span>
                        <div className="flex gap-1 bg-[#0b0e14] p-0.5 rounded border border-slate-800">
                          <button
                            type="button"
                            onClick={() => setCardChartOverrides(prev => ({ ...prev, [rawSp.id]: 'radar' }))}
                            className={`px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 transition-colors ${
                              (cardChartOverrides[rawSp.id] ?? globalCardChartType) === 'radar'
                                ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            五行雷達
                          </button>
                          <button
                            type="button"
                            onClick={() => setCardChartOverrides(prev => ({ ...prev, [rawSp.id]: 'composed' }))}
                            className={`px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 transition-colors ${
                              (cardChartOverrides[rawSp.id] ?? globalCardChartType) === 'composed'
                                ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <TrendingUp className="w-2.5 h-2.5" />
                            熟練組合圖
                          </button>
                        </div>
                      </div>

                      {(cardChartOverrides[rawSp.id] ?? globalCardChartType) === 'radar' ? (
                        <QiRadarChart cost={sp.cost} primaryColor={element.hex} height={115} />
                      ) : (
                        <SpellProgressComposedChart
                          spell={rawSp}
                          currentExp={exp}
                          primaryColor={element.hex}
                          height={105}
                        />
                      )}

                      <div className="text-[11px] text-amber-400/90 font-mono mb-2">
                        消耗：
                        {Object.entries(sp.cost).map(([e, c]) => (
                          <span key={e} className="mr-2">
                            {ELEMENT_LABELS[e as ElementType]?.name}×{c}
                          </span>
                        ))}
                      </div>

                      {/* 熟練度概況 */}
                      {isKnown && (
                        <div className="bg-[#0b0e14] p-2 rounded border border-slate-800 mb-3 space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-amber-300 font-semibold">{sp.mastery.tierName}</span>
                            <span className="text-slate-400 font-mono">
                              熟練: {sp.mastery.currentExp}{sp.mastery.nextExp ? `/${sp.mastery.nextExp}` : ' (極限)'}
                            </span>
                          </div>
                          {sp.mastery.nextExp && (
                            <div className="w-full bg-[#161b22] h-1.5 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="bg-amber-400 h-full transition-all duration-300"
                                style={{ width: `${sp.mastery.progressPercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                      {isKnown ? (
                        <>
                          <button
                            onClick={() => setModalSpell(rawSp)}
                            className="px-2 py-1 rounded bg-[#161c26] hover:bg-[#202735] text-amber-300 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
                            title="查看成長圖表視圖"
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                            圖表
                          </button>

                          <button
                            onClick={() => handlePracticeWithAnim(rawSp.id)}
                            className="px-2 py-1 rounded bg-[#1c2330] hover:bg-[#253042] text-amber-300 border border-amber-600/40 text-xs flex items-center gap-1 transition-colors"
                            title="耗費1月與15靈石閉關推演此術，熟練度+3"
                          >
                            <BookOpen className="w-3 h-3 text-amber-400" />
                            推演(+3)
                          </button>

                          <button
                            onClick={() => {
                              sound.playCard();
                              onToggleSpellInDeck(rawSp.id);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> 加卡組
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500 py-1">
                          需突破大境界、拍賣或古地歷練獲取
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 單一神通成長圖譜彈窗 (SpellGrowthModal) */}
      {modalSpell && (
        <SpellGrowthModal
          spell={modalSpell}
          player={player}
          onClose={() => setModalSpell(null)}
          onPracticeSpell={(id) => onPracticeSpell(id)}
        />
      )}
    </div>
  );
};
