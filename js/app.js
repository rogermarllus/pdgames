import {
  getPlayer, getMonster,
  setMonster, setSpell,
  applyDamageToMonster, healPlayer,
  isHealAvailable, endCombat,
} from "./game.js";

import {
  updateMonsterHud, updatePlayerHud,
  addLogEntry, clearLog, setDisabled,
} from "./ui.js";

import { rollDice } from "./utils/dice.js";

function init() {
  const rawMonster = sessionStorage.getItem("selectedMonster");
  const rawSpell = sessionStorage.getItem("selectedSpell");

  if (!rawMonster) {
    window.location.href = "/pages/combat-preparation.html";
    return;
  }

  setMonster(JSON.parse(rawMonster));
  if (rawSpell) {
    try { setSpell(JSON.parse(rawSpell)); } catch { }
  }

  beginCombat();
}

function beginCombat() {
  clearLog();
  updateMonsterHud(getMonster());
  updatePlayerHud(getPlayer());
  refreshActionButtons();
  addLogEntry(`Combate iniciado contra ${getMonster().name}!`);
}

function refreshActionButtons() {
  setDisabled("btn-heal", !isHealAvailable());
}

function disableAllActions() {
  setDisabled("btn-attack", true);
  setDisabled("btn-heal", true);
  setDisabled("btn-spell", true);
}

/* Ataque do Jogador */
function onAttack() {
  const player = getPlayer();
  const monster = getMonster();

  const roll = rollDice("1d20");
  const total = roll + player.attack_bonus;
  const acerto = total >= monster.armor_class;

  if (!acerto) {
    addLogEntry("Jogador errou o ataque!");
    return;
  }

  const dano = rollDice(player.damage_dice);
  applyDamageToMonster(dano);

  addLogEntry(`Jogador causou ${dano} de dano!`);
  updateMonsterHud(getMonster());

  if (getMonster().hit_points <= 0) {
    addLogEntry(`${monster.name} foi derrotado!`);
    endCombat();
    disableAllActions();
  }
}

/* Cura do Jogador */
function onHeal() {
  if (!isHealAvailable()) return;

  const player = getPlayer();

  const cura = rollDice(player.heal_dice);
  healPlayer(cura);

  addLogEntry(`Jogador recuperou ${cura} de HP!`);
  updatePlayerHud(getPlayer());

  refreshActionButtons();
}

document.getElementById("btn-attack")
  .addEventListener("click", onAttack);

document.getElementById("btn-heal")
  .addEventListener("click", onHeal);

init();