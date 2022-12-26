/*─────────────────────────ACTOR SELECTOR─────────────────────────*/

class ActorSelector extends Application {
	constructor(option) {
		super(option);
	}
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
			title: "Actor Selector",
            template: "modules/mrkb-ui/templates/application/actorselector.html",
            id : "actor-selector",
            popOut: true
        });
    }
    getData() {
        if (game.user.flags["mrkb-ui"].favorites == undefined) {
            game.user.update({"flags['mrkb-ui'].favorites" : []});
        }
		let folder = {};
		folder["unclassified"] = {id: "unclassified", name: game.i18n.localize("MRKB.Unclassified"), content: []};
		
		let favorite = game.actors.filter(e => game.user.flags["mrkb-ui"].favorites.includes(e.id));
		game.actors.forEach(function(a) {
		    let favor;
		    if (game.user.flags["mrkb-ui"].favorites.includes(a.id)) {
		        favor = "checked";
		    }else {
		        favor = "unchecked";
		    }
		    if (a.folder == null) {
		        folder["unclassified"].content.push({id: a.id, name: a.name, img: a.img, favor: favor});
		        return;
		    }
		    if (folder[a.folder.name] == undefined) {
		        folder[a.folder.name] = {id: a.folder.id, name: a.folder.name, content: []};
		    }
		    folder[a.folder.name].content.push({id: a.id, name: a.name, img: a.img, favor: favor});
		})
		let favor = [];
		let fav = game.actors.filter(e => game.user.flags["mrkb-ui"].favorites.includes(e.id));
		fav.forEach(function(f) {
		    favor.push({id: f.id, name: f.name, img: f.img});
		})
        return {
            folder: folder,
            favor: favor
        }
    }
}

class ActorChanger extends Application {
	constructor(option) {
		super(option);
	}
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
			title: "Actor Selector",
            template: "modules/mrkb-ui/templates/application/actorchanger.html",
            id : "actor-changer",
            popOut: true
        });
    }
    getData() {
        let box = [];
        let actors = game.actors.filter(e => e.permission === 3);
        actors.forEach((e) => {
            let a = {
                id: e.id,
                name: e.name,
                img: e.img
            }
            box.push(a);
        });
        return {actor: box}
    }
}

const acts = new ActorSelector();
const actc = new ActorChanger();

function uiChange() {
    if (game.user.isGM) {
        acts.render(true);
        return;
    }else {
        actc.render(true);
        return;
    }
    /*
    canvas.tokens.releaseAll();
    let chara = game.user.character;
    let actors = game.actors.filter(e => e.isOwner);
    let i = (actors.length <= actors.indexOf(chara) + 1) ? 0 : actors.indexOf(chara) + 1;
    let newactor = actors[i];
    game.user.update({ character : newactor.id });
    canvas.tokens.releaseAll();
    ui.notifications.info(`
        <div class="changepopup">
            <img src=\"${newactor.img}\">
            <h2>${newactor.name}</h2>
        </div>
    `);
    */
}

function selectActor(id) {
    if (event.button == 0) {
        canvas.tokens.releaseAll();
        game.user.update({ character : id });
        let newactor = game.actors.get(id);
        ui.notifications.info(`
            <div class="changepopup">
                <img src=\"${newactor.img}\">
                <h2>${newactor.name}</h2>
            </div>
        `);
        canvas.tokens.releaseAll();
    }else if (event.button == 2) {
        let fav = game.user.flags["mrkb-ui"].favorites.includes(id);
        let newfav;
        if (fav) {
            newfav = game.user.flags["mrkb-ui"].favorites.filter(e => e != id);
            game.user.update({"flags.mrkb-ui.favorites" : newfav });
        }else {
            newfav = game.user.flags["mrkb-ui"].favorites;
            newfav.push(id);
            game.user.update({"flags.mrkb-ui.favorites" : newfav });
        }
    }else {
        alert("!");
    }
}

