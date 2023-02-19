function announce() {
	let noti = document.getElementById("mrkb-notification");
	let notiopen = document.getElementById("ui-noti-open");
	let precept = HUDSetting.get("announcement");
	if (precept == "") {
		noti.classList.add("hidden");
		notiopen.classList.remove("hidden");
	}else {
		noti.classList.remove("hidden");
		notiopen.classList.add("hidden");
		document.getElementById("notify").innerHTML = precept;
	}
}

function turnNotice() {
	const turnToken = game.combat.current.tokenId;
	if (turnToken === null) {
		return;
	}
	const turnPlayer = game.canvas.tokens.get(turnToken).actor;
	const turnTitle = `${turnPlayer.name}의 턴`;
	const turnOwner = game.users.character?.find(e => e.character.id === turnPlayer.id);
	if (game.user.isGM) {
		if (turnOwner === undefined) {
			ChatMessage.create({
				type : 0,
				speaker : {
					actor : turnPlayer.id,
					alias : turnTitle,
					token : turnToken
				}
			}, {mrkbturn : true});
		}else {
			ChatMessage.create({
				type : 0,
				speaker : {
					actor : turnPlayer.id,
					alias : turnTitle,
					token : turnToken
				},
				user : turnOwner
			}, {mrkbturn : true});
		}
	}
	const container = document.getElementById("turn-notice");
	const image = document.getElementById("turn-img");
	const name = document.getElementById("turn-name");
	image.src = turnPlayer.img;
	name.innerHTML = turnTitle;
	container.classList.remove("hidden");
	setTimeout(function() {
		container.classList.add("hidden");
	}, 1300);
}

let chatCount = 0;

function checkChatFlag(message, html) {
	if (message.getFlag("mrkb-ui", "turner")) {
		html[0].classList.add("mrkb-turn");
	}else if (message.getFlag("mrkb-ui", "kakao")) {
		html[0].classList.add("kakao");
	}else if (message.getFlag("mrkb-ui", "added")) {
		html[0].classList.add("added");
	}else {
	}
	if (message.speaker.actor == game.user.character?.id) {
		html[0].classList.add("self");
	}
}

function fixChatFlag() {
  	if (game.messages.size == 0) return;
  	const msgs = game.messages.contents;
  	let i = 0;
  	msgs.forEach((e) => {
		if (msgs.indexOf(e) == 0 || i >= 3) {
			if (game.user.isGM) {
				e.setFlag("mrkb-ui", "added", false);
			}
		  	document.querySelector(`[data-message-id="${e.id}"]`).classList.remove("added");
		  	i = 0;
		}else if (e.speaker.alias != msgs[msgs.indexOf(e) - 1].speaker.alias && e.type != 5 && msgs[msgs.indexOf(e) - 1].type != 5) {
			if (game.user.isGM) {
				e.setFlag("mrkb-ui", "added", false);
			}
		  	document.querySelector(`[data-message-id="${e.id}"]`).classList.remove("added");
		  	i = 0;
		}else {
			if (game.user.isGM) {
				e.setFlag("mrkb-ui", "added", true);
			}
		  	document.querySelector(`[data-message-id="${e.id}"]`).classList.add("added");
		  	i++;
		}
  	});
}

function chatPlay() {
	let chat = game.messages.contents[game.messages.size - 1];
	if (chat == undefined || chat == null) {
		return;
	}
	let actor = game.actors.get(chat.speaker.actor);
	if (chat.type != 2) {
		return;
	};
	let uiport = document.getElementById(`ui-port`);
	let uiname = document.getElementById(`ui-name`);
	let uichat = document.getElementById(`ui-chat`);
	let img = actor.img;
	uiport.src = `${location.origin}/${img}`;
	uiname.innerHTML = chat.alias;
	uichat.innerHTML = chat.content;
}
