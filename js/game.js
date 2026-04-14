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
  return !state.healUsed && state.player.hit_points > 0;
}

export function setMonster(monster) {
  state.monster = monster;
}

export function setSpell(spell) {
  state.spell = spell;
}

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
