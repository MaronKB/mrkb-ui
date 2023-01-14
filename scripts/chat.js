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
	const turnToken = game.combat.current.tokenId
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

function checkNotice(message, html, data) {
	if (message.getFlag("mrkb-ui", "turner")) {
		html[0].classList.add("mrkb-turn");
	}else if (message.getFlag("mrkb-ui", "kakao")) {
		html[0].classList.add("kakao");
	}else if (message.getFlag("mrkb-ui", "added")) {
		html[0].classList.add("added");
	}
	if (message.speaker.actor == game.user.character?.id) {
		html[0].classList.add("self");
	}
}
