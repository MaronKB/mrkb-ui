export default class Setting {
    static get(key) {
        return game.settings.get("mrkb-ui", key);
    }
    static set(type, url) {
        game.settings.set("mrkb-ui", type, url);
    }

    static register() {
        game.settings.register("mrkb-ui", "font-size", {
            name: game.i18n.localize("MRKB.Settings.FontSize.Title"),
            hint: game.i18n.localize("MRKB.Settings.FontSize.Hint"),
            scope: "client",
            config: true,
            type: Number,
            range: {
                min: 8,
                max: 20
            },
            default: 14,
            onChange: (value) => document.querySelector("#chat-log").style.setProperty("--font-size", value + "px")
        });
        game.settings.register("mrkb-ui", "use-portrait", {
            name: game.i18n.localize("MRKB.Settings.UsePortrait.Title"),
            hint: game.i18n.localize("MRKB.Settings.UsePortrait.Hint"),
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            onChange: () => window.location.reload()
        });

        /*UI*/

        game.settings.register("mrkb-ui", "ui-actor", {
            name: "액터 셀렉터 UI",
            hint: "",
            scope: "client",
            config: false,
            type: Boolean,
            default: false
        });
        game.settings.register("mrkb-ui", "ui-players", {
            name: "플레이어 목록 UI",
            hint: "",
            scope: "client",
            config: false,
            type: Boolean,
            default: false
        });
        game.settings.register("mrkb-ui", "ui-bottom", {
            name: "하단 UI",
            hint: "",
            scope: "client",
            config: false,
            type: Boolean,
            default: true
        });
        game.settings.register("mrkb-ui", "ui-msgMode", {
            name: "메시지 모드 UI",
            hint: "",
            scope: "client",
            config: false,
            type: Boolean,
            default: false
        });
        game.settings.register("mrkb-ui", "tab-actor", {
            name: "액터 탭",
            scope: "client",
            config: false,
            type: String,
            default: "unclassified"
        });
        game.settings.register("mrkb-ui", "talk-mode", {
            name: "대화 모드",
            scope: "client",
            config: false,
            type: String,
            default: "normal"
        });
    }
}