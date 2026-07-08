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
		
		console.log("불러오기 완료", saveData.version);
    },

    reset() {
        localStorage.removeItem(this.key);
    }

};