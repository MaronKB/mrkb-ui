/*─────────────────────────HOOKS─────────────────────────*/

Hooks.once("init", function () {
	let link = document.createElement('link');
	//link.href= "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css";
	link.rel= "stylesheet";
	document.getElementsByTagName("head")[0].append(link);

	CONFIG.TinyMCE.content_css.push("modules/mrkb-ui/style/ui/tinymce.css");

	let body = document.getElementsByClassName("vtt")[0];
	let loadscreen = document.createElement("div");
	loadscreen.setAttribute("id", "mrkb-loading");
	body.appendChild(loadscreen);
	$("#mrkb-loading").load("/modules/mrkb-ui/templates/loadscreen.html");

	let ui = document.createElement("div");
	ui.setAttribute("id", "mrkb-hud");
	body.appendChild(ui);

	CONFIG.debug.hooks = false;

	$("#mrkb-hud").load("/modules/mrkb-ui/templates/main.html");
});
Hooks.once("ready", function() {
	HUDSetting.register();

	if (HUDSetting.get('roll20chat')) {
		document.getElementById("chat-log").classList.add("roll20");
	}
	if (game.user.getFlag("mrkb-ui", "currenttab") === undefined || game.user.getFlag("mrkb-ui", "favorites") === undefined) {
		game.user.setFlag("mrkb-ui", "currenttab", []);
		game.user.setFlag("mrkb-ui", "favorites", []);
		setTimeout(() => {window.location.reload()}, 3000);
	}
	game.actors.forEach((e) => {
		if (e.getFlag("mrkb-ui", "customresource") === undefined) {
			e.setFlag("mrkb-ui", "customresource", {name : "자원 이름", value : "0"});
		}
	});

	hudInit();
	observerinit();
	readDisplay();
	announce();
	getBoss();
	changeProfile();

	getAllies();
	getResource();
	getItemCaster();
	getPhone();
	getKakaoData(true);
	getInventory();
	getTextGenerator();

	startClock();
	setInterval(startClock, 15000);

	$("#mrkb-loading").fadeOut(1000);
	//setTimeout(function() {
		//document.getElementById("mrkb-loading").remove();
	//}, 1100);

	document.documentElement.style.setProperty("--caster-height", HUDSetting.get("caster-height") + "px");

	if (game.system.id == "dx3rd") {
		const div = document.createElement("div");
		div.id = "conref";
		div.innerHTML = `
			<h4 id="con-title">컨센트레이트</h4>
			<button type="button" id="con-minus" onclick="conref('con','down')"><i class="fa-solid fa-caret-left"></i></button>
			<div id="con-value">0</div>
			<button type="button" id="con-minus" onclick="conref('con','up')"><i class="fa-solid fa-caret-right"></i></button>
			<div id="conref-divider"></div>
			<h4 id="ref-title">리플렉스</h4>
			<button type="button" id="ref-minus" onclick="conref('ref','down')"><i class="fa-solid fa-caret-left"></i></button>
			<div id="ref-value">0</div>
			<button type="button" id="ref-minus" onclick="conref('ref','up')"><i class="fa-solid fa-caret-right"></i></button>
		`
		document.querySelector("#chat-controls").before(div);
		getConref();
	}
});
Hooks.once("socketlib.ready", function() {
	socket = socketlib.registerModule("mrkb-ui");
	socket.register("addDisplay", addDisplay);
	socket.register("removeDisplay", removeDisplay);
	socket.register("getBoss", getBoss);
	socket.register("announce", announce);
	socket.register("getKakaoData", getKakaoData);
	socket.register("ringBell", ringBell);
});

