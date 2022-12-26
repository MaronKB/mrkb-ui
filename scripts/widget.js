class Widget extends Application {
	constructor(container, option) {
		super(option);
		this.container = container;
	}
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            popOut: false
        });
    }
	_injectHTML(html) {
        $(`#${this.container}`).append(html);
        this._element = html;
    }
    close() {}
}

/*─────────────────────────ALLIES LIST─────────────────────────*/
function getAllies() {
	let pc = game.user.character;
	let actors = game.user.isGM ? game.actors.filter(e => e.hasPlayerOwner && e.ownership.default >= 2) : game.actors.filter(e => e.hasPlayerOwner && e != pc && e.ownership.default >= 2);
	let allies = [];
	const parent = document.querySelector("#allies");
	parent.innerHTML = "";
	actors.forEach(function(a) {
		let resrc = (a.flags["mrkb-ui"]?.customresource === undefined) ? 0 : a.flags["mrkb-ui"].customresource.value;
		const hp = calcHP(a.id);
		const mana = calcMana(a.id);
		let div = document.createElement("div");
		div.classList.add('allies-container');
		div.dataset.id = a.id;
		div.innerHTML = `
			<div class="charaprofile">
				<img class="profilepic" src="${a.img}">
			</div>
			<div class="namespace">
				<h3 class="profilename">${a.name} [${resrc}]</h3>
			</div>
			<div class="mrkb-health">
				<h4 class="healthnumber">${hp.value}/${hp.max}</h4>
				<progress class="healthbar" value="${hp.hpm}" max="100">asdf</progress>
			</div>
			<div class="mrkb-mana">
				<h4 class="mananumber">${mana.value}/${mana.max}</h4>
				<progress class="manabar" value="${mana.mpm}" max="100">asdf</progress>
			</div>
		`;
		parent.appendChild(div);
	});
}

function toggleAllies() {
    let button = document.getElementById("toggleAllies");
    let leftside = document.getElementById("mrkb-left");
    if (button.classList.contains("char")) {
        button.classList.remove("char");
        leftside.classList.remove("char");
        button.classList.add("pl");
        leftside.classList.add("pl");
        button.innerHTML = `<i class="fa-solid fa-users"></i>`;
    }else if (button.classList.contains("pl")) {
        button.classList.remove("pl");
        leftside.classList.remove("pl");
        button.classList.add("closed");
        leftside.classList.add("closed");
        button.innerHTML = `<i class="fa-solid fa-users-slash"></i>`;
    }else {
        button.classList.remove("closed");
        leftside.classList.remove("closed");
        button.classList.add("char");
        leftside.classList.add("char");
        button.innerHTML = `<i class="fa-solid fa-people-group"></i>`;
    }
}

function userFace() {
    let users = game.users;
    users.forEach(function(u) {
        let target = document.querySelector(`li[data-user-id=\"${u.id}\"]`);
        if (target !== null) {
            let image = game.users.get(u.id).avatar;
            let div = document.createElement("div");
            div.setAttribute("class", "player-avatar");
            let img = document.createElement("img");
            img.setAttribute("src", image);
            div.appendChild(img);
            target.prepend(div);
        }
    });
}

/*─────────────────────────BOSS─────────────────────────*/

function addBossButton() {
	let button = document.createElement("div");
	button.classList.add("control-icon");
	button.innerHTML = "<i class='fa-solid fa-skull-crossbones'></i>"
	button.setAttribute("data-action", "boss");
	button.title = "보스로 지정";
	button.addEventListener("click", bossrize);
    document.querySelector(".col.left").append(button);
}
function bossrize() {
    let token = game.canvas.tokens.controlled[0].actor.id;
    if (token == HUDSetting.get("boss")) {
        HUDSetting.set("boss", "");
    }else {
        HUDSetting.set("boss", token);
    }
}
function getBoss() {
    let boss = HUDSetting.get("boss");
    if (boss == "") {
        document.getElementById("mrkb-boss").classList.add("hidden");
        return;
    }
    let actor = game.actors.get(boss);
    let hp = calcHP(boss);
    document.getElementById("bossbar").value = hp.hpm;
    document.getElementById("bossname").innerHTML = actor.name;
    document.getElementById("bossimg").src = actor.img;
    document.getElementById("mrkb-boss").classList.remove("hidden");
}

/*─────────────────────────CUSTOM RESOURCE─────────────────────────*/

