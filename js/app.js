import {
  getPlayer, getMonster, getState,
  setMonster, setSpell,
  applyDamageToMonster, applyDamageToPlayer, healPlayer,
  isHealAvailable, isPlayerTurn,
  startCombat, endCombat, nextTurn,
  getSpell,
  getSpellCooldown, setSpellCooldown, tickSpellCooldown, isSpellAvailable,
  loadState, restoreState, clearSavedState,
} from "./game.js";

import {
  updateMonsterHud, updatePlayerHud,
  addLogEntry, clearLog, setDisabled,
  updateSpellCooldown,
} from "./ui.js";

import { rollDice } from "./utils/dice.js";

import { hitFlash } from "./utils/animations.js";

import { musics, sfx } from "./utils/audio.js";

const MONSTER_TURN_DELAY = 700;
const RESULT_REDIRECT_DELAY = 1500;

let turnCount = 1;

function init() {
  // Carregar Jogo
  const resuming = sessionStorage.getItem("resuming") === "true";
  if (resuming) {
    sessionStorage.removeItem("resuming");
    return tryRestore();
  }

  // Reload
  const saved = loadState();
  if (saved?.combatActive) {
    restoreState(saved);
    resumeCombat();
    return;
  }

  // Novo Combate
  const rawMonster = sessionStorage.getItem("selectedMonster");
  const rawSpell = sessionStorage.getItem("selectedSpell");

  if (!rawMonster) {
    window.location.href = "/pages/combat-preparation.html";
    return;
  }

  setMonster(JSON.parse(rawMonster));
  setSpell(JSON.parse(rawSpell));
  beginCombat();
}

function tryRestore() {
  const saved = loadState();
  if (!saved) {
    window.location.href = "/pages/combat-preparation.html";
    return;
  }
  restoreState(saved);
  resumeCombat();
}

function beginCombat() {
  musics.combat.play();
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

function resumeCombat() {
  musics.combat.play();
  turnCount = 1;
  clearLog();
  updateMonsterHud(getMonster());
  updatePlayerHud(getPlayer());
  refreshActionButtons();

  addLogEntry(`Jogo carregado! Combate retomado contra <span class="log-red">${getMonster().name}</span>.`);

  if (!isPlayerTurn()) {
    setTimeout(runMonsterTurn, MONSTER_TURN_DELAY);
  }
}

function refreshActionButtons() {
  const playerTurn = isPlayerTurn();
  setDisabled("btn-attack", !playerTurn);
  setDisabled("btn-heal", !playerTurn || !isHealAvailable());
  setDisabled("btn-spell", !playerTurn || !isSpellAvailable());
  updateSpellCooldown(getSpellCooldown());
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

  clearSavedState();

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
    sfx.miss.play();
    addLogEntry(`<span class="log-red">${getMonster().name}</span> rolou <span class="log-yellow">${total}</span> e errou ${monster.action_name}!`);
  } else {
    sfx.hit.play();
    const dano = rollDice(monster.damage_dice);
    applyDamageToPlayer(dano);
    addLogEntry(`<span class="log-red">${getMonster().name}</span> usou ${monster.action_name}, rolou <span class="log-yellow">${total}</span> e causou <span class="log-yellow">${dano}</span> de dano!`);
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
    sfx.miss.play();
    addLogEntry(`<span class='log-green'>Jogador</span> rolou <span class="log-yellow">${total}</span> e errou o ataque!`);
  } else {
    sfx.hit.play();
    const dano = rollDice(player.damage_dice);
    applyDamageToMonster(dano);
    hitFlash("attack");
    addLogEntry(`<span class='log-green'>Jogador</span> rolou <span class="log-yellow">${total}</span> e causou <span class="log-yellow">${dano}</span> de dano!`);
    updateMonsterHud(getMonster());
  }

  tickSpellCooldown();

  if (!checkCombatEnd()) {
    passTurnToMonster();
  }
}

/* Conjuração do Jogador */
function onCast() {
  sfx.spell.play();

  const spell = getSpell();

  const dano = rollDice(spell.final_damage);

  const { resultType, finalDamage } = applyDamageToMonster(
    dano,
    spell.damage.damage_type.index
  );

  hitFlash("spell");

  setSpellCooldown(3);

  let extraLog = "";
  if (resultType === 1) extraLog = "O monstro é imune a este tipo de dano!";
  else if (resultType === 2) extraLog = "O monstro resistiu ao dano!";
  else if (resultType === 3) extraLog = "O monstro é vulnerável a este tipo de dano!";

  const baseLog = `<span class='log-green'>Jogador</span> conjurou ${spell.name} e causou <span class="log-yellow">${finalDamage}</span> de dano de ${spell.damage.damage_type.name}!`;
  addLogEntry(extraLog ? `${baseLog} ${extraLog}` : baseLog);

  updateMonsterHud(getMonster());

  if (!checkCombatEnd()) {
    passTurnToMonster();
  }
}

/* Cura do Jogador */
function onHeal() {
  if (!isHealAvailable()) return;

  sfx.heal.play();

  const player = getPlayer();
  const cura = rollDice(player.heal_dice);
  healPlayer(cura);

  addLogEntry(`<span class='log-green'>Jogador</span> recuperou ${cura} de HP!`);
  updatePlayerHud(getPlayer());

  tickSpellCooldown();
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

document.getElementById("btn-spell")
  .addEventListener("click", onCast);

document.getElementById("btn-heal")
  .addEventListener("click", onHeal);

document.getElementById("btn-surrender")
  .addEventListener("click", onSurrender);

init();