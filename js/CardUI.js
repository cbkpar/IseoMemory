window.CardUI = {

    activeChapterId: "CH-000",

    init() {
		HistoryUI.init();
        this.renderStatus();
        this.renderChapterTabs();
    },

    renderCards(chapterId) {
		this.activeChapterId = chapterId;
        const cardList = document.querySelector("#card-list");
        cardList.innerHTML = "";
        const cards = CardManager.getOwnedChapterCards(chapterId);

        this.renderProgress(chapterId);
		this.renderChapterTabs();
        this.renderStatus();

        if (cards.length === 0) {
            cardList.innerHTML = `<p class="empty-album">아직 이 사진첩에 붙인 사진이 없어요.<br>다음 기억을 기다리고 있어요.</p>`;
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
                    <img src="./assets/images/${card.photo}">
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
 
