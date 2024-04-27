import ActorSelector from "./actorSelector.mjs";
import Players from "./players.mjs";
import UIToggle from "./UIToggle.mjs";

export default class MRKBUI {
    static create() {
        const header = this.createHeaderUI();
        const bodies = this.createBodyUI();
        const hud = document.querySelector("#mrkb-hud");
        hud.append(header, bodies);
    }
    static createHeaderUI() {
        const hotbar = document.querySelector("#hotbar");

        const button = document.createElement("button");
        button.id = "toggle-players";
        button.className = UIToggle.get("players");
        button.dataset.widget = "players";
        button.onclick = () => UIToggle.set("players");
        button.innerHTML = "<i class='fa-solid'></i>";

        const buttons = document.createElement("div");
        buttons.id = "mrkb-buttons";
        buttons.append(button, hotbar);

        const container = document.createElement("div");
        container.id = "mrkb-profile";
        container.append(buttons);

        const player = Players.create();

        const controller = this.sceneController();

        const head = document.createElement("div");
        head.id = "mrkb-header";
        head.append(container, player, controller);

        return head;
    }
    static sceneController() {
        const nav = document.querySelector("#navigation");


        const button = document.createElement("a");
        button.id = "display-btn-sceneNavToggle";
        button.title = "장면 네비게이션 보이기/숨기기";
        button.className = "display-button fa-solid fa-grid";
        button.onclick = () => {
            const target = document.querySelector("#navigation");
            target.classList.toggle("active");
        }

        const collapse = document.createElement("a");
        collapse.id = "display-btn-collapse";
        collapse.title = game.i18n.localize("SIDEBAR.CollapseToggle");
        collapse.className = "display-button fa-solid fa-caret-right";
        collapse.onclick = () => document.querySelector("#sidebar-tabs > .collapse").click();

        const controller = document.createElement("div");
        controller.id = "display-controller";
        controller.append(button, collapse);

        const menu = document.createElement("div");
        menu.id = "screen-controller-nav";
        menu.append(nav, controller);

        const div = document.createElement("div");
        div.id = "screen-controller";
        div.append(menu);

        return div;
    }
    static createBodyUI() {
        const float = this.createFloatsUI();
        const footer = this.createFooterUI();
        const bottom = this.createBottomUI();

        const body = document.createElement("div");
        body.id = "mrkb-bodies";
        body.append(float, footer, bottom);

        return body;
    }
    static createFloatsUI() {
        const actorSelector = ActorSelector._createSelector();

        const float = document.createElement("div");
        float.id = "mrkb-float";
        float.append(actorSelector);

        return float;
    }
    static createFooterUI() {
        const icon = `<i class="fa-solid fa-caret-up"></i>`;

        const bottomOpner = document.createElement("a");
        bottomOpner.id = "ui-bot-open";
        bottomOpner.className = UIToggle.get("bottom");
        bottomOpner.onclick = () => UIToggle.set("bottom");
        bottomOpner.dataset.widget = "bottom";
        bottomOpner.innerHTML = icon;

        const openerContainer = document.createElement("div");
        openerContainer.id = "mrkb-openers";
        openerContainer.append(bottomOpner);

        return openerContainer;
    }
    static createBottomUI() {
        const controls = document.querySelector("#controls");

        const bot = document.createElement("div");
        bot.id = "mrkb-bottom";
        bot.className = UIToggle.get("bottom");
        bot.dataset.widget = "bottom";
        bot.append(controls);

        return bot;
    }
}