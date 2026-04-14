export function setMonster(normalizedMonster) {
  gameState.monster = { ...normalizedMonster };
}

export function setSpell(spellData) {
  gameState.spell = spellData;
}

export function getState() {
  return gameState;
}

