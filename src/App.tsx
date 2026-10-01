import React, { useState, useEffect } from 'react';
import { PlayerState, WorldState, LogMessage, SpellCard, EnemyActor, HerbRole, ElementType, CombatTurnMetric } from './types/game';
import { REALM_LIST, ALL_SPELLS, HERBS_DATA, ALCHEMY_RECIPES, INITIAL_PLAYER_STATE, findCombo } from './data/cultivation';
import { getArrayTier, SPIRIT_ARRAY_CONFIGS } from './data/spiritArray';
import { sound } from './utils/audio';
import { TopStatusBar } from './components/TopStatusBar';
import { CultivationTab } from './components/CultivationTab';
import { CombatView } from './components/CombatView';
import { AlchemyTab } from './components/AlchemyTab';
import { WorldTab } from './components/WorldTab';
import { SectTab } from './components/SectTab';
import { SpellsTab } from './components/SpellsTab';
import { TribulationModal } from './components/TribulationModal';
import { LogPanel } from './components/LogPanel';
import { Sparkles, Mountain, Compass, Flame, Scroll, Users, Menu, X } from 'lucide-react';

const STORAGE_KEY = 'mi_zhang_sheng_save_v2';

export default function App() {
  // Load saved state or default
  const [player, setPlayer] = useState<PlayerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.spellProficiency) {
          parsed.spellProficiency = { '金刃術': 2, '九宮水盾': 1, '乙木春風': 1 };
        }
        return parsed;
      }
    } catch {}
    return INITIAL_PLAYER_STATE;
  });

  const [world, setWorld] = useState<WorldState>({ year: 1, month: 1 });
  const [activeTab, setActiveTab] = useState<'cultivate' | 'world' | 'alchemy' | 'spells' | 'sect'>('cultivate');
  const [tribulationModalOpen, setTribulationModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientEnabled, setAmbientEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Combat state
  const [combat, setCombat] = useState<{
    inCombat: boolean;
    enemy: EnemyActor | null;
    turn: number;
    lastSpellId: string | null;
    comboCount: number;
    lastComboName: string | null;
    comboTriggerAnim: number;
    log: string[];
    turnMetrics: CombatTurnMetric[];
    currentTurnDealt: number;
    currentTurnQiSpent: number;
    currentTurnSpellsCount: number;
    currentTurnCombosCount: number;
  }>({
    inCombat: false,
    enemy: null,
    turn: 1,
    lastSpellId: null,
    comboCount: 0,
    lastComboName: null,
    comboTriggerAnim: 0,
    log: [],
    turnMetrics: [],
    currentTurnDealt: 0,
    currentTurnQiSpent: 0,
    currentTurnSpellsCount: 0,
    currentTurnCombosCount: 0,
  });

  // Chronicle logs
  const [logs, setLogs] = useState<LogMessage[]>([
    {
      id: 'init-1',
      year: 1,
      month: 1,
      text: '已步入仙道途程。壽元有盡，天道無情，願道友早證元嬰，得覓長生！',
      type: 'gold',
    }
  ]);

  // Save game progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch {}
  }, [player]);

  const addLog = (text: string, type: LogMessage['type'] = 'normal') => {
    const newLog: LogMessage = {
      id: `${Date.now()}-${Math.random()}`,
      year: world.year,
      month: world.month,
      text,
      type,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 80)]);
  };

  // Advance game time
  const advanceTime = (months: number) => {
    setWorld(prev => {
      let m = prev.month + months;
      let y = prev.year;
      let ageGained = 0;
      while (m > 12) {
        m -= 12;
        y += 1;
        ageGained += 1;
      }

      if (ageGained > 0) {
        setPlayer(p => {
          const newAge = p.age + ageGained;
          if (newAge >= p.maxAge) {
            alert('天道無情，壽元耗盡！修士大限已至，身死道消，重歸六道輪迴！');
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
          }
          return { ...p, age: newAge };
        });
        addLog(`白駒過隙，寒暑輪轉，增壽 ${ageGained} 載。韶華易逝，當勉力向道！`, 'gold');
      }

      return { year: y, month: m };
    });
  };

  // Meditate
  const handleMeditate = (months: number) => {
    advanceTime(months);
    const arrayLvl = player.gatheringArrayLevel || 0;
    const arrayTier = getArrayTier(arrayLvl);
    const bonusPct = arrayTier.bonusPercent;
    let baseExpGain = months === 1 ? 6 : months === 12 ? 80 : 850;
    let finalExpGain = Math.floor(baseExpGain * (1 + bonusPct / 100));

    setPlayer(prev => {
      const curHistory = prev.retreatHistory || [];
      const newRecord = {
        session: (curHistory[curHistory.length - 1]?.session || 0) + 1,
        year: world.year,
        month: world.month,
        expGained: baseExpGain,
        arrayBonusPercent: bonusPct,
        finalExp: finalExpGain,
        arrayLevel: arrayLvl,
      };
      const nextHistory = [...curHistory, newRecord].slice(-14);

      return {
        ...prev,
        exp: prev.exp + finalExpGain,
        hp: Math.min(prev.maxHp, prev.hp + Math.floor(prev.maxHp * 0.2)),
        retreatHistory: nextHistory,
      };
    });

    const bonusText = bonusPct > 0 ? ` (聚靈陣加成 +${bonusPct}%，額外獲得 ${finalExpGain - baseExpGain} 點)` : '';
    addLog(`在靈脈洞府中靜心閉關 ${months} 月，修為增長 ${finalExpGain} 點${bonusText}。`, 'gain');
  };

  // Upgrade Spirit Gathering Array
  const handleUpgradeArray = () => {
    const curLevel = player.gatheringArrayLevel || 0;
    const nextTier = SPIRIT_ARRAY_CONFIGS[curLevel + 1];
    if (!nextTier) return;
    if (player.spiritStones < nextTier.upgradeCost) {
      alert(`靈石不足！升級至【${nextTier.name}】需 ${nextTier.upgradeCost} 顆靈石。`);
      return;
    }
    sound.playGong();
    setPlayer(prev => ({
      ...prev,
      spiritStones: prev.spiritStones - nextTier.upgradeCost,
      gatheringArrayLevel: curLevel + 1,
    }));
    addLog(
      `消耗 ${nextTier.upgradeCost} 靈石灌注靈脈！洞府【靈脈聚靈陣】成功晉升為【${nextTier.name}】，閉關修為獲取效率提升至 +${nextTier.bonusPercent}%！`,
      'gold'
    );
  };

  // Detox dan poison
  const handleDetox = () => {
    advanceTime(3);
    setPlayer(prev => ({
      ...prev,
      danPoison: Math.max(0, prev.danPoison - 25),
      hp: prev.maxHp,
    }));
    addLog('運轉大周天玄功三個月，將體內沉積之丹毒經脈逼出體外，身輕如燕。', 'gain');
  };

  // Breakthrough / Tribulation
  const handleSurviveTribulation = (usedPill: boolean) => {
    setTribulationModalOpen(false);
    const nextIdx = player.realmIdx + 1;
    const nextRealm = REALM_LIST[nextIdx];
    if (!nextRealm) return;

    const rawDmg = nextRealm.tribulationDmg;
    const actualDmg = usedPill ? Math.floor(rawDmg * 0.45) : rawDmg;

    setPlayer(prev => {
      const updatedPills = { ...prev.pills };
      if (usedPill && updatedPills['築基丹'] > 0) {
        updatedPills['築基丹'] -= 1;
      }

      const updatedDeck = [...prev.deck];
      if (nextRealm.unlockedSpell && !updatedDeck.includes(nextRealm.unlockedSpell)) {
        updatedDeck.push(nextRealm.unlockedSpell);
      }

      return {
        ...prev,
        realmIdx: nextIdx,
        maxHp: nextRealm.maxHp,
        hp: nextRealm.maxHp,
        maxExp: nextRealm.maxExp,
        exp: 0,
        maxAge: nextRealm.maxAge,
        pills: updatedPills,
        deck: updatedDeck,
      };
    });

    addLog(
      `【紫霄雷劫度過】天花亂墜，地湧金蓮！成功頂過九重天劫，晉升為【${nextRealm.name}】！壽元大漲至 ${nextRealm.maxAge} 載！`,
      'breakthrough'
    );
  };

  const handleFailTribulation = () => {
    setTribulationModalOpen(false);
    sound.playThunder();
    alert('在紫霄神雷之下肉身湮滅，元神潰散，未能熬過雷劫，身死道消！');
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  // Combat Start
  const startCombat = (enemy: EnemyActor) => {
    const currentRealm = REALM_LIST[player.realmIdx] || REALM_LIST[0];
    const initialQi = { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 };
    // Allocate starting Qi based on realm bonus
    const elements: ElementType[] = ['metal', 'wood', 'water', 'fire', 'earth'];
    for (let i = 0; i < currentRealm.bonusQiPerTurn; i++) {
      const el = elements[Math.floor(Math.random() * elements.length)];
      initialQi[el] = (initialQi[el] || 0) + 1;
    }

    setPlayer(prev => ({
      ...prev,
      shield: prev.sect === '正道・雲山派' ? 8 : 0,
      qi: initialQi,
    }));

    setCombat({
      inCombat: true,
      enemy: { ...enemy },
      turn: 1,
      lastSpellId: null,
      comboCount: 0,
      lastComboName: null,
      comboTriggerAnim: 0,
      log: [`戰端開啟！遭遇強敵【${enemy.name}】（${enemy.realm}）！`],
      turnMetrics: [],
      currentTurnDealt: 0,
      currentTurnQiSpent: 0,
      currentTurnSpellsCount: 0,
      currentTurnCombosCount: 0,
    });

    addLog(`與敵手【${enemy.name}】展開生死鬥法！`, 'danger');
  };

  // Cast spell in combat
  const handleCastSpell = (card: SpellCard, cardIndex: number) => {
    if (!combat.enemy) return;

    // Track proficiency for base spell and check combo
    const baseSpellId = card.id;
    const combo = findCombo(combat.lastSpellId, baseSpellId);
    let nextComboCount = combat.comboCount || 0;
    let nextComboName = combat.lastComboName;
    let nextComboAnim = combat.comboTriggerAnim || 0;

    if (combo) {
      nextComboCount = nextComboCount + 1;
      nextComboName = combo.name;
      nextComboAnim = Date.now();
    } else {
      nextComboCount = 0;
      nextComboName = null;
    }

    setPlayer(prev => {
      const currentProf = prev.spellProficiency || {};
      const oldVal = currentProf[baseSpellId] || 0;
      const newVal = oldVal + 1;
      const nextProf = { ...currentProf, [baseSpellId]: newVal };

      // Check mastery breakthrough milestones
      if (oldVal < 5 && newVal >= 5) {
        sound.playAlchemy();
        addLog(`【神通昇華】你的法術【${baseSpellId}】歷經生死實戰，晉升至【略有小成】，威力提升25%！`, 'gold');
      } else if (oldVal < 15 && newVal >= 15) {
        sound.playGong();
        addLog(`【神通大成】百鍊化境！【${baseSpellId}】達到【融會大成】，威力激增55%並降低靈氣消耗！`, 'gold');
      } else if (oldVal < 30 && newVal >= 30) {
        sound.playThunder();
        addLog(`【出神入化·真訣】超凡入聖！【${baseSpellId}】晉升【出神入化·真訣】，威力暴增85%，法力消耗顯著減免！`, 'breakthrough');
      }

      const newQi = { ...prev.qi };
      for (const [el, amt] of Object.entries(card.cost)) {
        const element = el as ElementType;
        newQi[element] = Math.max(0, (newQi[element] || 0) - (amt || 0));
      }

      let newHp = prev.hp;
      let newShield = prev.shield;

      if (card.shield) newShield += card.shield;
      if (card.heal) newHp = Math.min(prev.maxHp, newHp + card.heal);
      if (card.lifesteal) newHp = Math.min(prev.maxHp, newHp + card.lifesteal);

      // Combo extra rewards (Shield, Qi, Lifesteal)
      if (combo?.bonusShield) newShield += combo.bonusShield;
      if (combo?.bonusLifesteal) newHp = Math.min(prev.maxHp, newHp + combo.bonusLifesteal);
      if (combo?.bonusQi) {
        newQi[combo.bonusQi] = (newQi[combo.bonusQi] || 0) + 1;
      }

      // Gain random Qi if card effect
      if (card.gainQi) {
        const elements: ElementType[] = ['metal', 'wood', 'water', 'fire', 'earth'];
        for (let i = 0; i < card.gainQi; i++) {
          const el = elements[Math.floor(Math.random() * elements.length)];
          newQi[el] = (newQi[el] || 0) + 1;
        }
      }

      return {
        ...prev,
        spellProficiency: nextProf,
        qi: newQi,
        hp: newHp,
        shield: newShield,
      };
    });

    // Apply damage to enemy with combo calculation
    setCombat(prev => {
      if (!prev.enemy) return prev;
      let targetHp = prev.enemy.hp;
      let targetShield = prev.enemy.shield;

      let dmg = card.damage || 0;
      if (combo) {
        dmg = Math.floor(dmg * combo.multiplier);
        sound.playFire();
        addLog(`【連擊引爆 · ${combo.name}】（第${nextComboCount}式）起手式【${prev.lastSpellId}】引動五行玄變！對敵造成 1.5 倍暴烈打擊（${dmg}點傷害）！`, 'gold');
      }

      if (dmg > 0) {
        // Sect bonus: Demonic low hp burst
        if (player.sect === '魔門・幽冥教' && player.hp < player.maxHp * 0.5) {
          dmg = Math.floor(dmg * 1.25);
        }

        if (card.pierceShield) {
          targetHp = Math.max(0, targetHp - dmg);
        } else {
          if (targetShield >= dmg) {
            targetShield -= dmg;
          } else {
            const remain = dmg - targetShield;
            targetShield = 0;
            targetHp = Math.max(0, targetHp - remain);
          }
        }

        // Update player's historical realm combat stats
        setPlayer(p => {
          const currentRealmName = REALM_LIST[p.realmIdx]?.name || '練氣前期';
          const prevStats = p.realmCombatStats?.[currentRealmName] || {
            battles: 1,
            victories: 0,
            damageDealt: 0,
            damageReceived: 0,
            peakDamage: 0,
          };
          return {
            ...p,
            realmCombatStats: {
              ...(p.realmCombatStats || {}),
              [currentRealmName]: {
                ...prevStats,
                damageDealt: prevStats.damageDealt + dmg,
                peakDamage: Math.max(prevStats.peakDamage, dmg),
              },
            },
          };
        });
      }

      const actionText = combo
        ? `🔥【連擊第${nextComboCount}式 · ${combo.name}】造成 1.5 倍巨傷 (${dmg}點傷害)！`
        : `施展【${card.name}】，對敵造成 ${dmg} 點破壞！`;
      const updatedLog = [...prev.log, actionText];

      const spellQiCost = Object.values(card.cost).reduce((a, b) => a + (b || 0), 0);

      return {
        ...prev,
        lastSpellId: baseSpellId,
        comboCount: nextComboCount,
        lastComboName: nextComboName,
        comboTriggerAnim: nextComboAnim,
        currentTurnDealt: prev.currentTurnDealt + dmg,
        currentTurnQiSpent: prev.currentTurnQiSpent + spellQiCost,
        currentTurnSpellsCount: prev.currentTurnSpellsCount + 1,
        currentTurnCombosCount: prev.currentTurnCombosCount + (combo ? 1 : 0),
        enemy: {
          ...prev.enemy,
          hp: targetHp,
          shield: targetShield,
        },
        log: updatedLog,
      };
    });

    // Check if enemy defeated
    setTimeout(() => {
      setCombat(c => {
        if (c.enemy && c.enemy.hp <= 0) {
          sound.playGong();
          const stonesReward = c.enemy.rewardStones;
          const herbReward = c.enemy.rewardHerbs || ['金陽花'];
          const spellReward = c.enemy.rewardSpell;

          setPlayer(p => {
            const nextHerbs = { ...p.herbs };
            herbReward.forEach(h => {
              nextHerbs[h] = (nextHerbs[h] || 0) + 1;
            });

            const nextDeck = [...p.deck];
            if (spellReward && !nextDeck.includes(spellReward)) {
              nextDeck.push(spellReward);
            }

            return {
              ...p,
              spiritStones: p.spiritStones + stonesReward,
              herbs: nextHerbs,
              deck: nextDeck,
            };
          });

          addLog(`【斬殺大捷】成功誅滅敵修【${c.enemy.name}】，搜刮獲得 ${stonesReward} 靈石與靈草！`, 'gold');
          return {
            inCombat: false,
            enemy: null,
            turn: 1,
            lastSpellId: null,
            comboCount: 0,
            lastComboName: null,
            comboTriggerAnim: 0,
            log: [],
            turnMetrics: [],
            currentTurnDealt: 0,
            currentTurnQiSpent: 0,
            currentTurnSpellsCount: 0,
            currentTurnCombosCount: 0,
          };
        }
        return c;
      });
    }, 150);
  };

  // End Turn in combat
  const handleEndTurn = () => {
    if (!combat.enemy) return;

    // Enemy acts
    const enemyAtk = combat.enemy.atk;
    sound.playHit();

    setPlayer(prev => {
      let playerHp = prev.hp;
      let playerShield = prev.shield;

      if (playerShield >= enemyAtk) {
        playerShield -= enemyAtk;
      } else {
        const rem = enemyAtk - playerShield;
        playerShield = 0;
        playerHp = Math.max(0, playerHp - rem);
      }

      if (playerHp <= 0) {
        alert('鬥法力竭不敵，遭對手搜魂奪寶，命喪黃泉！');
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }

      // Next turn: Gather new Qi according to realm
      const currentRealm = REALM_LIST[prev.realmIdx] || REALM_LIST[0];
      const newQi = { ...prev.qi };
      const elements: ElementType[] = ['metal', 'wood', 'water', 'fire', 'earth'];
      for (let i = 0; i < currentRealm.bonusQiPerTurn; i++) {
        const el = elements[Math.floor(Math.random() * elements.length)];
        newQi[el] = (newQi[el] || 0) + 1;
      }

      const currentRealmName = currentRealm.name;
      const prevStats = prev.realmCombatStats?.[currentRealmName] || {
        battles: 1,
        victories: 0,
        damageDealt: 0,
        damageReceived: 0,
        peakDamage: 0,
      };

      return {
        ...prev,
        hp: playerHp,
        shield: playerShield,
        qi: newQi,
        realmCombatStats: {
          ...(prev.realmCombatStats || {}),
          [currentRealmName]: {
            ...prevStats,
            damageReceived: prevStats.damageReceived + enemyAtk,
          },
        },
      };
    });

    setCombat(prev => {
      const finishedTurn: CombatTurnMetric = {
        turn: prev.turn,
        damageDealt: prev.currentTurnDealt,
        damageReceived: enemyAtk,
        qiSpent: prev.currentTurnQiSpent,
        spellsCastCount: prev.currentTurnSpellsCount,
        combosCount: prev.currentTurnCombosCount,
      };

      return {
        ...prev,
        turn: prev.turn + 1,
        turnMetrics: [...prev.turnMetrics, finishedTurn],
        currentTurnDealt: 0,
        currentTurnQiSpent: 0,
        currentTurnSpellsCount: 0,
        currentTurnCombosCount: 0,
        log: [...prev.log, `敵修發動攻勢，造成 ${enemyAtk} 點打擊！`],
      };
    });
  };

  // Escape combat
  const handleEscapeCombat = () => {
    sound.playFire();
    setPlayer(p => ({ ...p, age: p.age + 2 }));
    addLog('心知不敵，燃燒2年本命真元壽元施展血遁之術，狼狽逃離鬥法！', 'danger');
    setCombat({
      inCombat: false,
      enemy: null,
      turn: 1,
      lastSpellId: null,
      comboCount: 0,
      lastComboName: null,
      comboTriggerAnim: 0,
      log: [],
      turnMetrics: [],
      currentTurnDealt: 0,
      currentTurnQiSpent: 0,
      currentTurnSpellsCount: 0,
      currentTurnCombosCount: 0,
    });
  };

  // Hardcore Alchemy
  const handleCraftAlchemy = (slots: Record<HerbRole, string | null>) => {
    const { main, sub, helper, catalyst } = slots;
    if (!main || !sub || !helper || !catalyst) return;

    // Deduct herbs
    setPlayer(prev => {
      const nextHerbs = { ...prev.herbs };
      [main, sub, helper, catalyst].forEach(h => {
        if (nextHerbs[h] > 0) nextHerbs[h] -= 1;
      });
      return { ...prev, herbs: nextHerbs };
    });

    advanceTime(1);

    // Match recipe
    const matched = ALCHEMY_RECIPES.find(
      r => r.main === main && r.sub === sub && r.helper === helper && r.catalyst === catalyst
    );

    if (matched) {
      sound.playAlchemy();
      setPlayer(prev => ({
        ...prev,
        pills: {
          ...prev.pills,
          [matched.name]: (prev.pills[matched.name] || 0) + 1,
        },
        danPoison: prev.danPoison + matched.poison,
      }));
      addLog(`丹爐紫氣東來，靈光沖霄！成功煉成神丹【${matched.name}】！`, 'gold');
    } else {
      sound.playFire();
      addLog('五行相剋，火候失控！伴隨一聲巨響丹爐冒出焦黑青煙，只得一爐廢丹渣。', 'danger');
    }
  };

  // Consume pill
  const handleConsumePill = (pillName: string) => {
    const recipe = ALCHEMY_RECIPES.find(r => r.name === pillName);
    if (!recipe || (player.pills[pillName] || 0) <= 0) return;

    sound.playAlchemy();
    setPlayer(prev => {
      const nextPills = { ...prev.pills, [pillName]: prev.pills[pillName] - 1 };
      let hp = prev.hp;
      let maxHp = prev.maxHp;
      let exp = prev.exp;
      let maxAge = prev.maxAge;
      let poison = prev.danPoison;

      if (recipe.effectType === 'maxHp') {
        maxHp += recipe.effectValue;
        hp += recipe.effectValue;
        exp += 180;
      } else if (recipe.effectType === 'longevity') {
        maxAge += recipe.effectValue;
      } else if (recipe.effectType === 'healFull') {
        hp = maxHp;
        poison = 0;
      } else if (recipe.effectType === 'qiBoost') {
        maxHp += recipe.effectValue;
        exp += 300;
      }

      return {
        ...prev,
        hp,
        maxHp,
        exp,
        maxAge,
        danPoison: poison,
        pills: nextPills,
      };
    });

    addLog(`服用【${pillName}】，靈力如奔雷激盪丹田，經脈為之大振！`, 'gain');
  };

  // World Exploration: Forest
  const handleExploreForest = () => {
    advanceTime(1);
    const rnd = Math.random();
    if (rnd < 0.45) {
      // Gather herbs
      const herbsList = ['金陽花', '生生藤', '寧心草', '晨露花'];
      const chosen = herbsList[Math.floor(Math.random() * herbsList.length)];
      setPlayer(p => ({
        ...p,
        herbs: { ...p.herbs, [chosen]: (p.herbs[chosen] || 0) + 2 },
      }));
      addLog(`在天星密林幽谷中尋得靈氣充盈的【${chosen}】×2！`, 'gain');
    } else if (rnd < 0.8) {
      // Monster combat
      startCombat({
        name: '萬毒窟毒尾玄蛇',
        realm: '練氣巔峰',
        hp: 75,
        maxHp: 75,
        shield: 10,
        atk: 12,
        intent: { type: 'attack', value: 12, desc: '劇毒撲噬 (12點傷害)' },
        rewardStones: 45,
        rewardHerbs: ['生生藤', '龍血竭'],
      });
    } else {
      // Spirit Cave
      setPlayer(p => ({ ...p, exp: p.exp + 45, spiritStones: p.spiritStones + 20 }));
      addLog('偶入上古散修坐化遺府，吸納聚靈仙陣一氣，修為大漲，獲20靈石！', 'gain');
    }
  };

  // World Exploration: Ancient Ruins
  const handleExploreRuins = () => {
    advanceTime(2);
    const rnd = Math.random();
    if (rnd < 0.5) {
      startCombat({
        name: '古礦沉睡機關玄傀',
        realm: '築基中期',
        hp: 180,
        maxHp: 180,
        shield: 40,
        atk: 22,
        intent: { type: 'attack', value: 22, desc: '巨錘崩山 (22點重傷)' },
        rewardStones: 150,
        rewardHerbs: ['天元果', '紫猴花'],
        rewardSpell: '寒冰靈錐',
      });
    } else {
      setPlayer(p => ({
        ...p,
        spiritStones: p.spiritStones + 95,
        exp: p.exp + 100,
      }));
      addLog('成功勘破天墟古礦外圍靈禁，開掘出上品靈石脈，收穫 95 顆靈石！', 'gold');
    }
  };

  // Wanbao Bazaar
  const handleBuyHerb = (herbName: string) => {
    const herb = HERBS_DATA[herbName];
    if (!herb) return;
    if (player.spiritStones < herb.price) {
      alert('靈石不足！');
      return;
    }
    setPlayer(p => ({
      ...p,
      spiritStones: p.spiritStones - herb.price,
      herbs: { ...p.herbs, [herbName]: (p.herbs[herbName] || 0) + 1 },
    }));
    sound.playCard();
    addLog(`在坊市萬寶樓出資 ${herb.price} 顆靈石購入【${herbName}】。`, 'normal');
  };

  const handleSellHerb = (herbName: string) => {
    const herb = HERBS_DATA[herbName];
    if (!herb || (player.herbs[herbName] || 0) <= 0) return;
    const sellPrice = Math.floor(herb.price * 0.7);

    setPlayer(p => ({
      ...p,
      spiritStones: p.spiritStones + sellPrice,
      herbs: { ...p.herbs, [herbName]: p.herbs[herbName] - 1 },
    }));
    sound.playCard();
    addLog(`在坊市出售【${herbName}】，換取 ${sellPrice} 顆靈石。`, 'normal');
  };

  // Auction win
  const handleWinAuction = (spellId: string, cost: number) => {
    setPlayer(p => {
      const nextDeck = [...p.deck];
      if (!nextDeck.includes(spellId)) nextDeck.push(spellId);
      return {
        ...p,
        spiritStones: p.spiritStones - cost,
        deck: nextDeck,
      };
    });
    sound.playGong();
    addLog(`【拍賣落槌】一擲千金！成功競得鎮場神通【${spellId}】！`, 'gold');
  };

  // Join Sect
  const handleJoinSect = (sect: PlayerState['sect']) => {
    setPlayer(p => {
      const nextDeck = [...p.deck];
      if (sect === '正道・雲山派' && !nextDeck.includes('太乙劍罡')) {
        nextDeck.push('太乙劍罡');
      } else if (sect === '魔門・幽冥教' && !nextDeck.includes('九幽化血')) {
        nextDeck.push('九幽化血');
      }
      return {
        ...p,
        sect,
        sectContribution: 10,
        deck: nextDeck,
      };
    });
    sound.playGong();
    addLog(`正式拜入【${sect}】宗門，獲傳鎮派本命絕學！`, 'gain');
  };

  // Sect Quest
  const handleDoQuest = (costMonths: number, rewardStones: number, rewardExp: number, questName: string) => {
    advanceTime(costMonths);
    setPlayer(p => ({
      ...p,
      spiritStones: p.spiritStones + rewardStones,
      exp: p.exp + rewardExp,
      sectContribution: p.sectContribution + 25,
    }));
    sound.playGong();
    addLog(`完成了宗門懸賞【${questName}】，獲得 ${rewardStones} 靈石與貢獻！`, 'gain');
  };

  // Toggle spell in deck
  const handleToggleSpellInDeck = (spellId: string) => {
    setPlayer(p => {
      const idx = p.deck.indexOf(spellId);
      if (idx > -1 && p.deck.length > 4) {
        // Remove one instance
        const next = [...p.deck];
        next.splice(idx, 1);
        return { ...p, deck: next };
      } else {
        // Add
        return { ...p, deck: [...p.deck, spellId] };
      }
    });
  };

  // Practice & Deduce spell in seclusion
  const handlePracticeSpell = (spellId: string) => {
    if (player.spiritStones < 15) {
      alert('靈石不足！閉關推演需耗費 15 顆靈石佈置凝神陣法！');
      return;
    }

    advanceTime(1);
    sound.playGong();

    setPlayer(prev => {
      const currentProf = prev.spellProficiency || {};
      const oldVal = currentProf[spellId] || 0;
      const newVal = oldVal + 3;
      const nextProf = { ...currentProf, [spellId]: newVal };

      if (oldVal < 5 && newVal >= 5) {
        sound.playAlchemy();
        addLog(`【推演悟道】閉關參悟終破桎梏，【${spellId}】晉升至【略有小成】，威力提升25%！`, 'gold');
      } else if (oldVal < 15 && newVal >= 15) {
        sound.playGong();
        addLog(`【推演大成】玄功大成！【${spellId}】達到【融會大成】，威力激增55%並降低靈氣消耗！`, 'gold');
      } else if (oldVal < 30 && newVal >= 30) {
        sound.playThunder();
        addLog(`【真訣問世】推演造化！【${spellId}】晉入【出神入化·真訣】，威力暴增85%，法力消耗顯著減免！`, 'breakthrough');
      }

      return {
        ...prev,
        spiritStones: prev.spiritStones - 15,
        exp: prev.exp + 20,
        spellProficiency: nextProf,
      };
    });

    addLog(`在洞府之中耗費 15 靈石閉關推演【${spellId}】一月，熟練度 +3，修為 +20。`, 'gain');
  };

  // Reset Game
  const handleResetGame = () => {
    if (confirm('是否確認兵解轉世，重啟漫漫修仙之路？當前所有修為、靈草與靈石將歸零！')) {
      localStorage.removeItem(STORAGE_KEY);
      setPlayer(INITIAL_PLAYER_STATE);
      setWorld({ year: 1, month: 1 });
      setLogs([{
        id: 'reset-1',
        year: 1,
        month: 1,
        text: '重入輪迴，洗盡鉛華。願道友今生心向大道，早證長生！',
        type: 'gold',
      }]);
      sound.playGong();
    }
  };

  const tabs = [
    { id: 'cultivate', name: '洞府修行', icon: Mountain },
    { id: 'world', name: '九州遊歷', icon: Compass },
    { id: 'alchemy', name: '造化煉丹', icon: Flame },
    { id: 'spells', name: '功法神通', icon: Scroll },
    { id: 'sect', name: '宗門修仙', icon: Users },
  ] as const;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0d13] text-[#d6deeb] font-serif">
      {/* 頂部靜態銘文：低調暗金修仙古風 */}
      <div className="w-full bg-[#05070a] border-b border-[#2d2212]/80 py-1.5 px-4 text-center select-none shrink-0 shadow-sm z-40">
        <p className="text-[11px] sm:text-xs text-[#9a7b38] tracking-[0.25em] font-serif font-medium antialiased">
          吳永隆製作，2026。音聲禪院，南無無量音聲王佛。
        </p>
      </div>

      {/* 頂部修真數值面板 */}
      <TopStatusBar
        player={player}
        world={world}
        onResetGame={handleResetGame}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        ambientEnabled={ambientEnabled}
        setAmbientEnabled={setAmbientEnabled}
      />

      {/* 主體區塊：左側導航 + 中央主界面 + 右側日誌 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 左側修仙導航欄 */}
        <aside className="hidden md:flex flex-col w-48 bg-[#0e131b] border-r border-[#21262d] py-4 select-none shrink-0">
          <div className="px-4 mb-3">
            <span className="text-[11px] font-mono text-slate-500 tracking-widest block uppercase">
              修道法門
            </span>
          </div>
          <nav className="flex-1 space-y-1 px-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (combat.inCombat) {
                      addLog('鬥法生死關頭，切莫分心分神！', 'danger');
                      return;
                    }
                    setActiveTab(tab.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-amber-950/40 text-amber-300 font-bold border-l-4 border-amber-400 shadow-sm'
                      : 'text-slate-400 hover:bg-[#161b24] hover:text-slate-200 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-3 mx-2 rounded-lg bg-[#070a0f] border border-slate-800 text-[11px] text-slate-400 leading-snug">
            <div className="text-amber-400 font-semibold mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              修仙天道格言
            </div>
            「凡人成仙，乃逆天奪造化。靈氣相生相剋，修身更修道心。」
          </div>
        </aside>

        {/* 中央主視窗 (Viewport) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-[#0e131c] via-[#0a0d13] to-[#07090e]">
          {combat.inCombat && combat.enemy ? (
            <CombatView
              player={player}
              enemy={combat.enemy}
              turn={combat.turn}
              lastSpellId={combat.lastSpellId}
              comboCount={combat.comboCount}
              lastComboName={combat.lastComboName}
              comboTriggerAnim={combat.comboTriggerAnim}
              turnMetrics={combat.turnMetrics}
              currentTurnDealt={combat.currentTurnDealt}
              currentTurnQiSpent={combat.currentTurnQiSpent}
              currentTurnSpellsCount={combat.currentTurnSpellsCount}
              currentTurnCombosCount={combat.currentTurnCombosCount}
              onCastSpell={handleCastSpell}
              onEndTurn={handleEndTurn}
              onEscapeCombat={handleEscapeCombat}
              combatLog={combat.log}
            />
          ) : (
            <>
              {activeTab === 'cultivate' && (
                <CultivationTab
                  player={player}
                  onMeditate={handleMeditate}
                  onDetox={handleDetox}
                  onOpenTribulation={() => setTribulationModalOpen(true)}
                  onUpgradeArray={handleUpgradeArray}
                />
              )}

              {activeTab === 'world' && (
                <WorldTab
                  player={player}
                  onExploreForest={handleExploreForest}
                  onExploreRuins={handleExploreRuins}
                  onStartCombat={startCombat}
                  onBuyHerb={handleBuyHerb}
                  onSellHerb={handleSellHerb}
                  onWinAuction={handleWinAuction}
                />
              )}

              {activeTab === 'alchemy' && (
                <AlchemyTab
                  player={player}
                  onCraftAlchemy={handleCraftAlchemy}
                  onConsumePill={handleConsumePill}
                />
              )}

              {activeTab === 'spells' && (
                <SpellsTab
                  player={player}
                  onToggleSpellInDeck={handleToggleSpellInDeck}
                  onPracticeSpell={handlePracticeSpell}
                />
              )}

              {activeTab === 'sect' && (
                <SectTab
                  player={player}
                  onJoinSect={handleJoinSect}
                  onDoQuest={handleDoQuest}
                />
              )}
            </>
          )}
        </main>

        {/* 右側傳書日誌 (Log Panel) */}
        <aside className="hidden lg:block w-72 h-full shrink-0">
          <LogPanel logs={logs} onClearLogs={() => setLogs([])} />
        </aside>
      </div>

      {/* 手機端底部導航列 */}
      <div className="md:hidden bg-[#0c1017] border-t border-[#21262d] flex justify-around p-1 z-40 select-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (combat.inCombat) return;
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center py-1 px-2 text-[10px] ${
                isActive ? 'text-amber-300 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* 渡劫雷劫模態視窗 */}
      {tribulationModalOpen && (
        <TribulationModal
          player={player}
          onClose={() => setTribulationModalOpen(false)}
          onSurviveTribulation={handleSurviveTribulation}
          onFailTribulation={handleFailTribulation}
        />
      )}
    </div>
  );
}
