window.Player = {
    addCard(cardId, amount=1) {
        const ownedCard = PlayerData.ownedCards.find( card => card.id === cardId );

        // 이미 보유한 카드
        if (ownedCard) {
            ownedCard.count += amount;
            ownedCard.resonance += amount;
			this.levelUpCard(ownedCard);
            return false;
        }

        // 신규 카드
        PlayerData.ownedCards.push({
            id: cardId,
            level: 1,
			count: amount,
            resonance: amount-1,
            obtainedAt: Date.now()
        });
        this.applyCardUnlock(cardId);
        return true;
    },

    applyCardUnlock(cardId) {
        const card = CardManager.getCard(cardId);
        if (!card) return;

        if (card.skill === "UNLOCK_POINTS") {
            PlayerData.features.points = true;
        }
        if (card.skill === "UNLOCK_CHAPTER") {
            this.unlockNextChapter(card.chapterId);
        }
    },

    unlockNextChapter(chapterId) {
        const index = GameData.chapters.findIndex(chapter => chapter.id === chapterId);
        const next = GameData.chapters[index + 1];
        if (next && !PlayerData.unlockedChapters.includes(next.id)) {
            PlayerData.unlockedChapters.push(next.id);
            PlayerData.lastUnlockedChapter = next.id;
            return next;
        }
        return null;
    },
	
	checkChapterUnlock(){
		GameData.chapters.forEach(chapter=>{
			if(CardManager.isChapterComplete(chapter.id))
			{				
				this.unlockNextChapter(chapter.id);
			}
		});
	},
	
	hasCard(id){
		return PlayerData.ownedCards.some(card => card.id === id);
	},
	
	getRequiredExp(level){
		return level * level * 10;
	},
	
	levelUpCard(cardData){
		let required = this.getRequiredExp(cardData.level);

		while(cardData.resonance >= required){
			cardData.resonance -= required;
			cardData.level++;
			required = this.getRequiredExp(cardData.level);
		}
	},

	// 중복으로 뽑힌 사진에서 기억 조각을 얻어요
	grantFragments(rarity, count = 1){
		if (count <= 0) return 0;
		const value = (GameData.fragmentValue[rarity] ?? 1) * count;
		PlayerData.fragments += value;
		return value;
	},

	// 조각을 모아 아직 만나지 못한 사진을 직접 해금해요
	unlockCardWithFragments(cardId){
		const card = CardManager.getCard(cardId);
		if (!card) return false;
		if (this.hasCard(cardId)) return false;
		if (!card.requires.every(req => this.hasCard(req))) return false;

		const cost = GameData.fragmentCost[card.rarity] ?? 30;
		if (PlayerData.fragments < cost) return false;

		PlayerData.fragments -= cost;
		this.addCard(cardId, 1);
		PlayerData.fragmentUnlocks += 1;
		this.checkChapterUnlock();
		SaveManager.save();
		return true;
	},

	getBoostCost(rarity){
		return (GameData.fragmentValue[rarity] ?? 1) * GameData.fragmentBoostMultiplier;
	},

	// 이미 가진 사진에 조각을 써서 중복 획득한 것처럼 성장시켜요
	boostCardWithFragments(cardId){
		if (!this.hasCard(cardId)) return false;
		const card = CardManager.getCard(cardId);
		if (!card) return false;

		const cost = this.getBoostCost(card.rarity);
		if (PlayerData.fragments < cost) return false;

		PlayerData.fragments -= cost;
		this.addCard(cardId, 1);
		SaveManager.save();
		return true;
	},

	// 조각으로 탐색 대기시간을 즉시 건너뛰어요
	skipCooldownWithFragments(){
		if (PlayerData.fragments < GameData.fragmentSkipCost) return false;
		if (DrawManager.getRemainingTime() <= 0) return false;

		PlayerData.fragments -= GameData.fragmentSkipCost;
		PlayerData.draw.lastDrawTime = 0;
		SaveManager.save();
		return true;
	},

	// 오랜만에 돌아왔을 때 조각을 선물해요 (최대 24시간, 시간당 2개)
	claimWelcomeBack(){
		const now = Date.now();
		const last = PlayerData.lastSeenAt;
		PlayerData.lastSeenAt = now;

		if (!last) return null;
		const hours = Math.floor((now - last) / 3600000);
		if (hours < 1) return null;

		const cappedHours = Math.min(hours, 24);
		const fragments = cappedHours * 2;
		if (fragments <= 0) return null;

		PlayerData.fragments += fragments;
		return { hours: cappedHours, fragments };
	},

	// 방치해두면 서서히 차오르는 기억 상자
	CHEST_FILL_HOURS: 4,

	getChestProgress(){
		if (!PlayerData.chest.lastCollectedAt) PlayerData.chest.lastCollectedAt = Date.now();
		const elapsedHours = (Date.now() - PlayerData.chest.lastCollectedAt) / 3600000;
		const percent = Math.min(100, Math.floor((elapsedHours / this.CHEST_FILL_HOURS) * 100));
		return { percent, ready: percent >= 100 };
	},

	collectChest(){
		const progress = this.getChestProgress();
		if (!progress.ready) return null;

		const reward = 8 + Math.floor(Math.random() * 5);
		PlayerData.fragments += reward;
		PlayerData.chest.lastCollectedAt = Date.now();
		SaveManager.save();
		return reward;
	},

	// 모은 사진 수에 따라 붙는 작은 칭호
	getTitle(){
		const owned = PlayerData.ownedCards.length;
		const total = GameData.cards.length;
		if (owned >= total)  return "완벽한 기록자";
		if (owned >= 100) return "이서의 역사가";
		if (owned >= 60)  return "추억의 장인";
		if (owned >= 30)  return "우리 가족의 기록가";
		if (owned >= 10)  return "사진사 견습생";
		return "새싹 수집가";
	},

	todayKey(){
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
	},

	// 미래의 이서(또는 우리)에게 보내는 편지를 남겨요
	writeLetter(title, body, unlockAt){
		const letter = {
			id: "cap_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
			title: title.trim().slice(0, 40) || "이서에게",
			body: body.trim().slice(0, 500),
			createdAt: Date.now(),
			unlockAt,
			opened: false
		};
		PlayerData.letters.push(letter);
		SaveManager.save();
		return letter;
	},

	openLetter(id){
		const letter = PlayerData.letters.find(l => l.id === id);
		if (!letter) return false;
		if (Date.now() < letter.unlockAt) return false;
		letter.opened = true;
		SaveManager.save();
		return true;
	},

	getNextMilestone(){
		const birth = new Date(2025, 11, 27).getTime();
		const milestones = [
			{ label:"100일", at: birth + 100 * 86400000 },
			{ label:"첫 돌", at: new Date(2026, 11, 27).getTime() },
			{ label:"두 번째 생일", at: new Date(2027, 11, 27).getTime() },
			{ label:"다섯 번째 생일", at: new Date(2030, 11, 27).getTime() },
			{ label:"초등학교 입학", at: new Date(2032, 2, 2).getTime() },
			{ label:"열 번째 생일", at: new Date(2035, 11, 27).getTime() },
			{ label:"성인이 되는 날", at: new Date(2044, 11, 27).getTime() }
		];
		const now = Date.now();
		return milestones.find(m => m.at > now) || milestones[milestones.length - 1];
	},



	// 날짜가 바뀌면 오늘의 미션을 새로 시작해요
	ensureDailyMissions(){
		const today = this.todayKey();
		if (PlayerData.dailyMissions.date !== today) {
			PlayerData.dailyMissions = {
				date: today,
				draws: 0,
				favorited: false,
				noted: false,
				chestOpened: false,
				claimed: []
			};
		}
	},

	// 하루 한 번, 방문할 때마다 연속 방문(스트릭)을 갱신
	updateStreak(){
		const today = this.todayKey();
		const last = PlayerData.streak.lastVisit;

		if (last === today) return; // 오늘 이미 방문 체크됨

		if (last) {
			const diffDays = Math.round((new Date(today) - new Date(last)) / 86400000);
			PlayerData.streak.count = diffDays === 1 ? PlayerData.streak.count + 1 : 1;
		} else {
			PlayerData.streak.count = 1;
		}

		PlayerData.streak.lastVisit = today;
		PlayerData.streak.best = Math.max(PlayerData.streak.best, PlayerData.streak.count);
	}

};

window.PlayerData = {

    ownedCards: [],

    unlockedChapters:[
        "CH-000"
    ],

    features: {
        points: false
    },

    points: 0,
    totalDraws: 0,
    lastPointGain: 0,
    lastUnlockedChapter: null,

    favoriteCards: [],
    memoryNotes: {},

    unlockedAchievements: [],

    letters: [],

    memoryGame: {
        bestMoves: null,
        dailyPlays: 0,
        lastPlayDate: null
    },

    puzzleGame: {
        bestMoves: { 3:null, 4:null, 5:null },
        dailyPlays: 0,
        lastPlayDate: null
    },

    fragments: 0,
    fragmentUnlocks: 0,

    photoDownloads: 0,
    usedAlbumSearch: false,
    usedAlbumSort: false,
    usedHistoryRandom: false,

    lastSeenAt: null,

    chest: {
        lastCollectedAt: null
    },

    dailyMissions: {
        date: null,
        draws: 0,
        favorited: false,
        noted: false,
        chestOpened: false,
        claimed: []
    },

    streak: {
        count: 0,
        best: 0,
        lastVisit: null
    },

    draw: {
        baseCooldown: 3,
        lastDrawTime:0,
		baseCount:1,
    }

};
