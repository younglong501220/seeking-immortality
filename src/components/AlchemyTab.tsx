import React, { useState } from 'react';
import { PlayerState, HerbRole, AlchemyRecipe } from '../types/game';
import { HERBS_DATA, ALCHEMY_RECIPES } from '../data/cultivation';
import { sound } from '../utils/audio';
import { Flame, Sparkles, BookOpen, Plus, Check, AlertTriangle, Pill } from 'lucide-react';
import furnaceImage from '../assets/images/ancient_alchemy_furnace_1790834432948.jpg';

interface Props {
  player: PlayerState;
  onCraftAlchemy: (slots: Record<HerbRole, string | null>) => void;
  onConsumePill: (pillName: string) => void;
}

export const AlchemyTab: React.FC<Props> = ({
  player,
  onCraftAlchemy,
  onConsumePill,
}) => {
  const [furnace, setFurnace] = useState<Record<HerbRole, string | null>>({
    main: null,
    sub: null,
    helper: null,
    catalyst: null,
  });

  const [activeSlot, setActiveSlot] = useState<HerbRole | null>(null);

  const roleTitles: Record<HerbRole, { title: string; color: string; desc: string }> = {
    main: { title: '主藥 · 君', color: 'text-amber-400 border-amber-500/50', desc: '定丹藥本性與靈性根源' },
    sub: { title: '輔藥 · 臣', color: 'text-blue-400 border-blue-500/50', desc: '倍增主藥藥力，平抑燥烈' },
    helper: { title: '佐藥 · 佐', color: 'text-emerald-400 border-emerald-500/50', desc: '中和五行衝突，化解劇烈丹毒' },
    catalyst: { title: '使藥 · 使', color: 'text-purple-400 border-purple-500/50', desc: '引導真元藥力直達丹田氣海' },
  };

  const handleSelectHerb = (herbId: string) => {
    if (!activeSlot) return;
    setFurnace(prev => ({ ...prev, [activeSlot]: herbId }));
    setActiveSlot(null);
    sound.playCard();
  };

  const handleClearSlot = (role: HerbRole, e: React.MouseEvent) => {
    e.stopPropagation();
    setFurnace(prev => ({ ...prev, [role]: null }));
  };

  const handleAutoFillRecipe = (recipe: AlchemyRecipe) => {
    const hasMain = (player.herbs[recipe.main] || 0) > 0;
    const hasSub = (player.herbs[recipe.sub] || 0) > 0;
    const hasHelper = (player.herbs[recipe.helper] || 0) > 0;
    const hasCatalyst = (player.herbs[recipe.catalyst] || 0) > 0;

    if (!hasMain || !hasSub || !hasHelper || !hasCatalyst) {
      alert(`靈草不足！此丹方需要：${recipe.main}、${recipe.sub}、${recipe.helper}、${recipe.catalyst}`);
      return;
    }

    setFurnace({
      main: recipe.main,
      sub: recipe.sub,
      helper: recipe.helper,
      catalyst: recipe.catalyst,
    });
    sound.playCard();
  };

  const isReady = Boolean(furnace.main && furnace.sub && furnace.helper && furnace.catalyst);

  const startRefine = () => {
    if (!isReady) return;
    onCraftAlchemy(furnace);
    setFurnace({ main: null, sub: null, helper: null, catalyst: null });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 頂部仙府丹房橫幅 */}
      <div className="relative rounded-xl overflow-hidden border border-[#30363d] bg-[#161b22] shadow-xl">
        <div className="h-48 sm:h-52 w-full relative">
          <img
            src={furnaceImage}
            alt="九龍紫金鼎"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/60 to-transparent" />
          
          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1 block">
                九天造化 · 草木丹道
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
                九龍紫金鼎 · 造化神丹
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                遵太古【君臣佐使】之道，主藥定基，輔藥壯勢，佐藥化毒，使藥通脈。
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">丹爐火候</span>
              <span className="text-sm font-semibold text-rose-400 flex items-center gap-1 justify-end">
                <Flame className="w-4 h-4 fill-current animate-pulse text-amber-400" />
                三昧地火充沛
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 丹爐四象插槽 */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg">
        <h2 className="text-base font-serif font-bold text-slate-200 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            四象入爐（君臣佐使配伍）
          </span>
          <span className="text-xs font-normal text-slate-400">
            缺一不可 · 耗費 1 個月時光
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
          {(['main', 'sub', 'helper', 'catalyst'] as HerbRole[]).map((role) => {
            const herbName = furnace[role];
            const herb = herbName ? HERBS_DATA[herbName] : null;
            const meta = roleTitles[role];
            const isTarget = activeSlot === role;

            return (
              <div
                key={role}
                onClick={() => setActiveSlot(role)}
                className={`p-3.5 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                  herb
                    ? 'bg-[#1c222b] border-amber-500/70 shadow-sm'
                    : isTarget
                    ? 'bg-amber-950/20 border-amber-400 animate-pulse'
                    : 'bg-[#0d1117] border-slate-700/60 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold ${meta.color.split(' ')[0]}`}>
                      {meta.title}
                    </span>
                    {herb && (
                      <button
                        onClick={(e) => handleClearSlot(role, e)}
                        className="text-[10px] text-slate-400 hover:text-rose-400 px-1"
                      >
                        取出
                      </button>
                    )}
                  </div>

                  {herb ? (
                    <div>
                      <div className="font-serif font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {herb.name}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {herb.desc}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-3 text-slate-500">
                      <Plus className="w-5 h-5 mx-auto mb-1 opacity-50" />
                      <span className="text-xs">點擊放入藥材</span>
                      <p className="text-[10px] text-slate-600 mt-1">{meta.desc}</p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 text-right">
                  {herb ? '已入爐位' : '虛位以待'}
                </div>
              </div>
            );
          })}
        </div>

        {/* 選擇藥材的即時選單 */}
        {activeSlot && (
          <div className="p-4 bg-[#0d1117] border border-amber-500/40 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-300">
                正在為【{roleTitles[activeSlot].title}】挑選藥材：
              </span>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                取消
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(player.herbs).filter(id => (player.herbs[id] || 0) > 0).map((herbId) => {
                const herb = HERBS_DATA[herbId];
                if (!herb) return null;
                const count = player.herbs[herbId];

                return (
                  <button
                    key={herbId}
                    onClick={() => handleSelectHerb(herbId)}
                    className="p-2 rounded bg-[#161b22] hover:bg-[#21262d] border border-slate-700 text-left transition-colors flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center text-xs text-slate-200 font-medium">
                      <span>{herb.name}</span>
                      <span className="text-[11px] font-mono text-amber-400">×{count}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">{herb.rarity}</span>
                  </button>
                );
              })}
              {Object.keys(player.herbs).filter(id => (player.herbs[id] || 0) > 0).length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-slate-500">
                  藥囊空空如也！道友可前往九州密林採藥或坊市萬寶樓採購。
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-400">
            丹道真言：配方精準方可丹成九轉；若屬性相剋，則爐鼎崩裂化為焦渣！
          </div>

          <button
            onClick={startRefine}
            disabled={!isReady}
            className={`px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              isReady
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transform hover:scale-102 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Flame className="w-4 h-4 fill-current" />
            引三昧地火 · 開爐煉丹！
          </button>
        </div>
      </div>

      {/* 丹方真錄與儲備藥囊 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 丹方真錄 */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
          <h3 className="text-sm font-serif font-bold text-amber-300 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            上古丹方真傳
          </h3>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {ALCHEMY_RECIPES.map((r) => {
              const hasAll = 
                (player.herbs[r.main] || 0) > 0 &&
                (player.herbs[r.sub] || 0) > 0 &&
                (player.herbs[r.helper] || 0) > 0 &&
                (player.herbs[r.catalyst] || 0) > 0;

              return (
                <div
                  key={r.name}
                  className="p-3 rounded-lg bg-[#0d1117] border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      【{r.name}】
                    </span>
                    <button
                      onClick={() => handleAutoFillRecipe(r)}
                      disabled={!hasAll}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        hasAll
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {hasAll ? '一鍵配伍' : '材料不足'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">{r.desc}</p>

                  <div className="flex flex-wrap gap-1 text-[11px]">
                    <span className="px-1.5 py-0.5 bg-[#161b22] rounded text-amber-300">君: {r.main}</span>
                    <span className="px-1.5 py-0.5 bg-[#161b22] rounded text-blue-300">臣: {r.sub}</span>
                    <span className="px-1.5 py-0.5 bg-[#161b22] rounded text-emerald-300">佐: {r.helper}</span>
                    <span className="px-1.5 py-0.5 bg-[#161b22] rounded text-purple-300">使: {r.catalyst}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 煉就丹藥庫存與服用 */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-serif font-bold text-emerald-300 mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4" />
              紫金葫蘆（已煉成丹藥）
            </h3>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {Object.entries(player.pills).filter(([_, count]) => count > 0).map(([pillName, count]) => {
                const recipe = ALCHEMY_RECIPES.find(r => r.name === pillName);

                return (
                  <div
                    key={pillName}
                    className="p-2.5 rounded-lg bg-[#0d1117] border border-emerald-900/40 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-semibold text-sm text-emerald-200">
                          {pillName}
                        </span>
                        <span className="font-mono text-xs text-amber-300">×{count} 顆</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {recipe?.desc || '蘊含精純天地藥力的珍稀丹丸'}
                      </p>
                    </div>

                    <button
                      onClick={() => onConsumePill(pillName)}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shrink-0 transition-colors"
                    >
                      服丹
                    </button>
                  </div>
                );
              })}

              {Object.values(player.pills).every(c => c <= 0) && (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  丹葫空空如也，尚未煉製任何靈丹。
                </div>
              )}
            </div>
          </div>

          {/* 藥囊庫存統計 */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400 block mb-2 font-medium">當前儲備草藥：</span>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(player.herbs).map(([name, count]) => (
                <span
                  key={name}
                  className={`px-2 py-1 rounded border text-[11px] ${
                    count > 0 ? 'bg-[#0d1117] border-slate-700 text-slate-200' : 'bg-slate-900/40 border-slate-800 text-slate-600'
                  }`}
                >
                  {name}: <strong className="text-amber-400">{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
