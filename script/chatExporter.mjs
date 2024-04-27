export default class ChatExporter {
    static exporter() {
        const orderHeader = document.createElement("h4");
        orderHeader.innerHTML = "오더 플래그";

        const orderMsg = document.createElement("p");
        orderMsg.innerHTML = "메시지 생성 시에 메시지 목록에 따라 상대적으로 설정되는 Order Flag에 따라 메시지를 정렬하여 내보냅니다. 경우에 따라 사용이 불가능할 수 있습니다.";

        const order = document.createElement("div");
        order.id = "export-as-order";
        order.append(orderHeader, orderMsg);

        const timestampHeader = document.createElement("h4");
        timestampHeader.innerHTML = "타임 스탬프";

        const timestampMsg = document.createElement("p");
        timestampMsg.innerHTML = "메시지 생성 시에 클라이언트 시간에 따라 설정되는 Timestamp에 따라 메시지를 정렬하여 내보냅니다. 개인 컴퓨터의 시간에 오차가 있을 경우 순서가 섞일 수 있습니다.";

        const timestamp = document.createElement("div");
        timestamp.id = "export-as-timestamp";
        timestamp.append(timestampHeader, timestampMsg);

        const exporterForm = document.createElement("form");
        exporterForm.id = "chat-exporter";
        exporterForm.append(order, timestamp);

        const exporter = new Dialog({
            title: `Chat Exporter`,
            content: exporterForm.outerHTML,
            buttons: {
                order: {
                    label: "오더 플래그",
                    callback: () => this.exportHTML(true)
                },
                timestamp: {
                    label: "타임 스탬프",
                    callback: () => this.exportHTML(false)
                },
                cancel: {
                    label: "취소"
                }
            },
            default: "cancel",
            close: () => {}
        }, {width: 400});

        exporter.render(true);
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
    static exportHTML(order = false) {
        function createHTML(callback, isOrdered) {
            const messagesTemp = game.messages.contents;
            const option = isOrdered ? (a, b) => {
                let prev = a.flags["mrkb-ui-ultimate"]?.order;
                let next = b.flags["mrkb-ui-ultimate"]?.order;
                if (String(prev) && String(next)) return (prev - next);
                else return (a.timestamp - b.timestamp);
            } : (a, b) => {
                let prev = a.timestamp;
                let next = b.timestamp;
                return (prev - next);
            }
            const messages = messagesTemp.sort(option);
            const firstMessageDate = messagesTemp[0].timestamp;
            const list = [];
            let index = 0;
            messages.forEach((e) => {
                e.exporting = true;
                e.getHTML().then((i) => {
                    const image = i[0].querySelectorAll("img");
                    image.forEach((img) => {
                        img.setAttribute("src", img.src);
                    });

                    list.push(i[0]);

                    if (index === messages.length - 1) {
                        if (isOrdered) list.sort((a, b) => {
                            let prev = a.dataset.order;
                            let next = b.dataset.order;
                            if (String(prev) && String(next)) return (prev - next);
                            else return (a.timestamp - b.timestamp);
                        });
                        callback(list, firstMessageDate);
                    }else {
                        index++;
                    }
                })
            });
        }
        try {
            createHTML((list, firstMessageDate) => {
                const body = document.createElement("ol");
                body.id = "chat-log";
                body.append(...list);

                const plainText = body.outerHTML.replace(/\n/g, "").replace(/\s\s/g, "");

                const date = ChatExporter.realignTime(firstMessageDate);
                const time = `${date.ye}${date.mo}${date.da}-${date.ho}${date.mi}${date.se}`;

                const file = new File([plainText], `${game.world.id}-log-${time}.html`, { type: 'text/html' });
                const url = window.URL.createObjectURL(file);

                const a = document.createElement('a');
                a.download = `${game.world.id}-log-${time}.html`;
                a.type = "text/html";
                a.href = url;
                a.target = "_blank";
                a.hidden = true;

                a.click();
                window.URL.revokeObjectURL(url);
            }, order);
        } catch (err) {
            debug("Exporting Log", err, true);
        }
    }
}