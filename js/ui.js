const HP_SEGMENTS = 10;

export function updateMonsterHud(monster) {
  setText("monster-name", monster.name);
  setText("monster-ac", String(monster.armor_class));
  setText("monster-hp", `PV: ${monster.hit_points}/${monster.max_hp}`);
  updateHpBar("monster-hp-bar", monster.hit_points, monster.max_hp);

  const art = document.getElementById("monster-art");
  if (art && monster.image) {
    art.src = monster.image;
    art.alt = monster.name;
  }
}

export function updatePlayerHud(player) {
  setText("player-name", player.name);
  setText("player-ac", String(player.armor_class));
  setText("player-hp", `PV: ${player.hit_points}/${player.max_hp}`);
  updateHpBar("player-hp-bar", player.hit_points, player.max_hp);
}

export function updateHpBar(barId, current, max) {
  const bar = document.getElementById(barId);
  if (!bar) return;

  const ratio = max > 0 ? Math.min(1, current / max) : 0;
  const filled = Math.round(ratio * HP_SEGMENTS);

  bar.querySelectorAll(".hp-part").forEach((part, i) => {
    part.style.opacity = i < filled ? "1" : "0";
  });
}

export function addLogEntry(message) {
  const log = document.getElementById("combat-log");
  if (!log) return;

  const time = new Date().toTimeString().slice(0, 8);
  const entry = document.createElement("p");
  entry.className = "log-entry";
  entry.innerHTML = `<span class="log-grey">[${time}]</span> ${message}`;

  log.prepend(entry);
}

export function clearLog() {
  const log = document.getElementById("combat-log");
  if (log) log.innerHTML = "";
}

export function showError(message) {
  const el = document.getElementById("error-message");
  if (!el) return;
  el.textContent = message;
  el.removeAttribute("hidden");
}

export function hideError() {
  const el = document.getElementById("error-message");
  el?.setAttribute("hidden", "");
}

export function showSelectLoading(selectId, message) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = `<option disabled selected>${message}</option>`;
}

export function populateMonsterSelect(list) {
  const select = document.getElementById("monster-select");
  if (!select) return;
  select.innerHTML = list
    .map(m => `<option value="${m.index}">${m.name}</option>`)
    .join("");
}

export function populateSpellSelect(list) {
  const select = document.getElementById("spell-select");
  if (!select) return;
  select.innerHTML = list
    .map(s => `<option value="${s.index}">${s.name}</option>`)
    .join("");
}

export function showSpellDescription(spell) {
  const el = document.getElementById("spell-description");
  if (!el) return;

  const parts = [];

  if (spell.name) parts.push(`<p>Nome: ${spell.name}</p>`);
  if (spell.level !== undefined) parts.push(`<p>Nível: ${spell.level}</p>`);

  parts.push(
    `<p>Dano: ${spell.final_damage ?? "-"
    } de ${spell.damage.damage_type?.name ?? "-"}</p>`
  );

  parts.push(`<p>Cooldown: 3 turnos</p>`);

  el.innerHTML = parts.join("");
}

export function setDisabled(id, disabled) {
  const el = document.getElementById(id);
  if (el) el.disabled = disabled;
}

export function updateSpellCooldown(count) {
  const wrapper = document.getElementById("spell-surrender-wrapper");
  if (!wrapper) return;

  let counter = wrapper.querySelector(".spell-cooldown-counter");

  if (!counter) {
    counter = document.createElement("span");
    counter.className = "spell-cooldown-counter";
    wrapper.appendChild(counter);
  }

  if (count > 0) {
    counter.textContent = count;
    counter.removeAttribute("hidden");
  } else {
    counter.setAttribute("hidden", "");
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}