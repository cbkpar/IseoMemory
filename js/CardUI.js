window.CardUI = {

    renderCards(chapterId) {
        const cardList = document.querySelector("#card-list");
        cardList.innerHTML = "";
        const cards = CardManager.getOwnedChapterCards(chapterId);

        this.renderProgress(chapterId);

        cards.forEach(card => {
            const owned =
                CardManager.getOwnedCard(
                    card.id
                );

            const element = document.createElement("div");
            element.className = `card ${card.rarity.toLowerCase()}`;
			element.onclick = () => { UI.showCardDetail({id: card.id, count: owned.count}); };

			const Star = Math.min(7,owned.level);
			const stars = "💗".repeat(Star) + "🤍".repeat(7-Star);
            element.innerHTML = `
                <div class="card-frame">
                    <img src="./assets/images/${card.photo}">
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

        el.textContent = `${owned.length} / ${total.length} 수집됨 (${percent}%)`;
    }

};
 