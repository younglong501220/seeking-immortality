import React from 'react';
import { PlayerState, SectType } from '../types/game';
import { sound } from '../utils/audio';
import { ShieldCheck, Flame, Users, Award, Check, Sparkles } from 'lucide-react';
import yunshanImage from '../assets/images/sect_yunshan_celestial_1790834443615.jpg';
import youmingImage from '../assets/images/sect_youming_abyss_1790834454921.jpg';

interface Props {
  player: PlayerState;
  onJoinSect: (sect: SectType) => void;
  onDoQuest: (costMonths: number, rewardStones: number, rewardExp: number, questName: string) => void;
}

export const SectTab: React.FC<Props> = ({
  player,
  onJoinSect,
  onDoQuest,
}) => {
  const isYunshan = player.sect === '正道・雲山派';
  const isYouming = player.sect === '魔門・幽冥教';

  const getRankTitle = () => {
    if (player.sectContribution < 100) return '外門普通弟子';
    if (player.sectContribution < 300) return '內門精英真傳';
    if (player.sectContribution < 800) return '執事護法長老';
    return '傳功太上客卿';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 宗門抬頭 */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1 block">
              仙門氣運 · 正邪殊途
            </span>
            <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-400" />
              名門正宗 vs 九幽魔道
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              正道修天地生息，魔道奪他人氣血。一念成仙，一念成魔。
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">當前身分</span>
            <span className="text-sm font-semibold text-amber-300 flex items-center gap-1 justify-end">
              <Award className="w-4 h-4" />
              {player.sect} · {getRankTitle()}
            </span>
            <span className="text-[11px] text-slate-400">宗門貢獻: {player.sectContribution} 點</span>
          </div>
        </div>
      </div>

      {/* 兩大宗門門派展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 正道 · 雲山派 */}
        <div className={`rounded-xl overflow-hidden border-2 transition-all flex flex-col justify-between ${
          isYunshan ? 'border-cyan-500 bg-[#121a24] shadow-xl shadow-cyan-500/10' : 'border-slate-800 bg-[#161b22]'
        }`}>
          <div>
            <div className="h-44 w-full relative">
              <img
                src={yunshanImage}
                alt="雲山派仙峰"
                className="w-full h-full object-cover filter brightness-90 contrast-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121a24] via-transparent to-transparent" />
              {isYunshan && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-cyan-950/80 border border-cyan-400 text-cyan-300 rounded text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 已拜入門派
                </div>
              )}
            </div>

            <div className="p-5">
              <h2 className="text-xl font-serif font-bold text-cyan-300 flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                名門正派 · 雲山宗
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                立派三千年，講究道法自然、上善若水。心性純正不易滋生心魔，每輪鬥法額外凝結靈力護罩，擅長以柔克剛。
              </p>

              <div className="bg-[#0b1016] border border-cyan-900/40 rounded-lg p-3 text-xs text-cyan-200/90 mb-4 space-y-1">
                <div>· 入門傳授：【太乙劍罡】(攻守兼備玄品法訣)</div>
                <div>· 宗門特效：每回合初始額外獲得 +1 點水行靈氣</div>
              </div>
            </div>
          </div>

          <div className="p-5 pt-0">
            <button
              onClick={() => onJoinSect('正道・雲山派')}
              disabled={isYunshan}
              className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                isYunshan
                  ? 'bg-cyan-950/40 text-cyan-400/60 border border-cyan-800/40 cursor-default'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-md shadow-cyan-600/20'
              }`}
            >
              {isYunshan ? '雲山派門下真修' : '拜入雲山正道'}
            </button>
          </div>
        </div>

        {/* 魔門 · 幽冥教 */}
        <div className={`rounded-xl overflow-hidden border-2 transition-all flex flex-col justify-between ${
          isYouming ? 'border-rose-500 bg-[#1c1214] shadow-xl shadow-rose-500/10' : 'border-slate-800 bg-[#161b22]'
        }`}>
          <div>
            <div className="h-44 w-full relative">
              <img
                src={youmingImage}
                alt="幽冥教魔窟"
                className="w-full h-full object-cover filter brightness-90 contrast-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1214] via-transparent to-transparent" />
              {isYouming && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-rose-950/80 border border-rose-400 text-rose-300 rounded text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 魔道血脈
                </div>
              )}
            </div>

            <div className="p-5">
              <h2 className="text-xl font-serif font-bold text-rose-300 flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-rose-400" />
                九幽魔道 · 幽冥教
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                隱匿於萬丈血淵之中，逆天奪命，以血煞祭煉殺伐之術。鬥法兇悍無比，可吞噬敵手氣血反哺己身！
              </p>

              <div className="bg-[#120a0c] border border-rose-900/40 rounded-lg p-3 text-xs text-rose-200/90 mb-4 space-y-1">
                <div>· 入門傳授：【九幽化血】(噬血奪生神技)</div>
                <div>· 宗門特效：生命低於50%時攻擊傷害提升20%</div>
              </div>
            </div>
          </div>

          <div className="p-5 pt-0">
            <button
              onClick={() => onJoinSect('魔門・幽冥教')}
              disabled={isYouming}
              className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                isYouming
                  ? 'bg-rose-950/40 text-rose-400/60 border border-rose-800/40 cursor-default'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20'
              }`}
            >
              {isYouming ? '幽冥魔道血脈' : '墮入幽冥修羅'}
            </button>
          </div>
        </div>
      </div>

      {/* 宗門任務懸賞 */}
      {player.sect !== '散修' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
          <h3 className="font-serif font-bold text-amber-300 text-sm mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            宗門任務懸賞榜
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#0d1117] border border-slate-800 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block mb-1">
                  採集珍稀主藥 (耗1月)
                </span>
                <p className="text-[11px] text-slate-400 mb-2">前往後山採摘百年靈草上繳宗門藥庫。</p>
              </div>
              <button
                onClick={() => onDoQuest(1, 30, 20, '採集珍稀主藥')}
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                領取完成 (+30石, +20貢獻)
              </button>
            </div>

            <div className="p-3 bg-[#0d1117] border border-slate-800 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block mb-1">
                  鎮守靈礦法陣 (耗3月)
                </span>
                <p className="text-[11px] text-slate-400 mb-2">值守宗門邊界礦脈，提防宵小與地底妖物。</p>
              </div>
              <button
                onClick={() => onDoQuest(3, 85, 60, '鎮守靈礦法陣')}
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                領取完成 (+85石, +60貢獻)
              </button>
            </div>

            <div className="p-3 bg-[#0d1117] border border-slate-800 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block mb-1">
                  斬殺敵對妖魔 (耗2月)
                </span>
                <p className="text-[11px] text-slate-400 mb-2">領法旨截殺敵對宗門暗哨，揚宗門威名。</p>
              </div>
              <button
                onClick={() => onDoQuest(2, 60, 50, '斬殺敵對妖魔')}
                className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                領取完成 (+60石, +50貢獻)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
