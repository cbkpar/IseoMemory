window.CardUI = {

    activeChapterId: "CH-000",

    filters: {
        search: "",
        sort: "order" // order | rarity | latest | favorite
    },

    rarityOrder: { SECRET:0, LEGEND:1, EPIC:2, RARE:3, NORMAL:4 },

    treeStages: [
        { min: 0,  emoji: "🌱", label: "새싹" },
        { min: 20, emoji: "🌿", label: "어린 나무" },
        { min: 40, emoji: "🌸", label: "꽃이 핀 나무" },
        { min: 60, emoji: "🍎", label: "열매 맺은 나무" },
        { min: 80, emoji: "🌳", label: "우리의 거대한 나무" }
    ],

    init() {
		HistoryUI.init();
		StatsUI.init();
		FragmentUI.init();
        this.renderStatus();
        this.renderChapterTabs();
		this.renderDailyQuote();
		this.renderMissionDot();
		this.renderMemoryTree();
		this.initToolbar();
		this.initChest();
		AchievementManager.checkAll();
    },

	// 레벨이 오를수록 사진이 또렷하게 "현상"되는 느낌을 주는 필터
	getDevelopFilter(level){
		const step = Math.max(0, 7 - Math.min(level, 7)); // 0(선명) ~ 6(흐릿)
		const blur = step * 0.6;
		const gray = step * 11;
		const bright = 100 - step * 3;
		return `blur(${blur}px) grayscale(${gray}%) brightness(${bright}%)`;
	},

	initChest(){
		const button = document.getElementById("memory-chest");
		if (!button) return;
		button.onclick = () => {
			const reward = Player.collectChest();
			if (!reward) return;
			Player.ensureDailyMissions();
			PlayerData.dailyMissions.chestOpened = true;
			SaveManager.save();
			this.renderChest();
			this.renderStatus();
			AchievementManager.checkAll();
			this.showWelcomeBackToast({ fragments: reward, hours: null, chest: true });
		};
		this.renderChest();
		setInterval(() => this.renderChest(), 30000);
	},

	renderChest(){
		const button = document.getElementById("memory-chest");
		const label = document.getElementById("memory-chest-label");
		const fill = document.getElementById("memory-chest-fill");
		if (!button) return;

		const progress = Player.getChestProgress();
		fill.style.width = progress.percent + "%";
		button.classList.toggle("ready", progress.ready);

		if (progress.ready) {
			label.textContent = "🎁 기억 상자가 가득 찼어요! 눌러서 열기";
		} else {
			const remainHours = Math.max(0, Player.CHEST_FILL_HOURS - (Player.CHEST_FILL_HOURS * progress.percent / 100));
			const remainText = remainHours >= 1 ? `약 ${Math.ceil(remainHours)}시간 후` : "곧";
			label.textContent = `기억 상자 채우는 중 · ${remainText} 열 수 있어요`;
		}
	},

	showWelcomeBackToast(data){
		const toast = document.createElement("div");
		toast.className = "welcome-back-toast";
		const title = data.chest ? "기억 상자 열기" : "다녀오셨어요";
		const desc = data.chest
			? `🧩 기억 조각 +${data.fragments}개를 얻었어요`
			: `${data.hours}시간 만이에요 · 🧩 기억 조각 +${data.fragments}개`;
		toast.innerHTML = `
			<span class="welcome-back-toast-icon">${data.chest ? "🎁" : "⏰"}</span>
			<span><strong>${title}</strong><p>${desc}</p></span>
		`;
		document.body.appendChild(toast);
		requestAnimationFrame(() => toast.classList.add("show"));
		setTimeout(() => {
			toast.classList.remove("show");
			setTimeout(() => toast.remove(), 400);
		}, 3600);
	},

	renderMissionDot(){
		const button = document.getElementById("stats-open");
		if (!button) return;
		Player.ensureDailyMissions();
		const claimable = MissionManager.getClaimableCount();
		button.classList.toggle("has-dot", claimable > 0);
	},

	renderDailyQuote(){
		const el = document.getElementById("daily-quote");
		if (!el) return;

		// 가장 최근에 열린 챕터의 문구 묶음을 사용해요 (임신 중 문구가 출산 후에도 뜨지 않도록)
		let pool = [];
		for (let i = GameData.chapters.length - 1; i >= 0; i--) {
			const chapter = GameData.chapters[i];
			if (!PlayerData.unlockedChapters.includes(chapter.id)) continue;
			pool = GameData.quotesByChapter[chapter.id];
			if (pool && pool.length) break;
		}
		if (!pool || !pool.length) return;

		const dayIndex = Math.floor(Date.now() / 86400000);
		el.textContent = pool[dayIndex % pool.length];
	},

	renderMemoryTree(){
		const el = document.getElementById("memory-tree");
		const visual = document.getElementById("memory-tree-visual");
		const caption = document.getElementById("memory-tree-caption");
		if (!visual || !caption) return;

		if (el && !el.dataset.bound) {
			el.dataset.bound = "1";
			el.onclick = () => StatsUI.open();
		}

		const total = GameData.cards.length;
		const owned = PlayerData.ownedCards.length;
		const percent = total ? Math.floor((owned / total) * 100) : 0;

		let stage = this.treeStages[0];
		this.treeStages.forEach(item => { if (percent >= item.min) stage = item; });

		visual.textContent = stage.emoji;
		visual.className = "memory-tree-visual stage-" + this.treeStages.indexOf(stage);
		caption.textContent = percent >= 100
			? `🎉 우리의 이야기가 모두 채워졌어요 (${owned}/${total})`
			: `${stage.label} · 사진 ${owned}/${total} (${percent}%)`;
	},

	initToolbar(){
		const search = document.getElementById("album-search");
		if (search) {
			let debounce;
			search.addEventListener("input", () => {
				clearTimeout(debounce);
				debounce = setTimeout(() => {
					this.filters.search = search.value.trim();
					if (this.filters.search && !PlayerData.usedAlbumSearch) {
						PlayerData.usedAlbumSearch = true;
						AchievementManager.checkAll();
					}
					this.renderCards(this.activeChapterId);
				}, 120);
			});
		}

		document.querySelectorAll(".album-sort-chip").forEach(chip => {
			chip.addEventListener("click", () => {
				this.filters.sort = chip.dataset.sort;
				if (chip.dataset.sort !== "order" && !PlayerData.usedAlbumSort) {
					PlayerData.usedAlbumSort = true;
					AchievementManager.checkAll();
				}
				document.querySelectorAll(".album-sort-chip").forEach(c => c.classList.toggle("active", c === chip));
				this.renderCards(this.activeChapterId);
			});
		});
	},

	applyFilters(cards){
		let result = cards;

		if (this.filters.search) {
			const query = this.filters.search.toLowerCase();
			result = result.filter(card =>
				card.title.toLowerCase().includes(query) ||
				card.description.toLowerCase().includes(query)
			);
		}

		result = result.slice();
		switch (this.filters.sort) {
			case "rarity":
				result.sort((a, b) => this.rarityOrder[a.rarity] - this.rarityOrder[b.rarity] || a.order - b.order);
				break;
			case "latest":
				result.sort((a, b) => b.date.localeCompare(a.date) || b.order - a.order);
				break;
			case "favorite":
				result.sort((a, b) => {
					const favA = PlayerData.favoriteCards.includes(a.id) ? 0 : 1;
					const favB = PlayerData.favoriteCards.includes(b.id) ? 0 : 1;
					return favA - favB || a.order - b.order;
				});
				break;
			default:
				result.sort((a, b) => a.order - b.order);
		}

		return result;
	},

    renderCards(chapterId) {
		this.activeChapterId = chapterId;
        const cardList = document.querySelector("#card-list");
        cardList.innerHTML = "";
        const cards = this.applyFilters(CardManager.getOwnedChapterCards(chapterId));

        this.renderProgress(chapterId);
		this.renderChapterTabs();
        this.renderStatus();
		this.renderMemoryTree();
		this.renderDailyQuote();
		this.renderMissionDot();

        if (cards.length === 0) {
            cardList.innerHTML = this.filters.search
				? `<p class="empty-album">검색 결과가 없어요.<br>다른 검색어로 찾아보세요.</p>`
				: `<p class="empty-album">아직 이 사진첩에 붙인 사진이 없어요.<br>다음 기억을 기다리고 있어요.</p>`;
            return;
        }

        cards.forEach(card => {
            const owned =
                CardManager.getOwnedCard(
                    card.id
                );

            const element = document.createElement("div");
			const favorite = PlayerData.favoriteCards.includes(card.id);
            element.className = `card ${card.rarity.toLowerCase()}${favorite ? " favorite" : ""}`;
			element.onclick = () => { UI.showCardDetail({id: card.id, count: owned.count}); };

			const Star = Math.min(7,owned.level);
			const stars = "💗".repeat(Star) + "🤍".repeat(7-Star);
            element.innerHTML = `
                <div class="card-frame">
                    <img src="./assets/images/${card.photo}" style="filter:${this.getDevelopFilter(owned.level)}">
					${favorite ? '<span class="favorite-mark">★</span>' : ''}
                    <div> ${stars} </div>
                </div>
            `;

            cardList.appendChild(element);


        });

    },

    renderProgress(chapterId) {
        const el = document.getElementById("album-progress");
        if (!el) return;

        const total = CardManager.getChapterCards(chapterId);
        const owned = CardManager.getOwnedChapterCards(chapterId);
        const percent = total.length === 0 ? 0 : Math.floor((owned.length / total.length) * 100);

        const chapter = GameData.chapters.find(item => item.id === chapterId);
        el.textContent = `${chapter.title} · ${owned.length} / ${total.length}장 (${percent}%)`;
    },

    renderStatus() {
        const el = document.getElementById("player-status");
        if (!el) return;
        const cooldown = DrawManager.getCooldown();
        const points = PlayerData.features.points ? `${PlayerData.points} P` : "잠김";
		const canSkip = PlayerData.features.points && PlayerData.points >= 100 && DrawManager.getRemainingTime() > 0;
        el.innerHTML = `
            <div><span>기억 포인트</span><strong>${points}</strong></div>
            <div><span>발견한 사진</span><strong>${PlayerData.ownedCards.length}장</strong></div>
			<div><span>탐색 간격</span><strong>${cooldown}초</strong></div>
			<div><span>좋아하는 사진</span><strong>${PlayerData.favoriteCards.length}장</strong></div>
			<div><span>연속 방문</span><strong>🔥 ${PlayerData.streak.count}일</strong></div>
			<div><span>기억 조각</span><strong>🧩 ${PlayerData.fragments}개</strong></div>
			${PlayerData.features.points ? `<button id="point-skip" class="point-skip" ${canSkip ? "" : "disabled"}>100 P로 바로 사진 보기</button>` : ""}
        `;
		const pointSkip = document.getElementById("point-skip");
		if (pointSkip) pointSkip.onclick = () => DrawUI.skipCooldownWithPoints();
    },

    renderChapterTabs() {
        const el = document.getElementById("chapter-tabs");
        if (!el) return;
        el.innerHTML = "";
        GameData.chapters.forEach(chapter => {
            const unlocked = PlayerData.unlockedChapters.includes(chapter.id);
            const button = document.createElement("button");
            button.className = `chapter-tab${chapter.id === this.activeChapterId ? " active" : ""}`;
            button.disabled = !unlocked;
            button.textContent = unlocked ? chapter.title : "🔒 새로운 사진첩";
            if (unlocked) button.onclick = () => this.renderCards(chapter.id);
            el.appendChild(button);
        });
    }

};
