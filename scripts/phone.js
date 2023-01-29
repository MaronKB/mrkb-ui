/*─────────────────────────PHONE─────────────────────────*/

function getPhone() {
	const apps = document.querySelectorAll(".phone-app");
	apps.forEach((e) => {
		e.onclick = () => {activeApp(e.dataset.app)};
	});
	const bell = document.querySelector(`[data-app="bell"]`);
	bell.onclick = () => {ringToAll(game.user.character?.id)};
}

function openSide() {
	const side = document.querySelector("#mrkb-side");
	if (side.classList.contains("open")) {
		side.classList.remove("open");
	}else {
		side.classList.add("open");
	}
}

function activeApp(app) {
	const apps = document.querySelectorAll(".phone-window");
	for (a of apps) {
		a.classList.remove("active");
	};
	const target = document.querySelector(`#phone-${app}`);
	target.classList.add("active");
}

/*─────────────────────────CLOCK─────────────────────────*/

function startClock() {
	const plainClock = document.querySelector("#phone-time");
	const widgetClock = document.querySelector("#phone-clock");
	const time = new Date();
	const month = time.getMonth();
	const date = time.getDate();
	const day = time.getDay();
	const dayArr = ["일", "월", "화", "수", "목", "금", "토"];
	const d = dayArr[day];

	let h = time.getHours();
	const ap = (h >= 12) ? "오후" : "오전";
	h = (h%12) || 12;
	const m = time.getMinutes();
	const s = time.getSeconds();

	const days = document.createElement("div");
	days.id = "clock-day";
	days.innerHTML = `<h4>${d}요일</h4><h4>${month + 1}월 ${date}일</h4>`
	let plainText = `${h}:${(m < 10) ? "0" + m : m}`;
	const widgetText = document.createElement("div");
	widgetText.id = "clock-times";
	widgetText.innerHTML = `<span id="clock-ap">${ap}</span><span id="clock-time">${plainText}</span>`

	plainClock.innerHTML = plainText;
	widgetClock.innerHTML = "";
	widgetClock.appendChild(days);
	widgetClock.appendChild(widgetText);
}

/*─────────────────────────CUSTOM RESOURCE─────────────────────────*/

function getResource() {
	const chara = game.user.character;
	const parent = document.querySelector("#phone-resource");
	if (chara !== undefined && chara !== null) {
		const resource = chara.flags["mrkb-ui"].customresource;
		parent.innerHTML = `
		<div id="resrcname">
		<input type="text" id="resrcnameinput" value="${resource.name}" onchange="resourceNameUpdate();" spellcheck="false">
		</div>
		<div id="resrccontrol">
		<a id="resrcdown" onclick="resourceValueUpdate('down');"><i class="fa-solid fa-minus"></i></a>
		<div id="resrc">
		<h3>${resource.value}</h3>
		</div>
		<a id="resrcup" onclick="resourceValueUpdate('up');"><i class="fa-solid fa-plus"></i></a>
		</div>
		`;
	}
}
function resourceNameUpdate() {
	let name = document.querySelector("#resrcnameinput").value;
	game.user.character.update({"flags.mrkb-ui.customresource.name" : name});
}
function resourceValueUpdate(direction) {
	let value = game.user.character?.flags['mrkb-ui'].customresource.value;
	let nv;
	if (direction == "up") {
		nv = value + 1;
	}else if (direction == "down") {
		nv = value - 1;
	}else {
		return;
	};
	game.user.character.update({"flags.mrkb-ui.customresource.value" : nv});
	getResource();
}

/*─────────────────────────DOCK─────────────────────────*/

function ringToAll() {
	const id = game.user.character?.id;
	if (id === undefined || id === null) {
		return;
	}else {
		socket.executeForEveryone("ringBell", id);
	}
}

function ringBell(id) {
	const actor = game.actors.get(id);
	const bell = document.querySelector("#mrkb-bell");
	const face = document.querySelector("#bell-img");
	const title = document.querySelector("#bell-title");
	const alert = new Audio("/modules/mrkb-ui/src/alert.wav");

	face.src = actor.img;
	title.innerHTML = actor.name;

	bell.classList.add("open");
	alert.volume = 0.2;
	alert.play();

	setTimeout(() => {
		bell.classList.remove("open");
	}, 1500);
}

/*─────────────────────────ITEM CASTER─────────────────────────*/

