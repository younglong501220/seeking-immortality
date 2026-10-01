import React from 'react';
import { PlayerState } from '../types/game';
import { REALM_LIST } from '../data/cultivation';
import { getArrayTier } from '../data/spiritArray';
import { SpiritGatheringArrayPanel } from './SpiritGatheringArrayPanel';
import { sound } from '../utils/audio';
import { Sparkles, Zap, Flame, ShieldAlert, Heart, Calendar, Wind } from 'lucide-react';
import heroCaveImage from '../assets/images/cultivation_hero_cave_1790834420793.jpg';

interface Props {
  player: PlayerState;
  onMeditate: (months: number) => void;
  onDetox: () => void;
  onOpenTribulation: () => void;
  onUpgradeArray?: () => void;
}

export const CultivationTab: React.FC<Props> = ({
  player,
  onMeditate,
  onDetox,
  onOpenTribulation,
  onUpgradeArray,
}) => {
  const currentRealm = REALM_LIST[player.realmIdx] || REALM_LIST[0];
  const nextRealm = REALM_LIST[player.realmIdx + 1];
  const canBreakthrough = player.exp >= player.maxExp && Boolean(nextRealm);
  const isMaxRealm = !nextRealm;

  const currentTier = getArrayTier(player.gatheringArrayLevel || 0);
  const bonusMultiplier = 1 + (currentTier.bonusPercent / 100);
  const expMonth1 = Math.floor(6 * bonusMultiplier);
  const expYear1 = Math.floor(80 * bonusMultiplier);
  const expYear10 = Math.floor(850 * bonusMultiplier);

  const handleMeditate = (months: number) => {
    sound.playGong();
    onMeditate(months);
  };

  const getGongfaDesc = () => {
    if (player.sect === '正道・雲山派') {
      return '《雲山太虛訣》：正道清修根本心法，調和五行，每輪鬥法額外凝結 1 點柔水護盾。';
    }
    if (player.sect === '魔門・幽冥教') {
      return '《幽冥化骨煞》：魔門凶狠吞噬之術，鬥法造成傷害時自帶血煞反哺經脈。';
    }
    return '《九天引氣訣》：凡人吐納基底心法，順應天地日月盈虧，緩緩聚攏周天靈氣。';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Hero Visual Banner */}
      <div className="relative rounded-xl overflow-hidden border border-[#30363d] bg-[#161b22] shadow-xl">
        <div className="h-56 sm:h-64 w-full relative">
          <img
            src={heroCaveImage}
            alt="洞府靈脈仙山"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/60 to-transparent" />
          
          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1 block">
                九天仙境 · 靈脈洞天
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide flex items-center gap-2">
                {player.name}
                <span className="text-sm font-sans px-2.5 py-0.5 rounded border border-amber-500/50 bg-amber-950/40 text-amber-300 font-normal">
                  {currentRealm.name}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
                {currentRealm.title}。長生路漫漫，與天道競奪壽元。
              </p>
            </div>

            {canBreakthrough && (
              <button
                onClick={onOpenTribulation}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105 flex items-center gap-2 animate-bounce"
              >
                <Zap className="w-4 h-4 fill-current" />
                靈氣圓滿 · 逆天渡劫！
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 閉關打坐操作區 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 一月閉關 */}
        <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-amber-500/50 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-200 font-semibold mb-1">
              <span className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-400" />
                靜心打坐
              </span>
              <span className="text-xs text-slate-400 font-mono">耗費 1 月</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              微調氣息，運轉小周天。修為穩定增長，適合細水長流。
            </p>
          </div>
          <button
            onClick={() => handleMeditate(1)}
            className="w-full py-2 bg-[#21262d] hover:bg-[#30363d] text-emerald-400 hover:text-emerald-300 font-medium rounded text-xs transition-colors border border-slate-700"
          >
            閉關一月 (+{expMonth1} 修為)
          </button>
        </div>

        {/* 一年閉關 */}
        <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-amber-500/50 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-200 font-semibold mb-1">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                深層閉關
              </span>
              <span className="text-xs text-amber-400/80 font-mono">耗費 1 年</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              沉浸識海運轉大周天，壽元損耗1載，修為顯著累積。
            </p>
          </div>
          <button
            onClick={() => handleMeditate(12)}
            className="w-full py-2 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 hover:text-amber-200 font-medium rounded text-xs transition-colors border border-amber-600/40"
          >
            閉關一年 (+{expYear1} 修為)
          </button>
        </div>

        {/* 十年苦修 */}
        <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-red-500/50 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-200 font-semibold mb-1">
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                死關苦修
              </span>
              <span className="text-xs text-rose-400 font-mono">耗費 10 年</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              燃燒歲月求大道！若壽元無多切莫輕試，或遭天道坐化。
            </p>
          </div>
          <button
            onClick={() => handleMeditate(120)}
            className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-rose-200 font-medium rounded text-xs transition-colors border border-rose-700/50"
          >
            死關十年 (+{expYear10} 修為)
          </button>
        </div>
      </div>

      {/* 靈脈聚靈陣互動區域 (Spirit Gathering Array & AreaChart) */}
      <SpiritGatheringArrayPanel
        player={player}
        onUpgradeArray={onUpgradeArray || (() => {})}
      />

      {/* 丹毒逼出 & 突破狀況 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 功法與體質 */}
        <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d]">
          <h3 className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            當前運轉功法
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#0d1117] p-3 rounded border border-slate-800">
            {getGongfaDesc()}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>宗門歸屬：<strong className="text-slate-200">{player.sect}</strong></span>
            <span>戰鬥初始靈氣：<strong className="text-amber-400">+{currentRealm.bonusQiPerTurn} / 回合</strong></span>
          </div>
        </div>

        {/* 丹毒管理與突破契機 */}
        <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              經脈丹毒與天道警示
            </h3>
            <p className="text-xs text-slate-400 mb-2">
              服用各類靈丹有助修為突破，但日積月累會淤積丹毒。丹毒過高將影響鬥法經脈運轉。
            </p>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-slate-400">當前丹毒濃度：</span>
              <span className={`font-mono font-bold ${player.danPoison > 30 ? 'text-rose-400' : 'text-slate-200'}`}>
                {player.danPoison}%
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onDetox}
              disabled={player.danPoison <= 0}
              className={`flex-1 py-2 text-xs font-medium rounded border transition-colors ${
                player.danPoison > 0
                  ? 'bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border-purple-700/50'
                  : 'bg-[#21262d] text-slate-500 border-slate-800 cursor-not-allowed'
              }`}
            >
              運功逼毒 (耗3月，清除20%丹毒)
            </button>
            {canBreakthrough && (
              <button
                onClick={onOpenTribulation}
                className="flex-1 py-2 text-xs font-bold rounded bg-amber-600 hover:bg-amber-500 text-slate-950 transition-colors"
              >
                前往渡劫
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
