import {
  getPlayer, getMonster, getState,
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
const RESULT_REDIRECT_DELAY = 1500;

let turnCount = 1;

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
  turnCount = 1;
  clearLog();
  startCombat();
  updateMonsterHud(getMonster());
  updatePlayerHud(getPlayer());
  refreshActionButtons();

  if (sessionStorage.getItem("monsterWasRandom") === "true") {
    sessionStorage.removeItem("monsterWasRandom");
    addLogEntry(`Monstro aleatório <span class="log-red">${getMonster().name}</span> foi selecionado!`);
  }

  addLogEntry(`Combate iniciado contra <span class="log-red">${getMonster().name}</span>!`);
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

function saveResultAndRedirect(outcome) {
  const player = getPlayer();
  const monster = getMonster();
  const { healUsed } = getState();

  sessionStorage.setItem("combatResult", JSON.stringify({
    outcome,
    monsterName: monster.name,
    turnsPlayed: turnCount,
    healUsed,
    playerHp: player.hit_points,
  }));

  setTimeout(() => {
    window.location.href = "/pages/combat-result.html";
  }, RESULT_REDIRECT_DELAY);
}

function checkCombatEnd() {
  if (getMonster().hit_points <= 0) {
    addLogEntry(`<span class='log-green'>Vitória!</span> Você derrotou <span class="log-red">${getMonster().name}</span>!`);
    endCombat();
    disableAllActions();
    saveResultAndRedirect("victory");
    return true;
  }
  if (getPlayer().hit_points <= 0) {
    addLogEntry("<span class='log-red'>Fim de Jogo!</span> Você foi derrotado!");
    endCombat();
    disableAllActions();
    saveResultAndRedirect("defeat");
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
    addLogEntry(`<span class="log-red">${getMonster().name}</span> errou ${monster.action_name}!`);
  } else {
    const dano = rollDice(monster.damage_dice);
    applyDamageToPlayer(dano);
    addLogEntry(`<span class="log-red">${getMonster().name}</span> usou ${monster.action_name} e causou ${dano} de dano!`);
    updatePlayerHud(getPlayer());
  }

  if (!checkCombatEnd()) {
    nextTurn();
    refreshActionButtons();
  }
}

function passTurnToMonster() {
  turnCount++;
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
    addLogEntry("<span class='log-green'>Jogador</span> errou o ataque!");
  } else {
    const dano = rollDice(player.damage_dice);
    applyDamageToMonster(dano);
    addLogEntry(`<span class='log-green'>Jogador</span> causou ${dano} de dano!`);
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

  addLogEntry(`<span class='log-green'>Jogador</span> recuperou ${cura} de HP!`);
  updatePlayerHud(getPlayer());

  passTurnToMonster();
}

/* Desistência do Jogador */
function onSurrender() {
  addLogEntry("<span class='log-green'>Jogador</span> desistiu do combate...");
  endCombat();
  disableAllActions();
  saveResultAndRedirect("defeat");
}

document.getElementById("btn-attack")
  .addEventListener("click", onAttack);

document.getElementById("btn-heal")
  .addEventListener("click", onHeal);

document.getElementById("btn-surrender")
  .addEventListener("click", onSurrender);

init();