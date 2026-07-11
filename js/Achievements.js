window.Achievements = {

	list:[
		{ id:"FIRST_MEMORY", icon:"🌱", title:"첫 기억", desc:"첫 번째 사진을 모았어요",
			condition:() => PlayerData.ownedCards.length >= 1 },

		{ id:"COLLECT_10", icon:"📷", title:"작은 사진첩", desc:"사진 10장을 모았어요",
			condition:() => PlayerData.ownedCards.length >= 10 },

		{ id:"COLLECT_25", icon:"📚", title:"두툼한 사진첩", desc:"사진 25장을 모았어요",
			condition:() => PlayerData.ownedCards.length >= 25 },

		{ id:"COLLECT_ALL", icon:"🏆", title:"완성된 이야기", desc:"Prologue의 모든 사진을 모았어요",
			condition:() => CardManager.isChapterComplete("CH-000") },

		{ id:"RARE_5", icon:"💎", title:"레어의 시작", desc:"RARE 등급 사진 5장을 모았어요",
			condition:() => CardManager.countOwnedByRarity("RARE") >= 5 },

		{ id:"EPIC_5", icon:"✨", title:"특별한 순간들", desc:"EPIC 등급 사진 5장을 모았어요",
			condition:() => CardManager.countOwnedByRarity("EPIC") >= 5 },

		{ id:"LEGEND_3", icon:"👑", title:"전설의 기록", desc:"LEGEND 등급 사진 3장을 모았어요",
			condition:() => CardManager.countOwnedByRarity("LEGEND") >= 3 },

		{ id:"SECRET_1", icon:"🔮", title:"숨겨진 이야기", desc:"SECRET 등급 사진을 처음 발견했어요",
			condition:() => CardManager.countOwnedByRarity("SECRET") >= 1 },

		{ id:"FAVORITE_5", icon:"⭐", title:"마음에 담은 순간", desc:"즐겨찾기에 5장을 담았어요",
			condition:() => PlayerData.favoriteCards.length >= 5 },

		{ id:"NOTE_3", icon:"📝", title:"기록하는 마음", desc:"한 줄 메모를 3개 남겼어요",
			condition:() => Object.keys(PlayerData.memoryNotes).length >= 3 },

		{ id:"DRAW_50", icon:"🔍", title:"꾸준한 탐색", desc:"사진을 50번 찾았어요",
			condition:() => PlayerData.totalDraws >= 50 },

		{ id:"DRAW_100", icon:"🧭", title:"열심히 찾은 우리", desc:"사진을 100번 찾았어요",
			condition:() => PlayerData.totalDraws >= 100 },

		{ id:"STREAK_3", icon:"🔥", title:"3일 연속 방문", desc:"3일 연속으로 사진첩을 열었어요",
			condition:() => PlayerData.streak.count >= 3 },

		{ id:"STREAK_7", icon:"🔥", title:"일주일의 약속", desc:"7일 연속으로 사진첩을 열었어요",
			condition:() => PlayerData.streak.count >= 7 },

		{ id:"LEVEL_10", icon:"🌟", title:"깊어진 기억", desc:"사진 하나를 Lv.10까지 키웠어요",
			condition:() => PlayerData.ownedCards.some(c => c.level >= 10) }
	]

};

window.AchievementManager = {

	checkAll(){
		const newlyUnlocked = [];

		Achievements.list.forEach(achievement => {
			if (PlayerData.unlockedAchievements.includes(achievement.id)) return;
			if (achievement.condition()) {
				PlayerData.unlockedAchievements.push(achievement.id);
				newlyUnlocked.push(achievement);
			}
		});

		if (newlyUnlocked.length) {
			SaveManager.save();
			newlyUnlocked.forEach((achievement, index) => {
				setTimeout(() => this.showToast(achievement), index * 900);
			});
		}

		return newlyUnlocked;
	},

	showToast(achievement){
		const toast = document.createElement("div");
		toast.className = "achievement-toast";
		toast.innerHTML = `
			<span class="achievement-toast-icon">${achievement.icon}</span>
			<span class="achievement-toast-body"><strong>업적 달성</strong>${achievement.title}</span>
		`;
		document.body.appendChild(toast);

		requestAnimationFrame(() => toast.classList.add("show"));

		setTimeout(() => {
			toast.classList.remove("show");
			setTimeout(() => toast.remove(), 400);
		}, 3200);
	}

};
