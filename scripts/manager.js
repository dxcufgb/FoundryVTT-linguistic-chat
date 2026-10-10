import { MODULE_ID } from "./constants.js";
import { getLanguages, diffFromSystem } from "./languages.js";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function parseDefinitions(text) {
  return text.split("\n").map(line => line.split("|").map(p => p.trim())).filter(p => p[0]).map(([id, label, style, flag]) => ({
    id: id.toLowerCase(), label: label || id, style: style || "common", universal: /^(u|universal|true|\*)$/i.test(flag ?? "")
  }));
}

export class LanguageManager extends foundry.applications.api.ApplicationV2 {
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
        <h3>${L("Actors")}</h3>${rows}</div>`,
      buttons: [
        { action: "save", label: L("Save"), icon: "fa-solid fa-save", default: true,
          callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object },
        { action: "cancel", label: L("Cancel"), icon: "fa-solid fa-times" }
      ],
      rejectClose: false
    }).then(async data => {
      if (!data || typeof data !== "object") return;
      const langs = parseDefinitions(data.definitions ?? "");
      if (langs.length) await game.settings.set(MODULE_ID, "languages", diffFromSystem(langs));
      for (const a of actors) {
        const ids = String(data[`a_${a.id}`] ?? "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
        await a.setFlag(MODULE_ID, "languages", ids);
      }
      ui.notifications.info("Linguistic Chat: languages saved.");
      Hooks.callAll(`${MODULE_ID}.languagesChanged`);
    });
  }
}
