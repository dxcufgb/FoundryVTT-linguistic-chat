import { MODULE_ID } from "./constants.js";
import { getLanguages, diffFromSystem } from "./languages.js";
import { translateText } from "./translator.js";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function parseDefinitions(text) {
  return text.split("\n").map(line => line.split("|").map(p => p.trim())).filter(p => p[0]).map(([id, label, style, flag]) => ({
    id: id.toLowerCase(), label: label || id, style: style || "common", universal: /^(u|universal|true|\*)$/i.test(flag ?? "")
  }));
}

export class LanguageManager extends foundry.applications.api.ApplicationV2 {
  /** Live preview: re-renders whenever the language, sample text or definitions change. */
  static #wirePreview(root) {
    const defs = root.querySelector("textarea[name=definitions]");
    const select = root.querySelector(".lc-preview-lang");
    const input = root.querySelector(".lc-preview-text");
    const out = root.querySelector(".lc-preview-out");

    const refreshOptions = () => {
      const langs = parseDefinitions(defs.value).filter(l => !l.universal);
      const current = select.value;
      select.replaceChildren(...langs.map(l => new Option(l.label, l.id)));
      if (langs.some(l => l.id === current)) select.value = current;
    };
    const render = () => {
      const lang = parseDefinitions(defs.value).find(l => l.id === select.value);
      out.textContent = lang ? translateText(input.value, lang, { save: false }) : "";
    };
    defs.addEventListener("input", () => { refreshOptions(); render(); });
    select.addEventListener("change", render);
    input.addEventListener("input", render);
    refreshOptions();
    render();
  }

  static open() {
    const DialogV2 = foundry.applications.api.DialogV2;
    const defs = getLanguages().map(l => [l.id, l.label, l.style, l.universal ? "universal" : ""].join(" | ").replace(/ \| $/, "")).join("\n");
    const actors = game.actors.filter(a => a.type === "character" || a.hasPlayerOwner);
    const rows = actors.map(a => `<div class="lc-actor"><label>${esc(a.name)}</label>
      <input type="text" name="a_${a.id}" value="${esc((a.getFlag(MODULE_ID, "languages") ?? []).join(", "))}"></div>`).join("");
    const L = k => game.i18n.localize(`LINGUISTIC_CHAT.Manager.${k}`);
    return DialogV2.wait({
      window: { title: L("Name") },
      position: { width: 520 },
      content: `<div class="linguistic-chat-manager">
        <h3>${L("Definitions")}</h3><p class="hint">${L("DefinitionsHint")}</p>
        <textarea name="definitions">${esc(defs)}</textarea>
        <h3>${L("Preview")}</h3>
        <div class="lc-preview">
          <select class="lc-preview-lang"></select>
          <input type="text" class="lc-preview-text" value="${esc(L("PreviewSample"))}">
          <div class="lc-preview-out"></div>
        </div>
        <h3>${L("Actors")}</h3>${rows}</div>`,
      buttons: [
        { action: "save", label: L("Save"), icon: "fa-solid fa-save", default: true,
          callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
        { action: "cancel", label: L("Cancel"), icon: "fa-solid fa-times" }
      ],
      render: (event, dialog) => LanguageManager.#wirePreview(dialog.element),
      rejectClose: false
    }).then(async data => {
      if (!data || typeof data !== "object") return;
      const langs = parseDefinitions(data.definitions ?? "");
      if (langs.length) await game.settings.set(MODULE_ID, "languages", diffFromSystem(langs));
      for (const a of actors) {
        const ids = String(data[`a_${a.id}`] ?? "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
        await a.setFlag(MODULE_ID, "languages", ids);
      }
      ui.notifications.info("Dxcufgb's Linguistic Chat: languages saved.");
      Hooks.callAll(`${MODULE_ID}.languagesChanged`);
    });
  }
}
