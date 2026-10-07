# Linguistic Chat (FoundryVTT v13)

Adds a **Speaking** dropdown above the chat box. Pick one of the languages your character knows and your message is sent in that language:

- Characters who know the language see your message in plain text (tagged with the language name).
- Everyone else sees a word-for-word translation into a real language, which reads as gibberish to them.
- GMs see everything in plain text (toggle in module settings).

## Translation & local cache
Each word is translated with the free [MyMemory](https://mymemory.translated.net) API (no key needed; anonymous quota applies). Every translated word is stored in a local cache (client setting `translationCache`), so a word is only ever fetched once per target language. If the service is unreachable, over quota, or disabled in settings, a deterministic offline pseudo-word is used instead (not cached, so it is retried later). The sender translates once and the result is stored on the chat message, so all viewers see identical text.

## Who knows what
- Configure via *Module Settings → Linguistic Chat → Manage Languages* (GM): define languages (`id | Label | real-language code | universal`) and list language ids per character.
- **The language list comes from the active game system** (`CONFIG.DND5E.languages` for D&D 5e, `CONFIG.PF2E.languages` for Pathfinder 2e, `CONFIG.<SYSTEM>.languages` for other systems that define it). Systems that define none fall back to the built-in D&D 5e/5.5e list. Character languages are read from the system's own traits (dnd5e `traits.languages`, pf2e `details.languages`, including custom entries) in addition to the module's per-character list.
- Each language is mapped to a real language for the gibberish; known ids have a fixed mapping, others get one assigned deterministically. The GM can override codes, labels or add extra languages in *Manage Languages* (only differences from the system list are stored).
- A user speaks/listens as their assigned character plus any controlled tokens. Universal languages (Common) are always known.

## Known PoC limitations
- The original text is kept in the message content (needed so knowers see plain text), so a technically savvy player could read it from the message data. Not secure against cheating.
- Inline rolls / enrichers are not processed in translated messages; `/commands` are never translated.
- Already-rendered messages don't refresh when you change controlled token; reload the chat to update.
- Untested inside a live Foundry instance (written against the v13 API; syntax and translation cache logic verified with Node).

## Install
Copy this folder to `Data/modules/linguistic-chat` and enable it in your world.
