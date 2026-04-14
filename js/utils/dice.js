export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollD20() {
  return rollDie(20);
}

export function rollDice(notation) {
  const match = String(notation).match(/^(\d+)d(\d+)([+-]\d+)?$/i);

  if (!match) {
    console.warn(`[dice] Notação inválida: "${notation}". Usando fallback 1d6.`);
    return rollDice("1d6");
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const bonus = match[3] ? parseInt(match[3], 10) : 0;

  const rolls = Array.from({ length: count }, () => rollDie(sides));
  const raw = rolls.reduce((sum, r) => sum + r, 0) + bonus;

  return {
    total: Math.max(1, raw),
    rolls,
    bonus,
    notation,
  };
}