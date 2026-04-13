const BASE_URL = "https://www.dnd5eapi.co/api/2014";

async function fetchWithTimeout(url, ms = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`HTTP_ERROR:${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("TIMEOUT");
    }
    if (!navigator.onLine) {
      throw new Error("NO_CONNECTION");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchMonsterList() {
  const data = await fetchWithTimeout(`${BASE_URL}/monsters`);
  return data.results;
}

export async function fetchMonsterByIndex(index) {
  const data = await fetchWithTimeout(`${BASE_URL}/monsters/${index}`);
  return data;
}

export async function fetchSpellList() {
  const data = await fetchWithTimeout(`${BASE_URL}/spells`);
  return data.results;
}

export async function fetchSpellByIndex(index) {
  const data = await fetchWithTimeout(`${BASE_URL}/spells/${index}`);
  return data;
}