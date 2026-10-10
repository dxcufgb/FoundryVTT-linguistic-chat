import { MODULE_ID, DEFAULT_LANGUAGES, STYLE_MAP } from "./constants.js";
import { styleFor } from "./translator.js";

const localize = v => (typeof v === "string" ? game.i18n.localize(v) : String(v ?? ""));

const styleOf = id => styleFor(STYLE_MAP[id] ?? id);

/** Flatten a system language config (flat, or dnd5e-style nested with `children`). */
function flatten(config, depth = 0, out = []) {
  for (const [key, val] of Object.entries(config ?? {})) {
    const isObj = val && typeof val === "object";
    const children = isObj ? val.children : null;
    if (children && depth === 0) { flatten(children, depth + 1, out); continue; } // category (Standard/Exotic)
    out.push({ id: key.toLowerCase(), label: localize(isObj ? val.label : val) });
    if (children) flatten(children, depth + 1, out);
  }
  return out;
}

let systemCache = null;

/** The languages the active game system defines (empty if it defines none). */
export function systemLanguages() {
  if (systemCache) return systemCache;
  const sys = game.system.id;
  const cfg = CONFIG[sys.toUpperCase()] ?? CONFIG[sys];
  let list = cfg?.languages ? flatten(cfg.languages) : [];
  if (!list.length) list = DEFAULT_LANGUAGES.map(l => ({ id: l.id, label: l.label }));
  const seen = new Set();
  systemCache = list.filter(l => l.label && !seen.has(l.id) && seen.add(l.id)).map(l => ({
    id: l.id, label: l.label, style: styleOf(l.id), universal: l.id === "common"
  }));
  if (!systemCache.some(l => l.universal)) systemCache.unshift({ id: "common", label: "Common", style: "common", universal: true });
  return systemCache;
}

/** System languages plus any GM overrides/additions (matched by id). */
export function getLanguages() {
  const overrides = game.settings.get(MODULE_ID, "languages");
  const list = systemLanguages().map(l => ({ ...l }));
  for (const o of Array.isArray(overrides) ? overrides : []) {
    const existing = list.find(l => l.id === o.id);
    if (existing) Object.assign(existing, o);
    else list.push({ ...o });
  }
  return list;
}

/** Reduce a full language list to only what differs from the system's list. */
export function diffFromSystem(list) {
  const sys = systemLanguages();
  return list.filter(l => {
    const s = sys.find(x => x.id === l.id);
    return !s || s.label !== l.label || s.style !== l.style || !!s.universal !== !!l.universal;
  });
}

export function getLanguage(id) {
  return getLanguages().find(l => l.id === id);
}

/** Map a dnd5e key ("exotic:deep"), id, or label ("Deep Speech") to a language id. */
const normalize = key => {
  const k = String(key).split(":").pop().trim().toLowerCase();
  const match = getLanguages().find(l => l.id === k || l.label.toLowerCase() === k);
  return match ? match.id : k;
};

/** Language ids the game system records on the actor (dnd5e: system.traits.languages.value + custom; pf2e: system.details.languages). */
export function systemLanguageIds(actor) {
  const ids = new Set();
  const traits = actor?.system?.traits?.languages ?? actor?.system?.details?.languages;
  if (traits) {
    for (const key of traits.value ?? []) ids.add(normalize(key));
    for (const c of String(traits.custom ?? "").split(/[;,]/)) if (c.trim()) ids.add(normalize(c));
  }
  return ids;
}

/** Language ids added through this module's Manage Languages dialog. */
export function flagLanguageIds(actor) {
  return new Set([...(actor?.getFlag(MODULE_ID, "languages") ?? [])].map(normalize));
}

/** Language ids an actor knows: the system's own traits plus the module's extras. */
export function actorLanguageIds(actor) {
  return new Set([...systemLanguageIds(actor), ...flagLanguageIds(actor)]);
}

/** Actors the given user currently speaks/listens as. */
export function userActors(user = game.user) {
  const actors = new Set();
  if (user.character) actors.add(user.character);
  if (user.id === game.user.id) {
    for (const t of canvas?.tokens?.controlled ?? []) if (t.actor) actors.add(t.actor);
  }
  return [...actors];
}

/** Language ids the current user can speak/understand. */
export function knownLanguageIds() {
  const known = new Set(getLanguages().filter(l => l.universal).map(l => l.id));
  for (const actor of userActors()) for (const id of actorLanguageIds(actor)) known.add(id);
  return known;
}
