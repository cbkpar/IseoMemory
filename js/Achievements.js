window.Achievements = {

	categories:[
		{ id:"COLLECTION", label:"📷 수집" },
		{ id:"RARITY",     label:"💎 등급" },
		{ id:"RECORD",     label:"💌 기록" },
		{ id:"EXPLORE",    label:"🔍 탐색" },
		{ id:"GROWTH",     label:"🌱 성장" },
		{ id:"FRAGMENT",   label:"🧩 조각" },
		{ id:"SPECIAL",    label:"✨ 특별" }
	],

	list:[
		// ── 수집 ──────────────────────────────
		{ id:"FIRST_MEMORY", cat:"COLLECTION", icon:"🌱", title:"첫 기억", desc:"첫 번째 사진을 모았어요",
			condition:() => PlayerData.ownedCards.length >= 1 },

		{ id:"COLLECT_10", cat:"COLLECTION", icon:"📷", title:"작은 사진첩", desc:"사진 10장을 모았어요",
			condition:() => PlayerData.ownedCards.length >= 10 },

		{ id:"COLLECT_25", cat:"COLLECTION", icon:"📚", title:"두툼한 사진첩", desc:"사진 25장을 모았어요",
			condition:() => PlayerData.ownedCards.length >= 25 },

		{ id:"COLLECT_50", cat:"COLLECTION", icon:"🗂️", title:"쌓여가는 이야기", desc:"사진 50장을 모았어요",
			condition:() => PlayerData.ownedCards.length >= 50 },

		{ id:"COLLECT_100", cat:"COLLECTION", icon:"📦", title:"가득 찬 사진첩", desc:"사진 100장을 모았어요",
			condition:() => PlayerData.ownedCards.length >= 100 },

		{ id:"COLLECT_ALL", cat:"COLLECTION", icon:"🏆", title:"완성된 이야기", desc:"Prologue의 모든 사진을 모았어요",
			condition:() => CardManager.isChapterComplete("CH-000") },

		{ id:"WELCOME_BABY_COMPLETE", cat:"COLLECTION", icon:"👶", title:"우리 아가와의 첫 만남", desc:"Welcome Baby의 모든 사진을 모았어요",
			condition:() => CardManager.isChapterComplete("CH-001") },

		{ id:"DAY100_COMPLETE", cat:"COLLECTION", icon:"🎂", title:"백일의 기록", desc:"100일의 모든 사진을 모았어요",
			condition:() => CardManager.isChapterComplete("CH-002") },

		{ id:"GRAND_COMPLETE", cat:"COLLECTION", icon:"🌳", title:"우리의 모든 이야기", desc:"모든 챕터의 사진을 하나도 빠짐없이 모았어요",
			condition:() => GameData.chapters.every(chapter => CardManager.isChapterComplete(chapter.id)) },

		// ── 등급 ──────────────────────────────
		{ id:"RARE_5", cat:"RARITY", icon:"💎", title:"레어의 시작", desc:"RARE 등급 사진 5장을 모았어요",
			condition:() => CardManager.countOwnedByRarity("RARE") >= 5 },

		{ id:"RARE_15", cat:"RARITY", icon:"💠", title:"레어 컬렉터", desc:"RARE 등급 사진 15장을 모았어요",
			condition:() => CardManager.countOwnedByRarity("RARE") >= 15 },

		{ id:"EPIC_5", cat:"RARITY", icon:"✨", title:"특별한 순간들", desc:"EPIC 등급 사진 5장을 모았어요",
			condition:() => CardManager.countOwnedByRarity("EPIC") >= 5 },

		{ id:"EPIC_10", cat:"RARITY", icon:"🌠", title:"빛나는 기억들", desc:"EPIC 등급 사진 10장을 모았어요",
			condition:() => CardManager.countOwnedByRarity("EPIC") >= 10 },

		{ id:"LEGEND_3", cat:"RARITY", icon:"👑", title:"전설의 기록", desc:"LEGEND 등급 사진 3장을 모았어요",
			condition:() => CardManager.countOwnedByRarity("LEGEND") >= 3 },

		{ id:"LEGEND_7", cat:"RARITY", icon:"🏅", title:"전설이 되어가는", desc:"LEGEND 등급 사진 7장을 모았어요",
			condition:() => CardManager.countOwnedByRarity("LEGEND") >= 7 },

		{ id:"SECRET_1", cat:"RARITY", icon:"🔮", title:"숨겨진 이야기", desc:"SECRET 등급 사진을 처음 발견했어요",
			condition:() => CardManager.countOwnedByRarity("SECRET") >= 1 },

		{ id:"SECRET_3", cat:"RARITY", icon:"🌌", title:"비밀이 쌓여가요", desc:"SECRET 등급 사진 3장을 모았어요",
			condition:() => CardManager.countOwnedByRarity("SECRET") >= 3 },

		{ id:"SECRET_ALL", cat:"RARITY", icon:"🗝️", title:"모든 비밀을 찾다", desc:"모든 SECRET 등급 사진을 모았어요",
			condition:() => {
				const total = CardManager.countTotalByRarity("SECRET");
				return total > 0 && CardManager.countOwnedByRarity("SECRET") >= total;
			} },

		{ id:"RAINBOW", cat:"RARITY", icon:"🎨", title:"무지개 같은 사진첩", desc:"모든 등급의 사진을 하나씩 모았어요",
			condition:() => ["NORMAL","RARE","EPIC","LEGEND","SECRET"].every(r => CardManager.countOwnedByRarity(r) >= 1) },

		// ── 기록 ──────────────────────────────
		{ id:"FAVORITE_5", cat:"RECORD", icon:"⭐", title:"마음에 담은 순간", desc:"즐겨찾기에 5장을 담았어요",
			condition:() => PlayerData.favoriteCards.length >= 5 },

		{ id:"FAVORITE_15", cat:"RECORD", icon:"🌟", title:"소중한 것들만 모아", desc:"즐겨찾기에 15장을 담았어요",
			condition:() => PlayerData.favoriteCards.length >= 15 },

		{ id:"FAVORITE_30", cat:"RECORD", icon:"💖", title:"온통 좋아하는 것들", desc:"즐겨찾기에 30장을 담았어요",
			condition:() => PlayerData.favoriteCards.length >= 30 },

		{ id:"NOTE_3", cat:"RECORD", icon:"📝", title:"기록하는 마음", desc:"한 줄 메모를 3개 남겼어요",
			condition:() => Object.keys(PlayerData.memoryNotes).length >= 3 },

		{ id:"NOTE_10", cat:"RECORD", icon:"✍️", title:"차곡차곡 쌓인 마음", desc:"한 줄 메모를 10개 남겼어요",
			condition:() => Object.keys(PlayerData.memoryNotes).length >= 10 },

		{ id:"NOTE_30", cat:"RECORD", icon:"📖", title:"우리만의 일기장", desc:"한 줄 메모를 30개 남겼어요",
			condition:() => Object.keys(PlayerData.memoryNotes).length >= 30 },

		// ── 탐색 ──────────────────────────────
		{ id:"DRAW_50", cat:"EXPLORE", icon:"🔍", title:"꾸준한 탐색", desc:"사진을 50번 찾았어요",
			condition:() => PlayerData.totalDraws >= 50 },

		{ id:"DRAW_100", cat:"EXPLORE", icon:"🧭", title:"열심히 찾은 우리", desc:"사진을 100번 찾았어요",
			condition:() => PlayerData.totalDraws >= 100 },

		{ id:"DRAW_200", cat:"EXPLORE", icon:"🗺️", title:"멈추지 않는 탐색", desc:"사진을 200번 찾았어요",
			condition:() => PlayerData.totalDraws >= 200 },

		{ id:"DRAW_500", cat:"EXPLORE", icon:"🏕️", title:"탐색의 달인", desc:"사진을 500번 찾았어요",
			condition:() => PlayerData.totalDraws >= 500 },

		{ id:"STREAK_3", cat:"EXPLORE", icon:"🔥", title:"3일 연속 방문", desc:"3일 연속으로 사진첩을 열었어요",
			condition:() => PlayerData.streak.count >= 3 },

		{ id:"STREAK_7", cat:"EXPLORE", icon:"🔥", title:"일주일의 약속", desc:"7일 연속으로 사진첩을 열었어요",
			condition:() => PlayerData.streak.count >= 7 },

		{ id:"STREAK_14", cat:"EXPLORE", icon:"🔥", title:"2주째 이어지는 하루", desc:"14일 연속으로 사진첩을 열었어요",
			condition:() => PlayerData.streak.count >= 14 },

		{ id:"STREAK_30", cat:"EXPLORE", icon:"🔥", title:"한 달의 약속", desc:"30일 연속으로 사진첩을 열었어요",
			condition:() => PlayerData.streak.count >= 30 },

		// ── 성장 ──────────────────────────────
		{ id:"LEVEL_10", cat:"GROWTH", icon:"🌟", title:"깊어진 기억", desc:"사진 하나를 Lv.10까지 키웠어요",
			condition:() => PlayerData.ownedCards.some(c => c.level >= 10) },

		{ id:"LEVEL_20", cat:"GROWTH", icon:"💫", title:"완전히 자란 기억", desc:"사진 하나를 Lv.20까지 키웠어요",
			condition:() => PlayerData.ownedCards.some(c => c.level >= 20) },

		{ id:"CLEAR_PHOTO", cat:"GROWTH", icon:"📸", title:"선명해진 순간", desc:"사진 하나가 Lv.7이 되어 완전히 선명해졌어요",
			condition:() => PlayerData.ownedCards.some(c => c.level >= 7) },

		{ id:"CLEAR_5", cat:"GROWTH", icon:"🖼️", title:"선명해진 다섯 장", desc:"사진 5장이 완전히 선명해졌어요",
			condition:() => PlayerData.ownedCards.filter(c => c.level >= 7).length >= 5 },

		// ── 조각 ──────────────────────────────
		{ id:"FRAGMENT_UNLOCK", cat:"FRAGMENT", icon:"🧩", title:"조각을 모아서", desc:"기억 조각으로 사진을 처음 해금했어요",
			condition:() => PlayerData.fragmentUnlocks >= 1 },

		{ id:"FRAGMENT_MASTER", cat:"FRAGMENT", icon:"🧷", title:"조각의 달인", desc:"기억 조각으로 사진을 5번 해금했어요",
			condition:() => PlayerData.fragmentUnlocks >= 5 },

		{ id:"FRAGMENT_HOARDER", cat:"FRAGMENT", icon:"💰", title:"조각 부자", desc:"기억 조각을 100개 이상 모아봤어요",
			condition:() => PlayerData.fragments >= 100 },

		// ── 특별 ──────────────────────────────
		{ id:"NIGHT_OWL", cat:"SPECIAL", icon:"🌙", title:"한밤의 탐색", desc:"자정부터 새벽 5시 사이에 사진을 찾았어요",
			condition:() => {
				const h = new Date(PlayerData.draw.lastDrawTime).getHours();
				return PlayerData.draw.lastDrawTime > 0 && h >= 0 && h < 5;
			} },

		{ id:"EARLY_BIRD", cat:"SPECIAL", icon:"🌅", title:"아침의 첫 탐색", desc:"오전 5시부터 8시 사이에 사진을 찾았어요",
			condition:() => {
				const h = new Date(PlayerData.draw.lastDrawTime).getHours();
				return PlayerData.draw.lastDrawTime > 0 && h >= 5 && h < 8;
			} },

		{ id:"WEEKEND_KEEPER", cat:"SPECIAL", icon:"📅", title:"주말에도 우리는", desc:"주말에도 사진첩을 열어봤어요",
			condition:() => {
				const day = new Date().getDay();
				return PlayerData.ownedCards.length > 0 && (day === 0 || day === 6);
			} },

		{ id:"BIRTH_DAY", cat:"SPECIAL", icon:"🎂", title:"태어난 그날에", desc:"이서의 생일에 사진첩을 열었어요",
			condition:() => {
				const now = new Date();
				return now.getMonth() === 11 && now.getDate() === 27;
			} },

		{ id:"HUNDRED_DAY", cat:"SPECIAL", icon:"🎉", title:"진짜 백일잔치", desc:"백일 되는 그날에 사진첩을 열었어요",
			condition:() => {
				const now = new Date();
				return now.getFullYear() === 2026 && now.getMonth() === 3 && now.getDate() === 6;
			} },

		{ id:"EXPLORER", cat:"SPECIAL", icon:"🔎", title:"꼼꼼한 탐험가", desc:"앨범에서 검색 기능을 사용해봤어요",
			condition:() => PlayerData.usedAlbumSearch },

		{ id:"SORTER", cat:"SPECIAL", icon:"🗃️", title:"정리의 달인", desc:"앨범 정렬 기능을 사용해봤어요",
			condition:() => PlayerData.usedAlbumSort },

		{ id:"RANDOM_MEMORY", cat:"SPECIAL", icon:"🎲", title:"우연한 재회", desc:"랜덤으로 옛 추억을 다시 봤어요",
			condition:() => PlayerData.usedHistoryRandom },

		{ id:"SHARE_MEMORY", cat:"SPECIAL", icon:"📤", title:"추억을 나누다", desc:"사진을 이미지로 저장해봤어요",
			condition:() => PlayerData.photoDownloads >= 1 }
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
