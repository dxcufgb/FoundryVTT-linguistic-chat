# Linguistic Chat (FoundryVTT v13)

Adds a **Speaking** dropdown above the chat box. Pick one of the languages your character knows and your message is sent in that language:

- Characters who know the language see your message in plain text (tagged with the language name).
- Everyone else sees a word-for-word rendering in that language's fantasy-sounding words, which reads as gibberish to them.
- GMs see everything in plain text (toggle in module settings).

## How the gibberish is made (no external service)
No translation service knows Elvish or Dwarvish, so words are generated offline. Each language has its own sound style (Elvish is soft and flowing, Orc harsh, Deep Speech guttural with apostrophes, Thieves' Cant slangy, Common Sign Language shows `*gestures*`, etc.). Each English word is turned into a fantasy word built from that style's sounds, deterministically, so the same word is always the same in a given language. Every English → fantasy pair is also saved in a local dictionary (client setting `translationCache`) and reused. The sender generates the text once and stores it on the chat message, so all viewers see identical text. Primordial dialects (Aquan, Auran, Ignan, Terran) share a style but have different words.

## Who knows what
- Configure via *Module Settings → Linguistic Chat → Manage Languages* (GM): define languages (`id | Label | sound style | universal`) and list language ids per character.
- **The language list comes from the active game system** (`CONFIG.DND5E.languages` for D&D 5e, `CONFIG.PF2E.languages` for Pathfinder 2e, `CONFIG.<SYSTEM>.languages` for other systems that define it). Systems that define none fall back to the built-in D&D 5e/5.5e list. Character languages are read from the system's own traits (dnd5e `traits.languages`, pf2e `details.languages`, including custom entries) in addition to the module's per-character list.
- Each language is mapped to a sound style; known ids have a fixed one, others get one assigned deterministically. The GM can override styles, labels or add extra languages in *Manage Languages* (only differences from the system list are stored). The dialog includes a live **preview**: pick a language, type some text, and see how it will sound (nothing is saved to the dictionary by previewing).
- A user speaks/listens as their assigned character plus any controlled tokens. Universal languages (Common) are always known.

## Known PoC limitations
- The original text is kept in the message content (needed so knowers see plain text), so a technically savvy player could read it from the message data. Not secure against cheating.
- Inline rolls / enrichers are not processed in translated messages; `/commands` are never translated.
- Already-rendered messages don't refresh when you change controlled token; reload the chat to update.
- Untested inside a live Foundry instance (written against the v13 API; syntax and word generation verified with Node).

## Install
Copy this folder to `Data/modules/linguistic-chat` and enable it in your world.
