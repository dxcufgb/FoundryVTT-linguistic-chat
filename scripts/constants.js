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
