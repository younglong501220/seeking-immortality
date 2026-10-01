import React from 'react';
import { PlayerState, RealmTier } from '../types/game';
import { REALM_LIST } from '../data/cultivation';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  History,
  TrendingUp,
  ShieldAlert,
  Sword,
  Sparkles,
  Award,
  Crown,
  ChevronRight,
  Flame,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface Props {
  player: PlayerState;
  onBackToCombat?: () => void;
}

const REALM_NAMES: RealmTier[] = [
  '練氣前期',
  '練氣後期',
  '築基前期',
  '築基後期',
  '金丹初期',
  '金丹巔峰',
  '元嬰始成',
  '化神真仙',
];

// Baseline scaling benchmarks per realm for projected trajectory
const REALM_BASE_BENCHMARKS = [
  { dealt: 160, received: 75, battles: 3 },
  { dealt: 380, received: 160, battles: 5 },
  { dealt: 850, received: 340, battles: 7 },
  { dealt: 1800, received: 690, battles: 9 },
  { dealt: 3800, received: 1450, battles: 12 },
  { dealt: 7800, received: 2900, battles: 15 },
  { dealt: 16500, received: 5800, battles: 18 },
  { dealt: 36000, received: 11500, battles: 24 },
];

export const HistoricalBattleChronicle: React.FC<Props> = ({
  player,
  onBackToCombat,
}) => {
  const currentRealmIdx = player.realmIdx;
  const currentRealmName = REALM_LIST[currentRealmIdx]?.name || '練氣前期';

  let runningCumDealt = 0;
  let runningCumReceived = 0;

  const chronicleData = REALM_NAMES.map((name, idx) => {
    const isPast = idx < currentRealmIdx;
    const isCurrent = idx === currentRealmIdx;
    const isFuture = idx > currentRealmIdx;

    const recorded = player.realmCombatStats?.[name];
    let dealt = 0;
    let received = 0;
    let battles = 0;

    if (recorded && recorded.damageDealt > 0) {
      dealt = recorded.damageDealt;
      received = recorded.damageReceived;
      battles = recorded.battles;
    } else if (isPast) {
      // Historical experience baseline
      dealt = REALM_BASE_BENCHMARKS[idx].dealt;
      received = REALM_BASE_BENCHMARKS[idx].received;
      battles = REALM_BASE_BENCHMARKS[idx].battles;
    } else if (isCurrent) {
      // Current realm with minimum realistic engagement
      dealt = Math.max(REALM_BASE_BENCHMARKS[idx].dealt * 0.4, recorded?.damageDealt || 120);
      received = Math.max(REALM_BASE_BENCHMARKS[idx].received * 0.4, recorded?.damageReceived || 50);
      battles = Math.max(1, recorded?.battles || 1);
    } else {
      // Future projected divine power trajectory
      dealt = REALM_BASE_BENCHMARKS[idx].dealt;
      received = REALM_BASE_BENCHMARKS[idx].received;
      battles = REALM_BASE_BENCHMARKS[idx].battles;
    }

    runningCumDealt += Math.round(dealt);
    runningCumReceived += Math.round(received);

    let statusText = '天道推演';
    let statusColor = 'text-slate-500';
    if (isPast) {
      statusText = '已歷生死';
      statusColor = 'text-emerald-400';
    } else if (isCurrent) {
      statusText = '當前道境';
      statusColor = 'text-amber-300 font-bold';
    }

    const netExchange = runningCumDealt - runningCumReceived;
    const ratio = (runningCumDealt / Math.max(1, runningCumReceived)).toFixed(1);

    return {
      realm: name,
      shortRealm: name.replace('前期', '').replace('後期', '').replace('初期', '').replace('巔峰', '').replace('始成', '').replace('真仙', ''),
      idx,
      stageDealt: Math.round(dealt),
      stageReceived: Math.round(received),
      cumDealt: runningCumDealt,
      cumReceived: runningCumReceived,
      netExchange,
      ratio,
      status: statusText,
      statusColor,
      isPast,
      isCurrent,
      isFuture,
    };
  });

  const totalAllTimeDealt = chronicleData[currentRealmIdx]?.cumDealt || 0;
  const totalAllTimeReceived = chronicleData[currentRealmIdx]?.cumReceived || 0;
  const netAdvantage = totalAllTimeDealt - totalAllTimeReceived;
  const ascensionDealtCeiling = chronicleData[chronicleData.length - 1]?.cumDealt || 0;

  return (
    <div className="space-y-5 select-none pb-6">
      {/* 頂部導航與標題列 */}
      <div className="bg-[#111722] border border-[#2d3748] rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600/30 to-purple-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <History className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                修仙戰史 · 練氣至化神演進趨勢
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-600/40 font-mono">
                當前修為：{currentRealmName}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-serif font-bold text-white flex items-center gap-2 mt-0.5">
              <span>八重境界生死戰績覆盤</span>
              <span className="text-xs text-slate-400 font-sans font-normal">
                (Recharts AreaChart 全景視覺化)
              </span>
            </h2>
          </div>
        </div>

        {onBackToCombat && (
          <button
            onClick={onBackToCombat}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
          >
            <Sword className="w-3.5 h-3.5" />
            返回鬥法戰場
          </button>
        )}
      </div>

      {/* 關鍵修仙歷劫指標卡 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <div className="bg-[#161c26] p-3 rounded-xl border border-emerald-500/30 shadow-sm">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Sword className="w-3 h-3 text-emerald-400" /> 歷代累積輸出
          </span>
          <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5 block">
            {totalAllTimeDealt.toLocaleString()}{' '}
            <span className="text-[10px] text-slate-400 font-sans">點</span>
          </span>
          <span className="text-[9px] text-emerald-500/80 font-mono">
            至當前{currentRealmName}
          </span>
        </div>

        <div className="bg-[#161c26] p-3 rounded-xl border border-rose-500/30 shadow-sm">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> 歷代累積承傷
          </span>
          <span className="text-xl font-mono font-bold text-rose-400 mt-0.5 block">
            {totalAllTimeReceived.toLocaleString()}{' '}
            <span className="text-[10px] text-slate-400 font-sans">點</span>
          </span>
          <span className="text-[9px] text-rose-400/80 font-mono">
            金身道體護體承受
          </span>
        </div>

        <div className="bg-[#161c26] p-3 rounded-xl border border-amber-500/30 shadow-sm">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-amber-400" /> 攻防淨優勢差
          </span>
          <span className="text-xl font-mono font-bold text-amber-300 mt-0.5 block">
            +{netAdvantage.toLocaleString()}{' '}
            <span className="text-[10px] text-slate-400 font-sans">點</span>
          </span>
          <span className="text-[9px] text-amber-400/80 font-mono">
            淨威能壓制差值
          </span>
        </div>

        <div className="bg-[#161c26] p-3 rounded-xl border border-cyan-500/30 shadow-sm">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Award className="w-3 h-3 text-cyan-400" /> 當前戰損威能比
          </span>
          <span className="text-xl font-mono font-bold text-cyan-300 mt-0.5 block">
            {(totalAllTimeDealt / Math.max(1, totalAllTimeReceived)).toFixed(1)}{' '}
            <span className="text-[10px] text-slate-400 font-sans">倍</span>
          </span>
          <span className="text-[9px] text-cyan-400/80 font-mono">
            輸出 / 承受係數
          </span>
        </div>

        <div className="bg-[#161c26] p-3 rounded-xl border border-purple-500/30 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Crown className="w-3 h-3 text-purple-400" /> 化神飛昇預測
          </span>
          <span className="text-xl font-mono font-bold text-purple-300 mt-0.5 block">
            {ascensionDealtCeiling.toLocaleString()}{' '}
            <span className="text-[10px] text-slate-400 font-sans">點</span>
          </span>
          <span className="text-[9px] text-purple-400/80 font-mono">
            化神圓滿威能極限
          </span>
        </div>
      </div>

      {/* 主圖表：練氣期至化神期累計傷害與被擊數據 AreaChart */}
      <div className="bg-[#111722] border border-[#2d3748] rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-serif font-bold text-slate-100">
              從練氣期至化神期 · 累計傷害與被擊演進走勢圖 (Recharts AreaChart)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            綠金漸層：累計造成傷害 · 絳紅漸層：累計承受被擊 · 金黃虛線：當前境界
          </span>
        </div>

        <div className="h-72 w-full bg-[#090d14] rounded-lg p-2 border border-slate-800/80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chronicleData} margin={{ top: 15, right: 20, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="cumHistoryDealtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="cumHistoryRecvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="realm"
                stroke="#8b949e"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#8b949e"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#141b27] border border-amber-500/60 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 max-w-xs">
                        <div className="font-serif font-bold text-amber-300 flex items-center justify-between border-b border-slate-700/80 pb-1">
                          <span className="text-sm">【{d.realm}】</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            d.isCurrent
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-400'
                              : d.isPast
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                        <div className="text-emerald-400 font-mono flex justify-between">
                          <span>⚔️ 累計造成傷害:</span>
                          <strong className="text-emerald-300">{d.cumDealt.toLocaleString()} 點</strong>
                        </div>
                        <div className="text-rose-400 font-mono flex justify-between">
                          <span>🛡️ 累計承受打擊:</span>
                          <strong className="text-rose-300">{d.cumReceived.toLocaleString()} 點</strong>
                        </div>
                        <div className="text-amber-300 font-mono flex justify-between border-t border-slate-700 pt-1">
                          <span>⚡ 累計攻防差額:</span>
                          <strong>+{d.netExchange.toLocaleString()} 點</strong>
                        </div>
                        <div className="text-cyan-300 font-mono text-[11px] flex justify-between">
                          <span>🎯 戰損威能比:</span>
                          <strong>{d.ratio} 倍</strong>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 italic">
                          該境界單階爆發：造成 {d.stageDealt} 點 / 承受 {d.stageReceived} 點
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <ReferenceLine
                x={currentRealmName}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: '【當前修為道境】',
                  position: 'top',
                  fill: '#f59e0b',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              />
              <Area
                type="monotone"
                dataKey="cumDealt"
                name="累計造成傷害 (Dealt)"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cumHistoryDealtGrad)"
              />
              <Area
                type="monotone"
                dataKey="cumReceived"
                name="累計承受被擊 (Received)"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cumHistoryRecvGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 次圖表：各境界單階爆發強度對照 AreaChart */}
      <div className="bg-[#111722] border border-[#2d3748] rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-serif font-bold text-slate-100">
              各修為境界單階攻防強度對比 (Stage Burst Scaling)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            展現隨境界提升，單階法術威力與敵手反撲的幾何級爆發
          </span>
        </div>

        <div className="h-52 w-full bg-[#090d14] rounded-lg p-2 border border-slate-800/80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chronicleData} margin={{ top: 10, right: 20, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="stageDealtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="realm" stroke="#8b949e" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#8b949e"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#121824] border border-cyan-500/60 p-2.5 rounded-lg text-xs space-y-1">
                        <div className="font-serif font-bold text-cyan-300">{d.realm} 單階對抗</div>
                        <div className="text-cyan-400 font-mono">該階威力: {d.stageDealt} 點</div>
                        <div className="text-rose-400 font-mono">該階承傷: {d.stageReceived} 點</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Area
                type="monotone"
                dataKey="stageDealt"
                name="單階造成傷害"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#stageDealtGrad)"
              />
              <Area
                type="monotone"
                dataKey="stageReceived"
                name="單階承受傷害"
                stroke="#e11d48"
                strokeWidth={1.5}
                fillOpacity={0.3}
                fill="#e11d48"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 境界戰力演進詳細表格 */}
      <div className="bg-[#111722] border border-[#2d3748] rounded-xl p-4 shadow-lg">
        <h3 className="text-sm font-serif font-bold text-slate-200 mb-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          練氣至化神八重戰績演化詳表 (Cultivation Milestones)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-[#0b0e14] text-[11px] text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">境界階位</th>
                <th className="py-2.5 px-3">道途狀態</th>
                <th className="py-2.5 px-3 text-emerald-400">該階輸出</th>
                <th className="py-2.5 px-3 text-rose-400">該階承傷</th>
                <th className="py-2.5 px-3 text-emerald-300 font-bold">累計造成傷害</th>
                <th className="py-2.5 px-3 text-rose-300 font-bold">累計承受打擊</th>
                <th className="py-2.5 px-3 text-amber-300">攻防淨差</th>
                <th className="py-2.5 px-3 text-right">戰損比</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {chronicleData.map((d) => (
                <tr
                  key={d.realm}
                  className={`transition-colors ${
                    d.isCurrent
                      ? 'bg-amber-950/20 font-semibold text-amber-200 border-l-2 border-amber-400'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <td className="py-2.5 px-3 font-serif flex items-center gap-1.5">
                    {d.realm}
                    {d.isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/40 text-amber-200 font-mono">
                        當前
                      </span>
                    )}
                  </td>
                  <td className={`py-2.5 px-3 ${d.statusColor}`}>
                    {d.status}
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400">{d.stageDealt.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-rose-400">{d.stageReceived.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-bold">{d.cumDealt.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-rose-300 font-bold">{d.cumReceived.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-amber-300">+{d.netExchange.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-cyan-300">{d.ratio}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