Hooks.on("chatCommandsReady", function(chatCommands) {
  chatCommands.registerCommand(chatCommands.createCommandFromData({
	commandKey: "/anno",
	invokeOnCommand: (chatlog, messageText, chatdata) => {
	  HUDSetting.set("announcement", messageText);
	},
	shouldDisplayToChat: false,
	iconClass: "fa-sticky-note",
	description: "Display to chat",
	gmOnly: true
  }));
});
Hooks.on("updateSetting", function() {
	getBoss();
	announce();
})
Hooks.on("updateUser", function() {
	changeProfile();
	getAllies();
	getItemCaster();
	getResource();
	acts.render();
	canvas.tokens.releaseAll();
});
Hooks.on("updateActor", function() {
	loadCharaData();
	getAllies();
	getResource();
	getItemCaster();
	acts.render();
	getBoss();
	if (game.system.id == "dx3rd") {
		getConref();
	}
});
Hooks.on("createItem", function() {
	getItemCaster();
	getInventory();
});
Hooks.on("updateItem", function() {
	loadCharaData();
	getInventory();
});
Hooks.on("updateJournalEntry", function() {
	if (dialog === undefined) {
		return;
	}else if (dialog.rendered === false){
		return;
	}else {
		refresh();
	}
});
Hooks.on("updateCombat", function(combat, turn, data) {
	turnNotice();
	getAllies();
});
Hooks.on("deleteCombat", function() {
	getAllies();
});
Hooks.on("getSceneControlButtons", function(controls) {
	if (game.user.isGM) {
		controls[0].tools.push({
			name: "remote",
			title: "리모콘",
			icon: "fa-solid fa-house-laptop",
			visible: true,
			onClick: () => remoteControl(),
			button: true
		});
	}
});
Hooks.on("renderDisplayRemote", function() {
	const types = ["youtube", "embed", "image", "video"];
	for (type of types) {
		document.getElementById(`${type}-url`).value = HUDSetting.get(type);
	}
});

Hooks.on("renderActorSelector", function() {
	onRenderInit("tab-actor", "actor-grid")
});
Hooks.on("renderInventory", function() {
	onRenderInit("tab-folder", "inv-grid");
});
Hooks.on("renderQuest", function() {
	onRenderInit("quest-name", "quest");
});
Hooks.on("renderTokenHUD", function() {
	addBossButton();
	addStanceButton();
	addTemplateButton();
});
Hooks.on("createChatMessage", function(message, options) {
	if(!message.isAuthor) {
		return;
	}
	const lastMessage = game.messages.contents[game.messages.size - 2];
	if (options.mrkbturn) {
		message.setFlag("mrkb-ui", "turner", true);
	}
	if (options.kakao) {
		message.setFlag("mrkb-ui", "kakao", true);
	}
	if (lastMessage !== undefined && message.speaker.alias === lastMessage.speaker.alias) {
		message.setFlag("mrkb-ui", "added", true);
	}else {
		message.setFlag("mrkb-ui", "added", false);
		message.setFlag("mrkb-ui", "parent", null);
	}
});
Hooks.on("renderChatMessage", function(message, html, data) {
	chatPlay();
	checkChatFlag(message, html, data);
});
Hooks.on("deleteChatMessage", function(message) {
	fixChatFlag(message);
});
Hooks.on("controlToken", function() {
	GoToChat();
});
Hooks.on("renderPlayerList", function() {
	userFace();
});
Hooks.on("renderDX3rdActorSheet", function() {
	let a = document.querySelectorAll(".stat-list > input[name='system.attributes.hp.value'] ~ input.stat:last-child");
	a.forEach((e) => {
		e.value = 50;
	});
});

/*─────────────────────────INITIAL FUNCTIONS─────────────────────────*/

