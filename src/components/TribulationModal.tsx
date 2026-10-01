import React, { useState } from 'react';
import { PlayerState, RealmConfig } from '../types/game';
import { REALM_LIST } from '../data/cultivation';
import { sound } from '../utils/audio';
import { Zap, ShieldCheck, Heart, AlertTriangle, Sparkles, X } from 'lucide-react';

interface Props {
  player: PlayerState;
  onClose: () => void;
  onSurviveTribulation: (usedPill: boolean) => void;
  onFailTribulation: () => void;
}

export const TribulationModal: React.FC<Props> = ({
  player,
  onClose,
  onSurviveTribulation,
  onFailTribulation,
}) => {
  const currentRealm = REALM_LIST[player.realmIdx] || REALM_LIST[0];
  const targetRealm = REALM_LIST[player.realmIdx + 1];
  const hasZhuJiDan = (player.pills['築基丹'] || 0) > 0;
  const [usePill, setUsePill] = useState(hasZhuJiDan);
  const [isStriking, setIsStriking] = useState(false);

  if (!targetRealm) return null;

  const rawDmg = targetRealm.tribulationDmg;
  const actualDmg = usePill ? Math.floor(rawDmg * 0.45) : rawDmg;
  const willSurvive = player.hp > actualDmg;

  const handleStrike = () => {
    setIsStriking(true);
    sound.playThunder();

    setTimeout(() => {
      setIsStriking(false);
      if (willSurvive) {
        onSurviveTribulation(usePill);
      } else {
        onFailTribulation();
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className={`relative max-w-lg w-full rounded-2xl bg-[#12161f] border-2 border-amber-500/80 p-6 shadow-2xl transition-all duration-300 ${
        isStriking ? 'animate-pulse ring-8 ring-purple-600/60 bg-purple-950/60' : ''
      }`}>
        {/* 關閉按鈕 */}
        {!isStriking && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 標題 */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-950 border border-purple-500/60 mb-2 shadow-inner">
            <Zap className="w-6 h-6 text-purple-400 animate-bounce" />
          </div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold block">
            天地不仁 · 萬物芻狗
          </span>
          <h2 className="text-2xl font-serif font-bold text-amber-300">
            紫霄神雷 · 逆天大渡劫
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            當前境界【{currentRealm.name}】圓滿，即將突破至【{targetRealm.name}】！
          </p>
        </div>

        {/* 雷劫傷害估算 */}
        <div className="bg-[#0b0e14] border border-purple-900/50 rounded-xl p-4 my-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">當前修士氣血：</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {player.hp} / {player.maxHp}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">紫霄九天雷劫威能：</span>
            <span className="font-mono font-bold text-rose-400 text-sm">
              {rawDmg} 點天劫破壞
            </span>
          </div>

          {/* 丹藥護體勾選 */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="use-pill"
                checked={usePill}
                disabled={!hasZhuJiDan}
                onChange={(e) => setUsePill(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <label htmlFor="use-pill" className="cursor-pointer text-slate-200">
                服用【築基丹】護持道基 (抵消55%雷劫)
              </label>
            </div>
            <span className="text-[11px] text-amber-400 font-mono">
              持有: {player.pills['築基丹'] || 0} 顆
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">預計實受天劫創傷：</span>
            <span className={`font-mono font-bold text-base ${willSurvive ? 'text-amber-300' : 'text-rose-500'}`}>
              {actualDmg} 點
            </span>
          </div>

          {!willSurvive && (
            <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                警惕：氣血不足以承受雷殛，強行渡劫將身死道消、肉身湮滅！
              </span>
            </div>
          )}
        </div>

        {/* 渡劫晉升好處展示 */}
        <div className="text-[11px] text-slate-400 mb-5 space-y-1 bg-[#161b22] p-3 rounded-lg border border-slate-800">
          <div className="text-slate-200 font-medium">渡劫成功天道造化：</div>
          <div>· 壽元上限大幅飆升至：<strong className="text-amber-300 font-mono">{targetRealm.maxAge} 載</strong></div>
          <div>· 氣血真元極限大幅擴展至：<strong className="text-emerald-400 font-mono">{targetRealm.maxHp} 點</strong></div>
          {targetRealm.unlockedSpell && (
            <div>· 頓悟習得天賦神通：<strong className="text-purple-300 font-serif">【{targetRealm.unlockedSpell}】</strong></div>
          )}
        </div>

        {/* 迎抗雷劫按鈕 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isStriking}
            className="flex-1 py-2.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 text-xs font-semibold transition-colors"
          >
            退縮蓄力 (稍候再渡)
          </button>

          <button
            onClick={handleStrike}
            disabled={isStriking}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 flex items-center justify-center gap-1.5 transition-all transform hover:scale-102"
          >
            <Zap className="w-4 h-4 fill-current" />
            {isStriking ? '紫霄雷劫降臨中...' : '迎抗九天神雷！'}
          </button>
        </div>
      </div>
    </div>
  );
};
