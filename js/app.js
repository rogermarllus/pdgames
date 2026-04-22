import {
  getPlayer, getMonster,
  setMonster, setSpell,
  applyDamageToMonster, applyDamageToPlayer, healPlayer,
  isHealAvailable, isPlayerTurn,
  startCombat, endCombat, nextTurn,
} from "./game.js";

import {
  updateMonsterHud, updatePlayerHud,
  addLogEntry, clearLog, setDisabled,
} from "./ui.js";

import { rollDice } from "./utils/dice.js";

const MONSTER_TURN_DELAY = 700;

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
  startCombat();
  updateMonsterHud(getMonster());
  updatePlayerHud(getPlayer());
  refreshActionButtons();
  addLogEntry(`Combate iniciado contra ${getMonster().name}!`);
}

function refreshActionButtons() {
  const playerTurn = isPlayerTurn();
  setDisabled("btn-attack", !playerTurn);
  setDisabled("btn-heal", !playerTurn || !isHealAvailable());
  setDisabled("btn-spell", !playerTurn);
}

function disableAllActions() {
  setDisabled("btn-attack", true);
  setDisabled("btn-heal", true);
  setDisabled("btn-spell", true);
}

function checkCombatEnd() {
  if (getMonster().hit_points <= 0) {
    addLogEntry(`${getMonster().name} foi derrotado!`);
    endCombat();
    disableAllActions();
    return true;
  }
  if (getPlayer().hit_points <= 0) {
    addLogEntry("Aventureiro foi derrotado!");
    endCombat();
    disableAllActions();
    return true;
  }
  return false;
}

function runMonsterTurn() {
  const player = getPlayer();
  const monster = getMonster();

  const roll = rollDice("1d20");
  const total = roll + monster.attack_bonus;
  const acerto = total >= player.armor_class;

  if (!acerto) {
    addLogEntry(`${monster.name} errou ${monster.action_name}!`);
  } else {
    const dano = rollDice(monster.damage_dice);
    applyDamageToPlayer(dano);
    addLogEntry(`${monster.name} usou ${monster.action_name} e causou ${dano} de dano!`);
    updatePlayerHud(getPlayer());
  }

  if (!checkCombatEnd()) {
    nextTurn();
    refreshActionButtons();
  }
}

function passTurnToMonster() {
  nextTurn();
  refreshActionButtons();
  setTimeout(runMonsterTurn, MONSTER_TURN_DELAY);
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
  } else {
    const dano = rollDice(player.damage_dice);
    applyDamageToMonster(dano);
    addLogEntry(`Jogador causou ${dano} de dano!`);
    updateMonsterHud(getMonster());
  }

  if (!checkCombatEnd()) {
    passTurnToMonster();
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

  passTurnToMonster();
}

document.getElementById("btn-attack")
  .addEventListener("click", onAttack);

document.getElementById("btn-heal")
  .addEventListener("click", onHeal);

init();