function getResource() {
    const chara = game.user.character;
	const parent = document.querySelector("#custom-resource");
	if (chara !== undefined && chara !== null) {
		const resource = chara.flags["mrkb-ui"].customresource;
		parent.innerHTML = `
			<div id="resrcname">
				<input type="text" id="resrcnameinput" value="${resource.name}" onchange="resourceNameUpdate();" spellcheck="false">
				<a onclick="toggleResource();"><i class="fa-solid fa-minimize"></i></a>
			</div>
			<div id="resrccontrol">
				<a id="resrcdown" onclick="resourceValueUpdate('down');"><i class="fa-solid fa-minus"></i></a>
				<div id="resrc">
					<h3>${resource.value}</h3>
				</div>
				<a id="resrcup" onclick="resourceValueUpdate('up');"><i class="fa-solid fa-plus"></i></a>
			</div>
		`;
	}else {
	    parent.classList.add("hidden");
	}
}

function toggleResource() {
    let resrc = document.getElementById("custom-resource");
    let opener = document.getElementById("ui-resrc-open");
    if (resrc.classList.contains("hidden")) {
        resrc.classList.remove("hidden");
        opener.classList.add("hidden");
    }else {
        resrc.classList.add("hidden");
        opener.classList.remove("hidden");
    };
}
function resourceNameUpdate() {
    let name = document.querySelector("#resrcnameinput").value;
    game.user.character.update({"flags.mrkb-ui.customresource.name" : name});
}
function resourceValueUpdate(direction) {
    let value = game.user.character?.flags['mrkb-ui'].customresource.value;
    if (direction == "up") {
        value++;
    }else if (direction == "down") {
        value--;
    }else {
        return;
    };
    game.user.character.update({"flags['mrkb-ui'].customresource.value" : value});
    resource.render();
}
    

/*─────────────────────────DISPLAY─────────────────────────*/

function remoteDisplay(type) {
    let url = document.getElementById(`${type}-url`).value;
    if (type == "youtube" && url.substr(0, 32) == "https://www.youtube.com/watch?v=") {
        url = url.substr(32);
        if (url.substr(-1) == "/") {
            url = url.substr(0, -1);
        }
        url = `https://www.youtube.com/embed/${url}?amp;autoplay=1&amp;playlist=${url}&loop=1`
    }
    if (type != "flash") {
        HUDSetting.set(type, url);
    }
    socket.executeForEveryone("addDisplay", type, url);
}
function killDisplay(type) {
    HUDSetting.set(type, "");
    socket.executeForEveryone("removeDisplay", type);
}
function addDisplay(type, url){
    let target = document.getElementById(`display-${type}`);
    target.classList.remove("hidden");
    target.src = url;
    if (type === "image" || type === "video") {
        const bg = document.getElementById(`display-${type}-background`);
        bg.classList.remove("hidden");
        bg.src = url;
    }
}
function removeDisplay(type) {
    const target = document.getElementById(`display-${type}`);
    target.classList.add("hidden");
    setTimeout(function() {
        target.src = "";
    }, 300);
    if (type === "image" || type === "video") {
        const bg = document.getElementById(`display-${type}-background`);
        bg.classList.add("hidden");
        setTimeout(function() {
            bg.src = "";
        }, 300);
    }
}
function removeAllDisplay() {
    HUDSetting.reset();
    socket.executeForEveryone("removeDisplay", "youtube");
    socket.executeForEveryone("removeDisplay", "embed");
    socket.executeForEveryone("removeDisplay", "image");
    socket.executeForEveryone("removeDisplay", "video");
}
function clearDisplay(type) {
    document.getElementById(`${type}-url`).value = "";
}
function clearAllDisplay() {
    document.getElementById("youtube-url").value = "";
    document.getElementById("embed-url").value = "";
    document.getElementById("image-url").value = "";
    document.getElementById("video-url").value = "";
    document.getElementById("flash-url").value = "";
}
function readDisplay() {
    if (!HUDSetting.getStatus()) {
        return;
    }
    if (HUDSetting.get("youtube") !== "") {
        addDisplay("youtube", HUDSetting.get("youtube"));
    }
    if (HUDSetting.get("embed") !== "") {
        addDisplay("embed", HUDSetting.get("embed"));
    }
    if (HUDSetting.get("image") !== "") {
        addDisplay("image", HUDSetting.get("image"));
    }
    if (HUDSetting.get("video") !== "") {
        addDisplay("video", HUDSetting.get("video"));
    }
}

/*─────────────────────────ITEM CASTER─────────────────────────*/

