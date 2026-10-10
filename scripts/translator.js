import { MODULE_ID } from "./constants.js";

const WORD_RE = /[\p{L}][\p{L}'’-]*/gu;

/**
 * Phonology per language style. Each English word is turned into a nonsense word built from
 * these sounds, so every language "sounds" different. Generation is deterministic, so the same
 * word always maps to the same fantasy word (and is also stored in a local dictionary).
 *   onset/vowel/coda: sound pools; onsetP/codaP: chance a syllable has one; join: syllable joiner,
 *   joinP: chance the joiner is used between two syllables; fixed: pick whole tokens instead.
 */
export const STYLES = {
  elvish:      { onset: ["l", "n", "r", "th", "s", "v", "f", "m", "el", "ae", "y", "ll"], vowel: ["a", "e", "i", "ae", "ia", "ei", "o", "ui", "ó", "é"], coda: ["l", "n", "r", "s", "th"], onsetP: 0.8, codaP: 0.25 },
  dwarvish:    { onset: ["d", "b", "k", "g", "th", "r", "br", "dr", "kh", "z", "m", "gr"], vowel: ["a", "o", "u", "i", "ú", "á"], coda: ["r", "k", "m", "n", "d", "ng", "rn", "ld", "z"], onsetP: 0.9, codaP: 0.75 },
  giant:       { onset: ["g", "b", "gr", "th", "j", "h", "br", "dr", "kr"], vowel: ["o", "u", "oo", "a", "au", "ou"], coda: ["m", "r", "ng", "rk", "th", "g", "mp"], onsetP: 0.8, codaP: 0.8 },
  gnomish:     { onset: ["g", "n", "f", "t", "p", "b", "w", "z", "k", "gl", "fl"], vowel: ["i", "e", "a", "ee", "y", "ib", "o"], coda: ["x", "z", "t", "ck", "p", "b", "nk"], onsetP: 0.9, codaP: 0.55, join: "-", joinP: 0.25 },
  goblin:      { onset: ["g", "k", "sk", "gr", "z", "sn", "kr", "b", "r", "gh"], vowel: ["i", "u", "a", "ee", "ik"], coda: ["k", "sh", "g", "t", "z", "ck", "x"], onsetP: 0.9, codaP: 0.8 },
  halfling:    { onset: ["b", "p", "m", "t", "w", "h", "d", "f", "br", "pip", "n"], vowel: ["o", "a", "e", "i", "oo", "ay"], coda: ["n", "m", "b", "p", "ly", "dle", "ck"], onsetP: 0.85, codaP: 0.4 },
  orc:         { onset: ["gr", "ug", "m", "kr", "z", "dr", "gh", "th", "r", "b", "sh"], vowel: ["u", "o", "a", "ug", "ar"], coda: ["k", "g", "sh", "z", "gh", "rk", "ng", "gg", "r"], onsetP: 0.9, codaP: 0.9, join: "'", joinP: 0.2 },
  abyssal:     { onset: ["z", "x", "v", "k", "th", "bal", "mor", "gh", "sz", "r"], vowel: ["a", "o", "u", "e", "ae", "a'"], coda: ["x", "z", "th", "g", "r", "k", "oth", "gul"], onsetP: 0.85, codaP: 0.8, join: "'", joinP: 0.3 },
  celestial:   { onset: ["s", "l", "m", "h", "v", "n", "el", "ael", "ser", "ph", "th"], vowel: ["a", "e", "i", "o", "ae", "ia", "io", "ie"], coda: ["l", "n", "s", "m", "el", "iel", "ah"], onsetP: 0.75, codaP: 0.35 },
  deep:        { onset: ["gl", "zh", "q", "kh", "ph", "thl", "ng", "vh", "xh", "sh", "ul"], vowel: ["u", "a", "i", "o", "uu", "ä", "ö"], coda: ["gl", "q", "th", "zz", "rl", "ng", "hh", "kth", "'g"], onsetP: 0.9, codaP: 0.85, join: "'", joinP: 0.35 },
  draconic:    { onset: ["k", "th", "v", "sh", "r", "d", "z", "kr", "dr", "j", "s"], vowel: ["a", "i", "o", "e", "aa", "ae", "ir", "or"], coda: ["x", "th", "rr", "ss", "k", "ax", "rax", "nn"], onsetP: 0.9, codaP: 0.7 },
  infernal:    { onset: ["m", "b", "d", "n", "v", "az", "mal", "bel", "ph", "r", "s"], vowel: ["a", "e", "i", "o", "u", "ia", "eo"], coda: ["s", "m", "th", "x", "us", "ath", "oth", "ium"], onsetP: 0.85, codaP: 0.75 },
  primordial:  { onset: ["r", "ur", "th", "kr", "sh", "w", "fl", "v", "z", "m", "br"], vowel: ["a", "u", "oo", "aa", "o", "au", "i"], coda: ["r", "sh", "m", "n", "th", "rr", "ss", "ll", "k"], onsetP: 0.8, codaP: 0.65 },
  sylvan:      { onset: ["l", "f", "w", "s", "v", "n", "fl", "sy", "th", "br", "ty", "lh"], vowel: ["i", "e", "a", "ee", "ia", "ae", "y", "ei", "oi"], coda: ["l", "n", "s", "th", "ll", "wyn", "ie"], onsetP: 0.8, codaP: 0.3, join: "'", joinP: 0.1 },
  undercommon: { onset: ["z", "v", "x", "l", "dr", "ss", "ilh", "k", "q", "n", "ph"], vowel: ["a", "i", "e", "o", "u", "ae", "ei"], coda: ["z", "th", "x", "ss", "l", "n", "ath", "yl", "ir"], onsetP: 0.85, codaP: 0.65, join: "'", joinP: 0.2 },
  druidic:     { onset: ["d", "g", "br", "c", "m", "n", "r", "t", "ll", "fh", "bh", "mh"], vowel: ["a", "i", "e", "o", "ae", "ui", "ea", "ai", "io"], coda: ["n", "d", "dh", "gh", "ch", "nn", "s", "th"], onsetP: 0.8, codaP: 0.5 },
  cant:        { onset: ["b", "p", "m", "s", "f", "d", "t", "n", "j", "sl", "tr", "g"], vowel: ["i", "u", "a", "e", "o", "oo", "ee"], coda: ["ck", "p", "ff", "z", "gger", "ish", "y", "le"], onsetP: 0.9, codaP: 0.7, join: " ", joinP: 0.0 },
  sign:        { fixed: ["*signs*", "*gestures*", "*points*", "*motions*", "*taps*", "*waves*", "*nods*", "*mimes*", "*shrugs*", "*beckons*"] }
};

const STYLE_NAMES = Object.keys(STYLES).filter(k => k !== "sign" && k !== "cant");

export function styleFor(styleOrId) {
  if (STYLES[styleOrId]) return styleOrId;
  return STYLE_NAMES[hash(String(styleOrId)) % STYLE_NAMES.length];
}

function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}

