class shopSetting extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["sheet"],
            template: "modules/mrkb-ui/templates/setting/shop.html",
            width: 500,
        });
    }
    getData() {
        return {
            folder : HUDSetting.get("shop"),
            merchant : {
                name : HUDSetting.get("merchant"),
                comment : HUDSetting.get("merchant-comment"),
                notenough : HUDSetting.get("merchant-notenough"),
                thanks : HUDSetting.get("merchant-thanks")
            }
        };
    }
}
class tabletSetting extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["sheet"],
            template: "modules/mrkb-ui/templates/setting/tablet.html",
            width: 500,
        });
    }
    getData() {
		const docks = [];
        const reg = new RegExp(/\/([0-9]|[a-z])+\.html/, "g");
		const list = [HUDSetting.get("dock1-name"), HUDSetting.get("dock2-name"), HUDSetting.get("dock3-name"), HUDSetting.get("dock4-name"), HUDSetting.get("dock5-name")];
		for (let i=1; i<=5; i++) {
		    let name = HUDSetting.get(`dock${i}-name`);
		    let fas = HUDSetting.get(`dock${i}-fas`);
		    let url = HUDSetting.get(`dock${i}-url`);
		    docks.push({order: i, name : name, fas : fas, url : url});
		};
		const selected = {
		    hor : false,
		    ver : false,
		    big : false,
		    med : false,
		    small : false
		}
		const direction = HUDSetting.get("tablet-direction");
		if (!direction) {
		    selected.hor = true;
		}else {
		    selected.ver = true;
		}
		const size = HUDSetting.get("tablet-size");
		if (size === "big") {
		    selected.big = true;
		}else if (size === "med") {
		    selected.med = true;
		}else {
		    selected.small = true;
		}
		
        return {
            dock : docks,
            back : HUDSetting.get("tablet-background"),
            direction : direction,
            size : size,
            selected : selected
        };
    }
}
function settingUpdate(id) {
	const target = document.querySelector(`[setting-data=${id}]`).value;
	HUDSetting.set(id, target);
	calcSize();
}
class HUDSetting {
	static get(key) {
		return game.settings.get('mrkb-ui', key);
	}
	static getStatus() {
	    if (HUDSetting.get("youtube") === "" && HUDSetting.get("embed") === "" && HUDSetting.get("image") === "" && HUDSetting.get("video") === "") {
	        return false;
	    }else {
	        return true;
	    }
	}
	static set(type, url) {
	    game.settings.set("mrkb-ui", type, url);
	}
	static reset() {
	    game.settings.set("mrkb-ui", "youtube", "");
	    game.settings.set("mrkb-ui", "embed", "");
	    game.settings.set("mrkb-ui", "image", "");
	    game.settings.set("mrkb-ui", "video", "");
	}
	static register() {
		game.settings.register('mrkb-ui', 'inventory', {
			name: "???????????? ??????",
			hint: "??????????????? ????????? ???????????? ???????????????. ????????? ????????? ????????? ????????? ??????????????? ????????? ?????????. ???????????? ????????? ?????? ????????? ????????? ?????? ????????? ????????? ??? ????????????.",
			scope: 'world',
			config: true,
			type: String,
			default: ""
		});
		game.settings.register('mrkb-ui', 'quest', {
			name: "????????? ??????",
			hint: "???????????? ????????? ???????????? ???????????????. ????????? ????????? ????????? ?????? ??????????????? ????????? ?????????. ???????????? ????????? ?????? ????????? ????????? ?????? ????????? ????????? ??? ????????????.",
			scope: 'world',
			config: true,
			type: String,
			default: ""
		});
		
		/*UTILITY*/
		
		game.settings.register("mrkb-ui", "quickchat", {
			name: "?????? ?????? ??????",
			hint: "??????????????? ?????? ?????? ?????? ????????? ??????????????? ????????????, ???????????? ??????????????? ???????????????.",
			scope: "client",
			config: true,
			type: Boolean,
			default: false
		});
		game.settings.register("mrkb-ui", "selection", {
			name: "?????? ?????? ??????",
			hint: "????????? ???????????? ??? ????????? ????????? ???????????????. ??????????????? ???????????? ????????? ?????? ????????? ????????????, ?????? ?????? ????????? ????????? ?????????. ?????????????????? ????????? ???????????? ????????? ?????? ????????? ???, ?????? ?????? ????????? ????????? ?????????.",
			scope: "client",
			config: true,
			type: Boolean,
			default: false
		});
		game.settings.register("mrkb-ui", "roll20chat", {
			name: "Roll20??? ?????????",
			hint: "?????? ??? ????????? ????????? ?????????",
			scope: "client",
			config: true,
			type: Boolean,
			default: false,
			onChange: value => window.location.reload()
		});
		
		/*ETC*/
		
		game.settings.register("mrkb-ui", "youtube", {
			name: "?????????",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "embed", {
			name: "?????????",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "image", {
			name: "?????????",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "video", {
			name: "?????????",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "boss", {
			name: "??????",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "announcement", {
			name: "??????",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
	    
		/*TABLET*/
		
        game.settings.registerMenu('mrkb-ui', 'tablet-setting', {
            name: game.i18n.localize('TabletSetting'),
            label: game.i18n.localize('SCENES.Configure'),
            icon: 'fa-solid fa-tablet',
            type: tabletSetting,
            restricted: true
        });
        game.settings.register("mrkb-ui", "tablet-direction", {
			name: "dockname1",
			scope: "client",
			config: false,
			type: String,
			default: "horizontal"
		});
        game.settings.register("mrkb-ui", "tablet-size", {
			name: "dockname1",
			scope: "client",
			config: false,
			type: String,
			default: "med"
		});
        game.settings.register("mrkb-ui", "tablet-background", {
			name: "dockname1",
			scope: "world",
			config: false,
			type: String,
			default: "med"
		});
		game.settings.register("mrkb-ui", "dock1-name", {
			name: "dockname1",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock2-name", {
			name: "docknam2e",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock3-name", {
			name: "dockname3",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock4-name", {
			name: "dockname4",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock5-name", {
			name: "dockname5",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock1-fas", {
			name: "dockfas1",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock2-fas", {
			name: "dockfas2",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock3-fas", {
			name: "dockfas3",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock4-fas", {
			name: "dockfas4",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock5-fas", {
			name: "dockfas5",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock1-url", {
			name: "dockurl1",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock2-url", {
			name: "dockurl2",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock3-url", {
			name: "dockurl3",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock4-url", {
			name: "dockurl4",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "dock5-url", {
			name: "dockurl5",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		
		game.settings.register("mrkb-ui", "caster-height", {
			name: "??????",
			scope: "client",
			config: false,
			type: Number,
			default: 400
		});
	}
}