function hudInit() {
	const left = document.getElementById("mrkb-left");
	const center = document.getElementById("mrkb-center");
	const right = document.getElementById("mrkb-right");
	const bot = document.getElementById("mrkb-bottom");
	const chat = document.getElementById("chat-controls");
	const chatform = document.querySelector("#chat-form");

	const send = document.createElement("a");
	send.id = "mobile-send";
	send.onclick = () => {}

	const bell = document.createElement("div");
	bell.id = "mrkb-bell";
	bell.innerHTML = `
		<img id="bell-img" src="">
		<i class="fa-solid fa-bell"></i>
		<h5 id="bell-subtitle">발언권 요청!</h5>
		<h4 id="bell-title"></h4>
	`;

	left.append(document.getElementById("players"));
	center.append(document.getElementById("notifications"));
	bot.append(document.getElementById("controls"));
	bot.append(document.getElementById("hotbar"));
	bot.append(document.getElementById("sidebar-tabs"));
	chat.before(bell);

	if (game.system.id === "archmage") {
		right.appendChild(document.getElementsByClassName("archmage-escalation")[0]);
	}
	ui.players._showOffline = true;
	ui.players.render();

	if (game.system.id !== "swade" && game.system.id !== "archmage" && game.system.id !== "dx3rd") {
		document.querySelector("#characon-toggle").classList.add("disabled");
		document.querySelector("#characon-toggle").click();
	}
}
function observerinit() {
	let sidebar = document.getElementById("sidebar");
	let width = sidebar.style.width;
	document.documentElement.style.setProperty("--sidebar-width", width);
	let observer = new MutationObserver((mutations) => {
		newidth = mutations[0].target.attributes.style.value.replace("width: ", "");
		document.documentElement.style.setProperty("--sidebar-width", newidth);
	})
	let config = {
		attributes: true,
		childList: false,
		characterData: false
	};
	observer.observe(sidebar, config);
}
function onRenderInit(a, b) {
	let c = a;
	let currenttab = game.user.flags["mrkb-ui"].currenttab;
	if (currenttab.find(e => e.tab == a) === undefined) {
		currenttab.push({tab: c, id: "unclassified"});
		game.user.update({"flags.mrkb-ui.currenttab" : currenttab});
	}
	let target = game.user.flags["mrkb-ui"].currenttab.find(e => e.tab == a).id;
	let bar = document.querySelector(`.${a}[data-tab=${target}]`);
	let tab = document.querySelector(`.${b}[data-tab=${target}]`);
	bar.classList.add("active");
	tab.classList.add("active");
}
function onAppendInit(a, b, dir = false) {
	if (dir === false || dir === undefined) {
		document.getElementById(b).append(document.getElementById(a));
	}else if (dir === true) {
		document.getElementById(b).prepend(document.getElementById(a));
	}
	return;
}
function tabOpen(id, a, b) {
	let bars = document.getElementsByClassName(a);
	let tabs = document.getElementsByClassName(b);
	for (var i = 0; i < tabs.length; i++) {
		tabs[i].classList.remove("active");
		bars[i].classList.remove("active");
	}
	let target = "[data-tab='" + id + "']";
	let newtab = document.querySelectorAll(target);
	let currenttab = game.user.flags["mrkb-ui"].currenttab;
	let n = currenttab.findIndex((e) => e.tab == a);
	currenttab[n].id = id
	game.user.setFlag("mrkb-ui", "currenttab", currenttab);
	newtab[0].classList.add("active");
	newtab[1].classList.add("active");
}
function checkFolder(name, type) {
	let targetname = HUDSetting.get(name);
	if (targetname === "") {
		//ui.notifications.error(game.i18n.localize("MRKB.Notifications.FolderIsNull"));
		return false;
	}
	let target = game.folders.getName(targetname);
	if (target == undefined) {
		//ui.notifications.error(game.i18n.format("MRKB.Notifications.FolderIsNone", {name: targetname}));
		return false;
	}else if (target.type !== type) {
		//ui.notifications.error(game.i18n.format("MRKB.Notifications.FolderIsNone", {name: targetname}));
		return false;
	}
	return true;
}

/*─────────────────────────HP CALCULATER─────────────────────────*/

