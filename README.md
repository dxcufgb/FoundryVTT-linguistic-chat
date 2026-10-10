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

## Installing in Foundry

Requires Foundry VTT **v13**. Works with any system; D&D 5e and Pathfinder 2e get their language lists automatically.

### Option 1: Manual install (works today)
1. Get the files: `git clone https://github.com/dxcufgb/FoundryVTT-linguistic-chat.git` (or download the repository as a ZIP and extract it).
2. Put the folder in Foundry's user data `modules` directory. **The folder must be named `linguistic-chat`** (it must match the `id` in `module.json`, so rename the cloned/extracted folder). Typical locations:
   - Windows: `%localappdata%\FoundryVTT\Data\modules\linguistic-chat`
   - macOS: `~/Library/Application Support/FoundryVTT/Data/modules/linguistic-chat`
   - Linux: `~/.local/share/FoundryVTT/Data/modules/linguistic-chat`
   - Hosted/Docker setups: the `Data/modules` folder inside your data volume.
   (Check *Configuration → User Data Path* in Foundry's setup screen if unsure.)
3. Restart Foundry (or return to the setup screen and refresh) so the module is detected.

### Option 2: Manifest URL (once a release is published)
`module.json` already points at `https://github.com/dxcufgb/FoundryVTT-linguistic-chat/releases/latest/download/module.json`. This only works after a GitHub release is published with `module.json` and a `module.zip` (containing the module files at the zip root) attached. No release exists yet, so use Option 1 for now. After that: *Add-on Modules → Install Module → paste the manifest URL → Install*.

### Enabling it
1. Launch your world as GM, open *Game Settings → Manage Modules*, tick **Linguistic Chat**, and save. The world reloads.
2. Open *Game Settings → Configure Settings → Linguistic Chat → Manage Languages* to review the languages, preview how each sounds, and assign languages to characters (dnd5e/pf2e language traits are picked up automatically).
3. Players will see a **Speaking** dropdown above the chat box listing the languages their character knows.
