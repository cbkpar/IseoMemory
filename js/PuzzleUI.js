window.PuzzleUI = {

	state: null,

	init(){
		document.getElementById("puzzle-restart").onclick = () => this.startPuzzle();

		document.getElementById("puzzle-photo").onchange = () => this.startPuzzle();
		document.querySelectorAll(".puzzle-size-chip").forEach(chip => {
			chip.onclick = () => {
				document.querySelectorAll(".puzzle-size-chip").forEach(c => c.classList.toggle("active", c === chip));
				this.startPuzzle();
			};
		});
	},

	getSelectedSize(){
		const active = document.querySelector(".puzzle-size-chip.active");
		return active ? Number(active.dataset.size) : 3;
	},

	activate(){
		if (!this.state) {
			this.renderPhotoOptions();
			this.startPuzzle();
		} else {
			this.render();
		}
	},

	renderPhotoOptions(){
		const select = document.getElementById("puzzle-photo");
		const owned = PlayerData.ownedCards.map(o => CardManager.getCard(o.id)).filter(Boolean);
		if (!owned.length) {
			select.innerHTML = "";
			return;
		}
		const previousValue = select.value;
		select.innerHTML = owned.map(card => `<option value="${card.id}">${this.escapeHtml(card.title)}</option>`).join("");
		if (owned.some(c => c.id === previousValue)) {
			select.value = previousValue;
		} else {
			select.value = owned[Math.floor(Math.random() * owned.length)].id;
		}
	},

	shuffle(size){
		const total = size * size;
		const arr = Array.from({ length: total }, (_, i) => i);
		do {
			for (let i = arr.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[arr[i], arr[j]] = [arr[j], arr[i]];
			}
		} while (arr.every((v, i) => v === i));
		return arr;
	},

	startPuzzle(){
		const owned = PlayerData.ownedCards.map(o => CardManager.getCard(o.id)).filter(Boolean);
		document.getElementById("puzzle-result").textContent = "";

		if (!owned.length) {
			this.state = null;
			document.getElementById("puzzle-grid").innerHTML = "";
			document.getElementById("puzzle-moves").textContent = "";
			document.getElementById("puzzle-empty").classList.remove("hidden");
			document.getElementById("puzzle-controls").classList.add("hidden");
			return;
		}
		document.getElementById("puzzle-empty").classList.add("hidden");
		document.getElementById("puzzle-controls").classList.remove("hidden");

		const select = document.getElementById("puzzle-photo");
		let card = owned.find(c => c.id === select.value);
		if (!card) card = owned[0];

		const size = this.getSelectedSize();

		this.state = {
			cardId: card.id,
			photo: card.photo,
			size,
			order: this.shuffle(size),
			selected: null,
			moves: 0
		};

		this.render();
	},

	render(){
		if (!this.state) return;
		const s = this.state;
		const grid = document.getElementById("puzzle-grid");
		grid.style.setProperty("--puzzle-size", s.size);

		grid.innerHTML = s.order.map((originalIndex, pos) => {
			const col = originalIndex % s.size;
			const row = Math.floor(originalIndex / s.size);
			const posX = s.size > 1 ? (col / (s.size - 1)) * 100 : 0;
			const posY = s.size > 1 ? (row / (s.size - 1)) * 100 : 0;
			const selected = s.selected === pos;
			const solved = originalIndex === pos;
			return `
				<button class="puzzle-piece ${selected ? "selected" : ""} ${solved ? "solved" : ""}" data-pos="${pos}" type="button"
					style="background-image:url('./assets/images/${s.photo}'); background-size:${s.size * 100}% ${s.size * 100}%; background-position:${posX}% ${posY}%;">
				</button>
			`;
		}).join("");

		document.getElementById("puzzle-moves").textContent = `이동 ${s.moves}회`;
		document.getElementById("puzzle-preview").style.backgroundImage = `url('./assets/images/${s.photo}')`;

		grid.querySelectorAll(".puzzle-piece").forEach(button => {
			button.onclick = () => this.selectPiece(Number(button.dataset.pos));
		});
	},

	selectPiece(pos){
		const s = this.state;
		if (!s) return;

		if (s.selected === null) {
			s.selected = pos;
		} else if (s.selected === pos) {
			s.selected = null;
		} else {
			[s.order[s.selected], s.order[pos]] = [s.order[pos], s.order[s.selected]];
			s.moves++;
			s.selected = null;
			if (s.order.every((v, i) => v === i)) {
				this.render();
				this.onWin();
				return;
			}
		}
		this.render();
	},

	onWin(){
		const s = this.state;
		const today = Player.todayKey();
		if (PlayerData.puzzleGame.lastPlayDate !== today) {
			PlayerData.puzzleGame.lastPlayDate = today;
			PlayerData.puzzleGame.dailyPlays = 0;
		}

		let rewardText = "";
		if (PlayerData.puzzleGame.dailyPlays < 3) {
			PlayerData.puzzleGame.dailyPlays += 1;
			const reward = s.size * 2; // 3x3=6, 4x4=8, 5x5=10
			PlayerData.fragments += reward;
			rewardText = ` · 🧩 +${reward}`;
		}

		let bestText = "";
		const best = PlayerData.puzzleGame.bestMoves[s.size];
		if (!best || s.moves < best) {
			PlayerData.puzzleGame.bestMoves[s.size] = s.moves;
			bestText = " · 🏆 최고기록 경신!";
		}

		SaveManager.save();
		CardUI.renderStatus();
		AchievementManager.checkAll();

		document.getElementById("puzzle-result").textContent = `🧩 완성! ${s.moves}번 만에 맞췄어요${rewardText}${bestText}`;
	},

	escapeHtml(text){
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

};
