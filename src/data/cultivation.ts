import { RealmConfig, SpellCard, HerbItem, AlchemyRecipe, EnemyActor, SpellMasteryInfo, SpellCombo } from '../types/game';

export const SPELL_COMBOS: SpellCombo[] = [
  {
    name: '火煉金精',
    prevSpell: '金刃術',
    nextSpell: '離火訣',
    multiplier: 1.5,
    desc: '庚金遇真火，破體穿心！造成 1.5 倍熾烈傷害！',
  },
  {
    name: '水木長青',
    prevSpell: '九宮水盾',
    nextSpell: '乙木春風',
    multiplier: 1.5,
    desc: '真水滋養青木，生生不息！氣血恢復提升 1.5 倍並額外生出木靈氣！',
    bonusShield: 12,
    bonusQi: 'wood',
  },
  {
    name: '寒泉凝冰',
    prevSpell: '九宮水盾',
    nextSpell: '寒冰靈錐',
    multiplier: 1.5,
    desc: '周天柔水驟化玄陰寒冰！造成 1.5 倍傷害並額外凝結 15 點冰甲！',
    bonusShield: 15,
  },
  {
    name: '木助火勢',
    prevSpell: '乙木春風',
    nextSpell: '離火訣',
    multiplier: 1.5,
    desc: '乙木生火，真焰大盛！造成 1.5 倍傷害並額外聚攏 1 點火靈氣！',
    bonusQi: 'fire',
  },
  {
    name: '天火燎原',
    prevSpell: '乙木春風',
    nextSpell: '焚天烈焰',
    multiplier: 1.5,
    desc: '無邊木靈引發滔天三昧火劫！造成 1.5 倍焚天巨傷！',
  },
  {
    name: '乾坤合璧',
    prevSpell: '引氣歸元',
    nextSpell: '乾坤一擲',
    multiplier: 1.5,
    desc: '厚土靈息貫注隨身法寶！造成 1.5 倍撼山重創！',
  },
  {
    name: '水天一劍',
    prevSpell: '九宮水盾',
    nextSpell: '太乙劍罡',
    multiplier: 1.5,
    desc: '水天一色，正道劍芒激射！造成 1.5 倍真元傷害！',
  },
  {
    name: '引雷破陣',
    prevSpell: '金刃術',
    nextSpell: '紫霄神雷訣',
    multiplier: 1.5,
    desc: '庚金劍氣化作引雷玄針，引動紫霄神雷！造成 1.5 倍滅世雷殛！',
  },
  {
    name: '幽冥血毒',
    prevSpell: '九幽化血',
    nextSpell: '萬毒蝕魂',
    multiplier: 1.5,
    desc: '魔門血煞與萬毒合流！造成 1.5 倍穿透傷害且汲取大量生機！',
    bonusLifesteal: 14,
  },
  {
    name: '冰魄金鋒',
    prevSpell: '寒冰靈錐',
    nextSpell: '金刃術',
    multiplier: 1.5,
    desc: '玄冰凍體，金刃一擊即碎！造成 1.5 倍裂體傷害！',
  },
  {
    name: '天人合一',
    prevSpell: '引氣歸元',
    nextSpell: '天地同壽',
    multiplier: 1.5,
    desc: '萬物歸元，身合天道！氣血恢復與護盾效果提升 1.5 倍！',
  }
];

export const findCombo = (prevSpellId: string | null | undefined, nextSpellId: string): SpellCombo | null => {
  if (!prevSpellId) return null;
  return SPELL_COMBOS.find(c => c.prevSpell === prevSpellId && c.nextSpell === nextSpellId) || null;
};

export const getSpellMastery = (exp: number = 0): SpellMasteryInfo => {
  if (exp < 5) {
    return {
      tier: 0,
      tierName: '初窺門徑',
      currentExp: exp,
      nextExp: 5,
      progressPercent: Math.min(100, Math.floor((exp / 5) * 100)),
    };
  } else if (exp < 15) {
    return {
      tier: 1,
      tierName: '略有小成',
      currentExp: exp,
      nextExp: 15,
      progressPercent: Math.min(100, Math.floor(((exp - 5) / 10) * 100)),
    };
  } else if (exp < 30) {
    return {
      tier: 2,
      tierName: '融會貫通',
      currentExp: exp,
      nextExp: 30,
      progressPercent: Math.min(100, Math.floor(((exp - 15) / 15) * 100)),
    };
  } else {
    return {
      tier: 3,
      tierName: '出神入化 · 真訣',
      currentExp: exp,
      nextExp: null,
      progressPercent: 100,
    };
  }
};

