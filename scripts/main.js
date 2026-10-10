import { MODULE_ID } from "./constants.js";
import { getLanguage, getLanguages, knownLanguageIds } from "./languages.js";
import { translateText } from "./translator.js";
import { LanguageManager } from "./manager.js";

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
  s.registerMenu(MODULE_ID, "manager", {
    name: "LINGUISTIC_CHAT.Manager.Name", label: "LINGUISTIC_CHAT.Manager.Label", hint: "LINGUISTIC_CHAT.Manager.Hint",
    icon: "fa-solid fa-language", type: class extends foundry.applications.api.ApplicationV2 {
      constructor(...a) { super(...a); LanguageManager.open(); }
      render() { return this; }
    }, restricted: true
  });
});

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
  // Foundry re-renders the chat input without removing our bar (it sits outside the re-rendered part): drop bars that no longer sit directly above a chat input.
  for (const bar of document.querySelectorAll(".linguistic-chat-bar")) {
    if (!inputs.has(bar.nextElementSibling)) bar.remove();
  }
  for (const input of inputs) {
    if (input.previousElementSibling?.classList.contains("linguistic-chat-bar")) continue;
    const bar = document.createElement("div");
    bar.className = "linguistic-chat-bar";
    const label = document.createElement("label");
    label.textContent = game.i18n.localize("LINGUISTIC_CHAT.Speaking");
    const select = document.createElement("select");
    select.addEventListener("change", () => game.settings.set(MODULE_ID, "selectedLanguage", select.value));
    bar.append(label, select);
    buildOptions(select);
    input.before(bar);
  }
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
  if (!lang || lang.universal || !text || text.startsWith("/")) return;

  (async () => {
    const translated = translateText(text, lang);
    const html = esc(text).replace(/\n/g, "<br>");
    await ChatMessage.implementation.create({
      ...chatData,
      content: html,
      flags: { [MODULE_ID]: { language: lang.id, label: lang.label, translated } }
    });
  })().catch(err => console.error(`${MODULE_ID} | failed to send`, err));
  return false;
});

/* ---------- Rendering ---------- */

Hooks.on("renderChatMessageHTML", (message, html) => {
  const data = message.flags?.[MODULE_ID];
  if (!data?.language) return;
  const content = html.querySelector(".message-content");
  if (!content) return;

  const understands = (game.user.isGM && game.settings.get(MODULE_ID, "gmSeesAll"))
    || message.author?.id === game.user.id
    || knownLanguageIds().has(data.language);

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