function resetActor() {
    canvas.tokens.releaseAll();
    game.user.update({ "character" : null });
}

/*─────────────────────────DISPLAY REMOTE CONTROLLER─────────────────────────*/

class DisplayRemote extends Application {
	constructor(option) {
		super(option);
	}
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/mrkb-ui/templates/application/displayremote.html",
            id : "display-remote",
			title: "DISPLAY REMOTE",
            minimizable: false,
            popOut: true,
            resizable: false,
            width: 300,
            height: 200
        });
    }
}
class DisplayBrowser extends FilePicker {
	constructor(sceneType, option) {
		super(option);
		if (sceneType == "image") {
	    	this.type = "image";
		    this.extensions = [".apng", ".bmp", ".svg", ".jpg", "jpeg", ".png", ".gif", "webp"];
		}else if (sceneType == "video" || sceneType == "overlay" || sceneType == "flash") {
	    	this.type = "video";
		    this.extensions = [".ogg", ".mp4", ".webm"];
		}else {
		    ui.notifications.error("잘못된 분류입니다.");
		}
		this.callback = () => {
		    document.getElementById(`${sceneType}-url`).value = document.getElementsByClassName("picked")[0].attributes["data-path"].value;
		}
	}
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
			title: "탐색기",
            id : "display-browser",
            classes: ['filepicker'],
            minimizable: false,
            popOut: true,
            resizable: false
        });
    }
}
    

function remoteControl() {
    remoteController = new DisplayRemote();
    remoteController.render(true);
}
function browseDisplay(type) {
    let browser = new DisplayBrowser(type);
    browser.render(true);
}

/*─────────────────────────INVENTORY─────────────────────────*/

class Inventory extends Application {
	constructor(option) {
		super(option);
		this.alies = [];
	}
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/mrkb-ui/templates/application/inventory.html",
            id : "inventory",
			title: "INVENTORY",
            minimizable: false,
            popOut: true,
            resizable: false
        });
    }
    getData() {
        let invname = HUDSetting.get("inventory");
		let target = game.folders.getName(invname);
		let folder = [];
		let item = [];
        target.children.forEach(function(c) {
            c.item = [];
            c.content.forEach(function(i) {
                let desc;
                if (i.system.description == undefined) {
                    desc = "";
                }else if (i.system.description.value == undefined) {
                    desc = i.system.description;
                }else {
                    desc = i.system.description.value;
                }
                c.item.push({id: i.id, name: i.name, img: i.img, desc: desc});
            });
            folder.push({id: c.id, name: c.name, item: c.item});
        });
        target.content.forEach(function(j) {
            let desc;
            if (j.system.description == undefined) {
                desc = "";
            }else if (j.system.description.value == undefined) {
                desc = j.system.description;
            }else {
                desc = j.system.description.value;
            }
            item.push({id: j.id, name: j.name, img: j.img, desc: desc});
        });
        return {
            folder: folder,
            etc: item
        }
    }
}

function uiInventory() {
    if (!checkFolder("inventory", "Item")) {
        return;
    }
    inv = new Inventory();
    inv.render(true);
}

function invUse(id) {
    let target = game.items.get(id);
    let name = target.name;
    let img = target.img;
    let desc;
    if (target.system.description === undefined) {
        desc = "";
    }else if (target.system.description.value === undefined) {
        desc = target.system.description;
    }else {
        desc = target.system.description.value;
    }
	ChatMessage.create({
		content: `
		    <div class="mrkb-itemcard">
		        <div class="mrkb-itemhead">
		            <img src="${img}">
		            <h3>${name}</h3>
		        </div>
		        <div class="mrkb-itemdesc">
		            ${desc}
		        </div>
		    </div>
	    `,
		speaker: ChatMessage.getSpeaker()
	});
}

function itemDetail(id, a) {
    let target = "[item='" + id + "']";
    let item = document.querySelector(target);
    if (a) {
        item.classList.add("active");
    }else {
        item.classList.remove("active");
    }
}

