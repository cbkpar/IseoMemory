window.SaveManager = {
	
	key:"memory_save",
	
    save() {
		const saveData = {
            version:GameData.version,
            player:PlayerData
        };
		
        try {
            localStorage.setItem(this.key, JSON.stringify(saveData));
        } catch (err) {
            console.warn("저장에 실패했어요", err);
        }
    },
	
    load() {
        const data = localStorage.getItem(this.key);
        if (!data) return;

        let saveData;
        try {
            saveData = JSON.parse(data);
        } catch (err) {
            console.warn("저장 데이터를 읽는 중 문제가 생겨서 처음부터 시작해요", err);
            return;
        }
		if(!saveData || !saveData.player) return;
		
        Object.assign(PlayerData, saveData.player);
		if (!Array.isArray(PlayerData.ownedCards)) PlayerData.ownedCards = [];
		PlayerData.features = { points:false };
		PlayerData.draw = { baseCooldown:3, lastDrawTime:0, baseCount:1, ...(PlayerData.draw || {}) };
		PlayerData.draw.baseCooldown = 3;
		PlayerData.points ??= 0;
		PlayerData.totalDraws ??= 0;
		PlayerData.lastPointGain ??= 0;
		PlayerData.lastUnlockedChapter ??= null;
		PlayerData.favoriteCards ??= [];
		PlayerData.memoryNotes ??= {};
		PlayerData.unlockedAchievements ??= [];
		PlayerData.fragments ??= 0;
		PlayerData.fragmentUnlocks ??= 0;
		PlayerData.photoDownloads ??= 0;
		PlayerData.usedAlbumSearch ??= false;
		PlayerData.usedAlbumSort ??= false;
		PlayerData.usedHistoryRandom ??= false;
		PlayerData.lastSeenAt ??= null;
		PlayerData.chest ??= { lastCollectedAt:null };
		PlayerData.chest.lastCollectedAt ??= null;
		PlayerData.dailyMissions ??= { date:null, draws:0, favorited:false, noted:false, chestOpened:false, claimed:[] };
		Player.ensureDailyMissions();
		PlayerData.streak ??= { count:0, best:0, lastVisit:null };
		PlayerData.streak.count ??= 0;
		PlayerData.streak.best ??= 0;
		PlayerData.streak.lastVisit ??= null;
		PlayerData.ownedCards.forEach(card => Player.applyCardUnlock(card.id));
		PlayerData.ownedCards.forEach(card => { card.obtainedAt ??= null; });
		Player.updateStreak();
		
		console.log("불러오기 완료", saveData.version);
    },

    reset() {
        localStorage.removeItem(this.key);
    }

};