function calcHP(target) {
	let hp = {
		value : 0,
		max : 0,
		hpm : 0
	};
	if (game.system.id == "swade") {
		let wounds = game.actors.get(target).system.wounds;
		hp.value = wounds.value;
		hp.max = wounds.max;
		hp.temp = 0;
		hp.hpm = (hp.max <= 0) ? 100 : (parseInt(100 - ((hp.value / hp.max) * 100)));
	}else if (game.system.id == "archmage") {
		let health = game.actors.get(target).system.attributes.hp;
		hp.value = health.value;
		hp.max = health.max;
		hp.temp = health.temp;
		hp.hpm = (hp.max <= 0) ? 100 : parseInt((hp.value / hp.max) * 100);
	}else if (game.system.id == "pf2e") {
		let health = game.actors.get(target).system.attributes.hp;
		hp.value = health.value;
		hp.max = health.max;
		hp.temp = health.temp;
		hp.hpm = (hp.max <= 0) ? 100 : parseInt((hp.value / hp.max) * 100);
	}else if (game.system.id == "dx3rd") {
		let health = game.actors.get(target).system.attributes.hp;
		hp.value = health.value;
		hp.max = 50;
		hp.temp = 0;
		hp.hpm = (hp.max <= 0) ? 100 : parseInt((hp.value / hp.max) * 100);
	}
	return hp;
}
function calcMana(target) {
	const actor = game.actors.get(target);
	let mana = {
		value : 0,
		max : 0,
		mpm : 0
	};
	if (game.system.id == "swade") {
		let pp = actor.system.powerPoints.general;
		mana.value = pp.value === undefined ? 0 : pp.value;
		mana.max = pp.max === undefined ? 0 : pp.max;
		mana.mpm = (pp.max === 0) ? 0 : parseInt((pp.value / pp.max) * 100);
	}else if (game.system.id == "archmage" && actor.type == "character") {
		let recovery = actor.system.attributes.recoveries;
		mana.value = recovery.value;
		mana.max = recovery.max;
		mana.mpm = parseInt((recovery.value / recovery.max) * 100);
	}else if (game.system.id == "pf2e") {
		let xp = actor.system.details.xp;
		mana.value = xp.value;
		mana.max = xp.max;
		mana.mpm = parseInt((xp.value / xp.max) * 100);
	}else if (game.system.id == "dx3rd") {
		let encroachment = actor.system.attributes.encroachment;
		mana.value = encroachment.value;
		mana.max = encroachment.max;
		mana.mpm = parseInt((encroachment.value / encroachment.max) * 100);
	}
	return mana;
}

/*─────────────────────────UTILLS─────────────────────────*/

function uiPoint(target, value) {
	if (game.user == undefined || game.user.character == undefined) {
		return;
	}
	let hp = game.user.character.system.wounds.value;
	let mp = game.user.character.system.powerPoints.general.value;
	let point = (target == "hp") ? hp : mp;
	let newpoint = (value == "heal") ? (target == "hp") ? point - 1 : point + 1 : (target == "hp") ? point + 1 : point - 1;
		console.log(newpoint);
	if (target == "hp") {
		game.user.character.update({'system.wounds.value': newpoint});
	}else if (target == "mp") {
		game.user.character.update({'system.powerPoints.general.value': newpoint});
	}
}
function GoToChat() {
	if (!HUDSetting.get('quickchat') || canvas.tokens.controlled.length < 1) return;
	const chatmsg = document.getElementById('chat-message');

	document.querySelector('#sidebar-tabs>a').click();setTimeout(function() {
		chatmsg.focus();
		if (chatmsg.value == "") {
			chatmsg.value = "\"\"";
		}
		let str = (ModuleSettings.get('selection')) ? 1 : chatmsg.value.length;
		let end = chatmsg.value.length - 1;
		chatmsg.setSelectionRange(str, end);
	}, 10);
}

function changeProfile() {

	let name, src;
	if (game.user === undefined) {
		return;
	}
	if (game.user.character === undefined || game.user.character === null) {
		name = "UNDEFINED";
		src = "modules/mrkb-ui/src/chestnut.png";
	}else {
		let img = game.user.character.img;
		name = game.user.character.name;
		src = `${location.origin}/${img}`;
	}
	let profilepic = document.getElementById("profilepic");
	let profilename = document.getElementById("profilename");
	if (game.modules.get("illandril-chat-enhancements") == !undefined) {
		let nameplace = document.getElementsByClassName("illandril-chat-enhancements--currentSpeaker");
		nameplace.innerHTML = name;
	}
	profilepic.src = src;
	profilename.innerHTML = name;
	loadCharaData();
}