/*─────────────────────────KAKAO TALK─────────────────────────*/

let needFocus, temp;

class KakaoTalk extends Application {
	constructor(option) {
		super(option);
	}
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
			title: "KAKAOTALK",
            template: "modules/mrkb-ui/templates/application/kakaotalk.html",
            //classes: ["kakaotalk", "dialog"],
			id: "kakao-talk",
			popout: true
        });
    }
    getData() {
    }
}

function getKakaoData() {
    if (document.querySelector("#kakao-talk") === undefined) {
        return;
    }
	let content;
	const path = `worlds/${game.world.id}/`;
    const parent = document.querySelector("#kakaolog");
	let obj = { "talk"  : [] };
    let a = new Promise((resolve, reject) => {
		fetch(`worlds/${game.world.id}/kakao.json`)
	    .then((response) => {
	        if (response.status == 404) {
	    	    saveKakao(obj);
	    	    getKakaoData();
	    	    return;
	        }
	        resolve(response.json());
	    });
    });
    a.then((data) => {
        let box = document.createElement("div");
        
        const talk = data.talk.sort(function(a, b)  {
                let i = (a.time >= b.time) ? 1 : -1;
            return i;
        });
        talk.forEach((e) => {
            let chat = document.createElement("div");
            chat.classList.add("chat");
            if (e.owner === game.userId) {
                chat.classList.add("self");
            }
            chat.innerHTML = `
				<div class="profile">
				    <img src="${e.img}">
				</div>
				<div class="kakaoname">${e.name}</div>
				<div class="kakao">${e.talk}</div>
			`;
			box.appendChild(chat);
        });
        parent.innerHTML = box.innerHTML;
        parent.scrollTo(0, parent.scrollHeight);
    });
}

function kakaoDialog() {
	dialog = new KakaoTalk();
	dialog.render(true);
}

function sendtalk() {
	let chara = game.user.character;
	let time = Date.now();
	let talk = document.getElementById('kakaomessage').value;
	if (talk == "" || talk == "&nbsp;" || talk.substr(0,1) == "\n" || (talk.substr(0,1) == " " && talk.substr(talk.length-1, 1) == " ")) {
		return;
	}else {
		let a = new Promise((resolve, reject) => {
			fetch(`worlds/${game.world.id}/kakao.json`)
			.then((response) => {
				resolve(response.json());
			})
			.catch(() => {
			});
		});
		a.then((data) => {
			let newkakao = {
				"name" : chara.name,
				"img" : chara.img,
				"talk" : talk,
				"owner" : game.userId,
				"time" : time
			}
			data.talk.push(newkakao);
			saveKakao(data);
	        setTimeout(() => {
	            socket.executeForEveryone("getKakaoData");
	        },100);
	        document.getElementById('kakaomessage').value = "";
		});
	}
}

function saveKakao(data) {
	const path = `worlds/${game.world.id}/`;
	let objs = JSON.stringify(data, null, "");
	let file = new File([objs], "kakao.json", {type: "application/json"});
	FilePicker.upload("data", path, file, {}, {notify : false});
}

function addEnter() {
	document.querySelector("#kakaomessage").addEventListener('keydown', (event) => {
        if (event.keyCode == 13) {
            if (!event.shiftKey){
                event.preventDefault();
			    document.getElementById('sendmessage').click();
                $('#kakaomessage').empty();
            }
        }
    });
}

function addOpacity() {
    const kakao = document.querySelector("#kakao-talk")
    const slide = document.querySelector("#kakaoopacity")
    slide.addEventListener("input", (event) => {
        kakao.style.opacity = slide.value * 0.009 + 0.1;
    });
}

/*─────────────────────────QUEST─────────────────────────*/

