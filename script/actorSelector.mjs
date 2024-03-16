import UIToggle from "./UIToggle.mjs";
import Setting from "./setting.mjs";
class TabControl {
    static open(type, id) {
        const tabs = document.querySelectorAll(`[data-tab="${type}"]`);
        tabs.forEach((t) => {
            t.classList.remove("active");
        });

        const target = document.querySelectorAll(`[data-tab="${type}"][data-id="${id}"]`);
        target.forEach((t) => {
            t.classList.add("active");
        });

        this.set(type, id);
    }
    static get(type, defId) {
        const tabList = Setting.get(`tab-${type}`);
        return tabList ?? defId ?? "unclassified";
    }
    static set(type, id) {
        Setting.set(`tab-${type}`, String(id));
    }
}

export default class ActorSelector {
    static _createSelector() {
        const data = this._createSelectorHTML();

        const div = document.createElement("div");
        div.id = "mrkb-selector";
        div.className = UIToggle.get("actor");
        div.dataset.widget = "actor";
        div.append(data.list);
        div.append(data.tab);

        return div;
    }
    static _createSelectorHTML() {
        const list = document.createElement("ul");
        list.id = "actor-folder";

        const tab = document.createElement("div");
        tab.id = "actor-tab";

        const folderList = this._collectCharacters();
        folderList.forEach((e) => {
            const page = this._getList(e);
            list.append(page.list);
            tab.append(page.tab);
        });

        const button = document.createElement("a");
        button.id = "actor-selector-refresh";
        button.innerHTML = "<i class=\"fa-solid fa-arrows-rotate\"></i>";
        button.onclick = () => ActorSelector._setSelector();

        const title = document.createElement("p");
        title.id = "actor-selector-title";
        title.innerHTML = "Actor Selector";
        title.append(button);

        tab.prepend(title);

        const tooltip = document.createElement("p");
        tooltip.id = "actor-selector-tooltip";
        tooltip.innerHTML = "<span>[좌클릭]<br/>[Ctrl+좌클릭]</span><span>액터 변경<br/>시트 열기</span>";
        tab.append(tooltip);

        return {
            list : list,
            tab : tab
        }
    }
    static _setSelector() {
        const data = this._createSelectorHTML();

        const list = document.querySelector("#actor-folder");
        list.replaceChildren(...data.list.children);

        const tab = document.querySelector("#actor-tab");
        tab.replaceChildren(...data.tab.children);
    }
    static _collectCharacters() {
        const actors = game.actors.filter(e => e.folder === null && e.permission >= 2);
        const folders = game.folders.filter(e => e.type === "Actor");
        folders.push({id: "unclassified", name: game.i18n.localize("MRKB.Unclassified"), contents: actors});

        const folderList = [];

        folders.forEach((f) => {
            const content = [];
            f.contents.filter(e => e.permission >= 2).forEach((c) => {
                content.push({id: c.id, name: c.name, img: c.img});
            });
            if (content.length === 0) return;
            folderList.push({id: f.id, name: f.name, content: content});
        });

        folderList.sort((a, b) => {
            return a.name > b.name ? 1 : -1;
        });

        return folderList;
    }
    static _getList(e) {
        const currentTab = TabControl.get("actor") ?? "unclassified";

        const span = document.createElement("span");
        span.innerHTML = e.name;

        const list = document.createElement("li");
        list.classList.add("tab-actor");
        list.dataset.tab = "actor";
        list.dataset.id = e.id;
        list.onclick = () => TabControl.open("actor", e.id);
        list.append(span);

        const div = document.createElement("div");
        div.classList.add("actor-grid");
        div.classList.add("tab");
        div.dataset.tab = "actor";
        div.dataset.id = e.id;

        if (e.id === currentTab) {
            list.classList.add("active");
            div.classList.add("active");
        }

        e.content.forEach((i) => div.appendChild(this._getToken(i)));

        return {
            list : list,
            tab : div
        }
    }
    static _getToken(i) {
        let a = document.createElement("a");
        a.className = "actor-icon";
        if (i.id === game.user.character?.id) a.classList.add("active");
        a.onmousedown = (e) => this._onClick(i.id, e);

        let label = document.createElement("label");
        label.htmlFor = i.id;
        label.innerHTML = `<i class="fa-solid fa-bookmark"></i>`;

        let img = document.createElement("img");
        img.src = i.img;

        let h4 = document.createElement("h4");
        h4.innerHTML = i.name;

        a.append(img, h4);

        return a;
    }
    static _onClick(id, e) {
        if (e.button === 0 && e.ctrlKey) {
            game.actors.get(id).sheet.render(true);
        }else {
            this._select(id);
        }
    }
    static _select(id) {
        if (game.user.character?._id === id) {
            game.user.update({ character : null }).then(() => {
                canvas.tokens.releaseAll();
                this._setSelector();
            });
        } else {
            game.user.update({ character : id }).then(() => {
                canvas.tokens.releaseAll();
                this._setSelector();
            });
        }
    }
}