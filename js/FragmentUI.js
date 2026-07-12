window.FragmentUI = {

	activeTab: "unlock",

	tabIntros: {
		unlock: "이미 모은 사진을 또 만나면 기억 조각을 얻어요.<br>조각을 아주 많이 모으면, 아직 만나지 못한 사진을 직접 열어볼 수 있어요.",
		boost: "이미 모은 사진에 조각을 써서, 또 만난 것처럼 성장시킬 수 있어요.",
		skip: "탐색까지 남은 시간을 조각으로 즉시 건너뛸 수 있어요."
	},

	init(){
		document.getElementById("fragment-open").onclick = () => this.open();
		document.getElementById("fragment-close").onclick = () => this.close();
		document.querySelector("#fragment-modal .history-modal-bg").onclick = () => this.close();

		document.querySelectorAll(".fragment-tab").forEach(tab => {
			tab.onclick = () => this.switchTab(tab.dataset.tab);
		});
	},

	open(){
		this.render();
		document.getElementById("fragment-modal").classList.remove("hidden");
		this._refreshTimer = setInterval(() => {
			if (this.activeTab === "skip") this.renderSkipPanel();
		}, 1000);
	},

	close(){
		document.getElementById("fragment-modal").classList.add("hidden");
		if (this._refreshTimer) {
			clearInterval(this._refreshTimer);
			this._refreshTimer = null;
		}
	},

	switchTab(tab){
		this.activeTab = tab;
		document.querySelectorAll(".fragment-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
		document.getElementById("fragment-panel-unlock").classList.toggle("hidden", tab !== "unlock");
		document.getElementById("fragment-panel-boost").classList.toggle("hidden", tab !== "boost");
		document.getElementById("fragment-panel-skip").classList.toggle("hidden", tab !== "skip");
		document.getElementById("fragment-panel-intro").innerHTML = this.tabIntros[tab];
	},

	render(){
		document.getElementById("fragment-balance").textContent = `🧩 ${PlayerData.fragments}개`;
		document.getElementById("fragment-panel-intro").innerHTML = this.tabIntros[this.activeTab];
		this.renderUnlockPanel();
		this.renderBoostPanel();
		this.renderSkipPanel();
	},

	renderUnlockPanel(){
		const list = document.getElementById("fragment-panel-unlock");
		const cards = CardManager.getUnlockableCards().sort((a, b) => {
			return CardManager.getFragmentCost(a.rarity) - CardManager.getFragmentCost(b.rarity) || a.order - b.order;
		});

		if (!cards.length) {
			list.innerHTML = `<p class="history-empty">지금은 조각으로 열어볼 수 있는 사진이 없어요.<br>탐색을 계속하면 새로운 사진이 열릴 거예요.</p>`;
			return;
		}

		list.innerHTML = `<div class="fragment-list">` + cards.map(card => {
			const cost = CardManager.getFragmentCost(card.rarity);
			const canAfford = PlayerData.fragments >= cost;
			return `
				<div class="fragment-card">
					<div class="fragment-card-silhouette rarity-${card.rarity.toLowerCase()}">🔒</div>
					<div class="fragment-card-body">
						<strong>${card.rarity}</strong>
						<span>미공개 사진</span>
					</div>
					<button class="fragment-card-unlock" data-card-id="${card.id}" type="button" ${canAfford ? "" : "disabled"}>
						🧩 ${cost}개로 해금
					</button>
				</div>
			`;
		}).join("") + `</div>`;

		list.querySelectorAll(".fragment-card-unlock").forEach(button => {
			button.onclick = () => {
				const cardId = button.dataset.cardId;
				const success = Player.unlockCardWithFragments(cardId);
				if (!success) return;
				AchievementManager.checkAll();
				CardUI.renderCards(CardUI.activeChapterId);
				CardUI.renderStatus();
				this.render();
				this.close();
				UI.showCardDetail({ id: cardId, count: 1 });
			};
		});
	},

	renderBoostPanel(){
		const list = document.getElementById("fragment-panel-boost");
		const owned = PlayerData.ownedCards
			.map(owned => ({ owned, card: CardManager.getCard(owned.id) }))
			.filter(item => item.card)
			.sort((a, b) => a.owned.level - b.owned.level || a.card.order - b.card.order);

		if (!owned.length) {
			list.innerHTML = `<p class="history-empty">아직 키울 수 있는 사진이 없어요.</p>`;
			return;
		}

		list.innerHTML = `<div class="fragment-list">` + owned.map(({ owned, card }) => {
			const cost = Player.getBoostCost(card.rarity);
			const canAfford = PlayerData.fragments >= cost;
			return `
				<div class="fragment-card">
					<div class="fragment-card-silhouette rarity-${card.rarity.toLowerCase()}">
						<img class="fragment-thumb" src="./assets/images/${card.photo}" alt="" loading="lazy">
					</div>
					<div class="fragment-card-body">
						<strong>${card.title}</strong>
						<span>Lv ${owned.level} · ${card.rarity}</span>
					</div>
					<button class="fragment-card-unlock" data-card-id="${card.id}" type="button" ${canAfford ? "" : "disabled"}>
						🧩 ${cost}개로 키우기
					</button>
				</div>
			`;
		}).join("") + `</div>`;

		list.querySelectorAll(".fragment-card-unlock").forEach(button => {
			button.onclick = () => {
				const cardId = button.dataset.cardId;
				const success = Player.boostCardWithFragments(cardId);
				if (!success) return;
				AchievementManager.checkAll();
				CardUI.renderCards(CardUI.activeChapterId);
				CardUI.renderStatus();
				this.render();
			};
		});
	},

	renderSkipPanel(){
		const box = document.getElementById("fragment-panel-skip");
		const remain = DrawManager.getRemainingTime();
		const cost = GameData.fragmentSkipCost;
		const canAfford = PlayerData.fragments >= cost;

		if (remain <= 0) {
			box.innerHTML = `
				<div class="fragment-skip-box">
					<p>지금은 바로 탐색할 수 있어요.<br>대기시간이 있을 때 조각으로 건너뛸 수 있어요.</p>
					<button class="fragment-skip-button" type="button" disabled>지금은 필요 없어요</button>
				</div>
			`;
			return;
		}

		box.innerHTML = `
			<div class="fragment-skip-box">
				<p>남은 대기시간을 조각으로 즉시 건너뛸까요?</p>
				<span class="fragment-skip-timer">⏳ ${remain.toFixed(1)}초 남음</span>
				<button class="fragment-skip-button" type="button" ${canAfford ? "" : "disabled"}>
					🧩 ${cost}개로 즉시 탐색하기
				</button>
			</div>
		`;

		box.querySelector(".fragment-skip-button").onclick = () => {
			const success = Player.skipCooldownWithFragments();
			if (!success) return;
			CardUI.renderStatus();
			this.render();
		};
	}

};
