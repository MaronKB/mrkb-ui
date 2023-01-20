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
