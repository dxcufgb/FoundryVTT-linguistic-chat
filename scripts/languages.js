import { MODULE_ID, DEFAULT_LANGUAGES } from "./constants.js";

export function getLanguages() {
  const stored = game.settings.get(MODULE_ID, "languages");
  return Array.isArray(stored) && stored.length ? stored : DEFAULT_LANGUAGES;
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

/** Language ids an actor knows: our flag, plus dnd5e traits when present. */
export function actorLanguageIds(actor) {
  const ids = new Set();
  for (const id of actor?.getFlag(MODULE_ID, "languages") ?? []) ids.add(normalize(id));
  const traits = actor?.system?.traits?.languages;
  if (traits) {
    for (const key of traits.value ?? []) ids.add(normalize(key));
    for (const c of String(traits.custom ?? "").split(/[;,]/)) if (c.trim()) ids.add(normalize(c));
  }
  return ids;
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
