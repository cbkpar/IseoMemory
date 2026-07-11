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

	todayKey(){
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
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
