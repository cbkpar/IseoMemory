window.DrawManager = {

    canDraw(){
        const now = Date.now();
        return now - PlayerData.draw.lastDrawTime >= PlayerData.draw.cooldown * 1000;
    },

	getRemainingTime(){
		const now = Date.now();
		const elapsed = (now - PlayerData.draw.lastDrawTime) / 1000;
		const remain = PlayerData.draw.cooldown - elapsed;
		return Math.max(0, remain);
	},

    draw(){
        if(!this.canDraw()){
            console.log("아직 뽑기 불가");
            return [];
        }

        const count = 1000;//this.getDrawCount();
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