function makeRng(seedStr) {
  let seed = hash(seedStr);
  return () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
}

function applyCase(source, target) {
  if (source.length > 1 && source === source.toUpperCase()) return target.toUpperCase();
  if (source[0] !== source[0].toLowerCase()) return target.charAt(0).toUpperCase() + target.slice(1);
  return target;
}

/** Build one fantasy word for an English word in the given language. */
export function fantasyWord(word, langId, style) {
  const p = STYLES[style];
  const rnd = makeRng(`${langId}:${word}`);
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  if (p.fixed) return pick(p.fixed);
  const syllables = Math.max(1, Math.min(5, Math.round(word.length / 4)));
  let out = "";
  for (let i = 0; i < syllables; i++) {
    if (i > 0 && p.join && rnd() < p.joinP) out += p.join;
    if (rnd() < p.onsetP) out += pick(p.onset);
    out += pick(p.vowel);
    if (rnd() < p.codaP) out += pick(p.coda);
  }
  return out;
}

function dictionary() {
  return game.settings.get(MODULE_ID, "translationCache");
}

let saveTimer = null;
function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => game.settings.set(MODULE_ID, "translationCache", dictionary()), 1000);
}

/**
 * Translate English text word by word into a language's fantasy words.
 * Every English/fantasy pair is saved in a local dictionary and reused afterwards.
 * `lang` is a language definition ({ id, style }). With `save: false` nothing is written to the dictionary
 * (used for previews; already-saved words are still honoured).
 */
export function translateText(text, lang, { save = true } = {}) {
  const style = styleFor(lang.style ?? lang.id);
  const table = save ? (dictionary()[lang.id] ??= {}) : (dictionary()[lang.id] ?? {});
  let dirty = false;
  const out = text.replace(WORD_RE, w => {
    const key = w.toLowerCase();
    if (!(key in table)) {
      const word = fantasyWord(key, lang.id, style);
      if (!save) return applyCase(w, word);
      table[key] = word; dirty = true;
    }
    return applyCase(w, table[key]);
  });
  if (dirty) saveSoon();
  return out;
}
