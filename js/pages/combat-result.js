import { musics } from "../utils/audio.js";

const raw = sessionStorage.getItem("combatResult");

if (!raw) {
  window.location.href = "/index.html";
} else {
  const { outcome, monsterName, turnsPlayed, healUsed, playerHp } = JSON.parse(raw);

  const isVictory = outcome === "victory";

  // Título
  const title = document.getElementById("result-title");
  title.textContent = isVictory ? "VITÓRIA" : "DERROTA";
  title.classList.add(isVictory ? "victory" : "defeat");

  // Subtítulo
  const nameSpan = `<span class="result-monster-name">${monsterName.toUpperCase()}</span>`;
  document.getElementById("result-subtitle").innerHTML = isVictory
    ? `Você derrotou ${nameSpan}!!!`
    : `Você foi derrotado por ${nameSpan}...`;

  // Estatísticas
  document.getElementById("stat-turns").textContent = `Turnos Jogados: ${turnsPlayed}`;
  document.getElementById("stat-heal").textContent = `Cura Usada: ${healUsed ? "Sim" : "Não"}`;
  document.getElementById("stat-hp").textContent = `Pontos de Vida Restantes: ${playerHp}`;

  // Botões de ação
  const actions = document.getElementById("result-actions");

  if (!isVictory) {
    const retry = document.createElement("a");
    retry.href = "/pages/combat.html";
    retry.className = "btn";
    retry.textContent = "TENTAR DE NOVO";
    actions.appendChild(retry);
  }

  const newCombat = document.createElement("a");
  newCombat.href = "/pages/combat-preparation.html";
  newCombat.className = "btn";
  newCombat.textContent = "NOVO COMBATE";
  actions.appendChild(newCombat);

  const home = document.createElement("a");
  home.href = "/index.html";
  home.className = "btn";
  home.textContent = "VOLTAR AO INÍCIO";
  actions.appendChild(home);

  if (isVictory) {
    musics.victory.play();
  } else {
    musics.gameOver.play();
  }
}