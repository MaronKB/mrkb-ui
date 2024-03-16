export default class Setting {
    static get(key) {
        return game.settings.get("mrkb-ui", key);
    }
    static set(type, url) {
        game.settings.set("mrkb-ui", type, url);
    }

    static register() {

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