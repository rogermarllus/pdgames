function navigateTo(path) {
  window.location.href = path;
}

document.getElementById("btn-new-game").addEventListener("click", () => navigateTo("/pages/combat-preparation.html"));
document.getElementById("btn-load-game").addEventListener("click", () => navigateTo("/pages/combat.html"));
document.getElementById("btn-achievements").addEventListener("click", () => navigateTo("/pages/achievements.html"));
document.getElementById("btn-credits").addEventListener("click", () => navigateTo("/pages/credits.html"));