window.StatsUI = {

	activeTab: "summary",

	init(){
		document.getElementById("stats-open").onclick = () => this.open();
		document.getElementById("stats-close").onclick = () => this.close();
		document.querySelector("#stats-modal .history-modal-bg").onclick = () => this.close();

		document.querySelectorAll(".stats-tab").forEach(tab => {
			tab.onclick = () => this.switchTab(tab.dataset.tab);
		});
	},

	open(){
		AchievementManager.checkAll();
		this.render();
		document.getElementById("stats-modal").classList.remove("hidden");
	},

	close(){
		document.getElementById("stats-modal").classList.add("hidden");
	},

	switchTab(tab){
		this.activeTab = tab;
		document.querySelectorAll(".stats-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
		document.getElementById("stats-panel-summary").classList.toggle("hidden", tab !== "summary");
		document.getElementById("stats-panel-missions").classList.toggle("hidden", tab !== "missions");
		document.getElementById("stats-panel-achievements").classList.toggle("hidden", tab !== "achievements");
	},

	render(){
		this.renderSummary();
		this.renderMissions();
		this.renderAchievements();
		this.renderBadge();
	},

	renderBadge(){
		const badge = document.getElementById("achievement-count-badge");
		if (badge) badge.textContent = `${PlayerData.unlockedAchievements.length}/${Achievements.list.length}`;

		const missionBadge = document.getElementById("mission-count-badge");
		if (missionBadge) {
			const claimable = MissionManager.getClaimableCount();
			missionBadge.textContent = claimable > 0 ? `${claimable}개 대기` : `${PlayerData.dailyMissions.claimed.length}/${DailyMissions.list.length}`;
		}
	},

	renderMissions(){
		const panel = document.getElementById("stats-panel-missions");
		if (!panel) return;
		Player.ensureDailyMissions();

		const rows = DailyMissions.list.map(mission => {
			const claimed = PlayerData.dailyMissions.claimed.includes(mission.id);
			const done = mission.condition();
			const state = claimed ? "claimed" : (done ? "ready" : "locked");
			const buttonLabel = claimed ? "받았어요 ✓" : (done ? `🧩 ${mission.reward}개 받기` : "진행 중");
			return `
				<div class="mission-row ${state}">
					<span class="mission-icon">${mission.icon}</span>
					<span class="mission-body"><strong>${mission.title}</strong><span>보상 🧩 ${mission.reward}개</span></span>
					<button class="mission-claim" data-mission-id="${mission.id}" type="button" ${claimed || !done ? "disabled" : ""}>${buttonLabel}</button>
				</div>
			`;
		}).join("");

		const allClaimed = PlayerData.dailyMissions.claimed.length === DailyMissions.list.length;
		panel.innerHTML = `
			<p class="fragment-intro">매일 자정에 새로운 미션으로 초기화돼요. 모두 완료하면 보너스 조각도 받을 수 있어요.</p>
			<div class="mission-list">${rows}</div>
			<div class="mission-bonus ${allClaimed ? "complete" : ""}">🎉 오늘의 미션을 모두 완료하면 보너스 🧩 ${DailyMissions.bonusReward}개!</div>
		`;

		panel.querySelectorAll(".mission-claim").forEach(button => {
			button.onclick = () => {
				const result = MissionManager.claim(button.dataset.missionId);
				if (!result) return;
				CardUI.renderStatus();
				this.render();
			};
		});
	},

	getStartDate(){
		const sorted = [...GameData.cards].sort((a, b) => a.order - b.order);
		return sorted[0] ? sorted[0].date : null;
	},

	getMostRecentCard(){
		const withTimestamps = PlayerData.ownedCards
			.map(owned => ({ owned, card: CardManager.getCard(owned.id) }))
			.filter(item => item.card && item.owned.obtainedAt);
		if (!withTimestamps.length) return null;
		return withTimestamps.sort((a, b) => b.owned.obtainedAt - a.owned.obtainedAt)[0];
	},

	renderSummary(){
		const panel = document.getElementById("stats-panel-summary");
		const startDate = this.getStartDate();
		const dDay = startDate
			? Math.floor((new Date().setHours(0,0,0,0) - new Date(startDate).setHours(0,0,0,0)) / 86400000)
			: 0;

		const totalOwned = PlayerData.ownedCards.length;
		const totalCards = GameData.cards.length;

		const rarities = ["SECRET", "LEGEND", "EPIC", "RARE", "NORMAL"];
		const rarityRows = rarities.map(rarity => {
			const owned = CardManager.countOwnedByRarity(rarity);
			const total = CardManager.countTotalByRarity(rarity);
			if (!total) return "";
			const percent = Math.round((owned / total) * 100);
			return `
				<div class="rarity-row">
					<span class="rarity-row-label rarity-row-${rarity.toLowerCase()}">${rarity}</span>
					<div class="rarity-row-bar"><div class="rarity-row-fill rarity-fill-${rarity.toLowerCase()}" style="width:${percent}%"></div></div>
					<span class="rarity-row-count">${owned}/${total}</span>
				</div>
			`;
		}).join("");

		const chapterRows = GameData.chapters.filter(chapter => chapter.cards.length > 0).map(chapter => {
			const total = CardManager.getChapterCards(chapter.id).length;
			const owned = CardManager.getOwnedChapterCards(chapter.id).length;
			const percent = total ? Math.round((owned / total) * 100) : 0;
			return `
				<div class="rarity-row">
					<span class="rarity-row-label">${chapter.title}</span>
					<div class="rarity-row-bar"><div class="rarity-row-fill chapter-fill" style="width:${percent}%"></div></div>
					<span class="rarity-row-count">${owned}/${total}</span>
				</div>
			`;
		}).join("");

		const recent = this.getMostRecentCard();

		panel.innerHTML = `
			<div class="player-title-badge">🎖️ ${Player.getTitle()}</div>
			<div class="dday-card">
				<span>우리 이야기가 시작된 지</span>
				<strong>D+${dDay}</strong>
				<em>${startDate ? startDate + "부터 함께" : ""}</em>
			</div>

			<div class="stats-grid">
				<div><span>모은 사진</span><strong>${totalOwned} / ${totalCards}</strong></div>
				<div><span>총 탐색</span><strong>${PlayerData.totalDraws}회</strong></div>
				<div><span>연속 방문</span><strong>${PlayerData.streak.count}일 (최고 ${PlayerData.streak.best}일)</strong></div>
				<div><span>즐겨찾기</span><strong>${PlayerData.favoriteCards.length}장</strong></div>
				<div><span>남긴 메모</span><strong>${Object.keys(PlayerData.memoryNotes).length}개</strong></div>
				<div><span>기억 조각</span><strong>🧩 ${PlayerData.fragments}개</strong></div>
			</div>

			<h3 class="stats-section-title">등급별 수집 현황</h3>
			${rarityRows}

			<h3 class="stats-section-title">챕터 진행률</h3>
			${chapterRows}

			${recent ? `
				<h3 class="stats-section-title">가장 최근에 발견한 사진</h3>
				<button class="stats-recent-card" id="stats-recent-card-btn" type="button">
					<img src="./assets/images/${recent.card.photo}" alt="">
					<span><strong>${recent.card.title}</strong><time>${recent.card.date}</time></span>
				</button>
			` : ""}
		`;

		const recentBtn = document.getElementById("stats-recent-card-btn");
		if (recentBtn) {
			recentBtn.onclick = () => {
				this.close();
				UI.showCardDetail({ id: recent.card.id, count: recent.owned.count });
			};
		}
	},

	renderAchievements(){
		const panel = document.getElementById("stats-panel-achievements");
		panel.innerHTML = Achievements.categories.map(category => {
			const items = Achievements.list.filter(a => a.cat === category.id);
			if (!items.length) return "";
			const unlockedCount = items.filter(a => PlayerData.unlockedAchievements.includes(a.id)).length;

			const cards = items.map(achievement => {
				const unlocked = PlayerData.unlockedAchievements.includes(achievement.id);
				return `
					<div class="achievement-card ${unlocked ? "unlocked" : "locked"}">
						<span class="achievement-icon">${unlocked ? achievement.icon : "🔒"}</span>
						<span class="achievement-body">
							<strong>${achievement.title}</strong>
							<p>${achievement.desc}</p>
						</span>
					</div>
				`;
			}).join("");

			return `
				<div class="achievement-category">
					<h4 class="achievement-category-title">${category.label} <span>${unlockedCount}/${items.length}</span></h4>
					<div class="achievement-category-grid">${cards}</div>
				</div>
			`;
		}).join("");
	}

};
