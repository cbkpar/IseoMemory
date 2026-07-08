window.CardManager = {

	SkillText: {
		DRAW_COUNT(value){return `기억 발견 횟수 +${value}`;},
		POINT_GAIN(value){return `복원 점수 +${value}`;},
		DRAW_COOLDOWN(value){return `탐색 대기시간 -${value/1000}초`;},
		UNLOCK_CHAPTER(value){return `새로운 챕터 해금`;}
	},

    getCard(cardId) {

        return GameData.cards.find(
            card => card.id === cardId
        );

    },


    getOwnedCard(cardId) {

        return PlayerData.ownedCards.find(
            card => card.id === cardId
        );

    },
	
	isOwned(cardId) {
		return this.getOwnedCard(cardId) !== undefined;
	},
	
	getChapterCards(chapterId) {
		const chapter =
			GameData.chapters.find(
				chapter =>
				chapter.id === chapterId
			);

		if(!chapter){
			return [];
		}

		return chapter.cards.map(cardId => this.getCard(cardId))
							.filter(card => card !== undefined);
	},
	
	getOwnedChapterCards(chapterId){
		return this
			.getChapterCards(chapterId)
			.filter(card =>	this.isOwned(card.id))
		    .filter(card => this.isOwned(card.id)
        );
	},
	
	levelUp(cardId) {
		const ownedCard =
			this.getOwnedCard(cardId);

		const card =
			this.getCard(cardId);

		if(!ownedCard || !card){ return false;}

		if(ownedCard.level >= card.maxLevel){

			console.log("최대 레벨입니다.");
			return false;
		}

		ownedCard.level++;

		console.log(
			`${cardId} Lv.${ownedCard.level}`
		);

		return true;
	},
	
	isChapterComplete(chapterId){
		const chapterCards = this.getChapterCards(chapterId);
		return chapterCards.every(card => this.isOwned(card.id));
	},
	
	getAvailableCards(){
		return GameData.cards.filter(card=>{
        if(!PlayerData.unlockedChapters.includes(card.chapterId)) return false;
        return card.requires.every(req=>Player.hasCard(req));
		});
	},
	
	getSkillValue(card, owned){
		const level = owned?.level ?? 1;
		return card.skillValue + (level - 1);
	}
	

	
	

};