export const getUpgradedSpell = (baseSpell: SpellCard, exp: number = 0): SpellCard & { mastery: SpellMasteryInfo } => {
  const mastery = getSpellMastery(exp);
  const upgraded: SpellCard = { ...baseSpell };

  // Calculate upgraded stats
  if (mastery.tier === 1) {
    if (upgraded.damage) upgraded.damage = Math.round(upgraded.damage * 1.25);
    if (upgraded.shield) upgraded.shield = Math.round(upgraded.shield * 1.25);
    if (upgraded.heal) upgraded.heal = Math.round(upgraded.heal * 1.25);
    if (upgraded.lifesteal) upgraded.lifesteal = Math.round(upgraded.lifesteal * 1.25);
  } else if (mastery.tier === 2) {
    if (upgraded.damage) upgraded.damage = Math.round(upgraded.damage * 1.55);
    if (upgraded.shield) upgraded.shield = Math.round(upgraded.shield * 1.55);
    if (upgraded.heal) upgraded.heal = Math.round(upgraded.heal * 1.55);
    if (upgraded.lifesteal) upgraded.lifesteal = Math.round(upgraded.lifesteal * 1.55);
    
    // Reduce cost by 1 for spells with total cost >= 3
    const totalCost = Object.values(upgraded.cost).reduce((a, b) => a + (b || 0), 0);
    if (totalCost >= 3) {
      const primaryCost = upgraded.cost[upgraded.element] || 0;
      if (primaryCost > 1) {
        upgraded.cost = { ...upgraded.cost, [upgraded.element]: primaryCost - 1 };
      }
    }
  } else if (mastery.tier === 3) {
    if (upgraded.damage) upgraded.damage = Math.round(upgraded.damage * 1.85);
    if (upgraded.shield) upgraded.shield = Math.round(upgraded.shield * 1.85);
    if (upgraded.heal) upgraded.heal = Math.round(upgraded.heal * 1.85);
    if (upgraded.lifesteal) upgraded.lifesteal = Math.round(upgraded.lifesteal * 1.85);
    if (upgraded.gainQi) upgraded.gainQi = upgraded.gainQi + 1;
    if (upgraded.drawCards) upgraded.drawCards = upgraded.drawCards + 1;

    // Guaranteed reduction of 1 cost (minimum total cost = 1)
    const totalCost = Object.values(upgraded.cost).reduce((a, b) => a + (b || 0), 0);
    if (totalCost > 1) {
      const primaryCost = upgraded.cost[upgraded.element] || 0;
      if (primaryCost > 1) {
        upgraded.cost = { ...upgraded.cost, [upgraded.element]: primaryCost - 1 };
      }
    }
  }

  // Dynamic description
  if (mastery.tier > 0) {
    const tierTag = mastery.tier === 1 ? '【小成】' : mastery.tier === 2 ? '【大成】' : '【真訣】';
    upgraded.name = `${baseSpell.name} ${tierTag}`;
  }

  return { ...upgraded, mastery };
};

export const REALM_LIST: RealmConfig[] = [
  {
    name: '練氣前期',
    title: '初窺門徑・凡身引氣',
    maxHp: 90,
    maxExp: 100,
    maxAge: 100,
    tribulationDmg: 45,
    bonusQiPerTurn: 4,
  },
  {
    name: '練氣後期',
    title: '吐納如風・百脈具通',
    maxHp: 160,
    maxExp: 260,
    maxAge: 120,
    tribulationDmg: 85,
    unlockedSpell: '乾坤一擲',
    bonusQiPerTurn: 5,
  },
  {
    name: '築基前期',
    title: '道基鑄就・神識初凝',
    maxHp: 320,
    maxExp: 600,
    maxAge: 250,
    tribulationDmg: 160,
    unlockedSpell: '太乙劍罡',
    bonusQiPerTurn: 5,
  },
  {
    name: '築基後期',
    title: '液態真元・踏劍乘風',
    maxHp: 520,
    maxExp: 1200,
    maxAge: 320,
    tribulationDmg: 280,
    unlockedSpell: '寒冰靈錐',
    bonusQiPerTurn: 6,
  },
  {
    name: '金丹初期',
    title: '金丹一粒・我命由我',
    maxHp: 950,
    maxExp: 2800,
    maxAge: 600,
    tribulationDmg: 500,
    unlockedSpell: '紫霄神雷訣',
    bonusQiPerTurn: 6,
  },
  {
    name: '金丹巔峰',
    title: '紫府蘊靈・九轉丹成',
    maxHp: 1600,
    maxExp: 5500,
    maxAge: 800,
    tribulationDmg: 880,
    unlockedSpell: '焚天烈焰',
    bonusQiPerTurn: 7,
  },
  {
    name: '元嬰始成',
    title: '破丹成嬰・神遊千里',
    maxHp: 3000,
    maxExp: 12000,
    maxAge: 1500,
    tribulationDmg: 1600,
    unlockedSpell: '天地同壽',
    bonusQiPerTurn: 8,
  },
  {
    name: '化神真仙',
    title: '羽化登仙・超脫凡塵',
    maxHp: 6666,
    maxExp: 99999,
    maxAge: 9999,
    tribulationDmg: 3333,
    bonusQiPerTurn: 9,
  }
];

