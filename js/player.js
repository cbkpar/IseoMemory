window.Player = {
    addCard(cardId, amount=1) {
        const ownedCard = PlayerData.ownedCards.find( card => card.id === cardId );

        // 이미 보유한 카드
        if (ownedCard) {
            ownedCard.count += amount;
            ownedCard.resonance += amount;
			this.levelUpCard(ownedCard);
            return false;
        }

        // 신규 카드
        PlayerData.ownedCards.push({
            id: cardId,
            level: 1,
			count: amount,
            resonance: amount-1
        });
		this.levelUpCard(ownedCard);
        return true;
    },
	
	checkChapterUnlock(){
		GameData.chapters.forEach(chapter=>{
			if(CardManager.isChapterComplete(chapter.id))
			{				
	            const index = GameData.chapters.indexOf(chapter);
				const next = GameData.chapters[index+1];
				if( next && !PlayerData.unlockedChapters.includes(next.id))
				{
					PlayerData.unlockedChapters.push(next.id);
				}
			}
		});
	},
	
	hasCard(id){
		return PlayerData.ownedCards.some(card => card.id === id);
	},
	
	getRequiredExp(level){
		return level * level * 10;
	},
	
	levelUpCard(cardData){
		let required = this.getRequiredExp(cardData.level);

		while(cardData.resonance >= required){
			cardData.resonance -= required;
			cardData.level++;
			required = this.getRequiredExp(cardData.level);
		}
	}
	
};

window.PlayerData = {

    ownedCards: [],

    unlockedChapters:[
        "CH-000"
    ],

    draw: {
        cooldown: 3,
        lastDrawTime:0,
		baseCount:1,
    }

};