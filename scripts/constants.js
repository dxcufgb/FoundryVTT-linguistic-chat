export const MODULE_ID = "linguistic-chat";

/** id|Label|code|universal — "code" is the real language used to build gibberish. */
/**
 * All D&D 5e (2014) and 5.5e (2024) languages. Ids match the dnd5e system's
 * language keys so character traits are picked up automatically.
 */
export const DEFAULT_LANGUAGES = [
  // Standard
  { id: "common", label: "Common", code: "en", universal: true },
  { id: "csl", label: "Common Sign Language", code: "eo" },
  { id: "dwarvish", label: "Dwarvish", code: "de" },
  { id: "elvish", label: "Elvish", code: "fi" },
  { id: "giant", label: "Giant", code: "no" },
  { id: "gnomish", label: "Gnomish", code: "nl" },
  { id: "goblin", label: "Goblin", code: "ru" },
  { id: "halfling", label: "Halfling", code: "sv" },
  { id: "orc", label: "Orc", code: "hu" },
  // Exotic / rare
  { id: "abyssal", label: "Abyssal", code: "tr" },
  { id: "celestial", label: "Celestial", code: "la" },
  { id: "deep", label: "Deep Speech", code: "mt" },
  { id: "draconic", label: "Draconic", code: "ro" },
  { id: "infernal", label: "Infernal", code: "pl" },
  { id: "primordial", label: "Primordial", code: "lt" },
  { id: "aquan", label: "Aquan (Primordial)", code: "id" },
  { id: "auran", label: "Auran (Primordial)", code: "da" },
  { id: "ignan", label: "Ignan (Primordial)", code: "sq" },
  { id: "terran", label: "Terran (Primordial)", code: "et" },
  { id: "sylvan", label: "Sylvan", code: "ga" },
  { id: "undercommon", label: "Undercommon", code: "cs" },
  // Secret
  { id: "druidic", label: "Druidic", code: "cy" },
  { id: "cant", label: "Thieves' Cant", code: "pt" },
  // Other languages in the dnd5e system
  { id: "aarakocra", label: "Aarakocra", code: "is" },
  { id: "gith", label: "Gith", code: "sk" },
  { id: "gnoll", label: "Gnoll", code: "sw" }
];

/** Real-language code used for gibberish, by language id (D&D ids are the common ones). */
export const CODE_MAP = Object.fromEntries(DEFAULT_LANGUAGES.map(l => [l.id, l.code]));

/** Extra aliases so other systems' ids reuse a sensible code. */
Object.assign(CODE_MAP, {
  dwarven: "de", elven: "fi", gnome: "nl", halfling: "sv", orcish: "hu", goblin: "ru", undercommon: "cs",
  draconic: "ro", fey: "ga", sylvan: "ga", shadowtongue: "pl", jotun: "no", jotun_: "no", celestial: "la",
  infernal: "pl", abyssal: "tr", aklo: "mt", aquan: "id", auran: "da", ignan: "sq", terran: "et",
  necril: "pt", petran: "et", utopian: "eo", sakvroth: "hu", gnoll: "sw", kholo: "sw", shoanti: "is",
  taldane: "en", hallit: "ru", skald: "no", varisian: "sk", vudrani: "lt", tien: "ja", wayang: "id"
});

/** Pool used for ids with no mapping (assigned deterministically by hash). */
export const CODE_POOL = ["de", "fi", "no", "nl", "ru", "sv", "hu", "tr", "ro", "pl", "ga", "cs", "mt", "lt", "da", "sq", "et", "sk", "is", "pt", "cy", "id", "sw", "eo"];
