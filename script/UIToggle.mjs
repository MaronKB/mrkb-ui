import Setting from "./setting.mjs";

export default class UIToggle {
    static get(tag) {
        if (!tag) return;
        return (Setting.get(`ui-${tag}`)) ? "active" : "";
    }

    static set(tag) {
        if (!tag) return;
        const target = document.querySelectorAll(`[data-widget=${tag}]`);
        let isActive = Setting.get(`ui-${tag}`);
        if (isActive) {
            Setting.set(`ui-${tag}`, false);
            target.forEach((e) => {
                e.classList.remove("active");
            });
        } else {
            Setting.set(`ui-${tag}`, true);
            target.forEach((e) => {
                e.classList.add("active");
            });
        }
    }
}