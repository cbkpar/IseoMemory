function renderCards(chapterId) {
    const cardList = document.querySelector("#card-list");
    cardList.innerHTML = "";

    // 1. 챕터 찾기
    const chapter = GameData.chapters.find(
        chapter => chapter.id === chapterId
    );

    if (!chapter) {
        console.error("Chapter not found");
        return;
    }

    // 2. 챕터에 속한 카드만 가져오기
    const chapterCards = chapter.cards;

    // 3. 실제 카드 데이터와 연결
    const ownedCards = chapterCards
        .map(cardId =>
            GameData.cards.find(card =>
                card.id === cardId
            )
        )
        .filter(card =>
            card &&
            PlayerData.ownedCards.includes(card.id)
        );

    // 4. 카드 출력
    ownedCards.forEach(card => {
        const element = document.createElement("div");
        element.className =
            `card ${card.rarity.toLowerCase()}`;
        element.innerHTML = `
            <div class="card-frame">
                <img src="./images/${card.photo}">
                <div class="card-title">
                    ${card.title}
                </div>
                <div class="card-level">
                    ⭐
                </div>
            </div>
        `;

        cardList.appendChild(element);

    });

}