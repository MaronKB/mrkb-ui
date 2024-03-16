import UIToggle from "./UIToggle.mjs";

export default class UtilityBar {
    static create() {
        const buttons = this._getUtilities();
        return buttons.map((e) => {
            if (!game.user.isGM && e.forGM) return;
            if (e.system && game.system.id !== e.system) return;

            const i = document.createElement("i");
            i.className = "fa-solid";
            i.classList.add(`fa-${e.fa}`);

            const h5 = document.createElement("h5");
            h5.className = "scene-control-title";
            h5.innerHTML = e.title;

            const isActive = UIToggle.get(e.tag);

            const li = document.createElement("li");
            li.className = `scene-control ${isActive}`;
            li.dataset.tool = "mrkb-menu";
            li.onclick = e.onclick;
            if (e.tag) {
                li.title = e.tag;
                li.dataset.widget = e.tag;
            }
            li.append(i, h5);

            return li;
        }).filter((e) => e);
    }
    static _getUtilities() {
        const list = [];
        list.push({
            title : "시트",
            onclick : () => {
                const character = game.actors.get(game.user.character.id);
                if (!character || character?.permission < 2) return;
                character.sheet.render(true);
            },
            fa : "id-card"
        });
        list.push({
            title : "캐릭터",
            tag : "actor",
            onclick : () => UIToggle.set("actor"),
            fa : "users-gear"
        });

        return list;
    }
    static set(controls, html, option) {
        Array.prototype.forEach.call(html[0].querySelector(".main-controls").children, (e, index) => {
            const text = option.controls[index]?.title ?? "";
            const local = game.i18n.localize(text) ?? e.title ?? "";

            const title = document.createElement("h5");
            title.className = "scene-control-title";
            title.innerHTML = local.split(" ")[0];
            e.append(title);
        })
        html[0].querySelector(".main-controls").append(...this.create());
    }
}