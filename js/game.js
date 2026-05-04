const PLAYER_TEMPLATE = Object.freeze({
  name: "Aventureiro",
  max_hp: 30,
  hit_points: 30,
  armor_class: 15,
  attack_bonus: 5,
  damage_dice: "1d8+2",
  heal_dice: "1d8+2",
});

const SAVE_KEY = "STATE";

let state = buildInitialState();

function buildInitialState() {
  return {
    player: { ...PLAYER_TEMPLATE },
    monster: null,
    spell: null,
    isPlayerTurn: true,
    combatActive: false,
    healUsed: false,
    spellCooldown: 0,
    log: [],
  };
}

export function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadState() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function restoreState(savedState) {
  state = { ...savedState };
}

export function hasSavedState() {
  return !!localStorage.getItem(SAVE_KEY);
}

export function clearSavedState() {
  localStorage.removeItem(SAVE_KEY);
}

export function getState() { return { ...state }; }
export function getPlayer() { return state.player; }
export function getMonster() { return state.monster; }
export function getSpell() { return state.spell; }

export function isPlayerTurn() { return state.isPlayerTurn; }
export function isCombatActive() { return state.combatActive; }

export function isHealAvailable() {
  return !state.healUsed && state.player.hit_points < state.player.max_hp;
}

export function getSpellCooldown() { return state.spellCooldown; }
export function isSpellAvailable() { return state.spellCooldown === 0; }
export function setSpellCooldown(value) { state.spellCooldown = value; }

export function tickSpellCooldown() {
  if (state.spellCooldown > 0) state.spellCooldown--;
}

export function setMonster(monster) {
  state.monster = monster;

  const calculatedMaxHp = Math.max(30, Math.floor(monster.hit_points * 0.6));

  state.player.max_hp = calculatedMaxHp;
  state.player.hit_points = calculatedMaxHp;
}

export function setSpell(spell) { state.spell = spell; }

export function startCombat() {
  state.combatActive = true;
  state.isPlayerTurn = true;
}

export function endCombat() {
  state.combatActive = false;
}

export function resetCombat() {
  state = buildInitialState();
}

export function applyDamageToMonster(amount, damage_type = "slashing") {
  const monster = state.monster;

  const isImmune = monster.damage_immunities?.includes(damage_type);
  const isResistant = monster.damage_resistances?.includes(damage_type);
  const isVulnerable = monster.damage_vulnerabilities?.includes(damage_type);

  let finalDamage = amount;
  let resultType = 0;

  if (isImmune) {
    finalDamage = 0;
    resultType = 1;
  } else if (isResistant) {
    finalDamage = Math.floor(amount / 2);
    resultType = 2;
  } else if (isVulnerable) {
    finalDamage = amount * 2;
    resultType = 3;
  }

  monster.hit_points = Math.max(0, monster.hit_points - finalDamage);

  return { resultType, finalDamage };
}

export function applyDamageToPlayer(amount) {
  state.player.hit_points = Math.max(0, state.player.hit_points - amount);
}

export function healPlayer(amount) {
  state.player.hit_points = Math.min(
    state.player.max_hp,
    state.player.hit_points + amount
  );
  state.healUsed = true;
}

export function nextTurn() {
  state.isPlayerTurn = !state.isPlayerTurn;
  saveState();
}

export function pushLog(entry) {
  state.log.push(entry);
}

export function getLog() {
  return [...state.log];
}

export function clearLogState() {
  state.log = [];
}