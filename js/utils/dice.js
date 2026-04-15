export function rollDice(notation) {
  const match = String(notation).match(/^(\d+)d(\d+)([+-]\d+)?$/i);

  if (!match) {
    console.warn(`[dice] Notação inválida: "${notation}". Usando fallback 1d6.`);
    return rollDice("1d6");
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const bonus = match[3] ? parseInt(match[3], 10) : 0;

  let total = bonus;

  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }

  return Math.max(1, total);
}