import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  triggerKey: number;
  damageAmount: number;
  isEnemy?: boolean;
}

const EMBER_COLORS = [
  '#f97316', // Orange
  '#ef4444', // Red
  '#fbbf24', // Amber
  '#dc2626', // Crimson
  '#fb923c', // Light orange
];

export const HealthEmberEffect: React.FC<Props> = ({
  triggerKey,
  damageAmount,
  isEnemy = false,
}) => {
  if (triggerKey <= 0 || damageAmount <= 0) return null;

  // Generate 8 ember sparks with varied angles, velocities, and shapes
  const embers = Array.from({ length: 8 }).map((_, i) => {
    const angle = (Math.PI / 4) * i + (Math.random() - 0.5) * 0.4;
    const distance = 25 + Math.random() * 35;
    const x = Math.cos(angle) * distance;
    const y = -Math.abs(Math.sin(angle) * distance) - 10;
    const size = 3 + Math.random() * 5;
    const color = EMBER_COLORS[i % EMBER_COLORS.length];
    const duration = 0.6 + Math.random() * 0.4;

    return { id: i, x, y, size, color, duration };
  });

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none z-30 select-none">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`ember-group-${triggerKey}`}
          className="relative flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          {/* 跳動扣血數字 */}
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: -28,
              scale: [0.6, 1.3, 1, 0.8],
            }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className={`absolute font-mono font-black text-sm sm:text-base drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] flex items-center gap-0.5 whitespace-nowrap ${
              isEnemy ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            <span>-{damageAmount}</span>
            <span className="text-xs">💥</span>
          </motion.div>

          {/* 餘燼碎火粒子 */}
          {embers.map((emb) => (
            <motion.div
              key={emb.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: emb.x,
                y: emb.y,
                opacity: [1, 0.8, 0],
                scale: [1, 1.4, 0],
                rotate: (emb.x > 0 ? 1 : -1) * 180,
              }}
              transition={{ duration: emb.duration, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: emb.size,
                height: emb.size,
                backgroundColor: emb.color,
                borderRadius: '50%',
                boxShadow: `0 0 6px ${emb.color}, 0 0 10px ${emb.color}`,
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
