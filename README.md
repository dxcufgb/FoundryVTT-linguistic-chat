# Dxcufgb's Linguistic Chat (FoundryVTT v13)

[![Foundry v13](https://img.shields.io/github/v/release/dxcufgb/FoundryVTT-linguistic-chat?label=Foundry%20v13&logo=foundryvirtualtabletop&color=ff6400)](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/dxcufgb/FoundryVTT-linguistic-chat/module.zip?label=downloads&color=blue)](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/releases)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-support-FF5E5B?logo=kofi&logoColor=white)](https://ko-fi.com/dxcufgb)\
[![CI](https://img.shields.io/github/actions/workflow/status/dxcufgb/FoundryVTT-linguistic-chat/ci.yml?branch=main&label=CI)](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/dxcufgb/FoundryVTT-linguistic-chat)](LICENSE)

<a href="https://dxcufgb.github.io/FVTT-dev-showcase/"><img src="https://dxcufgb.github.io/FVTT-dev-showcase/assets/img/workshop-badge.png" alt="Dxcufgb's Workshop: every Foundry VTT project, video and changelog in one place" width="650"></a>

Adds a **Speaking** dropdown above the chat box. Pick one of the languages your character knows and your message is sent in that language (leave it on **Common (plain)** to chat normally):

- Characters who know the language see your message in plain text (tagged with the language name).
- Everyone else sees a word-for-word rendering in that language's fantasy-sounding words, which reads as gibberish to them.
- You always see your own messages in plain text.
- GMs see everything in plain text (world setting **GM understands every language**, on by default).

## How the gibberish is made (no external service)
No translation service knows Elvish or Dwarvish, so words are generated offline. Each language has its own sound style (Elvish is soft and flowing, Orc harsh, Deep Speech guttural with apostrophes, Thieves' Cant slangy, Common Sign Language shows `*gestures*`, etc.). Each English word is turned into a fantasy word built from that style's sounds, deterministically, so the same word is always the same in a given language. Every English → fantasy pair is also saved in a local dictionary (client setting `translationCache`) and reused. The sender generates the text once and stores it on the chat message, so all viewers see identical text. Primordial dialects (Aquan, Auran, Ignan, Terran) share a style but have different words.

## Who knows what
- Configure via *Module Settings → Dxcufgb's Linguistic Chat → Manage Languages* (GM): define languages (`id | Label | sound style | universal`) and list language ids per character.
- **The language list comes from the active game system** (`CONFIG.DND5E.languages` for D&D 5e, `CONFIG.PF2E.languages` for Pathfinder 2e, `CONFIG.<SYSTEM>.languages` for other systems that define it). Systems that define none fall back to the built-in D&D 5e/5.5e list. Character languages are read from the system's own traits (dnd5e `traits.languages`, pf2e `details.languages`, including custom entries) in addition to the module's per-character list.
- Each language is mapped to a sound style; known ids have a fixed one, others get one assigned deterministically. The GM can override styles, labels or add extra languages in *Manage Languages* (only differences from the system list are stored). The dialog includes a live **preview**: pick a language, type some text, and see how it will sound (nothing is saved to the dictionary by previewing).
- A user speaks/listens as their assigned character plus any controlled tokens. Universal languages (Common) are always known.
- If the language picked in the **Speaking** dropdown is no longer known (for example after switching token), the message is sent as plain text instead. GMs can speak any language.
- **Primordial dialects:** Aquan, Auran, Ignan and Terran are separate languages under Primordial. D&D 5e already lists them under Primordial in the character sheet's language picker; for other systems that have a Primordial language but no dialects, the module adds them to the system's language list so they can be ticked on the sheet too (and they are in the built-in fallback list). With the world setting *Dialects are mutually understood* (on by default), a character who knows Primordial or any of its dialects understands and can speak all of them; turn it off to treat each dialect as its own language.
- **Pathfinder 2e elemental languages** (Sussuran, Petran, Pyric, Talican, Thalassic, Muan) use the same Primordial sound style but stay separate languages: knowing one does not let you understand the others.

## Known PoC limitations
- The original text is kept in the message content (needed so knowers see plain text), so a technically savvy player could read it from the message data. Not secure against cheating.
- Inline rolls / enrichers are not processed in translated messages; `/commands` are never translated.
- Already-rendered messages don't refresh when you change controlled token; reload the chat to update.
- Tested in a live game with dnd5e 5.2.5. Other systems (e.g. Pathfinder) are not tested yet.

## Installing in Foundry

Requires Foundry VTT **v13**. Works with any system; D&D 5e and Pathfinder 2e get their language lists automatically.

### Option 1: Manual install
1. Get the files: `git clone https://github.com/dxcufgb/FoundryVTT-linguistic-chat.git` (or download the repository as a ZIP and extract it).
2. Put the folder in Foundry's user data `modules` directory. **The folder must be named `dxcufgbs-linguistic-chat`** (it must match the `id` in `module.json`, so rename the cloned/extracted folder). Typical locations:
   - Windows: `%localappdata%\FoundryVTT\Data\modules\dxcufgbs-linguistic-chat`
   - macOS: `~/Library/Application Support/FoundryVTT/Data/modules/dxcufgbs-linguistic-chat`
   - Linux: `~/.local/share/FoundryVTT/Data/modules/dxcufgbs-linguistic-chat`
   - Hosted/Docker setups: the `Data/modules` folder inside your data volume.
   (Check *Configuration → User Data Path* in Foundry's setup screen if unsure.)
3. Restart Foundry (or return to the setup screen and refresh) so the module is detected.

### Option 2: Manifest URL
In Foundry: *Add-on Modules → Install Module*, paste

`https://github.com/dxcufgb/FoundryVTT-linguistic-chat/releases/latest/download/module.json`

and click **Install**.

### Enabling it
1. Launch your world as GM, open *Game Settings → Manage Modules*, tick **Dxcufgb's Linguistic Chat**, and save. The world reloads.
2. Open *Game Settings → Configure Settings → Dxcufgb's Linguistic Chat → Manage Languages* to review the languages, preview how each sounds, and assign languages to characters (dnd5e/pf2e language traits are picked up automatically).
3. Players will see a **Speaking** dropdown above the chat box listing the languages their character knows.

## For other modules

### API
`game.modules.get("dxcufgbs-linguistic-chat").api` is set in `init`, so it is there from `setup` on.

| Function | |
|---|---|
| `knownLanguages(actor)` | Array of the language ids the actor knows: the same list the module uses to decide who understands a message. Universal languages (Common), the languages on the character sheet, the extra languages a GM added in *Manage Languages*, and the whole dialect family when *Dialects are mutually understood* is on. Without an actor, only the universal languages. |
| `languages()` | Array of the available languages as `{id, label}`: the system's list plus the GM's changes from *Manage Languages*. |

### From another module

```js
const MOD = "dxcufgbs-linguistic-chat";
const api = game.modules.get(MOD)?.active ? game.modules.get(MOD).api : null;

// Which languages does this character know?
const actor = game.user.character;
const known = api?.knownLanguages(actor) ?? [];         // e.g. ["common", "elvish", "dwarvish"]
const speaksElvish = known.includes("elvish");

// All languages with their display names:
for (const { id, label } of api?.languages() ?? []) console.log(id, label);

// After a GM saves the Manage Languages dialog (language definitions and character languages).
Hooks.on(`${MOD}.languagesChanged`, () => console.log("languages changed"));

// A chat message sent in a language carries these flags (plain messages have none):
Hooks.on("createChatMessage", message => {
  const language = message.getFlag(MOD, "language");    // language id, e.g. "elvish"
  if (!language) return;
  const label = message.getFlag(MOD, "label");          // display name, e.g. "Elvish"
  const gibberish = message.getFlag(MOD, "translated"); // the text listeners who don't know it see
  console.log(label, gibberish, message.content);       // content is the original text, HTML-escaped
});
```

- `dxcufgbs-linguistic-chat.languagesChanged` is called with `Hooks.callAll` and no arguments, and only on the client of the GM who saved.
- The chat message flags are written by the module; read them, don't change them.
- The actor flag `languages` is internal: it holds only the GM's extra languages, not the ones on the sheet, and may change. Use `api.knownLanguages(actor)` instead.

## Development & releases
- **CI** (`.github/workflows/ci.yml`) runs on every push and pull request: it validates `module.json`, parses the scripts, checks `lang/en.json`, imports the module against stubbed Foundry globals, and dry-runs the release packaging. The checks live in [dxcufgb/foundry-module-ci](https://github.com/dxcufgb/foundry-module-ci), shared by all modules.
- **Releasing:** *Actions → Release module → Run workflow*, type the version (for example `1.2.3`) and run it. The module is checked and packaged first; only then is the release `v1.2.3` published with `module.json` and `module.zip` (version and URLs stamped from the tag). The manifest URL above always points at the newest release.
- **Pull request review:** every non-draft PR gets an automatic Claude code review (`.github/workflows/claude.yml`, rules for the reviewer in `CLAUDE.md`), and `@claude` in a PR/issue comment asks a question or requests a change. This needs a `CLAUDE_CODE_OAUTH_TOKEN` repository secret (create one with `claude setup-token`).
- **Workflow lint:** changes to `.github/` are checked with actionlint and zizmor; Dependabot keeps the pinned actions up to date weekly.