export const ALL_SPELLS: Record<string, SpellCard> = {
  '金刃術': {
    id: '金刃術',
    name: '金刃術',
    element: 'metal',
    cost: { metal: 2 },
    desc: '祭出銳利金靈劍氣，造成 18 點破體傷害。',
    damage: 18,
    rarity: '凡品'
  },
  '九宮水盾': {
    id: '九宮水盾',
    name: '九宮水盾',
    element: 'water',
    cost: { water: 2 },
    desc: '引動周天柔水護體，凝聚 16 點靈力護罩。',
    shield: 16,
    rarity: '凡品'
  },
  '乙木春風': {
    id: '乙木春風',
    name: '乙木春風',
    element: 'wood',
    cost: { wood: 2 },
    desc: '乙木生發之氣滋養經脈，恢復 15 點氣血。',
    heal: 15,
    rarity: '凡品'
  },
  '離火訣': {
    id: '離火訣',
    name: '離火訣',
    element: 'fire',
    cost: { fire: 2 },
    desc: '凝聚烈焰熱毒，無視護盾直接造成 14 點真傷穿透。',
    damage: 14,
    pierceShield: true,
    rarity: '凡品'
  },
  '引氣歸元': {
    id: '引氣歸元',
    name: '引氣歸元',
    element: 'earth',
    cost: { earth: 1 },
    desc: '厚德載物吐納調息，隨機汲取 2 點天地靈氣並摸 1 張牌。',
    gainQi: 2,
    drawCards: 1,
    rarity: '凡品'
  },
  '乾坤一擲': {
    id: '乾坤一擲',
    name: '乾坤一擲',
    element: 'metal',
    cost: { metal: 3 },
    desc: '催動隨身法寶破空重砸，造成 38 點毀滅巨傷！',
    damage: 38,
    rarity: '靈品'
  },
  '九幽化血': {
    id: '九幽化血',
    name: '九幽化血',
    element: 'fire',
    cost: { fire: 2, wood: 1 },
    desc: '魔門嗜血殺道，造成 24 點傷害並將其 15 點轉化為自身氣血。',
    damage: 24,
    lifesteal: 15,
    rarity: '靈品'
  },
  '太乙劍罡': {
    id: '太乙劍罡',
    name: '太乙劍罡',
    element: 'metal',
    cost: { metal: 2, water: 1 },
    desc: '名門浩然真氣，造成 28 點傷害，並獲得 14 點反震護罩。',
    damage: 28,
    shield: 14,
    rarity: '玄品'
  },
  '寒冰靈錐': {
    id: '寒冰靈錐',
    name: '寒冰靈錐',
    element: 'water',
    cost: { water: 3 },
    desc: '極寒冰髓凝聚成錐，造成 25 點傷害並獲得 20 點冰甲。',
    damage: 25,
    shield: 20,
    rarity: '玄品'
  },
  '紫霄神雷訣': {
    id: '紫霄神雷訣',
    name: '紫霄神雷訣',
    element: 'metal',
    cost: { metal: 3, fire: 2 },
    desc: '引九天紫霄真雷轟擊，造成 65 點雷殛暴擊！',
    damage: 65,
    rarity: '地品'
  },
  '萬毒蝕魂': {
    id: '萬毒蝕魂',
    name: '萬毒蝕魂',
    element: 'wood',
    cost: { wood: 3, earth: 1 },
    desc: '萬毒窟古老腐蝕煞氣，穿透護盾造成 42 點真傷並汲取 18 點氣血。',
    damage: 42,
    pierceShield: true,
    lifesteal: 18,
    rarity: '地品'
  },
  '焚天烈焰': {
    id: '焚天烈焰',
    name: '焚天烈焰',
    element: 'fire',
    cost: { fire: 4 },
    desc: '焚盡萬物之三昧真火，造成 75 點滔天火劫！',
    damage: 75,
    rarity: '地品'
  },
  '天地同壽': {
    id: '天地同壽',
    name: '天地同壽',
    element: 'earth',
    cost: { earth: 3, wood: 2 },
    desc: '身化天地萬物，恢復 120 點氣血並獲得 80 點大地護罩！',
    heal: 120,
    shield: 80,
    rarity: '天品'
  }
};

