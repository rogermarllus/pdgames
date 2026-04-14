export function populateMonsterSelect(monsterList) {
  const select = document.getElementById("monster-select");
  select.innerHTML = "";

  monsterList.forEach(({ index, name }) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = name.toUpperCase();
    select.appendChild(option);
  });
}

export function populateSpellSelect(spellList) {
  const select = document.getElementById("spell-select");
  select.innerHTML = "";

  spellList.forEach(({ index, name }) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = name.toUpperCase();
    select.appendChild(option);
  });
}

export function showSpellDescription(spell) {
  const article = document.getElementById("spell-description");

  const description = Array.isArray(spell.desc)
    ? spell.desc.join("\n\n")
    : spell.desc ?? "Descrição não disponível.";

  article.textContent = description;
}

export function showSelectLoading(selectId, message) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option disabled selected>${message}</option>`;
}