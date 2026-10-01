export interface SpiritArrayTier {
  level: number;
  name: string;
  desc: string;
  bonusPercent: number;
  upgradeCost: number;
  auraColor: string;
  runeText: string;
}

export const SPIRIT_ARRAY_CONFIGS: SpiritArrayTier[] = [
  {
    level: 0,
    name: '凡品聚靈石',
    desc: '未設陣法，僅借幾枚劣品靈石粗淺吞吐天地微薄靈氣。',
    bonusPercent: 0,
    upgradeCost: 40,
    auraColor: '#64748b',
    runeText: '無儀',
  },
  {
    level: 1,
    name: '一階 · 引靈微陣',
    desc: '引動山脈微弱靈泉，閉關修為獲取效率額外提升 30%。',
    bonusPercent: 30,
    upgradeCost: 120,
    auraColor: '#10b981',
    runeText: '青木生靈',
  },
  {
    level: 2,
    name: '二階 · 四象聚靈陣',
    desc: '布四象旗鎖定四方地脈，閉關修為獲取效率額外提升 70%。',
    bonusPercent: 70,
    upgradeCost: 260,
    auraColor: '#06b6d4',
    runeText: '四象伏流',
  },
  {
    level: 3,
    name: '三階 · 乾坤鎖靈大陣',
    desc: '溝通天地靈脈，百里靈氣如百川匯海，修為獲取效率額外提升 125%。',
    bonusPercent: 125,
    upgradeCost: 550,
    auraColor: '#f59e0b',
    runeText: '乾坤聚頂',
  },
  {
    level: 4,
    name: '四階 · 太虛化元大陣',
    desc: '聚靈成液，洗髓伐毛，閉關修為獲取效率額外提升 200%。',
    bonusPercent: 200,
    upgradeCost: 1100,
    auraColor: '#a855f7',
    runeText: '太虛洞天',
  },
  {
    level: 5,
    name: '五階 · 九霄通天造化神陣',
    desc: '陣連九重霄漢，吞日月之精華，奪造化之玄機，修為獲取效率狂飆 320%！',
    bonusPercent: 320,
    upgradeCost: 0, // Max Level
    auraColor: '#ec4899',
    runeText: '九霄造化',
  },
];

export const getArrayTier = (level: number = 0): SpiritArrayTier => {
  const safeLvl = Math.max(0, Math.min(SPIRIT_ARRAY_CONFIGS.length - 1, level));
  return SPIRIT_ARRAY_CONFIGS[safeLvl];
};
