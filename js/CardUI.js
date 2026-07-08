window.CardUI = {

    renderCards(chapterId) {
        const cardList = document.querySelector("#card-list");
        cardList.innerHTML = "";
        const cards = CardManager.getOwnedChapterCards(chapterId);

        cards.forEach(card => {
            const owned =
                CardManager.getOwnedCard(
                    card.id
                );

            const element = document.createElement("div");
            element.className = `card ${card.rarity.toLowerCase()}`;
			element.onclick = () => { UI.showCardDetail(card);};

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

    }

};
 