function loadCharaData() {
	if (game.user == undefined || game.user.character == undefined) {
		return;
	}
	let hpgage = document.getElementById("healthbar");
	let hpvalue = document.getElementById("healthnumber");
	let hp = calcHP(game.user.character.id);
	hpgage.value = hp.hpm;
	if (hp.temp === 0) {
		hpvalue.innerHTML = hp.value + "/" + hp.max;
	}else {
		hpvalue.innerHTML = hp.value + "+" + hp.temp + "/" + hp.max;
	}
	let managage = document.getElementById("manabar");
	let manavalue = document.getElementById("mananumber");
	let mana = calcMana(game.user.character.id);
	managage.value = mana.mpm;
	manavalue.innerHTML = mana.value + "/" + mana.max;
	setAttribute();
}

function setAttribute() {
	const element = document.getElementById("mrkb-info");
	while (element.hasChildNodes()) {
		element.removeChild(element.firstChild);
	}
	let list = [];
	if (game.system.id === "swade") {
		const stats = game.user.character.system.stats;
		list.push({
			fa : "person-running",
			name : "SP",
			value : stats.speed.value
		},
		{
			fa : "shield-halved",
			name : "PR",
			value : stats.parry.value
		},
		{
			fa : "shield-heart",
			name : "TN",
			value : stats.toughness.value
		},
		{
			fa : "heart",
			name : "<i class='fa-solid fa-minus'></i>",
			value : "",
			onclick : "uiPoint('hp', 'dmg')"
		},
		{
			fa : "heart",
			name : "<i class='fa-solid fa-plus'></i>",
			value : "",
			onclick : "uiPoint('hp', 'heal')"
		},
		{
			fa : "wand-magic-sparkles",
			name : "<i class='fa-solid fa-minus'></i>",
			value : "",
			onclick : "uiPoint('mp', 'dmg')"
		},
		{
			fa : "wand-magic-sparkles",
			name : "<i class='fa-solid fa-plus'></i>",
			value : "",
			onclick : "uiPoint('mp', 'heal')"
		});
	}else if (game.system.id === "archmage") {
		let attr = game.user.character.data.data.attributes;
		list.push({
			fa : "shield",
			name : "AC",
			value : attr.ac.value
		},
		{
			fa : "shield-halved",
			name : "PD",
			value : attr.pd.value
		},
		{
			fa : "shield-heart",
			name : "MD",
			value : attr.md.value
		});
	}else if (game.system.id === "pf2e") {
		let attr = game.user.character.data.data.attributes;
		list.push({
			fa : "shield-halved",
			name : "AC",
			value : attr.ac.value
		},
		{
			fa : "shield-halved",
			name : "DC",
			value : attr.classDC.value
		},
		{
			fa : "person-running",
			name : "SP",
			value : attr.speed.value
		});
	}
	list.forEach((e) => {
		let info = document.createElement("div");
		if (e.onclick !== undefined) {
			info.setAttribute("onclick", e.onclick);
		}
		info.setAttribute("class", "info");
		info.innerHTML = `<i class="fa-solid fa-${e.fa}"></i>${e.name} ${e.value}`;
		element.appendChild(info);
	});
}

