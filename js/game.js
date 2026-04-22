const PLAYER_TEMPLATE = Object.freeze({
  name: "Aventureiro",
  max_hp: 30,
  hit_points: 30,
  armor_class: 14,
  attack_bonus: 4,
  damage_dice: "1d8+2",
  heal_dice: "1d6+2",
});

let state = buildInitialState();

function buildInitialState() {
  return {
    player: { ...PLAYER_TEMPLATE },
    monster: null,
    spell: null,
    isPlayerTurn: true,
    combatActive: false,
    healUsed: false,
  };
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

export function setMonster(monster) { state.monster = monster; }
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

export function applyDamageToMonster(amount) {
  state.monster.hit_points = Math.max(0, state.monster.hit_points - amount);
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
}