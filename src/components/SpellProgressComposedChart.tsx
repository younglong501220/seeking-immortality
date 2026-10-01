import React from 'react';
import { SpellCard, ElementType } from '../types/game';
import { getSpellMastery } from '../data/cultivation';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface Props {
  spell: SpellCard;
  currentExp: number;
  height?: number;
  primaryColor?: string;
}

export const SpellProgressComposedChart: React.FC<Props> = ({
  spell,
  currentExp = 0,
  height = 120,
  primaryColor = '#f59e0b',
}) => {
  const mastery = getSpellMastery(currentExp);
  const basePower = spell.damage || spell.shield || spell.heal || 20;
  const totalCost = Object.values(spell.cost).reduce((a, b) => a + (b || 0), 0);

  const stages = [
    {
      stage: '初窺',
      fullStage: '初窺門徑',
      threshold: 0,
      power: Math.round(basePower),
      boost: '0%',
      unlocked: currentExp >= 0,
      cost: totalCost,
      perk: '基礎威能',
    },
    {
      stage: '小成',
      fullStage: '略有小成',
      threshold: 5,
      power: Math.round(basePower * 1.25),
      boost: '+25%',
      unlocked: currentExp >= 5,
      cost: totalCost,
      perk: '威能+25%',
    },
    {
      stage: '大成',
      fullStage: '融會大成',
      threshold: 15,
      power: Math.round(basePower * 1.55),
      boost: '+55%',
      unlocked: currentExp >= 15,
      cost: totalCost >= 3 ? totalCost - 1 : totalCost,
      perk: totalCost >= 3 ? '威能+55% 靈氣-1' : '威能+55%',
    },
    {
      stage: '真訣',
      fullStage: '出神入化·真訣',
      threshold: 30,
      power: Math.round(basePower * 1.85),
      boost: '+85%',
      unlocked: currentExp >= 30,
      cost: Math.max(1, totalCost - 1),
      perk: '極限+85% 必減消耗',
    },
  ];

  // Max power for Y-Axis
  const maxPower = Math.max(...stages.map((s) => s.power));

  return (
    <div className="w-full bg-[#070a0f]/90 rounded-lg p-2 border border-slate-800 my-1.5 shadow-inner">
      <div className="flex items-center justify-between text-[10px] mb-1 px-1">
        <span className="text-amber-300/90 font-serif flex items-center gap-1 font-semibold">
          <Sparkles className="w-3 h-3 text-amber-400" />
          熟練進度與強化組合圖 (ComposedChart)
        </span>
        <span className="text-slate-400 font-mono text-[9px]">
          當前: <strong className="text-amber-300">{currentExp}</strong> 次 ({mastery.tierName})
        </span>
      </div>

      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={stages} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="stage"
              stroke="#8b949e"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#8b949e"
              fontSize={9}
              tickLine={false}
              domain={[0, Math.ceil(maxPower * 1.15)]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#121824] border border-amber-500/60 p-2 rounded shadow-xl text-[10px] space-y-0.5">
                      <div className="font-serif font-bold text-amber-300 flex justify-between gap-3">
                        <span>{d.fullStage}</span>
                        <span className={d.unlocked ? 'text-emerald-400' : 'text-slate-400'}>
                          {d.unlocked ? '✓ 已參透' : `需 ${d.threshold} 次`}
                        </span>
                      </div>
                      <div className="text-emerald-300 font-mono">
                        強化威能: {d.power} 點 ({d.boost})
                      </div>
                      <div className="text-cyan-300 font-mono">
                        靈氣消耗: {d.cost} 點
                      </div>
                      <div className="text-amber-200/90 text-[9px] pt-0.5 border-t border-slate-700">
                        解鎖屬性: {d.perk}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="power"
              name="威能階梯"
              radius={[3, 3, 0, 0]}
              barSize={16}
            >
              {stages.map((entry) => (
                <Cell
                  key={`bar-${entry.stage}`}
                  fill={entry.unlocked ? primaryColor : '#1e293b'}
                  stroke={entry.unlocked ? '#fde68a' : '#334155'}
                  strokeWidth={0.5}
                />
              ))}
            </Bar>
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="power"
              name="成長走勢"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={{ r: 3, fill: '#38bdf8' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 強化屬性階梯狀態標籤列 */}
      <div className="grid grid-cols-4 gap-1 mt-1 text-[9px] text-center pt-1 border-t border-slate-800/80">
        {stages.map((s) => (
          <div
            key={s.stage}
            className={`py-0.5 px-0.5 rounded flex items-center justify-center gap-0.5 ${
              s.unlocked
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 font-medium'
                : 'bg-slate-900/40 text-slate-500 border border-slate-800'
            }`}
          >
            {s.unlocked ? (
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            ) : (
              <Lock className="w-2.5 h-2.5 text-slate-600 shrink-0" />
            )}
            <span className="truncate">{s.stage}: {s.boost}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
