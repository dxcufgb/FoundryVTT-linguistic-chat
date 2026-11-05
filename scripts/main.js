import { MODULE_ID } from "./constants.js";
import { getLanguage, getLanguages, knownLanguageIds, addSystemDialects, userActors, systemLanguages, languageSource, dialectStatus, recordableLanguageId } from "./languages.js";
import { translateText, dictionaryStats, dictionarySavePending, countWords, styleFor } from "./translator.js";
import { LanguageManager } from "./manager.js";
import { crumb, registerDebugRecorder } from "./debug-recorder.js";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

Hooks.once("init", () => {
  const s = game.settings;
  s.register(MODULE_ID, "languages", { scope: "world", config: false, type: Array, default: [] });
  s.register(MODULE_ID, "translationCache", { scope: "client", config: false, type: Object, default: {} });
  s.register(MODULE_ID, "selectedLanguage", { scope: "client", config: false, type: String, default: "", onChange: () => refreshBars() });
  s.register(MODULE_ID, "gmSeesAll", {
    name: "LINGUISTIC_CHAT.Settings.GMSeesAll.Name", hint: "LINGUISTIC_CHAT.Settings.GMSeesAll.Hint",
    scope: "world", config: true, type: Boolean, default: true
  });
  s.register(MODULE_ID, "dialectsShared", {
    name: "LINGUISTIC_CHAT.Settings.DialectsShared.Name", hint: "LINGUISTIC_CHAT.Settings.DialectsShared.Hint",
    scope: "world", config: true, type: Boolean, default: true, onChange: () => refreshBars()
  });
  s.registerMenu(MODULE_ID, "manager", {
    name: "LINGUISTIC_CHAT.Manager.Name", label: "LINGUISTIC_CHAT.Manager.Label", hint: "LINGUISTIC_CHAT.Manager.Hint",
    icon: "fa-solid fa-language", type: class extends foundry.applications.api.ApplicationV2 {
      constructor(...a) { super(...a); LanguageManager.open(); }
      render() { return this; }
    }, restricted: true
  });
  try {
    addSystemDialects();
    crumb("dialects.add", { result: dialectStatus.result, ...dialectStatus.parents });
  } catch (err) {
    stats.lastError = "dialectsFailed";
    crumb("dialects.add", { result: "error" });
    console.error(`${MODULE_ID} | could not add dialects to the system languages`, err);
  }

  /*
   * Module API: game.modules.get("dxcufgbs-linguistic-chat").api
   *   knownLanguages(actor) – language ids the actor knows, the same list used to decide who understands a message:
   *                           universal languages (Common), the sheet's languages, the GM's extras from Manage Languages,
   *                           and the dialect family when "Dialects are mutually understood" is on. No actor: universal only.
   *   languages()           – the available languages as [{id, label}] (system list plus the GM's changes).
   */
  const mod = game.modules.get(MODULE_ID);
  if (mod) mod.api = {
    knownLanguages: actor => [...knownLanguageIds(actor ? [actor] : [])],
    languages: () => getLanguages().map(l => ({ id: l.id, label: l.label }))
  };
  registerDebugRecorder(debugSnapshot);
});

/* ---------- Debug Recorder (optional): counts, ids and outcomes only, never message text or names ---------- */

/** Counters since this client loaded. */
const stats = { sent: 0, sendFailed: 0, rendered: { understood: 0, notUnderstood: 0 }, lastError: null };

function debugSnapshot() {
  const languages = getLanguages();
  const system = new Set(systemLanguages().map(l => l.id));
  const overrides = game.settings.get(MODULE_ID, "languages");
  const known = knownLanguageIds();
  const selected = game.settings.get(MODULE_ID, "selectedLanguage");
  const bars = [...document.querySelectorAll(".linguistic-chat-bar")];
  return {
    gameSystem: game.system.id,
    languageSource,
    dialects: { result: dialectStatus.result, ...dialectStatus.parents },
    languages: {
      total: languages.length,
      universal: languages.filter(l => l.universal).length,
      fromSystem: system.size,
      gmOverrides: Array.isArray(overrides) ? overrides.length : 0,
      gmAdded: languages.filter(l => !system.has(l.id)).length
    },
    user: {
      isGM: game.user.isGM,
      actors: userActors().length,
      controlledTokens: canvas?.tokens?.controlled?.length ?? 0,
      knownLanguages: [...new Set([...known].map(recordableLanguageId))],
      selectedLanguageKnown: !selected || known.has(selected)
    },
    dictionary: { ...dictionaryStats(), savePending: dictionarySavePending() },
    bars: { total: bars.length, shown: bars.filter(b => !b.hidden).length },
    messagesWithLanguage: game.messages?.filter?.(m => m.flags?.[MODULE_ID]?.language).length ?? 0,
    counters: { sent: stats.sent, sendFailed: stats.sendFailed, ...stats.rendered },
    lastError: stats.lastError
  };
}

/* ---------- Language selector above the chat box ---------- */

function buildOptions(select) {
  const current = game.settings.get(MODULE_ID, "selectedLanguage");
  const common = new Option(game.i18n.localize("LINGUISTIC_CHAT.Common"), "");
  select.replaceChildren(common);
  try {
    const known = knownLanguageIds();
    for (const l of getLanguages()) {
      if (l.universal || !(known.has(l.id) || game.user.isGM)) continue;
      select.append(new Option(l.label, l.id));
    }
  } catch (err) {
    console.error(`${MODULE_ID} | could not build the language list`, err);
  }
  select.value = [...select.options].some(o => o.value === current) ? current : "";
}

