window.DrawManager = {

    canDraw(){
        const now = Date.now();
        return now - PlayerData.draw.lastDrawTime >= this.getCooldown() * 1000;
    },

	getRemainingTime(){
		const now = Date.now();
		const elapsed = (now - PlayerData.draw.lastDrawTime) / 1000;
        const remain = this.getCooldown() - elapsed;
        return Math.max(0, remain);
	},

    getCooldown(){
        const base = PlayerData.draw.baseCooldown ?? 3;
        const reduction = PlayerData.ownedCards.reduce((total, owned) => {
            const card = CardManager.getCard(owned.id);
            return card?.skill === "DRAW_COOLDOWN"
                ? total + (CardManager.getSkillValue(card, owned) / 1000)
                : total;
        }, 0);
        return Math.max(.5, Number((base - reduction).toFixed(3)));
    },

    draw(){
        if(!this.canDraw()){
            console.log("아직 뽑기 불가");
            return [];
        }

		PlayerData.lastUnlockedChapter = null;
        const count = this.getDrawCount();
		const result = {};

        for(let i=0;i<count;i++){
            const card = this.randomCard();
		    if(result[card.id]){
				result[card.id]++;
			}
			else
			{
				result[card.id]=1;
			}
        }
		
		const displayResult = [];
		
		Object.entries(result).forEach(([cardId, amount])=>
			{
				const isNew = Player.addCard(cardId, amount);
			    displayResult.push({id:cardId, count:amount, isNew:isNew});
			}
		);
		

		Player.checkChapterUnlock();
        const points = this.grantPoints(displayResult);
		PlayerData.lastPointGain = points;
        PlayerData.totalDraws += count;
		PlayerData.draw.lastDrawTime = Date.now();
		SaveManager.save();
		
        return displayResult;

    },
	
	getDrawCount(){
		let count = PlayerData.draw.baseCount;

		PlayerData.ownedCards.forEach(
			owned=>{
			const card = CardManager.getCard( owned.id );
			if(!card) return;
			if(card.skill==="DRAW_COUNT"){ count += CardManager.getSkillValue(card,owned); }
		});

		return count;
	},

    grantPoints(result){
        if (!PlayerData.features.points) return 0;

        const bonus = PlayerData.ownedCards.reduce((total, owned) => {
            const card = CardManager.getCard(owned.id);
            return card?.skill === "POINT_GAIN"
                ? total + CardManager.getSkillValue(card, owned)
                : total;
        }, 0);
        const gained = (result.reduce((total, item) => total + item.count, 0) * 10) + bonus;
        PlayerData.points += gained;
        return gained;
    },

	randomCard(){
		const cards = CardManager.getAvailableCards();

		const total = cards.reduce((sum, card) => sum + card.drawWeight,0 );
		let random = Math.random()*total;

		for(const card of cards){
			random -= card.drawWeight;
			if(random <= 0){ return card; }
		}
	}

};