export const HERBS_DATA: Record<string, HerbItem> = {
  '金陽花': {
    id: '金陽花',
    name: '金陽花',
    element: 'fire',
    rarity: '靈芝',
    desc: '蘊含純陽金煞之氣，常用於築基與破境丹之君藥。',
    price: 35,
  },
  '寧心草': {
    id: '寧心草',
    name: '寧心草',
    element: 'wood',
    rarity: '凡草',
    desc: '清心凝神，平息丹火躁動，藥性溫潤之臣藥。',
    price: 20,
  },
  '生生藤': {
    id: '生生藤',
    name: '生生藤',
    element: 'wood',
    rarity: '凡草',
    desc: '生生不息之靈藤，能中和萬物毒素，化解丹毒。',
    price: 25,
  },
  '晨露花': {
    id: '晨露花',
    name: '晨露花',
    element: 'water',
    rarity: '凡草',
    desc: '採集自清晨純淨朝露，引導藥力通達周身氣穴經絡。',
    price: 20,
  },
  '龍血竭': {
    id: '龍血竭',
    name: '龍血竭',
    element: 'fire',
    rarity: '地寶',
    desc: '相傳為上古真龍隕落氣血所化，大補氣血生機。',
    price: 80,
  },
  '冰晶草': {
    id: '冰晶草',
    name: '冰晶草',
    element: 'water',
    rarity: '靈芝',
    desc: '生長於極北冰原，至陰至純，滋潤神識靈根。',
    price: 45,
  },
  '紫猴花': {
    id: '紫猴花',
    name: '紫猴花',
    element: 'earth',
    rarity: '靈芝',
    desc: '形如靈猴作揖，土性深厚，能固本培元。',
    price: 50,
  },
  '伴妖草': {
    id: '伴妖草',
    name: '伴妖草',
    element: 'wood',
    rarity: '地寶',
    desc: '千年大妖巢穴伴生奇草，奪天地長春之壽。',
    price: 90,
  },
  '天元果': {
    id: '天元果',
    name: '天元果',
    element: 'metal',
    rarity: '天珍',
    desc: '三百年一開花三百年一結果，洗滌靈根，妙用無窮。',
    price: 150,
  }
};

export const ALCHEMY_RECIPES: AlchemyRecipe[] = [
  {
    name: '築基丹',
    main: '金陽花',
    sub: '寧心草',
    helper: '生生藤',
    catalyst: '晨露花',
    desc: '凡人逆仙必備神丹。服用後道基堅若磐石，抵消渡劫 55% 紫霄神雷之威！',
    effectType: 'breakthrough',
    effectValue: 0.55,
    poison: 5,
  },
  {
    name: '九轉培元丹',
    main: '紫猴花',
    sub: '寧心草',
    helper: '生生藤',
    catalyst: '晨露花',
    desc: '固本培元，永久提升 50 點氣血上限，並增長 180 點修為！',
    effectType: 'maxHp',
    effectValue: 50,
    poison: 8,
  },
  {
    name: '延壽長青丹',
    main: '伴妖草',
    sub: '龍血竭',
    helper: '生生藤',
    catalyst: '晨露花',
    desc: '逆天奪壽之神丹，服用後立增 30 年壽元！',
    effectType: 'longevity',
    effectValue: 30,
    poison: 10,
  },
  {
    name: '太乙融血丹',
    main: '龍血竭',
    sub: '冰晶草',
    helper: '生生藤',
    catalyst: '晨露花',
    desc: '氣血完全回滿，且清除體內積累的所有丹毒！',
    effectType: 'healFull',
    effectValue: 9999,
    poison: 0,
  },
  {
    name: '天元洗髓丹',
    main: '天元果',
    sub: '金陽花',
    helper: '冰晶草',
    catalyst: '晨露花',
    desc: '洗經伐髓超凡入聖，永久增加 300 點修為與 20 點氣血上限！',
    effectType: 'qiBoost',
    effectValue: 20,
    poison: 5,
  }
];

export const INITIAL_PLAYER_STATE = {
  name: '韓天尊',
  realmIdx: 0,
  age: 16,
  maxAge: 100,
  exp: 0,
  maxExp: 100,
  hp: 90,
  maxHp: 90,
  shield: 0,
  danPoison: 0,
  spiritStones: 88,
  sect: '散修' as const,
  sectContribution: 0,
  qi: { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 },
  deck: ['金刃術', '金刃術', '九宮水盾', '乙木春風', '離火訣', '引氣歸元'],
  herbs: {
    '金陽花': 3,
    '寧心草': 4,
    '生生藤': 3,
    '晨露花': 3,
    '龍血竭': 1,
    '紫猴花': 1,
  },
  pills: {},
  spellProficiency: {
    '金刃術': 2,
    '九宮水盾': 1,
    '乙木春風': 1,
  }
};
