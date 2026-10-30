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

## Installation

Requires Foundry VTT **v13**. Works with any system; D&D 5e and Pathfinder 2e get their language lists automatically.

In Foundry: *Add-on Modules → Install Module*, paste

`https://github.com/dxcufgb/FoundryVTT-linguistic-chat/releases/latest/download/module.json`

and click **Install**.

Manual install and enabling the module in your world: see [Installation](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/wiki/Installation) in the wiki.

## Documentation

The full guide is in the [wiki](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/wiki):

- [Speaking in a Language](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/wiki/Speaking-in-a-Language): the **Speaking** dropdown and who sees what
- [Managing Languages](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/wiki/Managing-Languages): system language lists and characters' languages
- [Dialects](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/wiki/Dialects): Primordial dialects and Pathfinder 2e elemental languages
- [How the Gibberish Is Made](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/wiki/How-the-Gibberish-Is-Made): offline, no external service
- [Settings](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/wiki/Settings): the module's settings
- [Known Limitations](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/wiki/Known-Limitations): what this proof of concept does not do
- [API](https://github.com/dxcufgb/FoundryVTT-linguistic-chat/wiki/API): for other modules

## Development & releases
- **CI** (`.github/workflows/ci.yml`) runs on every push and pull request: it validates `module.json`, parses the scripts, checks `lang/en.json`, imports the module against stubbed Foundry globals, and dry-runs the release packaging. The checks live in [dxcufgb/foundry-module-ci](https://github.com/dxcufgb/foundry-module-ci), shared by all modules.
- **Releasing:** *Actions → Release module → Run workflow*, type the version (for example `1.2.3`) and run it. The module is checked and packaged first; only then is the release `v1.2.3` published with `module.json` and `module.zip` (version and URLs stamped from the tag). The manifest URL above always points at the newest release.
- **Pull request review:** every non-draft PR gets an automatic Claude code review (`.github/workflows/claude.yml`, rules for the reviewer in `CLAUDE.md`), and `@claude` in a PR/issue comment asks a question or requests a change. This needs a `CLAUDE_CODE_OAUTH_TOKEN` repository secret (create one with `claude setup-token`).
- **Workflow lint:** changes to `.github/` are checked with actionlint and zizmor; Dependabot keeps the pinned actions up to date weekly.
