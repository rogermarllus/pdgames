const MONSTER_IMAGES = {
  "mimic": "/assets/images/monsters/mimic.png"
};

const DEFAULT_IMAGE = "/assets/images/monsters/default.png";

export function getMonsterImage(index) {
  return MONSTER_IMAGES[index] ?? DEFAULT_IMAGE;
}

export function normalizeMonster(raw) {
  const firstAction = raw.actions?.[0] ?? null;
  const firstDamage = firstAction?.damage?.[0] ?? null;

  return {
    name: raw.name,
    index: raw.index,
    hp: raw.hit_points ?? 20,
    maxHp: raw.hit_points ?? 20,
    ac: raw.armor_class?.[0]?.value ?? 12,
    actionName: firstAction?.name ?? "Ataque Físico",
    attackBonus: firstAction?.attack_bonus ?? 3,
    damageDice: firstDamage?.damage_dice ?? "1d6",
    image: getMonsterImage(raw.index),
  };
}