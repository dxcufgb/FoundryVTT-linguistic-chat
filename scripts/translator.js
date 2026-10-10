import { MODULE_ID } from "./constants.js";

const WORD_RE = /[\p{L}][\p{L}'’-]*/gu;
const ENDPOINT = "https://api.mymemory.translated.net/get";
const MAX_ONLINE_WORDS = 40;
const CONCURRENCY = 4;
const TIMEOUT_MS = 6000;

let saveTimer = null;

function cache() {
  return game.settings.get(MODULE_ID, "translationCache");
}

function saveCacheSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => game.settings.set(MODULE_ID, "translationCache", cache()), 1000);
}

function applyCase(source, target) {
  if (source.length > 1 && source === source.toUpperCase()) return target.toUpperCase();
  if (source[0] !== source[0].toLowerCase()) return target.charAt(0).toUpperCase() + target.slice(1);
  return target;
}

function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}

/** Deterministic pronounceable nonsense; used when online translation is unavailable. */
export function pseudoWord(word, code) {
  let seed = hash(`${code}:${word}`);
  const rnd = () => (seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296;
  const C = "bdfgklmnprstvzh", V = "aeiou";
  let out = "";
  while (out.length < Math.max(2, word.length)) out += C[Math.floor(rnd() * C.length)] + V[Math.floor(rnd() * V.length)];
  return out.slice(0, Math.max(2, word.length));
}

async function fetchWord(word, code) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const url = `${ENDPOINT}?q=${encodeURIComponent(word)}&langpair=en|${code}`;
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.responseData?.translatedText;
    if (Number(data?.responseStatus) !== 200 || !text || /MYMEMORY WARNING/i.test(text)) return null;
    return text.trim().toLowerCase();
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Translate English text word by word into the given language code.
 * Looks each word up in the local cache first; only misses hit the network.
 */
export async function translateText(text, code) {
  const store = cache();
  const table = (store[code] ??= {});
  const online = game.settings.get(MODULE_ID, "onlineTranslation");
  const words = [...new Set((text.match(WORD_RE) ?? []).map(w => w.toLowerCase()))];
  const missing = words.filter(w => !(w in table));

  if (online && missing.length) {
    const queue = missing.slice(0, MAX_ONLINE_WORDS);
    let dirty = false;
    const worker = async () => {
      while (queue.length) {
        const w = queue.shift();
        const t = await fetchWord(w, code);
        if (t) { table[w] = t; dirty = true; }
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    if (dirty) saveCacheSoon();
  }

  return text.replace(WORD_RE, w => applyCase(w, table[w.toLowerCase()] ?? pseudoWord(w.toLowerCase(), code)));
}
