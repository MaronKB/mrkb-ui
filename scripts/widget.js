/*─────────────────────────ALLIES LIST─────────────────────────*/

function getAllies() {
	const parent = document.querySelector("#mrkb-allies");
	parent.innerHTML = "";
	if (game.combat === null) {
		return;
	}
	if (game.combat.current.tokenId === null) {
		return;
	}
	const turnPlayer = game.canvas.tokens.get(game.combat.current.tokenId).actor;
	const actors = game.combat.turns.filter(e => e.hasPlayerOwner && e.actor.ownership.default >= 2);
	actors.forEach((a) => {
		const actor = game.actors.get(a.actorId);
		let resrc = (actor.flags["mrkb-ui"]?.customresource === undefined) ? 0 : actor.flags["mrkb-ui"].customresource.value;
		const hp = calcHP(actor.id);
		const mana = calcMana(actor.id);
		const div = document.createElement("div");
		div.dataset.id = actor.id;
		div.classList.add('allies-container');
		if (actor.id == turnPlayer.id) {
			div.classList.add('turn-player');
		}
		div.innerHTML = `
			<h3 class="profilename">${actor.name} [${resrc}]</h3>
			<div class="charaprofile">
				<img class="profilepic" src="${actor.img}">
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
	if (game.user.character?.id == turnPlayer.id || game.user.isGM) {
		const next = document.createElement("a");
		next.id = "combat-next";
		next.onclick = () => {game.combat.nextTurn();}
		next.innerHTML = `<h3>턴 종료<span>TURN END</span></h3>`;
		parent.appendChild(next);
	}
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
	<input type="radio" name="skill-template" id="self" value="self">
	<label class='templater' for="self">
	<h5>자신</h5>
	</label>
	<input type="radio" name="skill-template" id="sq1" value='sq1'>
	<label class='templater' for="sq1">
	<h5>전방 1칸</h5>
	</label>
	<input type="radio" name="skill-template" id="cr4" value='cr4'>
	<label class='templater' for="cr4">
	<h5>접전 4칸</h5>
	</label>
	<input type="radio" name="skill-template" id="sq4" value='sq4'>
	<label class='templater' for="sq4">
	<h5>전방 4칸</h5>
	</label>
	<input type="radio" name="skill-template" id="sq8" value='sq8'>
	<label class='templater' for="sq8">
	<h5>전방 8칸</h5>
	</label>
	<input type="radio" name="skill-template" id="ci8" value='ci8'>
	<label class='templater' for="ci8">
	<h5>1서클</h5>
	</label>
	<input type="radio" name="skill-template" id="st12" value='st12'>
	<label class='templater' for="st12">
	<h5>직선 12칸</h5>
	</label>
	<input type="radio" name="skill-template" id="sq12" value='sq12'>
	<label class='templater' for="sq12">
	<h5>전방 12칸</h5>
	</label>
	<input type="radio" name="skill-template" id="rh12" value='rh12'>
	<label class='templater' for="rh12">
	<h5>마름모</h5>
	</label>
	<input type="radio" name="skill-template" id="sq18" value='sq18'>
	<label class='templater' for="sq18">
	<h5>전방 18칸</h5>
	</label>
	<input type="radio" name="skill-template" id="cr20" value='cr20'>
	<label class='templater' for="cr20">
	<h5>대십자</h5>
	</label>
	<input type="radio" name="skill-template" id="ci24" value='ci24'>
	<label class='templater' for="ci24">
	<h5>2서클</h5>
	</label>
	<input type="radio" name="skill-template" id="sq24" value='sq24'>
	<label class='templater' for="sq24">
	<h5>전방 24칸</h5>
	</label>
	<input type="radio" name="skill-template" id="sq30" value='sq30'>
	<label class='templater' for="sq30">
	<h5>전방 30칸</h5>
	</label>
	<input type="radio" name="skill-template" id="sq40" value='sq40'>
	<label class='templater' for="sq40">
	<h5>전방 40칸</h5>
	</label>
	<input type="radio" name="skill-template" id="ci48" value='ci48'>
	<label class='templater' for="ci48">
	<h5>3서클</h5>
	</label>
	<div class="arrows">
	<input type="radio" name="skill-direction" id="temp-up" value='up'>
	<label class="temp-arrow" for="temp-up">
	<i class="fa-solid fa-caret-up"></i>
	</label>
	<input type="radio" name="skill-direction" id="temp-right" value='right'>
	<label class="temp-arrow" for="temp-right">
	<i class="fa-solid fa-caret-right"></i>
	</label>
	<input type="radio" name="skill-direction" id="temp-left" value='left'>
	<label class="temp-arrow" for="temp-left">
	<i class="fa-solid fa-caret-left"></i>
	</label>
	<input type="radio" name="skill-direction" id="temp-down" value='down'>
	<label class="temp-arrow" for="temp-down">
	<i class="fa-solid fa-caret-down"></i>
	</label>
	</div>
	<div class="temp-buttons">
	<button type="button" id="temp-submit" class="temp-button" onclick="setupTemplate()">결정</button>
	<button type="button" id="temp-delete" class="temp-button">삭제</button>
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

async function setupTemplate() {
	const target = document.querySelector(`[name="skill-template"]:checked`);
	if (target === null) {
		return;
	}
	const dir = document.querySelector(`[name="skill-direction"]:checked`);
	let type = target.value;
	const nonedirection = ["self", "cr4", "ci8", "rh12", "cr20", "ci24", "ci48"];
	if (!nonedirection.includes(type)) {
		if (dir === null) {
			return;
		}
		type = type + "-" + dir.value;
	}
	const token = game.canvas.tokens.controlled[0];
	const old = game.canvas.drawings.objects.children.filter(e => e.document.text == token.name);
	old.forEach((e) => {
		e.document.delete();
	});

	let pos, point;
	let x = token.x;
	let y = token.y;
	if (type == "self") {
		pos = {
			x: x,
			y: y,
			w: 100,
			h: 100
		};
		point = [
			0, 0,
			100, 0,
			100, 100,
			0, 100,
			0, 0
		];
	}else if (type == "sq1-up") {
		pos = {
			x: x,
			y: y - 100,
			w: 100,
			h: 100
		};
		point = [
			0, 0,
			100, 0,
			100, 100,
			0, 100,
			0, 0
		];
	}else if (type == "sq1-right") {
		pos = {
			x: x + 100,
			y: y,
			w: 100,
			h: 100
		};
		point = [
			0, 0,
			100, 0,
			100, 100,
			0, 100,
			0, 0
		];
	}else if (type == "sq1-down") {
		pos = {
			x: x,
			y: y + 100,
			w: 100,
			h: 100
		};
		point = [
			0, 0,
			100, 0,
			100, 100,
			0, 100,
			0, 0
		];
	}else if (type == "sq1-left") {
		pos = {
			x: x - 100,
			y: y,
			w: 100,
			h: 100
		};
		point = [
			0, 0,
			100, 0,
			100, 100,
			0, 100,
			0, 0
		];
	}else if (type == "cr4") {
		pos = {
			x: x - 100,
			y: y - 100,
			w: 300,
			h: 300
		};
		point = [
			100, 0,
			200, 0,
			200, 100,
			300, 100,
			300, 200,
			200, 200,
			200, 300,
			100, 300,
			100, 200,
			0, 200,
			0, 100,
			100, 100,
			100, 0
		];
	}else if (type == "sq4-up") {
		pos = {
			x: x,
			y: y - 400,
			w: 100,
			h: 400
		};
		point = [
			0, 0,
			0, 400,
			100, 400,
			100, 0,
			0, 0
		];
	}else if (type == "sq4-right") {
		pos = {
			x: x + 100,
			y: y,
			w: 400,
			h: 100
		};
		point = [
			0, 0,
			400, 0,
			400, 100,
			0, 100,
			0, 0
		];
	}else if (type == "sq4-down") {
		pos = {
			x: x,
			y: y + 100,
			w: 100,
			h: 400
		};
		point = [
			0, 0,
			0, 400,
			100, 400,
			100, 0,
			0, 0
		];
	}else if (type == "sq4-left") {
		pos = {
			x: x - 400,
			y: y,
			w: 400,
			h: 100
		};
		point = [
			0, 0,
			400, 0,
			400, 100,
			0, 100,
			0, 0
		];
	}else if (type == "sq8-up") {
		pos = {
			x: x,
			y: y - 800,
			w: 100,
			h: 800
		};
		point = [
			0, 0,
			800, 0,
			800, 100,
			0, 100,
			0, 0
		];
	}else if (type == "sq8-right") {
		pos = {
			x: x + 100,
			y: y,
			w: 100,
			h: 800
		};
		point = [
			0, 0,
			0, 800,
			100, 800,
			100, 0,
			0, 0
		];
	}else if (type == "sq8-down") {
		pos = {
			x: x,
			y: y + 100,
			w: 100,
			h: 800
		};
		point = [
			0, 0,
			800, 0,
			800, 100,
			0, 100,
			0, 0
		];
	}else if (type == "sq8-left") {
		pos = {
			x: x - 800,
			y: y,
			w: 100,
			h: 800
		};
		point = [
			0, 0,
			0, 800,
			100, 800,
			100, 0,
			0, 0
		];
	}else if (type == "ci8") {
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
	}else if (type == "st12-up") {
		pos = {
			x: x,
			y: y - 1200,
			w: 100,
			h: 1200
		};
		point = [
			0, 0,
			0, 1200,
			100, 1200,
			100, 0,
			0, 0
		];
	}else if (type == "st12-right") {
		pos = {
			x: x + 100,
			y: y,
			w: 1200,
			h: 100
		};
		point = [
			0, 0,
			1200, 0,
			1200, 100,
			0, 100,
			0, 0
		];
	}else if (type == "st12-down") {
		pos = {
			x: x,
			y: y + 100,
			w: 100,
			h: 1200
		};
		point = [
			0, 0,
			0, 1200,
			100, 1200,
			100, 0,
			0, 0
		];
	}else if (type == "st12-left") {
		pos = {
			x: x - 1200,
			y: y,
			w: 1200,
			h: 100
		};
		point = [
			0, 0,
			1200, 0,
			1200, 100,
			0, 100,
			0, 0
		];
	}else if (type == "sq12-up") {
		pos = {
			x: x - 100,
			y: y - 400,
			w: 300,
			h: 400
		};
		point = [
			0, 0,
			0, 400,
			300, 400,
			300, 0,
			0, 0
		];
	}else if (type == "sq12-right") {
		pos = {
			x: x + 100,
			y: y - 100,
			w: 400,
			h: 300
		};
		point = [
			0, 0,
			400, 0,
			400, 300,
			0, 300,
			0, 0
		];
	}else if (type == "sq12-down") {
		pos = {
			x: x - 100,
			y: y + 100,
			w: 300,
			h: 400
		};
		point = [
			0, 0,
			0, 400,
			300, 400,
			300, 0,
			0, 0
		];
	}else if (type == "sq12-left") {
		pos = {
			x: x - 400,
			y: y - 100,
			w: 400,
			h: 300
		};
		point = [
			0, 0,
			400, 0,
			400, 300,
			0, 300,
			0, 0
		];
	}else if (type == "rh12") {
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
	}else if (type == "sq18-up") {
		pos = {
			x: x - 100,
			y: y - 600,
			w: 300,
			h: 600
		};
		point = [
			0, 0,
			0, 600,
			300, 600,
			300, 0,
			0, 0
		];
	}else if (type == "sq18-right") {
		pos = {
			x: x + 100,
			y: y - 100,
			w: 600,
			h: 300
		};
		point = [
			0, 0,
			600, 0,
			600, 300,
			0, 300,
			0, 0
		];
	}else if (type == "sq18-down") {
		pos = {
			x: x - 100,
			y: y + 100,
			w: 300,
			h: 600
		};
		point = [
			0, 0,
			0, 600,
			300, 600,
			300, 0,
			0, 0
		];
	}else if (type == "sq18-left") {
		pos = {
			x: x - 600,
			y: y - 100,
			w: 600,
			h: 300
		};
		point = [
			0, 0,
			600, 0,
			600, 300,
			0, 300,
			0, 0
		];
	}else if (type == "cr20") {
		pos = {
			x: x - 200,
			y: y - 200,
			w: 500,
			h: 500
		};
		point = [
			100, 0,
			400, 0,
			400, 100,
			500, 100,
			500, 400,
			400, 400,
			400, 500,
			100, 500,
			100, 400,
			0, 400,
			0, 100,
			100, 100,
			100, 0
		];
	}else if (type == "ci24") {
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
	}else if (type == "sq24-up") {
		pos = {
			x: x - 100,
			y: y - 800,
			w: 300,
			h: 800
		};
		point = [
			0, 0,
			0, 800,
			300, 800,
			300, 0,
			0, 0
		];
	}else if (type == "sq24-right") {
		pos = {
			x: x + 100,
			y: y - 100,
			w: 800,
			h: 300
		};
		point = [
			0, 0,
			800, 0,
			800, 300,
			0, 300,
			0, 0
		];
	}else if (type == "sq24-down") {
		pos = {
			x: x - 100,
			y: y + 100,
			w: 300,
			h: 800
		};
		point = [
			0, 0,
			0, 800,
			300, 800,
			300, 0,
			0, 0
		];
	}else if (type == "sq24-left") {
		pos = {
			x: x - 800,
			y: y - 100,
			w: 800,
			h: 300
		};
		point = [
			0, 0,
			800, 0,
			800, 300,
			0, 300,
			0, 0
		];
	}else if (type == "sq30-up") {
		pos = {
			x: x - 200,
			y: y - 600,
			w: 500,
			h: 600
		};
		point = [
			0, 0,
			0, 600,
			500, 600,
			500, 0,
			0, 0
		];
	}else if (type == "sq30-right") {
		pos = {
			x: x + 100,
			y: y - 200,
			w: 600,
			h: 500
		};
		point = [
			0, 0,
			600, 0,
			600, 500,
			0, 500,
			0, 0
		];
	}else if (type == "sq30-down") {
		pos = {
			x: x - 200,
			y: y + 100,
			w: 500,
			h: 600
		};
		point = [
			0, 0,
			0, 600,
			500, 600,
			500, 0,
			0, 0
		];
	}else if (type == "sq30-left") {
		pos = {
			x: x - 600,
			y: y - 200,
			w: 600,
			h: 500
		};
		point = [
			0, 0,
			600, 0,
			600, 500,
			0, 500,
			0, 0
		];
	}else if (type == "sq40-up") {
		pos = {
			x: x - 200,
			y: y - 800,
			w: 500,
			h: 800
		};
		point = [
			0, 0,
			0, 800,
			500, 800,
			500, 0,
			0, 0
		];
	}else if (type == "sq40-right") {
		pos = {
			x: x + 100,
			y: y - 200,
			w: 800,
			h: 500
		};
		point = [
			0, 0,
			800, 0,
			800, 500,
			0, 500,
			0, 0
		];
	}else if (type == "sq40-down") {
		pos = {
			x: x - 200,
			y: y + 100,
			w: 500,
			h: 800
		};
		point = [
			0, 0,
			0, 800,
			500, 800,
			500, 0,
			0, 0
		];
	}else if (type == "sq40-left") {
		pos = {
			x: x - 800,
			y: y - 200,
			w: 800,
			h: 500
		};
		point = [
			0, 0,
			800, 0,
			800, 500,
			0, 500,
			0, 0
		];
	}else if (type == "ci48") {
		pos = {
			x: x - 300,
			y: y - 300,
			w: 700,
			h: 700
		};
		point = [
			0, 0,
			700, 0,
			700, 700,
			0, 700,
			0, 0
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
