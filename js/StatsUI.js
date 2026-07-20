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
		document.getElementById("stats-panel-settings").classList.toggle("hidden", tab !== "settings");
	},

	render(){
		this.renderSummary();
		this.renderMissions();
		this.renderAchievements();
		this.renderBadge();
		this.renderSettings();
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
	},

	// ── 데이터 백업 / 복원 / 초기화 ─────────────────────────────────────
	resetArmed: false,
	importArmed: false,

	renderSettings(){
		const panel = document.getElementById("stats-panel-settings");
		if (!panel) return;

		if (!panel.dataset.built) {
			panel.innerHTML = `
				<p class="fragment-intro">기기를 바꾸거나 브라우저 데이터가 지워져도 진행 상황을 잃지 않도록, 내보내기 코드로 백업하고 다른 기기에서 불러올 수 있어요.</p>

				<h3 class="stats-section-title">📤 내보내기</h3>
				<p class="settings-desc">아래 코드를 복사해서 메모, 카카오톡 등에 보관했다가 다른 기기에서 붙여넣으면 진행 상황이 그대로 옮겨져요.</p>
				<div class="settings-actions">
					<button id="settings-export-copy" class="capsule-submit settings-btn" type="button">📋 코드 복사하기</button>
					<button id="settings-export-file" class="capsule-submit settings-btn ghost" type="button">💾 파일로 저장</button>
				</div>
				<p id="settings-export-msg" class="settings-msg"></p>

				<h3 class="stats-section-title">📥 가져오기</h3>
				<p class="settings-desc">다른 기기에서 받은 코드를 붙여넣거나, 저장했던 백업 파일을 선택하세요. 지금 이 기기의 기록은 덮어써져요.</p>
				<textarea id="settings-import-text" class="settings-textarea" placeholder="여기에 백업 코드를 붙여넣으세요"></textarea>
				<div class="settings-actions">
					<button id="settings-import-apply" class="capsule-submit settings-btn" type="button">코드로 가져오기</button>
					<label class="capsule-submit settings-btn ghost settings-file-label">
						📂 파일 선택
						<input id="settings-import-file" type="file" accept="application/json,.json" hidden>
					</label>
				</div>
				<p id="settings-import-msg" class="settings-msg"></p>

				<h3 class="stats-section-title">⚠️ 완전 초기화</h3>
				<p class="settings-desc">모아온 사진, 조각, 편지, 성장기록 등 모든 진행 상황이 사라져요. 되돌릴 수 없으니 먼저 백업을 권장해요.</p>
				<button id="settings-hard-reset" class="settings-btn danger" type="button">🗑️ 모든 기록 초기화하기</button>
			`;
			panel.dataset.built = "1";

			document.getElementById("settings-export-copy").onclick = () => this.exportToClipboard();
			document.getElementById("settings-export-file").onclick = () => this.exportToFile();
			document.getElementById("settings-import-apply").onclick = () => this.importFromText(document.getElementById("settings-import-text").value);
			document.getElementById("settings-import-file").onchange = (e) => this.importFromFile(e.target.files[0]);
			document.getElementById("settings-hard-reset").onclick = () => this.hardReset();
		}
	},

	// Unicode-safe base64 so Korean text (편지, 메모 등) survives copy/paste intact
	encodeSave(json){
		const bytes = new TextEncoder().encode(json);
		let binary = "";
		bytes.forEach(b => binary += String.fromCharCode(b));
		return btoa(binary);
	},

	decodeSave(code){
		const binary = atob(code.trim());
		const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
		return new TextDecoder().decode(bytes);
	},

	getExportPayload(){
		const raw = localStorage.getItem(SaveManager.key);
		if (!raw) return null;
		return this.encodeSave(raw);
	},

	async exportToClipboard(){
		const msg = document.getElementById("settings-export-msg");
		const payload = this.getExportPayload();
		if (!payload) { msg.textContent = "아직 백업할 기록이 없어요."; return; }
		try {
			await navigator.clipboard.writeText(payload);
			msg.textContent = "✅ 복사했어요! 안전한 곳에 붙여넣어 보관해두세요.";
		} catch (err) {
			// clipboard API unavailable — fall back to a selectable text box
			const ta = document.getElementById("settings-import-text");
			ta.value = payload;
			ta.select();
			msg.textContent = "자동 복사에 실패했어요. 아래 입력창에 코드를 넣어뒀으니 직접 복사해주세요.";
		}
	},

	exportToFile(){
		const msg = document.getElementById("settings-export-msg");
		const payload = this.getExportPayload();
		if (!payload) { msg.textContent = "아직 백업할 기록이 없어요."; return; }
		const blob = new Blob([payload], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		a.href = url;
		a.download = `IseoMemory_backup_${date}.txt`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
		msg.textContent = "✅ 파일로 저장했어요.";
	},

	importFromFile(file){
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => this.importFromText(String(reader.result || ""));
		reader.onerror = () => {
			document.getElementById("settings-import-msg").textContent = "파일을 읽지 못했어요.";
		};
		reader.readAsText(file);
	},

	importFromText(code){
		const msg = document.getElementById("settings-import-msg");
		const btn = document.getElementById("settings-import-apply");
		if (!code || !code.trim()) { msg.textContent = "붙여넣은 코드가 없어요."; return; }

		let json;
		try {
			json = this.decodeSave(code);
		} catch (err) {
			msg.textContent = "코드를 읽지 못했어요. 복사가 정확한지 확인해주세요.";
			return;
		}

		let saveData;
		try {
			saveData = JSON.parse(json);
		} catch (err) {
			msg.textContent = "코드가 손상된 것 같아요. 다시 내보내서 시도해주세요.";
			return;
		}

		if (!saveData || !saveData.player) {
			msg.textContent = "올바른 백업 코드가 아니에요.";
			return;
		}

		if (!this.importArmed) {
			this.importArmed = true;
			msg.textContent = "⚠️ 지금 이 기기의 기록을 덮어써요. 정말이면 버튼을 한 번 더 눌러주세요.";
			if (btn) btn.textContent = "정말 덮어쓰기";
			setTimeout(() => {
				this.importArmed = false;
				if (btn) btn.textContent = "코드로 가져오기";
			}, 5000);
			return;
		}

		this.importArmed = false;
		if (btn) btn.textContent = "코드로 가져오기";
		localStorage.setItem(SaveManager.key, json);
		msg.textContent = "✅ 불러왔어요! 새로고침할게요.";
		setTimeout(() => location.reload(), 500);
	},

	hardReset(){
		const btn = document.getElementById("settings-hard-reset");
		if (!this.resetArmed) {
			this.resetArmed = true;
			btn.textContent = "정말요? 한 번 더 누르면 완전히 초기화돼요";
			setTimeout(() => {
				this.resetArmed = false;
				if (btn) btn.textContent = "🗑️ 모든 기록 초기화하기";
			}, 4000);
			return;
		}
		this.resetArmed = false;
		SaveManager.reset();
		location.reload();
	}

};
