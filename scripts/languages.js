import { MODULE_ID, DEFAULT_LANGUAGES, STYLE_MAP, DIALECTS } from "./constants.js";
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

/** The active system's language config object, if it has one. */
const systemLanguageConfig = () => {
  const sys = game.system.id;
  const cfg = CONFIG[sys.toUpperCase()] ?? CONFIG[sys];
  return cfg?.languages && typeof cfg.languages === "object" ? cfg.languages : null;
};

/**
 * Add missing dialects (Aquan, Auran, Ignan, Terran) under their parent language in the system's config,
 * so character sheets can tick them. Nested configs (dnd5e) get them as the parent's `children`,
 * flat configs (and top-level parents) as extra entries next to the parent. Does nothing if the system has no such parent or already lists a dialect.
 */
export function addSystemDialects() {
  const config = systemLanguageConfig();
  if (!config) return;
  const nested = Object.values(config).some(v => v && typeof v === "object" && v.children);
  const keys = new Set();
  const collect = obj => {
    for (const [k, v] of Object.entries(obj ?? {})) {
      keys.add(k.toLowerCase());
      if (v && typeof v === "object") collect(v.children);
    }
  };
  collect(config);
  const findParent = (obj, id) => {
    for (const [k, v] of Object.entries(obj ?? {})) {
      if (k.toLowerCase() === id) return { obj, key: k };
      const found = v && typeof v === "object" ? findParent(v.children, id) : null;
      if (found) return found;
    }
    return null;
  };
  for (const [parent, dialects] of Object.entries(DIALECTS)) {
    if (Object.keys(dialects).some(d => keys.has(d))) continue;
    const at = findParent(config, parent);
    if (!at) continue;
    if (nested && at.obj !== config) { // top-level entries with children are read as categories
      const val = at.obj[at.key];
      const entry = val && typeof val === "object" ? val : { label: val };
      entry.children = { ...(entry.children ?? {}), ...dialects };
      at.obj[at.key] = entry;
    } else {
      Object.assign(at.obj, dialects);
    }
  }
  systemCache = null;
}

/** The languages the active game system defines (empty if it defines none). */
export function systemLanguages() {
  if (systemCache) return systemCache;
  const config = systemLanguageConfig();
  let list = config ? flatten(config) : [];
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

/** With the `dialectsShared` setting on, knowing a parent language or any of its dialects means knowing them all. */
export function withDialects(ids) {
  if (!game.settings.get(MODULE_ID, "dialectsShared")) return ids;
  for (const [parent, dialects] of Object.entries(DIALECTS)) {
    const family = [parent, ...Object.keys(dialects)];
    if (family.some(id => ids.has(id))) for (const id of family) ids.add(id);
  }
  return ids;
}

/** Language ids the current user (or the given actors) can speak/understand. */
export function knownLanguageIds(actors = userActors()) {
  const known = new Set(getLanguages().filter(l => l.universal).map(l => l.id));
  for (const actor of actors) for (const id of actorLanguageIds(actor)) known.add(id);
  return withDialects(known);
}
