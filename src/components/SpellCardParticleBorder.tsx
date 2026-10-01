import React from 'react';
import { Sparkles, ArrowRight, Zap, Crown } from 'lucide-react';

interface Props {
  isActive: boolean;
  tier: number; // 0, 1, 2, 3
  oldTier?: number;
  isTierCross?: boolean;
  expGained?: number;
  oldTierName?: string;
  newTierName?: string;
}

export const TIER_GRADIENTS = [
  {
    tier: 0,
    name: '初入門徑',
    gradient: 'from-slate-700 via-slate-600 to-zinc-700',
    border: 'border-slate-700',
    glow: 'rgba(100, 116, 139, 0.4)',
    text: 'text-slate-400',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  {
    tier: 1,
    name: '略有小成',
    gradient: 'from-emerald-600 via-teal-500 to-cyan-600',
    border: 'border-emerald-500/70',
    glow: 'rgba(16, 185, 129, 0.6)',
    text: 'text-emerald-300',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60',
  },
  {
    tier: 2,
    name: '融會大成',
    gradient: 'from-amber-500 via-orange-500 to-rose-600',
    border: 'border-amber-500/80',
    glow: 'rgba(245, 158, 11, 0.7)',
    text: 'text-amber-300',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
  },
  {
    tier: 3,
    name: '出神入化',
    gradient: 'from-purple-600 via-pink-500 to-amber-400',
    border: 'border-purple-400 shadow-lg shadow-purple-500/30',
    glow: 'rgba(168, 85, 247, 0.9)',
    text: 'text-purple-300',
    badgeBg: 'bg-purple-950/90 text-purple-200 border-purple-400',
  },
];

// Predefined particle positions around the card perimeter
const PARTICLES = [
  { id: 1, top: '0%', left: '15%', symbol: '✦', delay: '0s', color: 'text-amber-300' },
  { id: 2, top: '0%', left: '50%', symbol: '✧', delay: '0.4s', color: 'text-emerald-300' },
  { id: 3, top: '0%', left: '85%', symbol: '⋆', delay: '0.2s', color: 'text-cyan-300' },
  { id: 4, top: '30%', right: '-4px', symbol: '✴', delay: '0.6s', color: 'text-amber-400' },
  { id: 5, top: '70%', right: '-4px', symbol: '✦', delay: '0.1s', color: 'text-purple-300' },
  { id: 6, bottom: '0%', left: '80%', symbol: '✧', delay: '0.5s', color: 'text-rose-300' },
  { id: 7, bottom: '0%', left: '45%', symbol: '⋆', delay: '0.3s', color: 'text-yellow-300' },
  { id: 8, bottom: '0%', left: '15%', symbol: '✦', delay: '0.7s', color: 'text-emerald-400' },
  { id: 9, top: '65%', left: '-4px', symbol: '✴', delay: '0.2s', color: 'text-cyan-400' },
  { id: 10, top: '25%', left: '-4px', symbol: '✧', delay: '0.5s', color: 'text-amber-300' },
];

export const SpellCardParticleBorder: React.FC<Props> = ({
  isActive,
  tier,
  oldTier = 0,
  isTierCross = false,
  expGained = 3,
  oldTierName = '初入門徑',
  newTierName = '出神入化',
}) => {
  if (!isActive) return null;

  const currentTierMeta = TIER_GRADIENTS[Math.min(3, Math.max(0, tier))];
  const oldTierMeta = TIER_GRADIENTS[Math.min(3, Math.max(0, oldTier))];

  return (
    <div className="absolute inset-0 pointer-events-none z-30 rounded-xl overflow-visible transition-all duration-500">
      {/* 旋轉外邊緣光芒邊框 (Rotating Conic/Linear Gradient Beam) */}
      <div
        className={`absolute -inset-[2px] rounded-xl bg-gradient-to-r ${currentTierMeta.gradient} opacity-90 blur-[1px] animate-pulse`}
      />

      {/* 核心邊緣發光線 */}
      <div
        className={`absolute inset-0 rounded-xl border-2 ${currentTierMeta.border} shadow-2xl`}
        style={{
          boxShadow: `0 0 16px ${currentTierMeta.glow}, inset 0 0 12px ${currentTierMeta.glow}`,
        }}
      />

      {/* 邊緣四方浮動粒子特效 (Perimeter Particle Sparks) */}
      <div className="absolute inset-0 overflow-visible">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className={`absolute text-xs font-bold ${p.color} animate-particle-sparkle select-none drop-shadow-md`}
            style={{
              top: p.top,
              bottom: p.bottom,
              left: p.left,
              right: p.right,
              animationDelay: p.delay,
            }}
          >
            {p.symbol}
          </span>
        ))}
      </div>

      {/* 熟練度提升浮動提示 */}
      <div className="absolute -top-3 right-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-amber-300 flex items-center gap-1 animate-bounce">
        <Zap className="w-3 h-3 fill-slate-950" />
        熟練度 +{expGained}
      </div>

      {/* 品階跨越特效橫幅 (Tier Leap Milestone Banner) */}
      {isTierCross && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-11/12 bg-[#0c1017] border-2 border-amber-400 p-1.5 rounded-lg shadow-2xl z-40 text-center animate-fadeIn">
          <div className="flex items-center justify-center gap-1 text-[10px] font-serif font-black text-amber-300">
            <Crown className="w-3 h-3 text-yellow-400 animate-pulse" />
            <span>【道法昇華 · 品階跨越】</span>
          </div>

          {/* 顏色漸變展示品階跨越條 */}
          <div className="flex items-center justify-center gap-1.5 mt-1 text-[9px] font-bold">
            <span className={`px-1.5 py-0.2 rounded border ${oldTierMeta.badgeBg}`}>
              {oldTierName}
            </span>
            <ArrowRight className="w-3 h-3 text-amber-400 animate-pulse" />
            <span
              className={`px-1.5 py-0.2 rounded border bg-gradient-to-r ${currentTierMeta.gradient} text-white font-extrabold shadow`}
            >
              {newTierName}
            </span>
          </div>

          {/* 動態光譜光暈條 */}
          <div
            className={`w-full h-1 mt-1 rounded-full bg-gradient-to-r from-slate-600 via-emerald-500 via-amber-500 to-purple-600 animate-tier-glow`}
          />
        </div>
      )}
    </div>
  );
};