function uiStop() {
	let dialogEditor = new Dialog({
		title: `중단요청`,
		content: `
			<form style="text-align:center;">
				<table style="table-layout:fixed;"><tbody>
					<tr><td colspan="3">
					<h3 style="text-align:center;">중단사유<h3>
					</td></tr>
					<tr>
						<td>
							<label for="reason1"><input style="float:left;" type="radio" name="reason" id="reason1" value="트리거 요소" checked="checked">트리거 요소</label>
						</td>
						<td>
							<label for="reason2"><input style="float:left;" type="radio" name="reason" id="reason2" value="생리현상">생리현상</label>
						</td>
						<td>
							<label for="reason3"><input style="float:left;" type="radio" name="reason" id="reason3" value="위급 상황">위급 상황</label>
						</td>
					</tr>
					<tr>
						<td>
							<label for="reason4"><input style="float:left;" type="radio" name="reason" id="reason4" value="직업상 용무">직업상 용무</label>
						</td>
						<td>
							<label for="reason5"><input style="float:left;" type="radio" name="reason" id="reason5" value="개인적 용무">개인적 용무</label>
						</td>
						<td>
							<label for="reason6"><input style="float:left;" type="radio" name="reason" id="reason6" value="재미없음">재미없음</label>
						</td>
					</tr>
					<tr>
						<td>
							<label for="reason7"><input style="float:left;" type="radio" name="reason" id="reason7" value="체력 부족">체력 부족</label>
						</td>
						<td>
							<label for="reason8"><input style="float:left;" type="radio" name="reason" id="reason8" value="말하기 어려움">말하기 어려움</label>
						</td>
						<td>
							<label for="reason9"><input style="float:left;" type="radio" name="reason" id="reason9" value="기타">기타</label>
						</td>
					</tr>
				</tbody></table>
				<table style="table-layout:fixed;"><tbody>
					<tr><td colspan="3">
					<h3 style="text-align:center;">중단시간<h3>
					</td></tr>
					<tr>
						<td>
							<label for="time1"><input style="float:left;" type="radio" name="time" id="time1" value="5분" checked="checked">5분 이하</label>
						</td>
						<td>
							<label for="time2"><input style="float:left;" type="radio" name="time" id="time2" value="10분">10분 이하</label>
						</td>
						<td>
							<label for="time3"><input style="float:left;" type="radio" name="time" id="time3" value="15분">15분 이하</label>
						</td>
					</tr>
					<tr>
						<td>
							<label for="time4"><input style="float:left;" type="radio" name="time" id="time4" value="20분">20분 이하 </label>
						</td>
						<td>
							<label for="time5"><input style="float:left;" type="radio" name="time" id="time5" value="30분">30분 이하</label>
						</td>
						<td>
							<label for="time6"><input style="float:left;" type="radio" name="time" id="time6" value="45분">45분 이하</label>
						</td>
					</tr>
					<tr>
						<td>
							<label for="time7"><input style="float:left;" type="radio" name="time" id="time7" value="1시간">1시간 이하</label>
						</td>
						<td>
							<label for="time8"><input style="float:left;" type="radio" name="time" id="time8" value="1시간 이상">1시간 이상</label>
						</td>
						<td>
							<label for="time9"><input style="float:left;" type="radio" name="time" id="time9" value="불가">재개 불가</label>
						</td>
					</tr>
				</tbody></table>
				<table style="table-layout:fixed;"><tbody>
					<tr><td colspan="2">
					<h3 style="text-align:center;">귓말처리<h3>
					</td></tr>
					<tr>
						<td>
							<label for="anon1"><input style="float:left;" type="radio" name="anon" id="anon1" value="rw" checked="checked">귓말</label>
						</td>
						<td>
							<label for="anon2"><input style="float:left;" type="radio" name="anon" id="anon2" value="ra">전챗</label>
						</td>
					</tr>
				</tbody></table>
			</form>`,
		buttons: {
			trigger: {
				icon: '<i class="fas fa-check"></i>',
				label: "제출",
				callback: (html) => {
					var reasons = $('input[name="reason"]:checked').val();
					var times = $('input[name="time"]:checked').val();
					var anons = $('input[name="anon"]:checked').val();
					if (reasons == "생리현상" || reasons == "위급 상황" || reasons == "재미없음" || reasons == "체력 부족") {
						var why = `${reasons}을 이유로`;
					}else if (reasons == "말하기 어려움") {
						var why = "이유는 묻지 말아주시고";
					}else if (reasons == "기타") {
						var why = "따로 설명할 테니";
					}else {
						var why = `${reasons}를 이유로`;
					}
					console.log(why);
					if (times == "1시간 이상") {
						var till = `${times} 중단하고 싶습니다.`;
					}else if (times == "불가") {
						var till = "오늘 안에는 재개가 불가능합니다.";
					}else {
						var till = `${times} 동안 휴식하고 싶습니다.`;
					};
					let speaker = game.user.data._id;
					if (anons == "rw") {
						ChatMessage.create({
							content: `${why}, ${till}`,
							type: 1,
							whisper: [speaker]
						})
					}else if (anons == "ra") {
						ChatMessage.create({
							content: `${why}, ${till}`,
							type: 1
						})
					}
				}
			}
		},
		default: "trigger",
		close: () => { }
	}).render(true);
}
function uiSheet() {
	game.user.character.sheet.render("true");
}

