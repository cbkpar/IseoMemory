window.UI = {
  	wait(ms){
  		return new Promise(resolve=>{
  			setTimeout(resolve,ms);
  		});
  	},
    
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
		document.getElementById("note-save").textContent = "메모 저장하기";

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

		const favoriteButton = document.getElementById("favorite-button");
		const isFavorite = PlayerData.favoriteCards.includes(card.id);
		favoriteButton.textContent = isFavorite ? "★ 좋아하는 사진에서 빼기" : "☆ 좋아하는 사진으로 담기";
		favoriteButton.onclick = () => {
			const index = PlayerData.favoriteCards.indexOf(card.id);
			if (index === -1) PlayerData.favoriteCards.push(card.id);
			else PlayerData.favoriteCards.splice(index, 1);
			SaveManager.save();
			this.showCardDetail(data);
			CardUI.renderCards(CardUI.activeChapterId);
		};

		const note = document.getElementById("detail-note");
		note.value = PlayerData.memoryNotes[card.id] || "";
		document.getElementById("note-save").onclick = async () => {
			const text = note.value.trim();
			if (text) PlayerData.memoryNotes[card.id] = text;
			else delete PlayerData.memoryNotes[card.id];
			SaveManager.save();
			document.getElementById("note-save").textContent = "저장했어요 ✓";
      await new Promise(resolve => setTimeout(resolve, 500));
      modal.classList.add("hidden");
		};
	}

};

