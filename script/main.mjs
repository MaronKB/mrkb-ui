import ChatHandler from "./chatHandler.mjs";
import MRKBUI from "./mrkbui.mjs";
import Setting from "./setting.mjs";
import UtilityBar from "./utilityBar.mjs";
import Players from "./players.mjs";
import ChatEditor from "./chatEditor.mjs";
import ChatExporter from "./chatExporter.mjs";

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
Hooks.on("getChatLogEntryContext", (html, entryOptions) => {
    entryOptions.push(
        {
            name: game.i18n.localize("MRKB.EditMessage"),
            icon: '<i class="fa-solid fa-pen-to-square"></i>',
            condition: (li) => {
                const message = game.messages.get(li.data('messageId'));
                return ((game.user.isGM || message.isAuthor) && message.type !== 5);
            },
            callback: (li) => ChatEditor._edit(li.data('messageId'))
        }
    );
});
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
const onRenderSidebar = (sidebar, html/*, option*/) => {
    html[0].parentElement.parentElement.append(html[0]);

    const tabs = html[0].querySelector("#sidebar-tabs");
    tabs.onclick = () => tabs.classList.toggle("opened");

    const fold = document.createElement("a");
    fold.id = "fold-tabs";
    fold.className = "item fold";
    fold.dataset.tooltip = "메뉴";
    fold.onclick = () => tabs.classList.toggle("opened");
    fold.innerHTML = "<i class=\"fa-solid fa-bars\"></i>";

    html[0].prepend(fold);
}
const onRenderSidebarTab = (tab, html/*, option*/) => {
    if (tab.id !== "chat") return;

    const message = html[0].querySelector("#chat-message");
    message.addEventListener("keydown", (ev) => {
        if (ev.key === "ArrowUp" && ev.target.value.length === 0) {
            ev.preventDefault();
            ev.stopImmediatePropagation();

            const msg = game.messages.contents.filter(i => i.isAuthor);
            if (msg.length === 0) return;
            ChatEditor._edit(msg[msg.length - 1].id);
        }
    }, true, 100);
    message.after(ChatEditor._create());

    html[0].querySelector("#chat-log").style.setProperty("--font-size", Setting.get("font-size") + "px");

    html[0].querySelector(".chat-control-icon").remove();
    html[0].querySelector(".roll-type-select").remove();

    const rollMode = [
        {
            name: "publicroll",
            icon: "fa-solid fa-dice-d20",
            msg: "Public"
        },
        {
            name : "gmroll",
            icon : "fa-solid fa-user-secret",
            msg: "Private"
        },
        {
            name : "blindroll",
            icon : "fa-solid fa-eye-slash",
            msg: "Blind"
        },
        {
            name : "selfroll",
            icon : "fa-solid fa-user",
            msg: "Self"
        }
    ]

    const currentRollMode = game.settings.get("core", "rollMode");
    const rollList = rollMode.map((e) => {
        const title = game.i18n.localize("MRKB.Roll." + e.msg);

        const a = document.createElement("a");
        a.id = "roll-mode-" + e.name;
        a.className = "roll-mode";
        a.onclick = () => changeRollMode(e.name);
        a.innerHTML = `<i class="${e.icon}"></i><span>${title}</span>`;
        if (e.name === currentRollMode) a.classList.add("active");
        return a;
    });

    const changeRollMode = (target) => {
        game.settings.set("core", "rollMode", target);
        const buttons = document.querySelectorAll(".roll-mode");
        buttons.forEach((e) => e.classList.remove("active"));
        document.querySelector(`#roll-mode-${target}`).classList.add("active");
    }

    if (game.user.isGM) {
        const exportSpan = document.createElement("span");
        exportSpan.innerHTML = game.i18n.localize("MRKB.Export");

        const exp = html[0].querySelector(".export-log");
        exp.append(exportSpan);

        const deleteSpan = document.createElement("span");
        deleteSpan.innerHTML = game.i18n.localize("MRKB.Clear");

        const del = html[0].querySelector(".delete.chat-flush");
        del.append(deleteSpan);
    }
    const saveButton = document.createElement("a");
    saveButton.id = "chat-export";
    saveButton.onclick = () => ChatExporter.exporter();
    saveButton.innerHTML = `<i class="fa-solid fa-file-arrow-down"></i><span>로그 저장<span>`;

    const controller = html[0].querySelector("#chat-controls");
    controller.prepend(...rollList, saveButton);

    const namePlate = document.createElement("h4");
    namePlate.id = "mrkb-nameplate";
    namePlate.innerHTML = (game.user.character) ? game.user.character.name : game.user.name;

    const form = html[0].querySelector("#chat-form");
    form.prepend(namePlate);
}