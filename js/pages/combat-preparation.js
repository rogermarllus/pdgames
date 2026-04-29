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

function showError(message) {
  console.log(message);
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
    //hideError();
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
    //hideError();

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
  sessionStorage.setItem("monsterWasRandom", "true");
}

async function selectRandomSpell() {
  const select = document.getElementById("spell-select");
  const options = select.options;

  if (!options.length) return;

  const randomIndex = Math.floor(Math.random() * options.length);
  select.selectedIndex = randomIndex;

  await loadSpellDescription(select.value);
}

function onStartCombat() {
  const monsterIndex = document.getElementById("monster-select")?.value;
  const spellIndex = document.getElementById("spell-select")?.value;

  if (!monsterIndex) {
    showError("Selecione um monstro antes de iniciar o combate.");
    return;
  }

  if (!spellIndex) {
    showError("Selecione uma magia antes de iniciar o combate.");
    return;
  }

  localStorage.removeItem("STATE");

  const params = new URLSearchParams({
    action: "to-combat",
    next: "/pages/combat.html",
    monster: monsterIndex,
    spell: spellIndex,
  });

  window.location.href = `/pages/error-loading.html?${params}`;
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

document.getElementById("monster-select")
  .addEventListener("change", () => sessionStorage.removeItem("monsterWasRandom"));

document.getElementById("random-spell")
  .addEventListener("click", selectRandomSpell);

document.getElementById("spell-select")
  .addEventListener("change", (e) => loadSpellDescription(e.target.value));

document.getElementById("btn-start-combat")
  .addEventListener("click", onStartCombat);

init();