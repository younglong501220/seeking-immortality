import React, { useState } from 'react';
import { PlayerState, EnemyActor } from '../types/game';
import { HERBS_DATA, ALL_SPELLS } from '../data/cultivation';
import { sound } from '../utils/audio';
import { Compass, Trees, Pickaxe, Landmark, ShoppingBag, Sparkles, Skull, Coins, ArrowRight } from 'lucide-react';

interface Props {
  player: PlayerState;
  onExploreForest: () => void;
  onExploreRuins: () => void;
  onStartCombat: (enemy: EnemyActor) => void;
  onBuyHerb: (herbName: string) => void;
  onSellHerb: (herbName: string) => void;
  onWinAuction: (spellId: string, cost: number) => void;
}

export const WorldTab: React.FC<Props> = ({
  player,
  onExploreForest,
  onExploreRuins,
  onStartCombat,
  onBuyHerb,
  onSellHerb,
  onWinAuction,
}) => {
  const [auctionOpen, setAuctionOpen] = useState(false);
  const [bazaarOpen, setBazaarOpen] = useState(false);

  const auctionItem = {
    name: '【地品神通 · 紫霄神雷訣】',
    spellId: '紫霄神雷訣',
    basePrice: 110,
    desc: '傳說引動九天紫霄正雷之天階神通，修仙界人人爭奪之無上秘卷！',
  };

  const handleFairBid = () => {
    if (player.spiritStones < auctionItem.basePrice) {
      alert(`靈石不足！起拍價需要 ${auctionItem.basePrice} 顆靈石！`);
      return;
    }
    onWinAuction(auctionItem.spellId, auctionItem.basePrice);
    setAuctionOpen(false);
  };

  const handleLootAmbush = () => {
    setAuctionOpen(false);
    sound.playSword();
    onStartCombat({
      name: '萬寶閣護送客卿',
      realm: '築基初期',
      hp: 140,
      maxHp: 140,
      shield: 30,
      atk: 18,
      intent: {
        type: 'attack',
        value: 18,
        desc: '祭起奪命飛劍 (18點傷害)',
      },
      rewardStones: 120,
      rewardHerbs: ['天元果', '龍血竭'],
      rewardSpell: '紫霄神雷訣',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 九州大地圖標題 */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1 block">
              修仙大地 · 九州風雲
            </span>
            <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-amber-400" />
              九州八荒 · 歷練乾坤
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              世間多奇遇，亦多殺機。殺人奪寶、妖獸毒窟、天材地寶皆在一念之間。
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>隨身儲物袋：</span>
            <span className="font-mono text-amber-400 font-bold text-sm">
              {player.spiritStones}
            </span>
            <span>顆靈石</span>
          </div>
        </div>
      </div>

      {/* 地圖區域卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 東海水域 · 天星密林 */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-emerald-500/50 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif font-bold text-lg text-emerald-300 flex items-center gap-2">
                <Trees className="w-5 h-5 text-emerald-400" />
                東海水域 · 天星密林
              </h3>
              <span className="text-xs text-slate-400 font-mono">耗費 1 個月</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              原始妖木蔽日，其間生長有千年金陽花、生生藤與深潭妖蛇。有機緣採得神草，亦可能遭遇截道散修！
            </p>
          </div>

          <button
            onClick={onExploreForest}
            className="w-full py-2.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            深入密林歷練 <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 天墟古礦 · 上古秘境 */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-blue-500/50 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif font-bold text-lg text-blue-300 flex items-center gap-2">
                <Pickaxe className="w-5 h-5 text-blue-400" />
                天墟古礦 · 上古秘境
              </h3>
              <span className="text-xs text-slate-400 font-mono">耗費 2 個月</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              上古宗門傾覆後遺留之廢棄靈石重脈，深處有沉睡古機關傀儡看守，產出純淨巨額靈石與天元神果！
            </p>
          </div>

          <button
            onClick={onExploreRuins}
            className="w-full py-2.5 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-700/50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            探勘古礦深處 <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 天機閣 · 千寶大拍賣會 */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-amber-500/50 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif font-bold text-lg text-amber-300 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                天機閣 · 千寶大拍賣會
              </h3>
              <span className="text-xs text-amber-400 font-mono">三年一度</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              九州第一修仙拍賣行。正邪修士齊聚一堂競相出價。可光明正大砸靈石競購，亦可在會場外殺人奪寶！
            </p>
          </div>

          <button
            onClick={() => setAuctionOpen(true)}
            className="w-full py-2.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-600/50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            踏入天機拍賣大殿 <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 坊市萬寶樓 */}
        <div className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-purple-500/50 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif font-bold text-lg text-purple-300 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                坊市 · 萬寶樓
              </h3>
              <span className="text-xs text-slate-400 font-mono">隨時交易</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              仙家集市坊間。在此可買進煉丹急需的君臣佐使靈草，亦可將多餘仙植變賣換取靈石。
            </p>
          </div>

          <button
            onClick={() => setBazaarOpen(true)}
            className="w-full py-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-700/50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            進入靈草交易坊市 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 拍賣會互動模態框 */}
      {auctionOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border-2 border-amber-500 rounded-xl p-6 max-w-lg w-full shadow-2xl relative">
            <h2 className="text-xl font-serif font-bold text-amber-300 text-center mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              天機閣 · 鎮場重寶大競拍
            </h2>

            <p className="text-xs text-slate-300 text-center mb-4 leading-relaxed">
              拍賣台上靈光氤氳，正魔各路金丹、築基天驕目光如炬，主持長老宣讀起拍！
            </p>

            <div className="bg-[#0d1117] border border-amber-600/40 rounded-lg p-4 my-4">
              <div className="text-center">
                <span className="text-sm font-serif font-bold text-amber-200">
                  {auctionItem.name}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  {auctionItem.desc}
                </p>
                <div className="mt-3 font-mono text-amber-400 font-bold text-sm">
                  起拍價：{auctionItem.basePrice} 顆靈石
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleFairBid}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Coins className="w-4 h-4" />
                光明磊落 · 豪擲 {auctionItem.basePrice} 靈石競拍入手
              </button>

              <button
                onClick={handleLootAmbush}
                className="w-full py-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Skull className="w-4 h-4" />
                暗中埋伏 · 在城外截殺攜寶修士（殺人越貨！）
              </button>

              <button
                onClick={() => setAuctionOpen(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                退場離去
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 萬寶樓坊市交易模態框 */}
      {bazaarOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-slate-700 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-serif font-bold text-purple-300 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                萬寶樓 · 靈草買賣專櫃
              </h2>
              <div className="text-xs text-slate-400">
                持有靈石：<strong className="text-amber-400 font-mono">{player.spiritStones}</strong>
              </div>
            </div>

            <div className="overflow-y-auto py-3 space-y-2 flex-1 pr-1">
              {Object.values(HERBS_DATA).map((herb) => {
                const owned = player.herbs[herb.name] || 0;
                return (
                  <div
                    key={herb.id}
                    className="p-3 rounded-lg bg-[#0d1117] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{herb.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({herb.rarity})</span>
                        <span className="text-[11px] text-amber-400">庫存: {owned}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{herb.desc}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onBuyHerb(herb.name)}
                        className="px-2.5 py-1 rounded bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 transition-colors"
                      >
                        買入 ({herb.price}石)
                      </button>
                      <button
                        onClick={() => onSellHerb(herb.name)}
                        disabled={owned <= 0}
                        className={`px-2.5 py-1 rounded border transition-colors ${
                          owned > 0
                            ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-600/40'
                            : 'bg-slate-800 text-slate-600 border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        賣出 ({Math.floor(herb.price * 0.7)}石)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setBazaarOpen(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              >
                關閉坊市
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