function getItemCaster() {
    if (game.system.id !== "swade" && game.system.id !== "archmage" && game.system.id !== "dx3rd") {
        return;
    }
    const chara = game.user.character;
	const parent = document.querySelector("#item-caster");
	parent.innerHTML = "";
	if (chara !== undefined && chara !== null) {
	    const slot = getSlotData();
		slot.forEach((e) => {
			let div = document.createElement("div");
			div.classList.add("caster-tab");
			div.setAttribute("tab-type", `${e.name}`);
			let slot = document.createElement("div");
			slot.classList.add("caster-slot");
			slot.innerHTML =`
				<a class="slot-arrow" onclick="casterArrow('${e.name}', 'left')"><i class="fa-solid fa-caret-left"></i></a>
				<h3>${e.name}</h3>
				<a class="slot-arrow" onclick="casterArrow('${e.name}', 'right')"><i class="fa-solid fa-caret-right"></i></a>
			`;
			let tab = document.createElement("div");
			tab.classList.add("item-tab");
            tab.addEventListener('wheel', (e) => {
                e.preventDefault();
                let target = document.querySelector(".caster-tab.active").lastElementChild;
                let newheight;
                if (e.deltaY < 0) {
                    newheight = target.scrollTop - 25;
                }else {
                    newheight = target.scrollTop + 25;
                }
                target.scrollTo(0, newheight);
            });
			e.items.forEach(function(i) {
				let item = document.createElement("a");
				item.classList.add("cast-items");
				item.onclick = function() {
					castItem(`${i.id}`);
				}
				item.innerHTML = `
					<img src="${i.img}">
					<h3 class="profilename">${i.name}</h3>
				`;
				tab.appendChild(item);
			});
			div.appendChild(slot);
			div.appendChild(tab);
		    parent.appendChild(div);
		});
	}else {
	    document.getElementById("item-caster").classList.add("hidden");
	}
    document.getElementsByClassName("caster-tab")[0].classList.add("active");
}

function getSlotData() {
	let items = [];
	let slot = [];
	if (game.user.character === null || game.user.character?.items.size == 0) {
		slot = [{
			name: "EMPTY",
			items: [{id: null, name: "empty", img: "modules/mrkb-ui/src/chestnut.png"}]
		}];
	}else {
		game.user.character.items.forEach(function(e) {
			if (!items.includes(game.i18n.localize(`MRKB.ItemType.${e.type.toUpperCase()}`))) {
				items.push(game.i18n.localize(`MRKB.ItemType.${e.type.toUpperCase()}`));
			}
		});
		items.forEach(function(i) {
			slot.push({name: i, items: []});
		});
		game.user.character.items.forEach(function(e) {
			slot.find(a => a.name == game.i18n.localize(`MRKB.ItemType.${e.type.toUpperCase()}`)).items.push({id: e.id, name: e.name, img: e.img});
		});
	}
	return slot;
}

function toggleCaster() {
    let caster = document.getElementById("item-caster");
    let opener = document.getElementById("ui-skill-open");
    let notify = document.getElementById("ui-noti-open");
    if (caster.classList.contains("hidden")) {
        caster.classList.remove("hidden");
        notify.classList.remove("moved");
        opener.classList.add("hidden");
    }else {
        caster.classList.add("hidden");
        notify.classList.add("moved");
        opener.classList.remove("hidden");
    };
}

function castItem(id) {
    const target = game.user.character.items.get(id);
    let name = target.name;
    let img = target.img;
    let desc;
    if (target.system.description == undefined) {
        desc = "";
    }else if (target.system.description.value == undefined) {
        desc = target.system.description;
    }else {
        desc = target.system.description.value;
    }
    if (target == undefined) {
        return;
    }
    if (target.data.data.die == undefined && game.system.id == "swade") {
        target.show();
    }else {
        target.roll();
    }
}

