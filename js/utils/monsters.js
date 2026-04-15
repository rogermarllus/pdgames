export function normalizeMonster(raw) {
  const hp = raw.hit_points ?? 20;
  const ac = extractArmorClass(raw);
  const firstAction = raw.actions?.[0] ?? null;
  const attackBonus = firstAction?.attack_bonus ?? 3;
  const damageDice = extractDamageDice(firstAction);
  const actionName = firstAction?.name ?? "Ataque Físico";

  return {
    index: raw.index,
    name: raw.name,
    hit_points: hp,
    max_hp: hp,
    armor_class: ac,
    attack_bonus: attackBonus,
    damage_dice: damageDice,
    action_name: actionName,
    image: findMonsterImage(raw.index) ?? null,
  };
}

function findMonsterImage(name) {
  if (!name) return null;

  const formattedName = name
    .toLowerCase()
    .replace(/\s+/g, "-");

  return `/assets/images/monsters/${formattedName}.png`;
}

function extractArmorClass(raw) {
  if (Array.isArray(raw.armor_class)) {
    return raw.armor_class[0]?.value ?? 12;
  }
  if (typeof raw.armor_class === "number") {
    return raw.armor_class;
  }
  return 12;
}

function extractDamageDice(action) {
  if (!action) return "1d6";
  return action.damage?.[0]?.damage_dice ?? "1d6";
}