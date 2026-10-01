import React, { useState, useEffect, useRef } from 'react';
import { PlayerState, EnemyActor, SpellCard, ElementType, CombatTurnMetric } from '../types/game';
import { ALL_SPELLS, REALM_LIST, getUpgradedSpell, findCombo, SPELL_COMBOS } from '../data/cultivation';
import { sound } from '../utils/audio';
import { BattleAnalysisPanel } from './BattleAnalysisPanel';
import { HistoricalBattleChronicle } from './HistoricalBattleChronicle';
import { TurnQiEfficiencyReview } from './TurnQiEfficiencyReview';
import { HealthEmberEffect } from './HealthEmberEffect';
import { QiFlowParticlePath } from './QiFlowParticlePath';
import { Shield, Zap, Skull, Heart, Sword, RefreshCw, Flame, Droplets, Mountain, Leaf, Sparkles, Star, BarChart3, History } from 'lucide-react';

interface Props {
  player: PlayerState;
  enemy: EnemyActor;
  turn: number;
  lastSpellId?: string | null;
  comboCount?: number;
  lastComboName?: string | null;
  comboTriggerAnim?: number;
  turnMetrics?: CombatTurnMetric[];
  currentTurnDealt?: number;
  currentTurnQiSpent?: number;
  currentTurnSpellsCount?: number;
  currentTurnCombosCount?: number;
  onCastSpell: (card: SpellCard, index: number) => void;
  onEndTurn: () => void;
  onEscapeCombat: () => void;
  combatLog: string[];
}

const ELEMENT_INFO: Record<ElementType, { name: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  metal: { name: '金', bg: 'bg-amber-600', text: 'text-amber-200', border: 'border-amber-400', icon: <Sword className="w-3.5 h-3.5" /> },
  wood: { name: '木', bg: 'bg-emerald-600', text: 'text-emerald-200', border: 'border-emerald-400', icon: <Leaf className="w-3.5 h-3.5" /> },
  water: { name: '水', bg: 'bg-blue-600', text: 'text-blue-200', border: 'border-blue-400', icon: <Droplets className="w-3.5 h-3.5" /> },
  fire: { name: '火', bg: 'bg-rose-600', text: 'text-rose-200', border: 'border-rose-400', icon: <Flame className="w-3.5 h-3.5" /> },
  earth: { name: '土', bg: 'bg-purple-600', text: 'text-purple-200', border: 'border-purple-400', icon: <Mountain className="w-3.5 h-3.5" /> },
};