function getItemCaster() {
	if (game.system.id !== "swade" && game.system.id !== "archmage") {
		return;
	}
	const chara = game.user.character;
	if (chara === undefined || chara === null) {
		return;
	}
	const parent = document.querySelector("#phone-caster");
	parent.innerHTML = "";
	if (chara !== undefined && chara !== null) {
		const slot = getSlotData();
		slot.forEach((e) => {
			let div = document.createElement("div");
			div.classList.add("caster-tab");
			div.setAttribute("tab-type", `${e.name}`);
			let title = document.createElement("h3");
			title.classList.add("caster-title");
			title.innerHTML = e.name;
			let tab = document.createElement("div");
			tab.classList.add("item-tab");
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
			div.appendChild(title);
			div.appendChild(tab);
			parent.appendChild(div);
		});
	}else {
		document.getElementById("phone-caster").classList.add("hidden");
	}
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
	if (target.system.die == undefined && game.system.id == "swade") {
		target.show();
	}else {
		target.roll();
	}
}

/*─────────────────────────INVENTORY─────────────────────────*/

function getInventory() {
	const inventory = document.querySelector("#phone-inventory");
  if (!checkFolder("inventory", "Item")) {
    return;
  }
	const invname = HUDSetting.get("inventory");
	const target = game.folders.getName(invname);

	let folder = [];
	let item = [];

	let nav = document.createElement("nav");
	nav.id = "inv-folder";
	nav.dataset.group = "primary";

	let div = document.createElement("div");
	div.id = "inv-folders";

	let pops = document.createElement("div");
	pops.id = "inv-slot";

	target.children.forEach((c) => {
		let entries = [];
		c.documents.forEach((i) => {
			let desc;
			if (i.system.description == undefined) {
				desc = "";
			}else if (i.system.description.value == undefined) {
				desc = i.system.description;
			}else {
				desc = i.system.description.value;
			}
			entries.push({id: i.id, name: i.name, img: i.img, desc: desc});
		});
		folder.push({id: c.id, name: c.folder.name, item: entries});
	});

	target.contents.forEach(function(j) {
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

	folder.push({id: "unclassified", name: game.i18n.localize('MRKB.Unclassified'), item: item})

	folder.forEach((i) => {
		let tab = document.createElement("a");
		tab.classList.add("tab-folder");
		tab.onclick = () => {tabOpen(i.id, "tab-folder", "inv-grid")};
		tab.dataset.tab = i.id;
		tab.innerHTML = i.name;
		nav.appendChild(tab);

		let page = document.createElement("div");
		page.classList.add("inv-grid");
		page.classList.add("tab");
		page.dataset.tab = i.id;
		i.item.forEach((e) => {
			let icon = document.createElement("a");
			icon.classList.add("inv-icon");
			icon.onmouseover = () => {itemDetail(e.id, true)};
			icon.onmouseout = () => {itemDetail(e.id, false)};
			icon.onclick = () => {invUse(e.id)};
			let image = document.createElement("img");
			image.src = e.img;
			icon.appendChild(image);
			page.appendChild(icon);

			let pop = document.createElement("div");
			pop.classList.add("inv-pop");
			pop.dataset.item = e.id;
			let img = document.createElement("img");
			img.src = e.img;
			pop.appendChild(img);
			let h4 = document.createElement("h4");
			h4.innerHTML = e.name;
			pop.appendChild(h4);
			let desc = document.createElement("div");
			desc.innerHTML = e.desc;
			pop.appendChild(desc);
			pops.appendChild(pop);
		});

		div.appendChild(page);
	});

	inventory.innerHTML = "";
	inventory.appendChild(nav);
	inventory.appendChild(pops);
	inventory.appendChild(div);

	onRenderInit("tab-folder", "inv-grid");
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
	let item = document.querySelector(`[data-item="${id}"]`);
	if (a) {
		item.classList.add("active");
		console.log("IN");
	}else {
		item.classList.remove("active");
		console.log("OUT");
	}
}

/*─────────────────────────KAKAO─────────────────────────*/

function getKakaoData(total = false) {
	const kakao = total ? document.querySelector("#phone-kakao") : document.querySelector("#kakaolog");
	const path = `worlds/${game.world.id}/`;
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
		const top = document.createElement("div");
		if (total) {
			top.id = "kakaoheader";
			const back = document.createElement("a");
			back.onclick = () => activeApp('home');
			back.innerHTML = "<i class='fa-solid fa-arrow-left'></i>";
			top.appendChild(back);
			const title = document.createElement("h4");
			title.id = "kakaotitle";
			title.innerHTML = "카카오톡 <span>99</span>";
			top.appendChild(title);
			const search = document.createElement("a");
			search.innerHTML = "<i class='fa-solid fa-magnifying-glass'></i>";
			top.appendChild(search);
			const bars = document.createElement("a");
			bars.innerHTML = "<i class='fa-solid fa-bars'></i>";
			top.appendChild(bars);
		}

		const log = document.createElement("div");
		log.id = "kakaolog";
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
			log.appendChild(chat);
		});

		const bottom = document.createElement("div");
		if (total) {
			bottom.id = "kakaobottom";
			const plus = document.createElement("a");
			plus.innerHTML = "<i class='fa-solid fa-plus'></i>";
			bottom.appendChild(plus);
			const box = document.createElement("textarea");
			box.id = "kakaomessage";
			box.onchange = () => {
				resizeArea();
			}
			box.onkeydown = (e) => {
				resizeArea();
				if (e.keyCode == 13 && !e.shiftKey) {
					e.preventDefault();
					sendtalk();
					$('#kakaomessage').empty();
				}
			}
			box.onkeyup = () => {
				resizeArea();
			}
			box.rows = 1;
			box.autofocus = true;
			box.spellcheck = false;
			bottom.appendChild(box);
			const smile = document.createElement("a");
			smile.innerHTML = "<i class='fa-regular fa-face-smile'></i>";
			bottom.appendChild(smile);
			const send = document.createElement("a");
			send.innerHTML = "<i class='fa-solid fa-play'></i>";
			send.onclick = () => {
				sendtalk();
			}
			bottom.appendChild(send);
		}

		kakao.innerHTML = "";
		if (total) {
			kakao.appendChild(top);
			kakao.appendChild(log);
			kakao.appendChild(bottom);
		}else {
			kakao.appendChild(log);
		}
		const kakaolog = document.querySelector("#kakaolog");
		kakaolog.scrollTo(0, kakaolog.scrollHeight);
	});
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
				socket.executeForEveryone("getKakaoData", false);
			},100);
			document.getElementById('kakaomessage').value = "";
  			ChatMessage.create({
        	content: talk,
  				type : 2,
  				speaker : {
  					actor : chara.id,
  					alias : chara.name
  				}
  			}, {kakao : true});
		});
	}
}

