export const MODULE_ID = "dxcufgbs-linguistic-chat";

/**
 * Sound style (see translator.js STYLES) used to generate each language's words.
 * Ids match the dnd5e / pf2e system keys; unknown ids get a style assigned by hash.
 */
export const STYLE_MAP = {
  common: "common", csl: "sign",
  dwarvish: "dwarvish", dwarven: "dwarvish", elvish: "elvish", elven: "elvish", giant: "giant", jotun: "giant",
  gnomish: "gnomish", gnome: "gnomish", goblin: "goblin", halfling: "halfling", orc: "orc", orcish: "orc",
  abyssal: "abyssal", celestial: "celestial", deep: "deep", aklo: "deep", draconic: "draconic",
  infernal: "infernal", primordial: "primordial", aquan: "primordial", auran: "primordial",
  ignan: "primordial", terran: "primordial", sylvan: "sylvan", fey: "sylvan", undercommon: "undercommon",
  shadowtongue: "undercommon", druidic: "druidic", cant: "cant", thieves_cant: "cant", gnoll: "goblin",
  aarakocra: "sylvan", gith: "undercommon", necril: "infernal", petran: "giant"
};

/** Fallback language list for systems that don't define their own. */
export const DEFAULT_LANGUAGES = [
  "common", "csl", "dwarvish", "elvish", "giant", "gnomish", "goblin", "halfling", "orc",
  "abyssal", "celestial", "deep", "draconic", "infernal", "primordial", "sylvan", "undercommon",
  "druidic", "cant"
].map(id => ({ id, label: {
  common: "Common", csl: "Common Sign Language", dwarvish: "Dwarvish", elvish: "Elvish", giant: "Giant",
  gnomish: "Gnomish", goblin: "Goblin", halfling: "Halfling", orc: "Orc", abyssal: "Abyssal",
  celestial: "Celestial", deep: "Deep Speech", draconic: "Draconic", infernal: "Infernal",
  primordial: "Primordial", sylvan: "Sylvan", undercommon: "Undercommon", druidic: "Druidic", cant: "Thieves' Cant"
}[id] }));