window.HistoryUI = {

	filters: {
		search: "",
		chapterId: "all",
		favoriteOnly: false,
		sortDesc: true // true = 최신순 (기본값)
	},

	init(){
		document.getElementById("history-open").onclick = () => this.open();
		document.getElementById("history-close").onclick = () => this.close();
		document.querySelector(".history-modal-bg").onclick = () => this.close();
		document.getElementById("history-random").onclick = () => this.openRandomCard();

		const search = document.getElementById("history-search");
		let searchDebounce;
		search.addEventListener("input", () => {
			clearTimeout(searchDebounce);
			searchDebounce = setTimeout(() => {
				this.filters.search = search.value.trim();
				this.renderList();
			}, 120);
		});

		const favoriteToggle = document.getElementById("history-favorite-toggle");
		favoriteToggle.onclick = () => {
			this.filters.favoriteOnly = !this.filters.favoriteOnly;
			favoriteToggle.classList.toggle("active", this.filters.favoriteOnly);
			this.renderList();
		};

		const sortToggle = document.getElementById("history-sort-toggle");
		sortToggle.onclick = () => {
			this.filters.sortDesc = !this.filters.sortDesc;
			sortToggle.textContent = this.filters.sortDesc ? "최신순" : "오래된순";
			this.renderList();
		};

		document.getElementById("history-filter-reset").onclick = () => {
			this.filters.search = "";
			this.filters.chapterId = "all";
			this.filters.favoriteOnly = false;
			this.filters.sortDesc = true;
			search.value = "";
			sortToggle.textContent = "최신순";
			favoriteToggle.classList.remove("active");
			this.render();
		};

		const content = document.querySelector(".history-content");
		const topButton = document.getElementById("history-scrolltop");
		content.addEventListener("scroll", () => {
			topButton.classList.toggle("visible", content.scrollTop > 360);
		});
		topButton.onclick = () => content.scrollTo({ top: 0, behavior: "smooth" });
	},

	open(){
		this.render();
		document.getElementById("history-modal").classList.remove("hidden");
		document.querySelector(".history-content").scrollTop = 0;
	},

	close(){
		document.getElementById("history-modal").classList.add("hidden");
	},

	getOwnedEntries(){
		return PlayerData.ownedCards
			.map(owned => ({ card: CardManager.getCard(owned.id), owned }))
			.filter(item => item.card);
	},

	render(){
		this.renderSummary();
		this.renderChapterChips();
		this.renderList();
	},

	renderSummary(){
		const summary = document.getElementById("history-summary");
		const cards = this.getOwnedEntries();
		const favoriteCount = PlayerData.favoriteCards.length;
		if (!cards.length) {
			summary.innerHTML = `<span>아직 사진이 없어요</span><strong>첫 기억이 이곳에서 시작돼요</strong>`;
			return;
		}
		const earliest = [...cards].sort((a, b) => a.card.date.localeCompare(b.card.date))[0];
		const favoriteText = favoriteCount > 0 ? ` · ★ ${favoriteCount}장` : "";
		summary.innerHTML = `<span>${earliest.card.date}부터</span><strong>${cards.length}장의 기억을 모았어요${favoriteText}</strong>`;
	},

	renderChapterChips(){
		const container = document.getElementById("history-chapter-filter");
		const owned = this.getOwnedEntries();
		const ownedChapterIds = [...new Set(owned.map(item => item.card.chapterId))];
		const chapters = GameData.chapters.filter(chapter => ownedChapterIds.includes(chapter.id));

		if (chapters.length <= 1) {
			container.innerHTML = "";
			this.filters.chapterId = "all";
			return;
		}

		if (this.filters.chapterId !== "all" && !ownedChapterIds.includes(this.filters.chapterId)) {
			this.filters.chapterId = "all";
		}

		const chips = [{ id: "all", title: "전체" }, ...chapters];
		container.innerHTML = chips.map(chapter => `
			<button class="history-chip chapter-chip ${this.filters.chapterId === chapter.id ? "active" : ""}" data-chapter-id="${chapter.id}" type="button">${chapter.title}</button>
		`).join("");

		container.querySelectorAll(".chapter-chip").forEach(button => {
			button.onclick = () => {
				this.filters.chapterId = button.dataset.chapterId;
				container.querySelectorAll(".chapter-chip").forEach(b => b.classList.toggle("active", b === button));
				this.renderList();
			};
		});
	},

	hasActiveFilters(){
		return !!this.filters.search || this.filters.chapterId !== "all" || this.filters.favoriteOnly || !this.filters.sortDesc;
	},

	updateFilterResetVisibility(){
		document.getElementById("history-filter-reset").classList.toggle("hidden", !this.hasActiveFilters());
	},

	renderList(){
		const list = document.getElementById("history-list");
		const countLabel = document.getElementById("history-count");
		let entries = this.getOwnedEntries();
		const totalOwned = entries.length;

		if (this.filters.chapterId !== "all") {
			entries = entries.filter(item => item.card.chapterId === this.filters.chapterId);
		}
		if (this.filters.favoriteOnly) {
			entries = entries.filter(item => PlayerData.favoriteCards.includes(item.card.id));
		}
		if (this.filters.search) {
			const query = this.filters.search.toLowerCase();
			entries = entries.filter(item =>
				item.card.title.toLowerCase().includes(query) ||
				item.card.description.toLowerCase().includes(query)
			);
		}

		this.updateFilterResetVisibility();
		if (this.hasActiveFilters() && totalOwned > 0) {
			countLabel.textContent = `${entries.length}장 표시 중 (전체 ${totalOwned}장)`;
			countLabel.classList.remove("hidden");
		} else {
			countLabel.classList.add("hidden");
		}

		entries.sort((a, b) => {
			const cmp = a.card.date.localeCompare(b.card.date) || a.card.order - b.card.order;
			return this.filters.sortDesc ? -cmp : cmp;
		});

		list.innerHTML = "";

		if (!entries.length) {
			list.innerHTML = totalOwned
				? '<p class="history-empty">조건에 맞는 사진이 없어요.<br>검색어나 필터를 바꿔 보세요.</p>'
				: '<p class="history-empty">발견한 사진이 생기면, 그날의 시간선이 이곳에 이어져요.</p>';
			return;
		}

		let lastMonth = null;
		entries.forEach(({ card, owned }) => {
			const month = card.date.slice(0, 7);
			if (month !== lastMonth) {
				lastMonth = month;
				const [year, mon] = month.split("-");
				const header = document.createElement("div");
				header.className = "history-month";
				header.textContent = `${year}년 ${parseInt(mon, 10)}월`;
				list.appendChild(header);
			}

			const isFavorite = PlayerData.favoriteCards.includes(card.id);
			const hasNote = !!PlayerData.memoryNotes[card.id];
			const item = document.createElement("article");
			item.className = "history-entry";
			item.innerHTML = `
				<div class="history-card" data-card-id="${card.id}" type="button">
					<span class="history-thumb-wrap">
						<img class="history-thumb" src="./assets/images/${card.photo}" alt="" loading="lazy">
						<button class="history-fav-toggle${isFavorite ? " active" : ""}" type="button" aria-label="좋아하는 사진으로 표시">${isFavorite ? "★" : "☆"}</button>
					</span>
					<span class="history-card-body">
						<time>${card.date}</time>
						<strong>${card.title}${owned.count > 1 ? ` ×${owned.count}` : ""}${hasNote ? '<span class="history-note-flag">📝</span>' : ""}</strong>
						<p>${card.description}</p>
					</span>
				</div>
			`;
			const button = item.querySelector(".history-card");
			button.onclick = () => {
				UI.showCardDetail({ id: card.id, count: owned.count });
			};

			const favToggle = item.querySelector(".history-fav-toggle");
			favToggle.onclick = (event) => {
				event.stopPropagation();
				const index = PlayerData.favoriteCards.indexOf(card.id);
				if (index === -1) PlayerData.favoriteCards.push(card.id);
				else PlayerData.favoriteCards.splice(index, 1);
				SaveManager.save();
				this.renderSummary();
				if (this.filters.favoriteOnly) this.renderList();
				else {
					const nowFavorite = PlayerData.favoriteCards.includes(card.id);
					favToggle.classList.toggle("active", nowFavorite);
					favToggle.textContent = nowFavorite ? "★" : "☆";
				}
				CardUI.renderCards(CardUI.activeChapterId);
			};

			list.appendChild(item);
		});
	},

	openRandomCard(){
		const cards = PlayerData.ownedCards;
		if (!cards.length) return;
		const picked = cards[Math.floor(Math.random() * cards.length)];
		this.close();
		const owned = CardManager.getOwnedCard(picked.id);
		if (owned) UI.showCardDetail({ id: picked.id, count: owned.count });
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
				fill.style.transition = `${DrawManager.getCooldown()}s linear`;
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

	skipCooldownWithPoints(){
		if (!PlayerData.features.points || PlayerData.points < 100 || DrawManager.canDraw()) return;
		PlayerData.points -= 100;
		PlayerData.draw.lastDrawTime = 0;
		SaveManager.save();
		this.updateTimer();
		CardUI.renderStatus();
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
		const title = document.querySelector(".draw-title");
		const unlocked = GameData.chapters.find(chapter => chapter.id === PlayerData.lastUnlockedChapter);
		title.textContent = unlocked
			? `새 사진첩이 열렸어요 · ${unlocked.title}`
			: PlayerData.lastPointGain > 0
				? `오늘의 사진 : +${PlayerData.lastPointGain} P`
				: "오늘의 사진 ";

		if(this.page == this.pages.length-1){
			btn.textContent = "확인";
		}else{
			btn.textContent = `다음 ${this.page+1}/${this.pages.length}`;
		}

		modal.classList.remove("hidden");
		btn.classList.remove("complete");
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

		btn.classList.add("complete");
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


