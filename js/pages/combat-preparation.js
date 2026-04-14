import { fetchMonsterList, fetchSpellList, fetchSpellByIndex } from "../api.js";
import { normalizeMonster } from "../utils/monsters.js";
import { setMonster, setSpell } from "../game.js";
import {
  populateMonsterSelect,
  populateSpellSelect,
  showSelectLoading,
  showSpellDescription,
} from "../ui.js";

function navigateTo(path) {
  window.location.href = path;
}

async function init() {
  await Promise.all([loadMonsterList(), loadSpellList()]);
}

async function loadMonsterList() {
  showSelectLoading("monster-select", "Carregando monstros...");

  try {
    const list = await fetchMonsterList();

    if (!list.length) {
      showSelectLoading("monster-select", "Nenhum monstro disponível");
      return;
    }

    populateMonsterSelect(list);
    hideError();
  } catch (error) {
    handleApiError(error, "monster-select");
  }
}

async function loadSpellList() {
  showSelectLoading("spell-select", "Carregando magias...");

  try {
    const list = await fetchSpellList();

    if (!list.length) {
      showSelectLoading("spell-select", "Nenhuma magia disponível");
      return;
    }

    populateSpellSelect(list);
    hideError();

    await loadSpellDescription(list[0].index);
  } catch (error) {
    handleApiError(error, "spell-select");
  }
}

async function loadSpellDescription(index) {
  try {
    const spell = await fetchSpellByIndex(index);
    setSpell(spell);
    showSpellDescription(spell);
  } catch (error) {
    handleApiError(error);
  }
}

function selectRandomMonster() {
  const select = document.getElementById("monster-select");
  const options = select.options;

  if (!options.length) return;

  const randomIndex = Math.floor(Math.random() * options.length);
  select.selectedIndex = randomIndex;
}

async function selectRandomSpell() {
  const select = document.getElementById("spell-select");
  const options = select.options;

  if (!options.length) return;

  const randomIndex = Math.floor(Math.random() * options.length);
  select.selectedIndex = randomIndex;

  await loadSpellDescription(select.value);
}

async function onStartCombat() {
  const monsterIndex = document.getElementById("monster-select").value;

  try {
    const { fetchMonsterByIndex } = await import("../api.js");
    const raw = await fetchMonsterByIndex(monsterIndex);
    const monster = normalizeMonster(raw);
    setMonster(monster);

    sessionStorage.setItem("selectedMonster", JSON.stringify(monster));
    sessionStorage.setItem("selectedSpell", JSON.stringify(
      document.getElementById("spell-select").value
    ));

    navigateTo("/pages/combat.html");
  } catch (error) {
    handleApiError(error);
  }
}

function handleApiError(error, selectId = null) {
  const messages = {
    "TIMEOUT": "A API demorou muito para responder. Tente novamente.",
    "NO_CONNECTION": "Sem conexão com a internet. Verifique sua rede.",
  };

  const message = messages[error.message]
    ?? `Erro na API: ${error.message.replace("HTTP_ERROR:", "")}`;

  showError(message);

  if (selectId) {
    showSelectLoading(selectId, "Erro ao carregar. Tente novamente.");
  }
}

document.getElementById("random-monster")
  .addEventListener("click", selectRandomMonster);

document.getElementById("random-spell")
  .addEventListener("click", selectRandomSpell);

document.getElementById("spell-select")
  .addEventListener("change", (e) => loadSpellDescription(e.target.value));

document.getElementById("btn-start-combat")
  .addEventListener("click", onStartCombat);

init();