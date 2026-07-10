window.DrawDirector = {

    async play(cardElement, card, data){

        const flip = cardElement.querySelector(".draw-flip-card");

        // 뒤집기
        flip.classList.add("flip");

        await this.wait(100);

        // NEW 카드만 연출
        if(data.isNew){

            await this.playNew(cardElement, card);
			await this.openDetail(cardElement, card, data);
        }

    },

    async playNew(cardElement, card){

        switch(card.rarity){

            case "NORMAL":
                await this.playNormal(cardElement);
                break;

            case "RARE":
                await this.playRare(cardElement);
                break;

            case "EPIC":
                await this.playEpic(cardElement);
                break;

            case "LEGEND":
                await this.playLegend(cardElement);
                break;

            case "SECRET":
                await this.playSecret(cardElement);
                break;

        }

    },

	async playNormal(card){

		const target = card.querySelector(".draw-card-frame");

		target.classList.add("draw-new-normal");

		await this.wait(600);

		target.classList.remove("draw-new-normal");

	},


	async playRare(card){

		const target = card.querySelector(".draw-card-frame");

		target.classList.add("draw-new-rare");

		await this.wait(900);

		target.classList.remove("draw-new-rare");

	},


	async playEpic(card){

		const target = card.querySelector(".draw-card-frame");

		target.classList.add("draw-new-epic");

		await this.wait(1200);

		target.classList.remove("draw-new-epic");

	},


	async playLegend(card){

		const target = card.querySelector(".draw-card-frame");

		target.classList.add("draw-new-legend");

		await this.wait(1800);

		target.classList.remove("draw-new-legend");

	},


	async playSecret(card){

		const target = card.querySelector(".draw-card-frame");

		target.classList.add("draw-new-secret");

		await this.wait(2500);

		target.classList.remove("draw-new-secret");

	},

    wait(ms){

        return new Promise(resolve=>setTimeout(resolve,ms));

    },
	
	openDetail(cardElement, card, data){

		return new Promise(resolve=>{

			UI.showCardDetail(data);

			const modal =
				document.getElementById("detail-modal");


			const observer = new MutationObserver(()=>{

				if(modal.classList.contains("hidden")){

					observer.disconnect();

					resolve();

				}

			});


			observer.observe(modal,{
				attributes:true,
				attributeFilter:["class"]
			});

		});

	}

};