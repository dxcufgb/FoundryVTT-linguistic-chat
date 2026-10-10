import { MODULE_ID } from "./constants.js";
import { getLanguage, getLanguages, knownLanguageIds } from "./languages.js";
import { translateText } from "./translator.js";
import { LanguageManager } from "./manager.js";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

Hooks.once("init", () => {
  const s = game.settings;
  s.register(MODULE_ID, "languages", { scope: "world", config: false, type: Array, default: [] });
  s.register(MODULE_ID, "translationCache", { scope: "client", config: false, type: Object, default: {} });
  s.register(MODULE_ID, "selectedLanguage", { scope: "client", config: false, type: String, default: "" });
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
  const known = knownLanguageIds();
  const current = game.settings.get(MODULE_ID, "selectedLanguage");
  select.replaceChildren();
  const usable = getLanguages().filter(l => known.has(l.id) || game.user.isGM);
  for (const l of usable) {
    const opt = document.createElement("option");
    opt.value = l.universal ? "" : l.id;
    opt.textContent = l.universal ? game.i18n.localize("LINGUISTIC_CHAT.Common") : l.label;
    select.append(opt);
  }
  if (!usable.some(l => !l.universal)) select.append(new Option(game.i18n.localize("LINGUISTIC_CHAT.Common"), ""));
  select.value = [...select.options].some(o => o.value === current) ? current : "";
}

function injectBar(root) {
  if (!root || root.querySelector(".linguistic-chat-bar")) return;
  const input = root.querySelector("#chat-message");
  if (!input) return;
  const bar = document.createElement("div");
  bar.className = "linguistic-chat-bar";
  bar.innerHTML = `<label>${esc(game.i18n.localize("LINGUISTIC_CHAT.Speaking"))}</label><select></select>`;
  const select = bar.querySelector("select");
  select.addEventListener("change", () => game.settings.set(MODULE_ID, "selectedLanguage", select.value));
  buildOptions(select);
  input.before(bar);
}

function refreshBars() {
  for (const select of document.querySelectorAll(".linguistic-chat-bar select")) buildOptions(select);
}

Hooks.on("renderChatLog", (app, html) => injectBar(html instanceof HTMLElement ? html : html[0]));
Hooks.once("ready", () => injectBar(ui.chat?.element));
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
