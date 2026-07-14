window.MemoryGameUI = {

	state: null,

	init(){
		document.getElementById("game-restart").onclick = () => this.startGame();
	},

	activate(){
		if (!this.state) this.startGame();
		else this.render();
	},

	startGame(){
		const owned = PlayerData.ownedCards.map(o => CardManager.getCard(o.id)).filter(Boolean);
		document.getElementById("game-result").textContent = "";

		if (owned.length < 4) {
			this.state = null;
			document.getElementById("game-grid").innerHTML = "";
			document.getElementById("game-moves").textContent = "";
			document.getElementById("game-empty").classList.remove("hidden");
			document.getElementById("game-restart").classList.add("hidden");
			return;
		}
		document.getElementById("game-empty").classList.add("hidden");
		document.getElementById("game-restart").classList.remove("hidden");

		const pairCount = Math.min(8, Math.max(3, Math.floor(owned.length / 2)));
		const pool = [...owned].sort(() => Math.random() - 0.5).slice(0, pairCount);

		let tiles = [];
		pool.forEach(card => {
			tiles.push({ cardId: card.id, photo: card.photo });
			tiles.push({ cardId: card.id, photo: card.photo });
		});
		tiles = tiles.sort(() => Math.random() - 0.5);

		this.state = {
			tiles,
			flipped: [],
			matched: new Set(),
			moves: 0,
			locked: false,
			pairCount
		};

		this.render();
	},

	render(){
		if (!this.state) return;
		const grid = document.getElementById("game-grid");
		const cols = Math.min(6, this.state.pairCount * 2 >= 12 ? 6 : 4);
		grid.style.setProperty("--game-cols", cols);

		grid.innerHTML = this.state.tiles.map((tile, i) => {
			const flipped = this.state.flipped.includes(i) || this.state.matched.has(i);
			const matched = this.state.matched.has(i);
			return `
				<button class="game-tile ${flipped ? "flipped" : ""} ${matched ? "matched" : ""}" data-index="${i}" type="button" aria-label="카드 뒤집기">
					<span class="game-tile-inner">
						<span class="card-face card-back">
							<span class="card-back-pattern" aria-hidden="true"></span>
							<span class="card-back-mark">MEMORY</span>
						</span>
						<span class="card-face card-front"><img src="./assets/images/${tile.photo}" alt=""></span>
					</span>
				</button>
			`;
		}).join("");

		document.getElementById("game-moves").textContent = `이동 ${this.state.moves}회 · ${this.state.matched.size / 2} / ${this.state.pairCount} 쌍`;

		grid.querySelectorAll(".game-tile").forEach(button => {
			button.onclick = () => this.flipTile(Number(button.dataset.index));
		});
	},

	flipTile(index){
		const s = this.state;
		if (!s || s.locked) return;
		if (s.matched.has(index) || s.flipped.includes(index)) return;
		if (s.flipped.length >= 2) return;

		s.flipped.push(index);
		this.render();

		if (s.flipped.length === 2) {
			s.moves++;
			const [a, b] = s.flipped;
			if (s.tiles[a].cardId === s.tiles[b].cardId) {
				s.matched.add(a);
				s.matched.add(b);
				s.flipped = [];
				this.render();
				if (s.matched.size === s.tiles.length) this.onWin();
			} else {
				s.locked = true;
				setTimeout(() => {
					s.flipped = [];
					s.locked = false;
					this.render();
				}, 700);
			}
		}
	},

	onWin(){
		const today = Player.todayKey();
		if (PlayerData.memoryGame.lastPlayDate !== today) {
			PlayerData.memoryGame.lastPlayDate = today;
			PlayerData.memoryGame.dailyPlays = 0;
		}

		let rewardText = "";
		if (PlayerData.memoryGame.dailyPlays < 3) {
			PlayerData.memoryGame.dailyPlays += 1;
			PlayerData.fragments += 5;
			rewardText = " · 🧩 +5";
		}

		let bestText = "";
		if (!PlayerData.memoryGame.bestMoves || this.state.moves < PlayerData.memoryGame.bestMoves) {
			PlayerData.memoryGame.bestMoves = this.state.moves;
			bestText = " · 🏆 최고기록 경신!";
		}

		SaveManager.save();
		CardUI.renderStatus();
		AchievementManager.checkAll();

		document.getElementById("game-result").textContent = `🎉 완성! ${this.state.moves}번 만에 맞췄어요${rewardText}${bestText}`;
	}

};
