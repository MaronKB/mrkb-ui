/*─────────────────────────ALLIES LIST─────────────────────────*/

function getAllies() {
	let pc = game.user.character;
	let actors = game.user.isGM ? game.actors.filter(e => e.hasPlayerOwner && e.ownership.default >= 2) : game.actors.filter(e => e.hasPlayerOwner && e != pc && e.ownership.default >= 2);
	let allies = [];
	const parent = document.querySelector("#mrkb-allies");
	parent.innerHTML = "";
	actors.forEach(function(a) {
		let resrc = (a.flags["mrkb-ui"]?.customresource === undefined) ? 0 : a.flags["mrkb-ui"].customresource.value;
		const hp = calcHP(a.id);
		const mana = calcMana(a.id);
		let div = document.createElement("div");
		div.classList.add('allies-container');
		div.dataset.id = a.id;
		div.innerHTML = `
		<h3 class="profilename">${a.name} [${resrc}]</h3>
		<div class="charaprofile">
			<img class="profilepic" src="${a.img}">
		</div>
		<div class="mrkb-health">
			<h4 class="healthnumber">${hp.value}/${hp.max}</h4>
			<progress class="healthbar" value="${hp.hpm}" max="100"></progress>
		</div>
		<div class="mrkb-mana">
			<h4 class="mananumber">${mana.value}/${mana.max}</h4>
			<progress class="manabar" value="${mana.mpm}" max="100"></progress>
		</div>
		`;
		parent.appendChild(div);
	});
}

function toggleAllies() {
	let button = document.getElementById("toggleAllies");
	let leftside = document.getElementById("mrkb-left");
	if (button.classList.contains("open")) {
		button.classList.remove("open");
		leftside.classList.remove("open");
		button.innerHTML = `<i class="fa-solid fa-users-slash"></i>`;
	}else {
		button.classList.add("open");
		leftside.classList.add("open");
		button.innerHTML = `<i class="fa-solid fa-users"></i>`;
	}
}

function userFace() {
	let users = game.users;
	users.forEach(function(u) {
		let target = document.querySelector(`li[data-user-id=\"${u.id}\"] .player-name`);
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
