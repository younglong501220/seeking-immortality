export type ElementType = 'metal' | 'wood' | 'water' | 'fire' | 'earth';

export type RealmTier = 
  | '練氣前期' 
  | '練氣後期' 
  | '築基前期' 
  | '築基後期' 
  | '金丹初期' 
  | '金丹巔峰' 
  | '元嬰始成' 
  | '化神真仙';

export interface RealmConfig {
  name: RealmTier;
  maxHp: number;
  maxExp: number;
  maxAge: number;
  tribulationDmg: number;
  unlockedSpell?: string;
  title: string;
  bonusQiPerTurn: number;
}

export interface SpellCard {
  id: string;
  name: string;
  element: ElementType;
  cost: Partial<Record<ElementType, number>>;
  desc: string;
  damage?: number;
  shield?: number;
  heal?: number;
  drawCards?: number;
  gainQi?: number;
  pierceShield?: boolean;
  lifesteal?: number;
  rarity: '凡品' | '靈品' | '玄品' | '地品' | '天品';
}

export interface SpellCombo {
  name: string;
  prevSpell: string;
  nextSpell: string;
  multiplier: number;
  desc: string;
  bonusShield?: number;
  bonusQi?: ElementType;
  bonusLifesteal?: number;
}

export interface CombatTurnMetric {
  turn: number;
  damageDealt: number;
  damageReceived: number;
  qiSpent: number;
  spellsCastCount: number;
  combosCount: number;
}

export interface RealmCombatRecord {
  battles: number;
  victories: number;
  damageDealt: number;
  damageReceived: number;
  peakDamage: number;
}

export type HerbRole = 'main' | 'sub' | 'helper' | 'catalyst';

export interface HerbItem {
  id: string;
  name: string;
  element: ElementType;
  rarity: '凡草' | '靈芝' | '地寶' | '天珍';
  desc: string;
  price: number;
}

export interface AlchemyRecipe {
  name: string;
  main: string;
  sub: string;
  helper: string;
  catalyst: string;
  desc: string;
  effectType: 'breakthrough' | 'maxHp' | 'longevity' | 'healFull' | 'qiBoost';
  effectValue: number;
  poison: number;
}

export interface PillInventory {
  name: string;
  count: number;
  desc: string;
}

export interface EnemyActor {
  name: string;
  realm: string;
  hp: number;
  maxHp: number;
  shield: number;
  atk: number;
  intent: {
    type: 'attack' | 'shield' | 'heal' | 'special';
    value: number;
    desc: string;
  };
  rewardStones: number;
  rewardHerbs?: string[];
  rewardSpell?: string;
}

export type SectType = '散修' | '正道・雲山派' | '魔門・幽冥教';

export interface SpellMasteryInfo {
  tier: number; // 0, 1, 2, 3
  tierName: string; // 初窺門徑, 略有小成, 融會大成, 出神入化·真訣
  currentExp: number;
  nextExp: number | null;
  progressPercent: number;
}

export interface RetreatRecord {
  session: number;
  year: number;
  month: number;
  expGained: number;
  arrayBonusPercent: number;
  finalExp: number;
  arrayLevel: number;
}

export interface PlayerState {
  name: string;
  realmIdx: number;
  age: number;
  maxAge: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  shield: number;
  danPoison: number; // 丹毒
  spiritStones: number;
  sect: SectType;
  sectContribution: number;
  qi: Record<ElementType, number>;
  deck: string[]; // spell IDs
  herbs: Record<string, number>;
  pills: Record<string, number>;
  spellProficiency: Record<string, number>; // spellId -> use count
  realmCombatStats?: Partial<Record<string, RealmCombatRecord>>;
  gatheringArrayLevel?: number;
  retreatHistory?: RetreatRecord[];
}

export interface WorldState {
  year: number;
  month: number;
}

export interface LogMessage {
  id: string;
  year: number;
  month: number;
  text: string;
  type: 'gain' | 'danger' | 'gold' | 'normal' | 'breakthrough';
}
