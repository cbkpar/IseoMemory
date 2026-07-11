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
		document.getElementById("stats-panel-achievements").classList.toggle("hidden", tab !== "achievements");
	},

	render(){
		this.renderSummary();
		this.renderAchievements();
		this.renderBadge();
	},

	renderBadge(){
		const badge = document.getElementById("achievement-count-badge");
		if (!badge) return;
		badge.textContent = `${PlayerData.unlockedAchievements.length}/${Achievements.list.length}`;
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
			<div class="dday-card">
				<span>우리 이야기가 시작된 지</span>
				<strong>D+${dDay}</strong>
				<em>${startDate ? startDate + "부터 함께" : ""}</em>
			</div>

			<div class="stats-grid">
				<div><span>모은 사진</span><strong>${totalOwned} / ${totalCards}</strong></div>
				<div><span>총 탐색</span><strong>${PlayerData.totalDraws}회</strong></div>
				<div><span>연속 방문</span><strong>${PlayerData.streak.count}일</strong></div>
				<div><span>즐겨찾기</span><strong>${PlayerData.favoriteCards.length}장</strong></div>
				<div><span>남긴 메모</span><strong>${Object.keys(PlayerData.memoryNotes).length}개</strong></div>
				<div><span>최고 연속 방문</span><strong>${PlayerData.streak.best}일</strong></div>
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
		panel.innerHTML = Achievements.list.map(achievement => {
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
	}

};
