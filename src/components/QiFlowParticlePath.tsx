import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElementType } from '../types/game';

interface Props {
  activeKey: number;
  element?: ElementType;
  qiAmount?: number;
  spellName?: string;
}

const ELEMENT_COLORS: Record<ElementType, { main: string; glow: string; text: string }> = {
  metal: { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)', text: '庚金' },
  wood: { main: '#10b981', glow: 'rgba(16, 185, 129, 0.7)', text: '甲木' },
  water: { main: '#38bdf8', glow: 'rgba(56, 189, 248, 0.7)', text: '癸水' },
  fire: { main: '#f43f5e', glow: 'rgba(244, 63, 94, 0.7)', text: '丙火' },
  earth: { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.7)', text: '戊土' },
};

export const QiFlowParticlePath: React.FC<Props> = ({
  activeKey,
  element = 'fire',
  qiAmount = 2,
  spellName = '神通施展',
}) => {
  if (activeKey <= 0) return null;

  const colorMeta = ELEMENT_COLORS[element] || ELEMENT_COLORS.fire;

  // Staggered particle paths
  const particleCount = Math.min(8, Math.max(4, qiAmount * 2));
  const particles = Array.from({ length: particleCount }).map((_, i) => ({
    id: i,
    delay: i * 0.08,
    size: 6 + (i % 3) * 3,
    lateralDrift: (i - particleCount / 2) * 22,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden select-none">
      <AnimatePresence>
        <motion.div
          key={`qi-flow-${activeKey}`}
          className="relative w-full h-full"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
        >
          {/* 流動光弧 SVG 軌跡 */}
          <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="qiFlowGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={colorMeta.main} stopOpacity="0.1" />
                <stop offset="50%" stopColor={colorMeta.main} stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
              </linearGradient>
              <filter id="qiGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 左側弧線軌跡 */}
            <motion.path
              d="M 35% 85% Q 25% 45% 45% 20%"
              fill="none"
              stroke="url(#qiFlowGradient)"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              filter="url(#qiGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1],
                pathOffset: [0, 0, 1],
                opacity: [0, 0.9, 0],
              }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            />

            {/* 右側弧線軌跡 */}
            <motion.path
              d="M 65% 85% Q 75% 45% 55% 20%"
              fill="none"
              stroke="url(#qiFlowGradient)"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              filter="url(#qiGlow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1],
                pathOffset: [0, 0, 1],
                opacity: [0, 0.9, 0],
              }}
              transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.05 }}
            />
          </svg>

          {/* 沿著路徑自下而上飛馳的流動粒子群 */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute left-1/2 bottom-20 rounded-full"
              initial={{
                x: p.lateralDrift * 1.5,
                y: 0,
                scale: 0.3,
                opacity: 0,
              }}
              animate={{
                x: [p.lateralDrift * 1.5, p.lateralDrift * 0.4, 0],
                y: [0, -180, -320],
                scale: [0.4, 1.4, 0.2],
                opacity: [0, 1, 0.9, 0],
              }}
              transition={{
                duration: 0.85,
                delay: p.delay,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: colorMeta.main,
                boxShadow: `0 0 12px ${colorMeta.main}, 0 0 20px #ffffff`,
              }}
            >
              {/* 伴隨飄逸的微型星屑 */}
              <span className="absolute -top-2 -left-2 text-[9px] text-white select-none opacity-80">
                ✦
              </span>
            </motion.div>
          ))}

          {/* 靈氣匯聚爆裂環 (頂部敵方打擊點衝擊波) */}
          <motion.div
            className="absolute left-1/2 top-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{
              scale: [0.2, 1.8, 2.4],
              opacity: [0, 0.9, 0],
            }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            style={{
              width: 70,
              height: 70,
              borderColor: colorMeta.main,
              boxShadow: `0 0 16px ${colorMeta.glow}`,
            }}
          />

          {/* 靈氣引動浮動說明 */}
          <motion.div
            className="absolute left-1/2 top-[35%] -translate-x-1/2 bg-[#090d15]/90 border border-slate-700/80 px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-xl select-none"
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [15, 0, -20],
              scale: [0.8, 1.05, 0.9],
            }}
            transition={{ duration: 0.85, delay: 0.1 }}
            style={{
              color: colorMeta.main,
              boxShadow: `0 0 12px ${colorMeta.glow}`,
            }}
          >
            <span>⚡ 引動 {qiAmount} 點【{colorMeta.text}真元】</span>
            <span className="text-white">➜</span>
            <span className="text-amber-200">【{spellName}】</span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
