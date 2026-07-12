window.DailyMissions = {

	bonusReward: 10,

	list:[
		{ id:"draw3", icon:"🔍", title:"오늘 사진 3번 찾기", reward:6,
			condition:() => PlayerData.dailyMissions.draws >= 3 },

		{ id:"favorite1", icon:"⭐", title:"즐겨찾기 하나 추가하기", reward:6,
			condition:() => PlayerData.dailyMissions.favorited },

		{ id:"note1", icon:"📝", title:"메모 하나 남기기", reward:6,
			condition:() => PlayerData.dailyMissions.noted },

		{ id:"chest1", icon:"🎁", title:"기억 상자 열기", reward:6,
			condition:() => PlayerData.dailyMissions.chestOpened }
	]

};

window.MissionManager = {

	claim(missionId){
		Player.ensureDailyMissions();
		if (PlayerData.dailyMissions.claimed.includes(missionId)) return false;

		const mission = DailyMissions.list.find(m => m.id === missionId);
		if (!mission || !mission.condition()) return false;

		PlayerData.dailyMissions.claimed.push(missionId);
		PlayerData.fragments += mission.reward;

		let bonusClaimed = false;
		if (PlayerData.dailyMissions.claimed.length === DailyMissions.list.length) {
			PlayerData.fragments += DailyMissions.bonusReward;
			bonusClaimed = true;
		}

		SaveManager.save();
		return { reward: mission.reward, bonusClaimed };
	},

	getClaimableCount(){
		Player.ensureDailyMissions();
		return DailyMissions.list.filter(m =>
			!PlayerData.dailyMissions.claimed.includes(m.id) && m.condition()
		).length;
	}

};
