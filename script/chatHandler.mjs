import Setting from "./setting.mjs";

const getPortrait = (id, userId) => {
    const avatar = game.users.get(userId).avatar ?? "";
    return game.actors.get(id)?.img ?? avatar;
}
export default class ChatHandler {
    static preProcesser(message, source, options/*, id*/) {
        if (!message.isAuthor) return;

        const chara = game.user.character;
        const speaker = { ...message.speaker };
        const speakerNeeded = !speaker.alias && chara && message.type === 1;
        const type = speakerNeeded ? 2 : message.type;
        if (speakerNeeded) {
            speaker.actor = chara._id;
            speaker.alias = chara.name;
        }
        const getOrder = () => {
            const order = lastMessage.getFlag("mrkb-ui", "order");
            if (order) return order + 1;
            else {
                const arr = [];
                messages.forEach((e) => arr.push(e.flags["mrkb-ui"]?.order));
                const orders = arr.filter((e) => !isNaN(e));
                return (orders.length === 0) ? 0 : Math.max(...orders) + 2;
            }
        }

        const messages = game.messages.contents;
        const lastMessage = messages[messages.length - 1];
        const isFamily = this.isFamily(lastMessage, message, speaker, options);
        const option = {}
        option.added = isFamily ?? false;
        option.parent = isFamily ? lastMessage.id : null;
        option.order = lastMessage ? getOrder() : 0;

        message.updateSource({
            type : type,
            speaker : speaker,
            flags : {"mrkb-ui" : option}
        });
    }
    static isFamily(parent, child, speaker, options) {
        if (!parent) return false;
        return (
            parent &&
            speaker.alias === parent.speaker.alias &&
            speaker.actor === parent.speaker.actor &&
            child.user._id === parent.user._id &&
            !options.desc
        )
    }
    static realignTime(timestamp) {
        const date = new Date(timestamp);
        return {
            ye : String(date.getFullYear()).slice(2, 4),
            mo : String(date.getMonth() + 1).padStart(2, '0'),
            da : String(date.getDate()).padStart(2, '0'),
            ho : String(date.getHours()).padStart(2, '0'),
            mi : String(date.getMinutes()).padStart(2, '0'),
            se : String(date.getSeconds()).padStart(2, '0')
        }
    }
    static renderProcesser(message, html) {
        if (Setting.get("use-portrait")) {
            const id = message.speaker.actor;
            const actorImage = getPortrait(id, message.user.id);

            const portrait = document.createElement("img");
            portrait.src = actorImage;
            portrait.className = "message-portrait";
            portrait.onmouseenter = (event) => ChatHandler.expandPortrait(event);
            portrait.onmouseleave = () => ChatHandler.cleanupExpanded();

            const header = html[0].querySelector(".message-header");
            header.prepend(portrait);
        }

        const date = ChatHandler.realignTime(message.timestamp);
        const time = `${date.ye}.${date.mo}.${date.da} ${date.ho}:${date.mi}:${date.se}`;

        const absTime = document.createElement("time");
        absTime.className = "message-absolute-timestamp";
        absTime.innerHTML = time;

        const timestamp = html[0].querySelector(".message-timestamp");

        const times = document.createElement("div");
        times.className = "message-times";
        times.append(absTime, timestamp);

        const metadata = html[0].querySelector(".message-metadata");
        metadata.prepend(times);

        const sender = html[0].querySelector("h4.message-sender");
        sender.innerHTML += `<span class="message-user">${message.user.name}</span>`;

        ChatHandler.checkChatFlag(message, html);
    }
    static expandPortrait(event) {
        const bck = document.createElement("img");
        bck.id = "portrait-view-bck";
        bck.src = event.target.src;
        const img = document.createElement("img");
        img.id = "portrait-view-img";
        img.src = event.target.src;

        const div = document.createElement("div");
        div.id = "portrait-view";
        div.append(bck, img);

        const body = document.querySelector("#mrkb-float");
        body.append(div);
    }
    static cleanupExpanded() {
        const imgs = document.querySelectorAll("#portrait-view");
        imgs.forEach((e) => e.remove());
    }
    static checkChatFlag(message, html) {
        html[0].dataset.order = message.getFlag("mrkb-ui", "order");
        if (message.getFlag("mrkb-ui", "added")) html[0].classList.add("added");
        if (message.isAuthor) html[0].classList.add("self");
    }
    static fixChatFlag() {
        if (game.messages.size === 0) return;
        const msgs = game.messages.contents;
        msgs.forEach((e) => {
            const parent = msgs.find(a => a.id === e.getFlag("mrkb-ui", "parent"));
            const prev = msgs[msgs.indexOf(e) - 1];
            const option = {
                type : e.getFlag("mrkb-ui", "type"),
                desc : e.getFlag("mrkb-ui", "type") === "desc",
                kakao : e.getFlag("mrkb-ui", "type") === "kakao",
                truner : e.getFlag("mrkb-ui", "type") === "turner"
            }
            if (msgs.indexOf(e) === 0) {
                if (game.user.isGM) {
                    e.setFlag("mrkb-ui", "added", false);
                    e.setFlag("mrkb-ui", "parent", null);
                }
                document.querySelector(`[data-message-id="${e.id}"]`)?.classList?.remove("added");
            }else if (!parent && !this.isFamily(prev, e, e.speaker, option)) {
                if (game.user.isGM) {
                    e.setFlag("mrkb-ui", "added", false);
                    e.setFlag("mrkb-ui", "parent", null);
                }
                document.querySelector(`[data-message-id="${e.id}"]`)?.classList?.remove("added");
            } else {
                if (game.user.isGM) {
                    e.setFlag("mrkb-ui", "added", true);
                    e.setFlag("mrkb-ui", "parent", prev.id);
                }
                document.querySelector(`[data-message-id="${e.id}"]`)?.classList?.add("added");
            }
        });
    }
}