/*─────────────────────────TOGGLEBUTTONS─────────────────────────*/

function toggleChara() {
	let con = document.getElementById("character-container");
	let toggler = document.getElementById("characon-toggle");
	let buttons = document.getElementById("mrkb-buttons");
	let toal = document.getElementById("toggleAllies");
	if (con.classList.contains("hidden")) {
		con.classList.remove("hidden");
		toggler.classList.remove("fold")
		buttons.classList.remove("moved");
		toal.classList.remove("moved");
	}else {
		con.classList.add("hidden");
		toggler.classList.add("fold")
		buttons.classList.add("moved");
		toal.classList.add("moved");
	}
}
function toggleNotify() {
	let noti = document.getElementById("mrkb-notification");
	let notiopen = document.getElementById("ui-noti-open");
	if (noti.classList.contains("hidden")) {
		noti.classList.remove("hidden");
		notiopen.classList.add("hidden");
	}else {
		noti.classList.add("hidden");
		notiopen.classList.remove("hidden");
	};
}
function uiHideChat() {
	const chat = document.getElementById("mrkb-chat");
	const chatopener = document.getElementById("ui-chat-open");
	const allies = document.querySelector("#mrkb-allies");
	if (chat.classList.contains("hidden")) {
		chat.classList.remove("hidden");
		chatopener.classList.add("hidden");
		allies.classList.add("jump");
	}else {
		chat.classList.add("hidden");
		chatopener.classList.remove("hidden");
		allies.classList.remove("jump");
	};
}
function hideBotHud() {
	let bot = document.getElementById("mrkb-bottom");
	let botopener = document.getElementById("ui-bot-open");
	if (bot.classList.contains("hidden")) {
		bot.classList.remove("hidden");
		botopener.classList.add("hidden");
	}else {
		bot.classList.add("hidden");
		botopener.classList.remove("hidden");
	};
}
function displayOpacity() {
	let display = document.getElementById("mrkb-display");
	let button = document.querySelector(".mrkbmenu[onclick='displayOpacity();']");
	if (display.classList.contains("trans")) {
		display.classList.remove("trans");
		button.classList.remove("active");
	}else {
		display.classList.add("trans");
		button.classList.add("active");
	}
}
function getConref() {
	const chara = game.user.character;
	if (chara === undefined || chara === null) {
		return;
	}
	const conitem = chara.items.getName("컨센트레이트");
	const refitem = chara.items.getName("리플렉스");
	if (conitem === undefined || refitem === undefined) {
		return;
	}
	const con = document.querySelector("#con-value");
	const ref = document.querySelector("#ref-value");
	const convalue = conitem.system.level.init;
	const refvalue = refitem.system.level.init;
	con.innerHTML = convalue;
	ref.innerHTML = refvalue;
	return ({
		con : convalue,
		ref : refvalue
	});
}
function conref(type, dir) {
	const chara = game.user.character;
	const target = document.querySelector(`#${type}-value`);
	const value = getConref();
	if (value === undefined) {
		return;
	}
	let skill = value[type];
	let lvl = ((skill <= 0 && dir == "down") || (skill >= 3 && dir == "up")) ? skill : (dir == "up") ? ++skill : --skill;
	let enc = (type == "con") ? (lvl == 0) ? 0 : (lvl == 1) ? 2 : (lvl == 2) ? 6 : (lvl == 3) ? 10 : 0 : (lvl == 0) ? 0 : (lvl == 1) ? 1 : (lvl == 2) ? 4 : (lvl == 3) ? 7 : 0;

	const item = (type == "con") ? chara.items.getName("컨센트레이트") : chara.items.getName("리플렉스");

	target.innerHTML = lvl;
	item.update({
		"system.level.init" : lvl,
		"system.encroach.value" : enc
	});
}
