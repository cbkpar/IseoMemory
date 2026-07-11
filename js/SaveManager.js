window.SaveManager = {
	
	key:"memory_save",
	
    save() {
		const saveData = {
            version:GameData.version,
            player:PlayerData
        };
		
        localStorage.setItem(this.key, JSON.stringify(saveData));
    },
	
    load() {
        const data = localStorage.getItem(this.key);
        if (!data) return;
		
		const saveData = JSON.parse(data);
		if(!saveData.player) return;
		
        Object.assign(PlayerData, saveData.player);
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
