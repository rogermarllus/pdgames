import {
  getPlayer, getMonster,
  setMonster, setSpell,
} from "./game.js";

import {
  updateMonsterHud, updatePlayerHud,
  addLogEntry, clearLog,
} from "./ui.js";

function init() {
  const rawMonster = sessionStorage.getItem("selectedMonster");
  const rawSpell   = sessionStorage.getItem("selectedSpell");

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

  addLogEntry(`Combate iniciado contra ${getMonster().name}!`);
}

init();