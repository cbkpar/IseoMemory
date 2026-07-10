window.UI = {
    showMemory(memory) {
        if (!memory) {
            return;
        }

        const album = document.getElementById("album");
		album.innerHTML = `
		<div class="memory-album">

			<div class="memory-header">
				ISEO MEMORY
			</div>

			<div class="memory-chapter">
				${memory.chapterId}
			</div>

			<div class="memory-title">
				${memory.title}
			</div>

			<div class="memory-date">
				📅 ${memory.date}
			</div>

			<div class="memory-description">
				${memory.description}
			</div>

			<div class="memory-log">
				AI LOG<br>
				${memory.aiLog}
			</div>

		</div>
		`;
    },
	
	showCardDetail(data){
		const card = CardManager.getCard(data.id);
		const content = document.querySelector(".detail-content");
		content.className = "detail-content " + card.rarity.toLowerCase();
		
		const modal = document.getElementById("detail-modal");

		modal.onclick = (e)=>{
			if(e.target.classList.contains("detail-modal-bg")){
				modal.classList.add("hidden");
			}
		};
		modal.classList.remove("hidden");

		const playerCard = PlayerData.ownedCards.find(c => c.id === data.id);
		const level = playerCard.level ?? 1;
		const exp = playerCard.resonance ?? 0;
		const maxExp = level * level * 10;

		document.getElementById("detail-image").src = "./assets/images/" + card.photo;
		document.getElementById("detail-title").textContent = card.title;
		document.getElementById("detail-date").textContent = "📅 " + card.date;
		document.getElementById("detail-desc").textContent = card.description;
		document.getElementById("detail-stars").textContent = "💗".repeat(Math.min(level,7));
		document.getElementById("detail-level").textContent = `LV ${level} (${exp} / ${maxExp})`;
		
		const skillValue = CardManager.getSkillValue(card, playerCard);
		const skillText = CardManager.SkillText[card.skill] ? CardManager.SkillText[card.skill](skillValue): card.skill;
		document.getElementById("detail-effect").textContent =`✨ ${skillText}`;
	}

};

window.DrawUI = {
	
    results:[],
    page:0,
    pageSize:10,
    pages:[],
	
	wait(ms){
		return new Promise(resolve=>{
			setTimeout(resolve,ms);
		});
	},
	
    init() {
        //this.pageSize = window.matchMedia("(max-width: 640px)").matches ? 4 : 10;
        const button = document.getElementById("draw-button");
        button.onclick = () => {
            const result = DrawManager.draw();
			
			if(result.length > 0){
				const fill = document.getElementById("draw-progress-fill");
				fill.style.transition = "none";
				fill.style.width = "0%";
				void fill.offsetWidth;
				fill.style.transition = `${PlayerData.draw.cooldown}s linear`;
				fill.style.width = "100%";
			}
			
            this.showResult(result);
            CardUI.renderCards("CH-000");
        };
		
		// Continue 버튼
		document.getElementById("draw-close").onclick = () => {
			this.page++;
			if(this.page >= this.pages.length){
				document.getElementById("draw-modal").classList.add("hidden");
				return;
			}
			this.showPage();
		};
		
		
		// 타이머 시작
        this.updateTimer();
        setInterval(() => { this.updateTimer(); }, 50);
    },

    updateTimer() {
		const button = document.getElementById("draw-button");
		const timer = document.getElementById("draw-timer");
		const count = document.getElementById("draw-count");
		const fill = document.getElementById("draw-progress-fill");
		const cooldown = PlayerData.draw.cooldown;
		const remain = DrawManager.getRemainingTime();
		count.textContent =`💗 ×${DrawManager.getDrawCount()}`;

		if(remain <= 0){
			timer.textContent = "READY";
			button.disabled = false;
			button.classList.add("ready");
		}
		else
		{
			timer.textContent =	this.formatTime(remain);
			button.disabled = true;
		    button.classList.remove("ready");
		}
    },
	
	formatTime(sec){
		sec = Math.ceil(sec);
		const m = Math.floor(sec/60);
		const s = sec%60;
		return String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
	},
	
	showResult(results){
		this.results=results;
		this.page=0;
		this.pages=[];
		for(let i=0;i<results.length;i+=this.pageSize){
			this.pages.push(results.slice(i,i+this.pageSize));
		}
		this.showPage();
	},
	
	async showPage(){
		const modal = document.getElementById("draw-modal");
		const grid = document.getElementById("draw-grid");
		const btn = document.getElementById("draw-close");

		if(this.page == this.pages.length-1){
			btn.classList.add("complete");
			btn.textContent = "확인";
		}else{
			btn.textContent = `다음 ${this.page+1}/${this.pages.length}`;
		}

		modal.classList.remove("hidden");
		modal.style.display = "flex";
		grid.innerHTML = "";
		btn.disabled = true;
		const cards = this.pages[this.page];
		
		cards.forEach((data,index)=>{
			const card = CardManager.getCard(data.id);
			const element = this.createCard(card,data);
			element.style.animationDelay = `${index*180}ms`;
			grid.appendChild(element);
		});
		
		for(let index=0; index<cards.length; index++){
			const data = cards[index];
			const element = grid.children[index];
			const card = CardManager.getCard(data.id);
			await this.wait( index === 0 ? 500 : 180);
			await DrawDirector.play(element, card, data);
		}
		
		btn.disabled = false;
	},
	
	createCard(card,data){
		const rarity = card.rarity.toLowerCase();
		const div=document.createElement("div");
		div.className=`draw-card rarity-${rarity}`;
		div.innerHTML=`
			<div class="draw-flip-card rarity-${rarity}">
				<div class="card-face card-back">
					<div class="memory-logo">
						MEMORY
					</div>
				</div>
				<div class="card-face card-front">
					<div class="draw-rarity-glow"></div>
					<div class="draw-card-frame">
						<img class="draw-card-photo" src="./assets/images/${card.photo}" draggable="false">
						<div class="draw-rarity-border"></div>
						<div class="draw-particle-layer"></div>
						${data.isNew?'<div class="draw-card-new">NEW</div>':''}
					</div>
				</div>
			</div>
			<div class="draw-card-count">${data.count > 1 ?`💗 ×${data.count}`:""}</div>
		`;
		const particleLayer = div.querySelector(".draw-particle-layer");
		createParticles(particleLayer, rarity);
		return div;
	}
};

function createParticles(layer, rarity){
	const count = {
		common:0,
		rare:1,
		epic:3,
		legend:10,
		secret:15
	}[rarity];


	for(let i=0;i<count;i++){

		const p=document.createElement("span");

		p.className="draw-particle";

		p.style.left=Math.random()*100+"%";
		p.style.top=Math.random()*100+"%";

		p.style.animationDelay= Math.random()*2+"s";

		layer.appendChild(p);
	}
}


