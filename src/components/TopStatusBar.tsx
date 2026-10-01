import React from 'react';
import { PlayerState, WorldState } from '../types/game';
import { REALM_LIST } from '../data/cultivation';
import { sound } from '../utils/audio';
import { Volume2, VolumeX, Music, RotateCcw, Sparkles, Shield, Heart, Zap } from 'lucide-react';

interface Props {
  player: PlayerState;
  world: WorldState;
  onResetGame: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  ambientEnabled: boolean;
  setAmbientEnabled: (v: boolean) => void;
}

export const TopStatusBar: React.FC<Props> = ({
  player,
  world,
  onResetGame,
  soundEnabled,
  setSoundEnabled,
  ambientEnabled,
  setAmbientEnabled,
}) => {
  const currentRealm = REALM_LIST[player.realmIdx] || REALM_LIST[0];
  const hpPct = Math.min(100, Math.max(0, (player.hp / player.maxHp) * 100));
  const expPct = Math.min(100, Math.max(0, (player.exp / player.maxExp) * 100));
  const ageDanger = player.age >= player.maxAge - 5;

  return (
    <header className="bg-[#090d14] border-b border-[#21262d] text-[#c9d1d9] px-4 py-2.5 flex flex-wrap items-center justify-between gap-y-2 select-none shadow-md z-30">
      {/* Zone 1: Brand title wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-serif text-lg font-bold tracking-wider text-amber-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          覓長生 · 凡人逆仙傳
        </span>
        <span className="text-xs px-2 py-0.5 rounded border border-amber-500/40 bg-amber-950/30 text-amber-300 font-medium">
          {currentRealm.name}
        </span>
      </div>

      {/* Zone 2: Player Attributes & World Timeline */}
      <div className="flex flex-wrap items-center gap-4 text-xs tabular-nums text-slate-300">
        {/* 壽元 */}
        <div className={`flex items-center gap-1.5 ${ageDanger ? 'text-red-400 font-bold animate-pulse' : ''}`}>
          <span className="text-slate-400">壽元:</span>
          <span className="font-mono font-semibold">{player.age}</span>
          <span className="text-slate-500">/</span>
          <span className="font-mono">{player.maxAge} 載</span>
        </div>

        <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>

        {/* 氣血 */}
        <div className="flex items-center gap-1.5 min-w-[130px]">
          <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-slate-400">氣血</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {player.hp}/{player.maxHp}
                {player.shield > 0 && <span className="text-cyan-400 ml-1">+{player.shield}</span>}
              </span>
            </div>
            <div className="w-full bg-[#161b22] h-1.5 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${hpPct}%` }}
              />
            </div>
          </div>
        </div>

        <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>

        {/* 修為 */}
        <div className="flex items-center gap-1.5 min-w-[130px]">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-[11px] mb-0.5">
              <span className="text-slate-400">修為</span>
              <span className="font-mono text-amber-300 font-semibold">
                {player.exp}/{player.maxExp}
              </span>
            </div>
            <div className="w-full bg-[#161b22] h-1.5 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300"
                style={{ width: `${expPct}%` }}
              />
            </div>
          </div>
        </div>

        <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>

        {/* 靈石 */}
        <div className="flex items-center gap-1 text-amber-300 font-medium">
          <span className="text-slate-400">靈石:</span>
          <span className="font-mono font-bold text-amber-400">{player.spiritStones}</span>
          <span className="text-[11px] text-amber-500/80">顆</span>
        </div>

        {player.danPoison > 0 && (
          <>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
            <div className="flex items-center gap-1 text-purple-400 text-[11px]">
              <span>丹毒:</span>
              <span className="font-mono font-bold">{player.danPoison}%</span>
            </div>
          </>
        )}

        <span className="text-slate-600 hidden md:inline" aria-hidden="true">·</span>

        {/* 曆法 */}
        <div className="text-slate-400 text-[11px] hidden md:block">
          天道曆 <span className="font-mono font-medium text-slate-200">{world.year}</span> 年 <span className="font-mono font-medium text-slate-200">{world.month}</span> 月
        </div>
      </div>

      {/* Zone 3: Audio & Utility Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => {
            const next = sound.toggleAmbient();
            setAmbientEnabled(next);
          }}
          title={ambientEnabled ? '關閉古琴背景微音' : '開啟古琴背景微音'}
          className={`p-1.5 rounded hover:bg-[#21262d] transition-colors ${ambientEnabled ? 'text-amber-300 bg-amber-950/30' : 'text-slate-400'}`}
        >
          <Music className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sound.enabled = !soundEnabled;
            setSoundEnabled(!soundEnabled);
          }}
          title={soundEnabled ? '靜音法術音效' : '開啟法術音效'}
          className="p-1.5 rounded hover:bg-[#21262d] text-slate-400 hover:text-slate-200 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
        </button>

        <button
          onClick={onResetGame}
          title="轉世重修（重設進度）"
          className="p-1.5 rounded hover:bg-[#21262d] text-slate-400 hover:text-rose-400 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
