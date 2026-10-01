import React from 'react';
import { ElementType } from '../types/game';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Sparkles, PieChart } from 'lucide-react';

interface Props {
  cost: Partial<Record<ElementType, number>>;
  primaryColor?: string;
  height?: number;
}

const ELEMENT_MAP: Record<ElementType, { name: string; hex: string; bg: string; text: string }> = {
  metal: { name: '金', hex: '#d97706', bg: 'bg-amber-950/60', text: 'text-amber-300' },
  wood: { name: '木', hex: '#059669', bg: 'bg-emerald-950/60', text: 'text-emerald-300' },
  water: { name: '水', hex: '#2563eb', bg: 'bg-blue-950/60', text: 'text-blue-300' },
  fire: { name: '火', hex: '#e11d48', bg: 'bg-rose-950/60', text: 'text-rose-300' },
  earth: { name: '土', hex: '#9333ea', bg: 'bg-purple-950/60', text: 'text-purple-300' },
};

export const QiRadarChart: React.FC<Props> = ({
  cost,
  primaryColor = '#f59e0b',
  height = 120,
}) => {
  const totalCost = Object.values(cost).reduce((acc, v) => acc + (v || 0), 0);

  const radarData = (['metal', 'wood', 'water', 'fire', 'earth'] as ElementType[]).map((el) => {
    const val = cost[el] || 0;
    const pct = totalCost > 0 ? Math.round((val / totalCost) * 100) : 0;
    return {
      element: ELEMENT_MAP[el].name,
      elementKey: el,
      value: val,
      percentage: pct,
      hex: ELEMENT_MAP[el].hex,
    };
  });

  const maxVal = Math.max(2, ...radarData.map((d) => d.value));

  // Non-zero element costs for quick allocation evaluation chips
  const activeElements = radarData.filter((d) => d.value > 0);

  return (
    <div className="w-full bg-[#070a0f]/90 rounded-lg p-2 border border-slate-800 my-1.5 shadow-inner">
      {/* 標題與消耗總量 */}
      <div className="flex items-center justify-between text-[10px] mb-0.5 px-0.5">
        <span className="text-amber-300/90 font-serif flex items-center gap-1 font-semibold">
          <PieChart className="w-3 h-3 text-amber-400" />
          五行靈氣消耗佔比 (Radar)
        </span>
        <span className="text-slate-400 font-mono text-[9px]">
          總消耗: <strong className="text-amber-300">{totalCost}</strong> 點靈氣
        </span>
      </div>

      {/* Recharts RadarChart */}
      <div style={{ height, width: '100%' }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
            <PolarGrid stroke="#1e293b" strokeDasharray="2 2" />
            <PolarAngleAxis
              dataKey="element"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxVal]}
              tick={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  const isMain = d.percentage >= 50;
                  return (
                    <div className="bg-[#111722] border border-amber-500/60 p-2 rounded-lg shadow-xl text-[10px] space-y-0.5">
                      <div className="font-serif font-bold text-amber-300 flex justify-between gap-3">
                        <span>{d.element}行靈氣</span>
                        <span className="text-amber-400 font-mono">{d.percentage}% 佔比</span>
                      </div>
                      <div className="text-slate-300 font-mono">
                        消耗數量: <strong className="text-white">{d.value}</strong> 點
                      </div>
                      <div className="text-[9px] pt-0.5 border-t border-slate-700/80">
                        {d.value === 0 ? (
                          <span className="text-slate-500">此法術毋需此行靈氣</span>
                        ) : isMain ? (
                          <span className="text-amber-400 font-medium">★ 核心主行靈氣消耗</span>
                        ) : (
                          <span className="text-cyan-400 font-medium">✦ 輔助相生調和消耗</span>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="靈氣消耗"
              dataKey="value"
              stroke={primaryColor}
              fill={primaryColor}
              fillOpacity={0.4}
              strokeWidth={1.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 資源配置快速評估標籤列 */}
      <div className="flex flex-wrap items-center justify-center gap-1 mt-1 pt-1 border-t border-slate-800/80">
        {activeElements.length > 0 ? (
          activeElements.map((el) => {
            const meta = ELEMENT_MAP[el.elementKey as ElementType];
            return (
              <span
                key={el.elementKey}
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono border border-slate-700/80 flex items-center gap-1 ${meta.bg} ${meta.text}`}
              >
                <span>{el.element}行</span>
                <strong>{el.percentage}%</strong>
                <span className="text-slate-400">({el.value}點)</span>
              </span>
            );
          })
        ) : (
          <span className="text-[9px] text-slate-500 font-mono">零靈氣自化玄法</span>
        )}
      </div>
    </div>
  );
};
