import { normalizeMonster } from "./utils/monsters.js";

const BASE_URL = "https://www.dnd5eapi.co/api/2014";
const TIMEOUT_MS = 6000;

async function fetchWithTimeout(url, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`HTTP_ERROR:${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw new Error("TIMEOUT");
    if (!navigator.onLine) throw new Error("NO_CONNECTION");
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
  const raw = await fetchWithTimeout(`${BASE_URL}/monsters/${index}`);
  return normalizeMonster(raw);
}

export async function fetchSpellList() {
  const data = await fetchWithTimeout(`${BASE_URL}/spells`);
  return data.results;
}

export async function fetchSpellByIndex(index) {
  return await fetchWithTimeout(`${BASE_URL}/spells/${index}`);
}

export function parseApiError(error) {
  if (error.message === "TIMEOUT") {
    return {
      code: "408",
      message: "A API demorou muito para responder. Tente novamente.",
    };
  }

  if (error.message === "NO_CONNECTION") {
    return {
      code: "—",
      message: "Sem conexão com a internet. Verifique sua rede.",
    };
  }

  if (error.message.startsWith("HTTP_ERROR:")) {
    const code = error.message.replace("HTTP_ERROR:", "");
    const labels = {
      "400": "Requisição inválida",
      "404": "Recurso não encontrado",
      "500": "Erro Interno do Servidor",
      "503": "Serviço temporariamente indisponível",
    };
    return {
      code,
      message: `Erro na API: ${labels[code] ?? `Código ${code}`}`,
    };
  }

  return {
    code: "ERR",
    message: `Erro inesperado: ${error.message}`,
  };
}