function saveKakao(data) {
	const path = `worlds/${game.world.id}/`;
	let objs = JSON.stringify(data, null, "");
	let file = new File([objs], "kakao.json", {type: "application/json"});
	FilePicker.upload("data", path, file, {}, {notify : false});
}

function resizeArea() {
	const target = document.querySelector("#kakaomessage");
	const bottom = document.querySelector("#kakaobottom");
	bottom.style.height = "35px";
	bottom.style.height = target.scrollHeight + "px";
}

/*─────────────────────────TEXT─────────────────────────*/

function getTextGenerator() {
  const area = document.querySelector("#phone-text");

  const rubyDiv = document.createElement("div");
  rubyDiv.id = "text-ruby";
  rubyDiv.classList.add("text-div");
  rubyDiv.innerHTML = `
    <h4><ruby><rb>루비 텍스트</rb><rt>RUBY TEXT</rt></ruby></h4>
    <input type="text" id="upper-text" placeholder="루비">
    <input type="text" id="down-text" placeholder="본문">
    <button type="button" onclick="enterText('ruby')">루비 삽입</button>
  `
  area.appendChild(rubyDiv);

  const shineDiv = document.createElement("div");
  shineDiv.id = "text-shine";
  shineDiv.classList.add("text-div");
  shineDiv.innerHTML = `
    <h4 style="text-shadow: 0 0 2px white, 0 0 3px cyan, 0 0 10px cyan, 0 0 15px cyan;">발광 텍스트</h4>
    <input type="text" id="shine-text" placeholder="발광 텍스트">
    <input type="color" id="shine-color">
    <button type="button" onclick="enterText('shine')">발광 삽입</button>
  `
  area.appendChild(shineDiv);

  const blurDiv = document.createElement("div");
  blurDiv.id = "text-blur";
  blurDiv.classList.add("text-div");
  blurDiv.innerHTML = `
    <h4 style="color: transparent; text-shadow: 0 0 8px white, 0 0 10px white">블러 텍스트</h4>
    <input type="text" id="blur-text" placeholder="블러 텍스트">
    <button type="button" onclick="enterText('blur')">블러 삽입</button>
  `
  area.appendChild(blurDiv);
}

function enterText(target) {
  let plainText = "";
  if (target == "ruby") {
    plainText = `<ruby><rb>${document.querySelector("#down-text").value}</rb><rt>${document.querySelector("#upper-text").value}</rt></ruby>`
  }else if (target == "shine") {
    plainText = `<span style="text-shadow: 0 0 2px white, 0 0 3px ${document.querySelector("#shine-color").value}, 0 0 10px ${document.querySelector("#shine-color").value}, 0 0 15px ${document.querySelector("#shine-color").value};">${document.querySelector("#shine-text").value}</span>`
  }else if (target == "blur") {
    plainText = `<span style="color: transparent; text-shadow: 0 0 8px white, 0 0 10px white">${document.querySelector("#blur-text").value}</span>`
  }else {
  }

  const chat = document.querySelector("#chat-message");
  chat.value = chat.value + plainText;
}