function casterArrow(name, direction) {
	if (game.user.character == undefined || game.user.character.items.size == 0) {
	    return;
	}
    let tabs = document.getElementsByClassName("caster-tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
    let slot = getSlotData();
    let length = slot.length;
    let now = slot.findIndex(e => e.name == name);
    let next = (now >= length - 1) ? 0 : now + 1;
    let prev = (now <= 0) ? length - 1 : now - 1;
    let change;
    if (direction == "left") {
        change = slot[prev].name;
    }else if (direction == "right") {
        change = slot[next].name;
    }else {
        return;
    }
    let target = "[tab-type='" + change + "']";
    let newtab = document.querySelector(target);
    newtab.classList.add("active");
}
function resizeCaster(dir) {
    let height = HUDSetting.get("caster-height");
    if (dir === "up") {
        if (height >= 500) {
            height = 500;
        }else {
            height += 50;
        }
    }else if (dir === "down") {
        if (height <= 150) {
            height = 150;
        }else {
            height -= 50;
        }
    }
    HUDSetting.set("caster-height", height);
    document.documentElement.style.setProperty("--caster-height", height + "px");
}

/*─────────────────────────TEMPLATE─────────────────────────*/

function addTemplateButton() {
	let btn = document.createElement("div");
	btn.classList.add("control-icon");
	btn.setAttribute("data-action", "template");
	btn.title = "템플릿";
	btn.innerHTML = `
	    <i class="fa-solid fa-shapes"></i>
	    <div class='templaters'>
	        <div class='templater' data-type='sqr8' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-grip-lines"></i>
	            <span>08</span>
	        </div>
	        <div class='templater' data-type='sqc8' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-grip-lines-vertical"></i>
	            <span>08</span>
	        </div>
	        <div class='templater' data-type='cir8' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-square"></i>
	            <span>08</span>
	        </div>
	        <div class='templater' data-type='cro8' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-xmark"></i>
	            <span>08</span>
	        </div>
	        <div class='templater' data-type='sqr12' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-grip-lines"></i>
	            <span>12</span>
	        </div>
	        <div class='templater' data-type='sqc12' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-grip-lines-vertical"></i>
	            <span>12</span>
	        </div>
	        <div class='templater' data-type='rho12' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-diamond"></i>
	            <span>12</span>
	        </div>
	        <div class='templater' data-type='cro12' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-xmark"></i>
	            <span>12</span>
	        </div>
	        <div class='templater' data-type='sqr26' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-grip-lines"></i>
	            <span>26</span>
	        </div>
	        <div class='templater' data-type='sqc26' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-grip-lines-vertical"></i>
	            <span>26</span>
	        </div>
	        <div class='templater' data-type='cir24' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-square"></i>
	            <span>24</span>
	        </div>
	        <div class='templater' data-type='cro24' onclick='setupTemplate(this)'>
	            <i class="fa-solid fa-xmark"></i>
	            <span>24</span>
	        </div>
	    </div>
	`;
	btn.addEventListener("click", getTemp);
	document.querySelector(".col.right").append(btn);
}

function getTemp() {
    const btn = document.querySelector("[data-action='template']");
    if (btn.classList.contains("active")) {
        btn.classList.remove("active");
    }else {
        btn.classList.add("active");
    }
}

async function setupTemplate(target) {
    const type = target.dataset.type;
    const token = game.canvas.tokens.controlled[0];
    const old = game.canvas.drawings.objects.children.filter(e => e.document.text == token.name);
    old.forEach((e) => {
        e.document.delete();
    });
    
    let pos, point;
    let x = token.x;
    let y = token.y;
    if (type == "sqr8") {
        pos = {
            x: x - 400,
            y: y,
            w: 900,
            h: 100
        };
        point = [
            0, 0,
            900, 0,
            900, 100,
            0, 100,
            0, 0
        ];
    }else if (type == "sqc8") {
        pos = {
            x: x,
            y: y - 400,
            w: 100,
            h: 900
        };
        point = [
            0, 0,
            0, 900,
            100, 900,
            100, 0,
            0, 0
        ];
    }else if (type == "cir8") {
        pos = {
            x: x - 100,
            y: y - 100,
            w: 300,
            h: 300
        };
        point = [
            0, 0,
            300, 0,
            300, 300,
            0, 300,
            0, 0
        ];
    }else if (type == "cro8") {
        pos = {
            x: x - 200,
            y: y - 200,
            w: 500,
            h: 500
        };
        point = [
            200, 0,
            300, 0,
            300, 200,
            500, 200,
            500, 300,
            300, 300,
            300, 500,
            200, 500,
            200, 300,
            0, 300,
            0, 200,
            200, 200,
            200, 0
        ];
    }else if (type == "sqr12") {
        pos = {
            x: x - 600,
            y: y,
            w: 1300,
            h: 100
        };
        point = [
            0, 0,
            1300, 0,
            1300, 100,
            0, 100,
            0, 0
        ];
    }else if (type == "sqc12") {
        pos = {
            x: x,
            y: y - 600,
            w: 100,
            h: 1300
        };
        point = [
            0, 0,
            0, 1300,
            100, 1300,
            100, 0,
            0, 0
        ];
    }else if (type == "rho12") {
        pos = {
            x: x - 200,
            y: y - 200,
            w: 500,
            h: 500
        };
        point = [
            200, 0,
            300, 0,
            300, 100,
            400, 100,
            400, 200,
            500, 200,
            500, 300,
            400, 300,
            400, 400,
            300, 400,
            300, 500,
            200, 500,
            200, 400,
            100, 400,
            100, 300,
            0, 300,
            0, 200,
            100, 200,
            100, 100,
            200, 100,
            200, 0
        ];
    }else if (type == "cro12") {
        pos = {
            x: x - 300,
            y: y - 300,
            w: 700,
            h: 700
        };
        point = [
            300, 0,
            400, 0,
            400, 300,
            700, 300,
            700, 400,
            400, 400,
            400, 700,
            300, 700,
            300, 400,
            0, 400,
            0, 300,
            300, 300,
            300, 0
        ];
    }else if (type == "sqr26") {
        pos = {
            x: x - 400,
            y: y - 100,
            w: 900,
            h: 300
        };
        point = [
            0, 0,
            900, 0,
            900, 300,
            0, 300,
            0, 0
        ];
    }else if (type == "sqc26") {
        pos = {
            x: x - 100,
            y: y - 400,
            w: 300,
            h: 900
        };
        point = [
            0, 0,
            0, 900,
            300, 900,
            300, 0,
            0, 0
        ];
    }else if (type == "cir24") {
        pos = {
            x: x - 200,
            y: y - 200,
            w: 500,
            h: 500
        };
        point = [
            0, 0,
            500, 0,
            500, 500,
            0, 500,
            0, 0
        ];
    }else if (type == "cro24") {
        pos = {
            x: x - 600,
            y: y - 600,
            w: 1300,
            h: 1300
        };
        point = [
            600, 0,
            700, 0,
            700, 600,
            1300, 600,
            1300, 700,
            700, 700,
            700, 1300,
            600, 1300,
            600, 700,
            0, 700,
            0, 600,
            600, 600,
            600, 0
        ];
    }
    await canvas.scene.createEmbeddedDocuments("Drawing", [{
        x: pos.x,
        y: pos.y,
        width: pos.w,
        height: pos.h,
        shape: {
            type: "p", 
            points: point
        },
        text: token.name,
        textAlpha: 0,
        fillColor: "#FFFFFF",
        fillAlpha: .25,
        fillType: 1,
        strokeColor: "#FFFFFF",
        strokeAlpha: .75,
        strokeWidth: 5,
        flags: {
            "template" : true
        }
    }]);
}

/*─────────────────────────STANCE─────────────────────────*/

function addStanceButton() {
	let btn = document.createElement("div");
	btn.classList.add("control-icon");
	btn.setAttribute("data-action", "stance");
	btn.title = "태세";
	btn.innerHTML = `
	    <i class="fa-solid fa-person-running"></i>
	    <div class='stances'>
	        <div class='stance' data-type='power' onclick='setStance(this)'>
	            <i class='fa-solid fa-hammer-crash'></i>
	            <span>강타</span>
	        </div>
	        <div class='stance' data-type='attack' onclick='setStance(this)'>
	            <i class='fa-solid fa-swords'></i>
	            <span>공격</span>
	        </div>
	        <div class='stance' data-type='defence' onclick='setStance(this)'>
	            <i class='fa-solid fa-shield-halved'></i>
	            <span>방어</span>
	        </div>
	    </div>
	`;
	btn.addEventListener("click", getStance);
	document.querySelector(".col.left").append(btn);
}

function getStance() {
    const token = game.canvas.tokens.controlled[0].actor;
    
    const btn = document.querySelector("[data-action='stance']");
    if (btn.classList.contains("active")) {
        btn.classList.remove("active");
    }else {
        btn.classList.add("active");
    }
    const current = token.effects.find(e => e.flags.isStance);
    if (current === undefined || current === null) {
        return;
    }
    const target = document.querySelector(`[data-type=${current.label}]`);
    target.classList.add("active");
}
function setStance(target) {
    let change = [];
    const token = game.canvas.tokens.controlled[0].actor;
    const current = token.effects.filter(e => e.flags.isStance);
    current.forEach((e) => {
        e.delete();
    });
    const btns = document.querySelectorAll('.stance');
    if (!target.classList.contains("active")) {
        btns.forEach((e) => {
            if (e != target) {
                e.classList.remove("active");
            }
        });
    }else {
        target.classList.remove("active");
        return;
    }
    target.classList.add("active");
    if (target.dataset.type == "power" || target.dataset.type == "attack") {
        change = [
            {
                key: "system.stats.parry.value",
                mode: 2,
                value: "-2"
            }
        ]
    }else if (target.dataset.type == "defence") {
        change = [
            {
                key: "system.stats.parry.value",
                mode: 2,
                value: "2"
            }
        ]
    }
    game.user.character.createEmbeddedDocuments("ActiveEffect", [
        {
            label: target.dataset.type,
            icon: "modules/mrkb-ui/src/chestnut.png",
            flags: {
                isStance : true
            },
            changes: change
        }
    ]);
}