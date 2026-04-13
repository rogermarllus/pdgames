const gameState = {
  player: null,
  monster: null,
  spell: null,
  turn: null,
  spellUsed: false,
  healUsed: false,
  combatActive: false,
};

export function initPlayer() {
  gameState.player = {
    name: "Aventureiro",
    hp: 30,
    maxHp: 30,
    ac: 14,
    attackBonus: 4,
    damageDice: "1d8+2",
  };
}

export function setMonster(normalizedMonster) {
  gameState.monster = { ...normalizedMonster };
}

export function setSpell(spellData) {
  gameState.spell = spellData;
}

export function getState() {
  return gameState;
}