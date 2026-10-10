# Dxcufgb's Linguistic Chat

FoundryVTT v13 module (id `dxcufgbs-linguistic-chat`, the install folder must have the same name). Adds a
"Speaking" language dropdown above the chat box; listeners who don't know the language see generated
fantasy-word gibberish instead of the message. No build step and no npm dependencies.

## Layout
- `scripts/main.js` – settings, chat-box selector, `chatMessage` hook (sending) and `renderChatMessageHTML` hook (display).
- `scripts/languages.js` – language list from the active system (`CONFIG.DND5E.languages`, `CONFIG.PF2E.languages`, ...), GM overrides, which languages a user/actor knows.
- `scripts/translator.js` – offline per-language word generation (`STYLES`) and the local dictionary (`translationCache` setting).
- `scripts/manager.js` – the *Manage Languages* dialog, including the live preview.
- `scripts/constants.js` – `MODULE_ID`, fallback language list, language-id → sound-style map.
- `.github/ci/check-module.mjs` – the CI check (`node .github/ci/check-module.mjs`); `.github/ci/package.sh` builds the release zip.

## Conventions
- `MODULE_ID` must equal `id` in `module.json`; CI checks it.
- Every visible setting needs a Name and Hint in `lang/en.json`.
- Update `README.md` when behaviour or settings change.

## Review focus
- **Rendering**: message text from flags (`translated`, `label`) must be set with `textContent`, never `innerHTML`. Sent message content is HTML-escaped before creation.
- **Determinism**: the same word in the same language must always generate the same fantasy word; changing `STYLES` or `fantasyWord` changes every word not already in the saved dictionary, so call that out in the PR.
- **Who sees what**: players who don't know a language must never see the original in the rendered message; GMs see everything only if the `gmSeesAll` setting is on.
- **System independence**: language lookup must not throw on systems with no `CONFIG.<SYSTEM>.languages`.
- Never add an external network call: the module is intentionally offline.
