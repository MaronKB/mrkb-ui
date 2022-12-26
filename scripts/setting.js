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
			name: "인벤토리 폴더",
			hint: "인벤토리에 사용될 폴더명을 지정합니다. 이름이 동일한 폴더가 아이템 디렉토리에 있어야 합니다. 중복되는 이름을 가진 폴더가 존재할 경우 오류가 발생할 수 있습니다.",
			scope: 'world',
			config: true,
			type: String,
			default: ""
		});
		game.settings.register('mrkb-ui', 'quest', {
			name: "퀘스트 폴더",
			hint: "퀘스트로 사용될 폴더명을 지정합니다. 이름이 동일한 폴더가 저널 디렉토리에 있어야 합니다. 중복되는 이름을 가진 폴더가 존재할 경우 오류가 발생할 수 있습니다.",
			scope: 'world',
			config: true,
			type: String,
			default: ""
		});
		
		/*UTILITY*/
		
		game.settings.register("mrkb-ui", "quickchat", {
			name: "빠른 대화 사용",
			hint: "활성화하면 토큰 선택 즉시 커서가 대화창으로 이동하고, 자동으로 큰따옴표가 입력됩니다.",
			scope: "client",
			config: true,
			type: Boolean,
			default: false
		});
		game.settings.register("mrkb-ui", "selection", {
			name: "선택 범위 지정",
			hint: "토큰을 변경했을 때 커서의 상태를 설정합니다. 활성화하면 따옴표를 제외한 모든 문장을 선택하여, 즉시 수정 가능한 상태가 됩니다. 비활성화하면 커서가 따옴표를 제외한 문장 끝으로 가, 계속 작성 가능한 상태가 됩니다.",
			scope: "client",
			config: true,
			type: Boolean,
			default: false
		});
		game.settings.register("mrkb-ui", "roll20chat", {
			name: "Roll20형 챗로그",
			hint: "이런 게 그리운 사람을 위하여",
			scope: "client",
			config: true,
			type: Boolean,
			default: false,
			onChange: value => window.location.reload()
		});
		
		/*ETC*/
		
		game.settings.register("mrkb-ui", "youtube", {
			name: "유튜브",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "embed", {
			name: "임베드",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "image", {
			name: "이미지",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "video", {
			name: "비디오",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "boss", {
			name: "보스",
			scope: "world",
			config: false,
			type: String,
			default: ""
		});
		game.settings.register("mrkb-ui", "announcement", {
			name: "공지",
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
			name: "높이",
			scope: "client",
			config: false,
			type: Number,
			default: 400
		});
	}
}