import UIToggle from "./UIToggle.mjs";

export default class Players {
    static create() {
        const players = document.querySelector("#players");

        const div = document.createElement("div");
        div.id = "mrkb-players";
        div.className = UIToggle.get("players");
        div.dataset.widget = "players";
        div.append(players);

        ui.players._showOffline = true;
        ui.players.render();

        return div;
    }
    static _appendAvatar() {
        const users = game.users;
        users.forEach(function(u) {
            const img = document.createElement("img");
            img.src = game.users.get(u.id).avatar;

            const div = document.createElement("div");
            div.className = "player-avatar";
            div.appendChild(img);

            const target = document.querySelector(`li[data-user-id=\"${u.id}\"] .player-name`);
            if (target !== null) target.prepend(div);
        });
    }
}