export const CombatView: React.FC<Props> = ({
  player,
  enemy,
  turn,
  lastSpellId,
  comboCount = 0,
  lastComboName = null,
  comboTriggerAnim = 0,
  turnMetrics = [],
  currentTurnDealt = 0,
  currentTurnQiSpent = 0,
  currentTurnSpellsCount = 0,
  currentTurnCombosCount = 0,
  onCastSpell,
  onEndTurn,
  onEscapeCombat,
  combatLog,
}) => {
  const [activeTab, setActiveTab] = useState<'arena' | 'analysis' | 'chronicle'>('arena');
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [animatingCombo, setAnimatingCombo] = useState<boolean>(false);
  const [animKey, setAnimKey] = useState<number>(0);

  // Health ember particles tracking for enemy and player
  const enemyPrevHpRef = useRef<number>(enemy.hp);
  const playerPrevHpRef = useRef<number>(player.hp);
  const [enemyDmgEmber, setEnemyDmgEmber] = useState<{ key: number; amount: number }>({ key: 0, amount: 0 });
  const [playerDmgEmber, setPlayerDmgEmber] = useState<{ key: number; amount: number }>({ key: 0, amount: 0 });

  // Framer Motion Qi flow particle path animation state
  const [qiFlowAnim, setQiFlowAnim] = useState<{
    key: number;
    element: ElementType;
    amount: number;
    spellName: string;
  }>({
    key: 0,
    element: 'fire',
    amount: 0,
    spellName: '',
  });

  useEffect(() => {
    if (enemyPrevHpRef.current > enemy.hp) {
      const diff = enemyPrevHpRef.current - enemy.hp;
      setEnemyDmgEmber({ key: Date.now(), amount: diff });
    }
    enemyPrevHpRef.current = enemy.hp;
  }, [enemy.hp]);

  useEffect(() => {
    if (playerPrevHpRef.current > player.hp) {
      const diff = playerPrevHpRef.current - player.hp;
      setPlayerDmgEmber({ key: Date.now(), amount: diff });
    }
    playerPrevHpRef.current = player.hp;
  }, [player.hp]);

  useEffect(() => {
    if (comboTriggerAnim && comboTriggerAnim > 0) {
      setAnimatingCombo(true);
      setAnimKey(prev => prev + 1);
      const timer = setTimeout(() => {
        setAnimatingCombo(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [comboTriggerAnim]);

  const potentialCombos = lastSpellId ? SPELL_COMBOS.filter(c => c.prevSpell === lastSpellId) : [];

  const canAfford = (card: SpellCard) => {
    for (const [el, amt] of Object.entries(card.cost)) {
      const element = el as ElementType;
      if ((player.qi[element] || 0) < (amt || 0)) {
        return false;
      }
    }
    return true;
  };

  const handleCardClick = (card: SpellCard, idx: number) => {
    if (!canAfford(card)) {
      sound.playHit();
      return;
    }
    if (card.element === 'metal') sound.playSword();
    else if (card.element === 'fire') sound.playFire();
    else if (card.element === 'water') sound.playShield();
    else sound.playQiGather();

    const totalQiCost = Object.values(card.cost).reduce((a, b) => a + (b || 0), 0);
    setQiFlowAnim({
      key: Date.now(),
      element: card.element,
      amount: Math.max(1, totalQiCost),
      spellName: card.name,
    });

    onCastSpell(card, idx);
    setSelectedCardIdx(null);
  };

  const enemyHpPct = Math.min(100, Math.max(0, (enemy.hp / enemy.maxHp) * 100));
  const playerHpPct = Math.min(100, Math.max(0, (player.hp / player.maxHp) * 100));

  return (
    <div className="h-full flex flex-col justify-between max-w-5xl mx-auto py-2 px-1 select-none space-y-4 relative">
      {/* 靈氣消耗流動粒子路徑動畫 (Framer Motion) */}
      <QiFlowParticlePath
        activeKey={qiFlowAnim.key}
        element={qiFlowAnim.element}
        qiAmount={qiFlowAnim.amount}
        spellName={qiFlowAnim.spellName}
      />

      {/* 頂部切換頁籤：鬥法實戰 vs 戰局覆盤分析 */}
      <div className="flex items-center justify-between bg-[#111722] border border-[#2d3748] rounded-xl px-4 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'arena'
                ? 'bg-amber-600 text-slate-950 shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sword className="w-3.5 h-3.5" />
            鬥法實戰 (Arena)
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'analysis'
                ? 'bg-amber-600 text-slate-950 shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            戰局分析覆盤 (Battle Analysis)
            {turnMetrics.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/80 text-[10px] text-amber-300 font-mono">
                {turnMetrics.length} 輪
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('chronicle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'chronicle'
                ? 'bg-amber-600 text-slate-950 shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            歷境戰績演進 (AreaChart)
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 hidden sm:inline">
            當前回合：<strong className="text-amber-300 font-mono">第 {turn} 輪</strong>
          </span>
          {activeTab === 'arena' && (
            <button
              onClick={() => setActiveTab('analysis')}
              className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1 underline underline-offset-4"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              查看圖表覆盤
            </button>
          )}
        </div>
      </div>

      {activeTab === 'analysis' ? (
        <BattleAnalysisPanel
          player={player}
          enemy={enemy}
          currentTurn={turn}
          turnMetrics={turnMetrics}
          currentTurnDealt={currentTurnDealt}
          currentTurnQiSpent={currentTurnQiSpent}
          currentTurnSpellsCount={currentTurnSpellsCount}
          currentTurnCombosCount={currentTurnCombosCount}
          onBackToCombat={() => setActiveTab('arena')}
        />
      ) : activeTab === 'chronicle' ? (
        <HistoricalBattleChronicle
          player={player}
          onBackToCombat={() => setActiveTab('arena')}
        />
      ) : (
        <>
          {/* 戰鬥頂部：對手與玩家戰鬥情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* 對手卡片 */}
        <div className="p-4 rounded-xl bg-[#161b22] border-2 border-rose-900/60 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[11px] text-rose-400 font-mono tracking-widest uppercase">敵修意圖</div>
              <h2 className="text-xl font-bold font-serif text-rose-200 flex items-center gap-2">
                <Skull className="w-5 h-5 text-rose-400" />
                {enemy.name}
              </h2>
              <span className="text-xs text-slate-400">{enemy.realm}</span>
            </div>
            
            {/* 敵方意圖預告 */}
            <div className="text-right bg-rose-950/40 border border-rose-800/50 rounded-lg p-2 max-w-[180px]">
              <span className="text-[11px] text-rose-300 font-medium block">
                下回蓄勢：
              </span>
              <span className="text-xs text-amber-300 font-semibold leading-tight block">
                {enemy.intent.desc}
              </span>
            </div>
          </div>

          {/* 氣血條與護罩 */}
          <div className="space-y-1 relative overflow-visible">
            <div className="flex justify-between text-xs tabular-nums">
              <span className="text-slate-400">生命</span>
              <span className="font-mono text-rose-300 font-semibold">
                {enemy.hp} / {enemy.maxHp}
                {enemy.shield > 0 && <span className="text-cyan-400 ml-1.5">(護甲 {enemy.shield})</span>}
              </span>
            </div>
            <div className="w-full bg-[#0d1117] h-3.5 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-300"
                style={{ width: `${enemyHpPct}%` }}
              />
              {enemy.shield > 0 && (
                <div
                  className="absolute inset-y-0 left-0 bg-cyan-400/40 border-r-2 border-cyan-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, (enemy.shield / enemy.maxHp) * 100)}%` }}
                />
              )}
            </div>

            {/* 敵方血量餘燼粒子特效 */}
            <HealthEmberEffect
              triggerKey={enemyDmgEmber.key}
              damageAmount={enemyDmgEmber.amount}
              isEnemy={true}
            />
          </div>
        </div>

        {/* 我方戰鬥狀態 */}
        <div className="p-4 rounded-xl bg-[#161b22] border-2 border-emerald-900/60 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[11px] text-emerald-400 font-mono tracking-widest uppercase">道友本相</div>
              <h2 className="text-xl font-bold font-serif text-emerald-200 flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-400" />
                {player.name}
              </h2>
              <span className="text-xs text-slate-400">{REALM_LIST[player.realmIdx]?.name} · {player.sect}</span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">回合序數</span>
              <span className="text-sm font-mono text-amber-300 font-bold">第 {turn} 回合</span>
            </div>
          </div>

          {/* 氣血條與護罩 */}
          <div className="space-y-1 relative overflow-visible">
            <div className="flex justify-between text-xs tabular-nums">
              <span className="text-slate-400">生命</span>
              <span className="font-mono text-emerald-300 font-semibold">
                {player.hp} / {player.maxHp}
                {player.shield > 0 && <span className="text-cyan-400 ml-1.5">(靈力護盾 {player.shield})</span>}
              </span>
            </div>
            <div className="w-full bg-[#0d1117] h-3.5 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-700 to-emerald-500 transition-all duration-300"
                style={{ width: `${playerHpPct}%` }}
              />
              {player.shield > 0 && (
                <div
                  className="absolute inset-y-0 left-0 bg-cyan-400/40 border-r-2 border-cyan-300 transition-all duration-300"
                  style={{ width: `${Math.min(100, (player.shield / player.maxHp) * 100)}%` }}
                />
              )}
            </div>

            {/* 我方血量餘燼粒子特效 */}
            <HealthEmberEffect
              triggerKey={playerDmgEmber.key}
              damageAmount={playerDmgEmber.amount}
              isEnemy={false}
            />
          </div>
        </div>
      </div>

      {/* 連擊爆發短暫文字動畫效果 (觸發時伴隨動畫彈出) */}
      {animatingCombo && (
        <div
          key={`combo-burst-${animKey}`}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 p-0.5 shadow-2xl shadow-rose-500/50 animate-bounce transition-all duration-300"
        >
          <div className="bg-[#120807] px-4 py-2.5 rounded-[10px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md animate-pulse">
                ⚡
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-mono font-bold border border-rose-500/60">
                    連擊第 {comboCount} 式
                  </span>
                  <span className="text-base sm:text-lg font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-rose-200">
                    【{lastComboName}】
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/90 font-medium mt-0.5">
                  五行妙道共鳴！連擊威能激增 1.5 倍，勢如破竹！
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-amber-300 block">
                1.5× 威力爆發
              </span>
              <span className="text-[10px] text-rose-400/90">
                法訣相生貫通
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 連擊層數與狀態常駐顯示區 (當連擊生效且未處於爆發動畫時持續顯示) */}
      {!animatingCombo && comboCount > 0 && lastComboName && (
        <div className="bg-gradient-to-r from-[#20140b] via-[#24120c] to-[#20140b] border border-amber-500/60 rounded-xl px-4 py-2 flex items-center justify-between text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/50 flex items-center gap-1 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              當前連擊：{comboCount} 式
            </span>
            <span className="text-slate-200 font-serif font-semibold">
              妙法連攜：<strong className="text-amber-300 font-serif">【{lastComboName}】</strong> (1.5倍威能)
            </span>
          </div>
          <span className="text-[11px] text-amber-400 font-mono font-semibold animate-pulse">
            🔥 連擊勢頭正盛
          </span>
        </div>
      )}

      {/* 連擊引導與戰況提示 */}
      {lastSpellId && potentialCombos.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/50 via-[#18130c] to-amber-950/50 border border-amber-500/60 rounded-xl px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-2 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold border border-amber-400/50 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              起手法訣：【{lastSpellId}】
            </span>
            <span className="text-xs text-amber-200">
              可連攜：
              {potentialCombos.map(c => `【${c.nextSpell}】➜「${c.name} (${c.multiplier}倍傷害)」`).join(' · ')}
            </span>
          </div>
          <span className="text-[11px] text-amber-400 font-mono font-bold">
            ⚡ 連擊蓄勢待發
          </span>
        </div>
      )}

      {/* 戰況簡訊速覽 */}
      {combatLog.length > 0 && (
        <div className="bg-[#0d1117]/80 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-300 flex items-center justify-between">
          <span className="text-amber-400 font-medium">戰況：</span>
          <span className="truncate flex-1 ml-2 text-slate-300">{combatLog[combatLog.length - 1]}</span>
          <span className="text-[11px] text-slate-500 ml-3">靈氣跨輪保留</span>
        </div>
      )}

      {/* 戰局回顧摺疊面板 (Collapsible ComposedChart) */}
      <TurnQiEfficiencyReview
        currentTurn={turn}
        turnMetrics={turnMetrics}
        currentTurnDealt={currentTurnDealt}
        currentTurnQiSpent={currentTurnQiSpent}
        currentTurnSpellsCount={currentTurnSpellsCount}
        currentTurnCombosCount={currentTurnCombosCount}
        defaultExpanded={false}
      />

      {/* 五行靈氣池 (Qi Pool) */}
      <div className="bg-[#111720] border border-[#30363d] rounded-xl p-3 shadow-inner">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs text-slate-400 font-serif">當前可用五行靈氣 (施法素材)：</span>
          <span className="text-[11px] text-slate-500">每輪吸納 {REALM_LIST[player.realmIdx]?.bonusQiPerTurn || 4} 點</span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {(['metal', 'wood', 'water', 'fire', 'earth'] as ElementType[]).map((el) => {
            const count = player.qi[el] || 0;
            const info = ELEMENT_INFO[el];
            return (
              <div
                key={el}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  count > 0 ? `${info.border} bg-[#161b22] shadow-sm` : 'border-slate-800 bg-[#0d1117]/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow ${info.bg}`}>
                    {info.name}
                  </span>
                </div>
                <span className="text-lg font-mono font-bold text-white tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 手牌區 (Hand Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-slate-400">手牌神通 ({player.deck.length > 0 ? '法訣在手' : '空'})</span>
          <span className="text-[11px] text-amber-400/80">點擊神通即可催動真元釋放</span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center items-stretch min-h-[175px]">
          {player.deck.slice(0, 5).map((spellId, idx) => {
            const baseCard = ALL_SPELLS[spellId] || ALL_SPELLS['金刃術'];
            const card = getUpgradedSpell(baseCard, player.spellProficiency?.[baseCard.id] || 0);
            const affordable = canAfford(card);
            const element = ELEMENT_INFO[card.element];
            const hasMastery = card.mastery.tier > 0;
            const combo = findCombo(lastSpellId, baseCard.id);

            return (
              <div
                key={`${card.id}-${idx}`}
                onClick={() => handleCardClick(card, idx)}
                className={`w-36 sm:w-44 rounded-lg p-3 flex flex-col justify-between border-2 transition-all duration-200 cursor-pointer ${
                  combo && affordable
                    ? 'border-amber-300 bg-gradient-to-b from-[#241a15] to-[#161b22] ring-2 ring-amber-400 shadow-xl shadow-amber-500/30 hover:-translate-y-2'
                    : affordable
                    ? hasMastery
                      ? 'border-amber-400 bg-[#191f28] hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-500/25 ring-1 ring-amber-500/30'
                      : 'border-amber-500/80 bg-[#161b22] hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-500/20'
                    : 'border-slate-800 bg-[#11161d] opacity-50 grayscale hover:opacity-75 cursor-not-allowed'
                }`}
              >
                <div>
                  {/* 連擊高亮標籤 */}
                  {combo && (
                    <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-center flex items-center justify-center gap-1 shadow-sm mb-1.5 animate-bounce">
                      <Zap className="w-3 h-3 fill-current text-yellow-200" />
                      連擊：{combo.name} (×{combo.multiplier}倍)
                    </div>
                  )}

                  {/* 卡牌頂部：費用與屬性與熟練層次 */}
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold text-white ${element.bg}`}>
                        {element.name}行
                      </span>
                      {hasMastery && (
                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          card.mastery.tier === 3
                            ? 'bg-purple-950 text-purple-300 border border-purple-500/60'
                            : card.mastery.tier === 2
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/60'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                        }`}>
                          {card.mastery.tier === 3 ? '真訣' : card.mastery.tier === 2 ? '大成' : '小成'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-amber-300 font-bold">
                      {Object.entries(card.cost).map(([e, c]) => (
                        <span key={e} className="flex items-center">
                          {ELEMENT_INFO[e as ElementType].name}×{c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 卡牌名稱 */}
                  <h4 className="font-serif font-bold text-sm text-slate-100 text-center py-1 border-b border-slate-700/60 mb-2">
                    {card.name}
                  </h4>

                  {/* 描述與數值提示 */}
                  <p className="text-[11px] text-slate-300 leading-snug mb-1">
                    {card.desc}
                  </p>

                  {/* 連擊爆發數值預覽 */}
                  {combo && card.damage && (
                    <div className="text-[10px] text-amber-300 font-mono bg-rose-950/60 border border-rose-600/50 rounded px-1.5 py-0.5 my-1 flex items-center justify-between">
                      <span className="font-bold">連擊爆發</span>
                      <span className="text-amber-200 font-bold">{Math.floor(card.damage * combo.multiplier)} 傷害</span>
                    </div>
                  )}

                  {/* 熟練度加成提示 */}
                  {hasMastery && !combo && (
                    <div className="text-[10px] text-amber-300/90 font-mono bg-[#0d1117]/80 rounded px-1.5 py-0.5 my-1 flex items-center justify-between">
                      <span>威能加成</span>
                      <span>+{card.mastery.tier === 3 ? '85%' : card.mastery.tier === 2 ? '55%' : '25%'}</span>
                    </div>
                  )}
                </div>

                {/* 稀有度、熟練進度與底飾 */}
                <div className="mt-2 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>熟練: {card.mastery.currentExp}{card.mastery.nextExp ? `/${card.mastery.nextExp}` : ' (極)'}</span>
                    <span className={affordable ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                      {affordable ? '可施展' : '靈氣不足'}
                    </span>
                  </div>
                  {card.mastery.nextExp && (
                    <div className="w-full bg-[#0d1117] h-1 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{ width: `${card.mastery.progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 戰鬥控制按鈕列 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
        <button
          onClick={onEscapeCombat}
          className="px-4 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Skull className="w-3.5 h-3.5" />
          燃血遁逃 (耗費2年壽元)
        </button>

        <button
          onClick={() => {
            sound.playCard();
            onEndTurn();
          }}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all transform hover:scale-102"
        >
          <RefreshCw className="w-4 h-4" />
          結束本輪施法 (換敵方出招)
        </button>
      </div>
      </>
      )}
    </div>
  );
};
