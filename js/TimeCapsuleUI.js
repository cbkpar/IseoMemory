window.TimeCapsuleUI = {

	init(){
		document.getElementById("capsule-open").onclick = () => this.open();
		document.getElementById("capsule-close").onclick = () => this.close();
		document.querySelector("#capsule-modal .history-modal-bg").onclick = () => this.close();

		const milestoneSelect = document.getElementById("capsule-milestone");
		const customDateRow = document.getElementById("capsule-custom-date-row");
		milestoneSelect.onchange = () => {
			customDateRow.classList.toggle("hidden", milestoneSelect.value !== "custom");
		};

		document.getElementById("capsule-submit").onclick = () => this.submitLetter();
	},

	open(){
		this.renderMilestoneOptions();
		this.renderNextMilestone();
		this.renderLetterList();
		document.getElementById("capsule-modal").classList.remove("hidden");
	},

	close(){
		document.getElementById("capsule-modal").classList.add("hidden");
	},

	getMilestonePresets(){
		const birth = new Date(2025, 11, 27).getTime();
		return [
			{ label:"100일", at: birth + 100 * 86400000 },
			{ label:"첫 돌", at: new Date(2026, 11, 27).getTime() },
			{ label:"두 번째 생일", at: new Date(2027, 11, 27).getTime() },
			{ label:"다섯 번째 생일", at: new Date(2030, 11, 27).getTime() },
			{ label:"초등학교 입학", at: new Date(2032, 2, 2).getTime() },
			{ label:"열 번째 생일", at: new Date(2035, 11, 27).getTime() },
			{ label:"성인이 되는 날", at: new Date(2044, 11, 27).getTime() }
		];
	},

	renderMilestoneOptions(){
		const select = document.getElementById("capsule-milestone");
		if (select.dataset.built) return;
		select.dataset.built = "1";
		const options = this.getMilestonePresets().map(m =>
			`<option value="${m.at}">${m.label} (${new Date(m.at).toLocaleDateString("ko-KR")})</option>`
		).join("");
		select.innerHTML = options + `<option value="custom">직접 날짜 선택하기</option>`;
	},

	renderNextMilestone(){
		const el = document.getElementById("capsule-next-milestone");
		const next = Player.getNextMilestone();
		const days = Math.max(0, Math.ceil((next.at - Date.now()) / 86400000));
		el.innerHTML = `<span>다음 순간까지</span><strong>${next.label} · D-${days}</strong>`;
	},

	submitLetter(){
		const title = document.getElementById("capsule-title").value;
		const body = document.getElementById("capsule-body").value;
		const select = document.getElementById("capsule-milestone");
		let unlockAt;

		if (select.value === "custom") {
			const dateInput = document.getElementById("capsule-custom-date").value;
			if (!dateInput) { alert("열어볼 날짜를 선택해주세요."); return; }
			unlockAt = new Date(dateInput + "T00:00:00").getTime();
		} else {
			unlockAt = Number(select.value);
		}

		if (!body.trim()) { alert("편지 내용을 적어주세요."); return; }
		if (unlockAt <= Date.now()) { alert("미래의 날짜를 선택해주세요."); return; }

		Player.writeLetter(title, body, unlockAt);
		AchievementManager.checkAll();

		document.getElementById("capsule-title").value = "";
		document.getElementById("capsule-body").value = "";
		document.getElementById("capsule-custom-date").value = "";

		this.renderLetterList();
	},

	renderLetterList(){
		const list = document.getElementById("capsule-list");
		const letters = [...PlayerData.letters].sort((a, b) => a.unlockAt - b.unlockAt);

		if (!letters.length) {
			list.innerHTML = `<p class="history-empty">아직 남긴 편지가 없어요.<br>미래의 이서에게 첫 편지를 남겨보세요.</p>`;
			return;
		}

		list.innerHTML = letters.map(letter => {
			const locked = Date.now() < letter.unlockAt;
			const days = Math.ceil((letter.unlockAt - Date.now()) / 86400000);
			const dateLabel = new Date(letter.unlockAt).toLocaleDateString("ko-KR");

			if (locked) {
				return `
					<div class="capsule-letter locked">
						<span class="capsule-letter-icon">🔒</span>
						<span class="capsule-letter-body">
							<strong>${this.escapeHtml(letter.title)}</strong>
							<span>${dateLabel}에 열어볼 수 있어요 · D-${days}</span>
						</span>
					</div>
				`;
			}

			if (!letter.opened) {
				return `
					<button class="capsule-letter ready" data-letter-id="${letter.id}" type="button">
						<span class="capsule-letter-icon">💌</span>
						<span class="capsule-letter-body">
							<strong>${this.escapeHtml(letter.title)}</strong>
							<span>지금 열어볼 수 있어요! 눌러서 읽기</span>
						</span>
					</button>
				`;
			}

			return `
				<div class="capsule-letter opened">
					<span class="capsule-letter-icon">📖</span>
					<span class="capsule-letter-body">
						<strong>${this.escapeHtml(letter.title)}</strong>
						<p>${this.escapeHtml(letter.body)}</p>
					</span>
				</div>
			`;
		}).join("");

		list.querySelectorAll(".capsule-letter.ready").forEach(button => {
			button.onclick = () => {
				const success = Player.openLetter(button.dataset.letterId);
				if (!success) return;
				AchievementManager.checkAll();
				this.renderLetterList();
			};
		});
	},

	escapeHtml(text){
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

};
