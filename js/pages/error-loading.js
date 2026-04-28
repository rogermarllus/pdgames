import {
  fetchMonsterList,
  fetchSpellList,
  fetchMonsterByIndex,
  fetchSpellByIndex,
  parseApiError,
} from "../api.js";

const loadingScreen = document.getElementById("loading-screen");
const errorScreen = document.getElementById("error-screen");
const errorCode = document.getElementById("error-code");
const errorDetail = document.getElementById("error-detail");
const btnRetry = document.getElementById("btn-retry");

const params = new URLSearchParams(window.location.search);
const action = params.get("action") ?? "to-preparation";
const next = params.get("next") ?? "/pages/combat-preparation.html";

function showLoading() {
  errorScreen.style.display = "none";
  errorScreen.classList.remove("fade-in");
  loadingScreen.style.display = "flex";
}

function showErrorState(code, message) {
  loadingScreen.style.display = "none";
  errorCode.textContent = code;
  errorDetail.textContent = `"${message}"`;
  errorScreen.style.display = "flex";
  errorScreen.classList.add("fade-in");
}

async function handleToPreparation() {
  try {
    const [monsters, spells] = await Promise.all([
      fetchMonsterList(),
      fetchSpellList(),
    ]);

    sessionStorage.setItem("monsterList", JSON.stringify(monsters));
    sessionStorage.setItem("spellList", JSON.stringify(spells));

    window.location.href = next;
  } catch (error) {
    const { code, message } = parseApiError(error);
    showErrorState(code, message);
  }
}

async function handleToCombat() {
  const monsterIndex = params.get("monster");
  const spellIndex = params.get("spell");

  if (!monsterIndex) {
    showErrorState("—", "Nenhum monstro foi selecionado. Volte e tente novamente.");
    return;
  }

  if (!spellIndex) {
    showErrorState("—", "Nenhuma magia foi selecionada. Volte e tente novamente.");
    return;
  }

  try {
    localStorage.removeItem("STATE");

    const [monster, spell] = await Promise.all([
      fetchMonsterByIndex(monsterIndex),
      fetchSpellByIndex(spellIndex),
    ]);

    sessionStorage.setItem("selectedMonster", JSON.stringify(monster));
    sessionStorage.setItem("selectedSpell", JSON.stringify(spell));

    window.location.href = next;
  } catch (error) {
    const { code, message } = parseApiError(error);
    showErrorState(code, message);
  }
}

async function handleToResume() {
  const raw = localStorage.getItem("STATE");

  if (!raw) {
    showErrorState("—", "Nenhum jogo salvo encontrado.");
    return;
  }

  try {
    const saved = JSON.parse(raw);

    if (!saved.monster || !saved.spell) {
      showErrorState("—", "O arquivo de jogo salvo está incompleto.");
      return;
    }

    sessionStorage.setItem("resuming", "true");
    window.location.href = next;
  } catch {
    showErrorState("—", "O arquivo de jogo salvo está corrompido.");
  }
}

btnRetry?.addEventListener("click", () => {
  showLoading();
  run();
});

function run() {
  if (action === "to-combat") {
    handleToCombat();
  } else if (action === "to-resume") {
    handleToResume();
  } else {
    handleToPreparation();
  }
}

run();