const INPUT_SELECTORS = ["#chat-message", "textarea[name='content']", ".chat-form textarea", "#chat textarea", "#chat-popout textarea"];

/** Put the language bar above every chat input that does not have one yet (sidebar and pop-out). */
function injectBars() {
  const inputs = new Set();
  for (const sel of INPUT_SELECTORS) for (const el of document.querySelectorAll(sel)) inputs.add(el);
  let removed = 0, added = 0;
  // Foundry re-renders the chat input without removing our bar (it sits outside the re-rendered part): drop bars that no longer sit directly above a chat input.
  for (const bar of document.querySelectorAll(".linguistic-chat-bar")) {
    if (!inputs.has(bar.nextElementSibling)) { bar.remove(); removed++; }
  }
  for (const input of inputs) {
    if (input.previousElementSibling?.classList.contains("linguistic-chat-bar")) continue;
    added++;
    const bar = document.createElement("div");
    bar.className = "linguistic-chat-bar";
    const label = document.createElement("label");
    label.textContent = game.i18n.localize("LINGUISTIC_CHAT.Speaking");
    const select = document.createElement("select");
    select.addEventListener("change", () => {
      crumb("bar.select", { language: select.value ? recordableLanguageId(select.value) : "plain" });
      game.settings.set(MODULE_ID, "selectedLanguage", select.value);
    });
    bar.append(label, select);
    buildOptions(select);
    input.before(bar);
  }
  if (added || removed) crumb("bar.inject", { inputs: inputs.size, added, removed });
  syncBarVisibility();
}

const isShown = el => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";

/** Foundry keeps extra chat inputs in the DOM (sidebar, minimised bar, pop-outs) and hides the ones not in use: hide their bars too. */
function syncBarVisibility() {
  for (const bar of document.querySelectorAll(".linguistic-chat-bar")) {
    const input = bar.nextElementSibling;
    const hide = !(input && isShown(input));
    if (bar.hidden !== hide) bar.hidden = hide;
  }
}

function refreshBars() {
  for (const select of document.querySelectorAll(".linguistic-chat-bar select")) buildOptions(select);
}

Hooks.on("renderChatLog", () => { injectBars(); syncBarVisibility(); });
Hooks.once("ready", () => {
  injectBars();
  // Foundry re-renders the chat input in places no hook reports (tab switches, pop-outs): watch for it.
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; injectBars(); });
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });
});
Hooks.on("controlToken", refreshBars);
Hooks.on("updateActor", refreshBars);
Hooks.on("updateUser", refreshBars);
Hooks.on(`${MODULE_ID}.languagesChanged`, refreshBars);

/* ---------- Sending ---------- */

Hooks.on("chatMessage", (chatLog, message, chatData) => {
  const lang = getLanguage(game.settings.get(MODULE_ID, "selectedLanguage"));
  const text = message.trim();
  if (!lang || lang.universal) return;
  const language = recordableLanguageId(lang.id);
  if (!text || text.startsWith("/")) return crumb("send.skip", { language, reason: text ? "command" : "empty" });
  // The stored choice can be stale (other token, character or dialect setting): never speak a language you don't know.
  if (!game.user.isGM && !knownLanguageIds().has(lang.id)) return crumb("send.skip", { language, reason: "notKnown" });

  crumb("send.translate", { language, style: styleFor(lang.style ?? lang.id), words: countWords(text) });
  (async () => {
    const translated = translateText(text, lang);
    const html = esc(text).replace(/\n/g, "<br>");
    await ChatMessage.implementation.create({
      ...chatData,
      content: html,
      flags: { [MODULE_ID]: { language: lang.id, label: lang.label, translated } }
    });
    stats.sent++;
  })().catch(err => {
    stats.sendFailed++;
    stats.lastError = "sendFailed";
    crumb("send.error", { language, error: err?.name ?? "Error" });
    console.error(`${MODULE_ID} | failed to send`, err);
  });
  return false;
});

/* ---------- Rendering ---------- */

Hooks.on("renderChatMessageHTML", (message, html) => {
  const data = message.flags?.[MODULE_ID];
  if (!data?.language) return;
  const content = html.querySelector(".message-content");
  const language = recordableLanguageId(data.language);
  if (!content) return crumb("render.skip", { language, reason: "noContent" });

  const reason = (game.user.isGM && game.settings.get(MODULE_ID, "gmSeesAll")) ? "gmSeesAll"
    : message.author?.id === game.user.id ? "author"
    : knownLanguageIds().has(data.language) ? "knows" : null;
  const understands = !!reason;
  stats.rendered[understands ? "understood" : "notUnderstood"]++;
  crumb("render.decide", { language, outcome: understands ? "understood" : "notUnderstood", reason: reason ?? "unknownLanguage" });

  const tag = document.createElement("span");
  tag.className = "linguistic-chat-tag";
  tag.textContent = data.label ?? data.language;

  if (understands) {
    content.prepend(tag);
  } else {
    const span = document.createElement("span");
    span.className = "linguistic-chat-gibberish";
    span.textContent = data.translated;
    content.replaceChildren(tag, span);
  }
});