class Quest extends Application {
	constructor(option) {
		super(option);
		this.data = {
			title: "",
			content: "",
			buttons: {}
		};
	}
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/mrkb-ui/templates/application/quest.html",
            id : "quest",
            minimizable: false,
            popOut: true,
            resizable: false,
            width: 400,
            height: 400
        });
    }
    getData() {
        let questname = HUDSetting.get("quest");
        let source = game.folders.getName(questname);
            
		let quest = {};
		source.children.forEach(function(c) {
		    quest[c.name] = {id: c.id, name: c.name, content: []};
		    c.content.filter(e => e.data.permission.default >= 2).forEach(function(a) {
		        quest[c.name].content.push({id: a.id, name: a.name, desc: a.data.content});
		    });
		})
		quest["미분류"] = {name: "미분류", content: []};
		source.content.filter(e => e.data.permission.default >= 2).forEach(function(a) {
		    quest["미분류"].content.push({id: a.id, name: a.name, desc: a.data.content});
		});
        return {
            quest: quest
        }
    }
}

function uiQuest() {
    if (!checkFolder("quest", "JournalEntry")) {
        return;
    }
    quest = new Quest();
    quest.render(true);
}

function questOpen(id) {
    let bars = document.getElementsByClassName("quest-name");
    let tabs = document.getElementsByClassName("quest");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
        bars[i].classList.remove("active");
    }
    let target = "[data-tab='" + id + "']";
    let newtab = document.querySelectorAll(target);
    newtab[0].classList.add("active");
    newtab[1].classList.add("active");
}

/*─────────────────────────TABLET─────────────────────────*/

class Tablet extends Application {
	constructor(option) {
		super(option);
	}
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/mrkb-ui/templates/application/tablet.html",
            id : "tablet",
			title: "TABLET",
            minimizable: false,
            popOut: true,
            resizable: false
        });
    }
    getData() {
		const applist = [];
		const data = game.macros.filter(e => e.data.permission.default >= 2);
		data.forEach(function(e) {
			applist.push({id : e.data._id, name : e.data.name, img : e.data.img})
		});
		
		const docks = [];
        const reg = new RegExp(/\/([0-9]|[a-z])+\.html/, "g");
		const list = [HUDSetting.get("dock1-name"), HUDSetting.get("dock2-name"), HUDSetting.get("dock3-name"), HUDSetting.get("dock4-name"), HUDSetting.get("dock5-name")];
		for (let i=1; i<=5; i++) {
		    let name = HUDSetting.get(`dock${i}-name`);
		    let fas = HUDSetting.get(`dock${i}-fas`);
		    let url = HUDSetting.get(`dock${i}-url`);
		    if (name !== "" && fas !== "" && url !== "") {
		        docks.push({name : name, fas : fas, url : url});
		    }
		};
		calcSize();
        return {
            app: applist,
            dock: docks
        }
    }
}

const tablet = new Tablet;

function run(target) {
	game.macros.get(target).execute();
}
function activeApp(app) {
    const apps = document.getElementsByClassName("tablet-window");
    for (a of apps) {
        a.classList.remove("active");
    };
    const target = document.getElementById(`tablet-${app}`);
    target.classList.add("active");
}
function calcSize() {
	let grid, size, col, row, width, height;
	const sizes = HUDSetting.get("tablet-size");
	if (sizes === "big") {
	    grid = [7, 5];
	    size = [800, 600];
	    
	}else if (sizes === "med") {
	    grid = [6, 4];
	    size = [600, 450];
	}else {
	    grid = [4, 3];
	    size = [400, 300];
	}
	const direction = HUDSetting.get("tablet-direction");
	if (direction === "horizontal") {
	    width = size[0];
	    height = size[1];
	    col = grid[0];
	    row = grid[1];
	}else {
	    width = size[1];
	    height = size[0];
	    col = grid[1];
	    row = grid[0];
	}
	document.documentElement.style.setProperty("--tablet-width", width + "px");
	document.documentElement.style.setProperty("--tablet-height", height + "px");
	document.documentElement.style.setProperty("--tablet-column", col);
	document.documentElement.style.setProperty("--tablet-row", row);
}