import ChatHandler from "./chatHandler.mjs";
import MRKBUI from "./mrkbui.mjs";
import Setting from "./setting.mjs";
import UtilityBar from "./utilityBar.mjs";
import Players from "./players.mjs";

Hooks.once("init", () => onInit());
Hooks.once("ready", () => onReady());
Hooks.once("renderSidebar", (sidebar, html, option) => onRenderSidebar(sidebar, html, option));
Hooks.on("renderSidebarTab", (tab, html, option) => onRenderSidebarTab(tab, html, option));
Hooks.on("renderSceneControls", (controls, html, option) => UtilityBar.set(controls, html, option));
Hooks.on("renderPlayerList", () => Players._appendAvatar());
Hooks.on("updateUser", () => {
    const target = document.querySelector("#mrkb-nameplate");
    target.innerHTML = (game.user.character) ? game.user.character.name : game.user.name;
});
Hooks.on("preCreateChatMessage", (message, source, options, id) => ChatHandler.preProcesser(message, source, options, id));
Hooks.on("renderChatMessage", (message, html, data) => ChatHandler.renderProcesser(message, html, data));
Hooks.on("deleteChatMessage", (message) => ChatHandler.fixChatFlag(message));
const onInit = () => {
    Setting.register();

    const title = document.querySelector("title");
    title.innerHTML = game.world.title;

    CONFIG.TinyMCE.content_css.push("modules/mrkb-ui-core/style/etc/tinymce.css");

    const mrkbUI = document.createElement("div");
    mrkbUI.id = "mrkb-hud";

    const body = document.querySelector("#interface");
    body.append(mrkbUI);

    const calcScreenHeight = () => {
        document.documentElement.style.setProperty("--max-height", window.innerHeight + "px");
    }

    window.addEventListener("resize", calcScreenHeight);
    calcScreenHeight();
}
const onReady = () => {
    MRKBUI.create();
}
const onRenderSidebar = (sidebar, html, option) => {
    html[0].parentElement.parentElement.append(html[0]);

    const fold = document.createElement("a");
    fold.className = "item fold";
    fold.dataset.tooltip = "메뉴";
    fold.onclick = () => tabs.classList.toggle("opened");
    fold.innerHTML = "<i class=\"fa-solid fa-bars\"></i>";

    const tabs = html[0].querySelector("#sidebar-tabs");
    tabs.append(fold);

    for (let i = 0; i < 14 - tabs.childElementCount; i++) {
        const empty = document.createElement("a");
        empty.className = "item empty";
        empty.innerHTML = "<i class=\"fa-solid fa-circle\"></i>";
        tabs.append(empty);
    }
}
const onRenderSidebarTab = (tab, html, option) => {
    if (tab.id !== "chat") return;

    html[0].querySelector(".chat-control-icon").remove();
    html[0].querySelector(".roll-type-select").remove();

    const rollMode = [
        {
            name: "publicroll",
            next: "gmroll",
            icon: "fa-solid fa-dice-d20",
            msg: "Public"
        },
        {
            name : "gmroll",
            next: "blindroll",
            icon : "fa-solid fa-user-secret",
            msg: "Private"
        },
        {
            name : "blindroll",
            next: "selfroll",
            icon : "fa-solid fa-eye-slash",
            msg: "Blind"
        },
        {
            name : "selfroll",
            next: "publicroll",
            icon : "fa-solid fa-user",
            msg: "Self"
        }
    ]

    const currentRollMode = game.settings.get("core", "rollMode");
    const rollList = rollMode.map((e) => {
        const a = document.createElement("a");
        a.id = "roll-mode-" + e.name;
        a.className = "roll-mode";
        a.onclick = () => changeRollMode(e.next);
        a.innerHTML = `<i class="${e.icon}"></i><span>${game.i18n.translations.CHAT["Roll" + e.msg]}</span>`;
        if (e.name === currentRollMode) a.classList.add("active");
        return a;
    });

    const changeRollMode = (target) => {
        game.settings.set("core", "rollMode", target);
        const buttons = document.querySelectorAll(".roll-mode");
        buttons.forEach((e) => e.classList.remove("active"));
        document.querySelector(`#roll-mode-${target}`).classList.add("active");
    }

    const controller = html[0].querySelector(".control-buttons");
    controller.prepend(...rollList);

    const namePlate = document.createElement("h4");
    namePlate.id = "mrkb-nameplate";
    namePlate.innerHTML = (game.user.character) ? game.user.character.name : game.user.name;

    const form = html[0].querySelector("#chat-form");
    form.prepend(namePlate);
}