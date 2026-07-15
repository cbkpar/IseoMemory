window.WordGameUI = {

	MAX_TRIES: 5,

	CHO: ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"],
	JUNG: ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"],
	JONG: ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"],

	KEYBOARD_CONSONANTS: ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"],
	KEYBOARD_VOWELS: ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"],

	WORDS: {
		5:["가을","가족","검사","겨울","고민","기록","기적","내일","마음","모빌","바람","사랑","사진","소원","시작","엄마","여름","예정","오늘","이름","준비","추억","축하","태동","태명","트림","편지","하늘"],
		6:["고마워","기저귀","눈물","만남","만삭","목욕","무지개","백일","별빛","병실","병원","봄날","성장","손발","순간","심장","앨범","얼굴","용품","웃음","유모차","젖병","첫날","출산","카시트","키재기","포대기","행복"],
		7:["겉싸개","놀이터","목소리","몸무게","반가워","발싸개","배내옷","사랑해","소중해","속싸개","손싸개","애틋해","우유병","이불보","이유식","자장가","잠꼬대","초음파"]
	},

	state: null,

	init(){
		document.getElementById("word-restart").onclick = () => this.startGame();
		document.querySelectorAll(".word-size-chip").forEach(chip => {
			chip.onclick = () => {
				document.querySelectorAll(".word-size-chip").forEach(c => c.classList.toggle("active", c === chip));
				this.startGame();
			};
		});
		document.getElementById("word-keyboard").addEventListener("click", (e) => {
			const btn = e.target.closest("button");
			if (!btn || btn.disabled) return;
			if (btn.dataset.key === "back") this.backspace();
			else if (btn.dataset.key === "enter") this.submitGuess();
			else if (btn.dataset.jamo) this.inputJamo(btn.dataset.jamo);
		});
		document.getElementById("word-grid").addEventListener("click", (e) => {
			const cell = e.target.closest(".word-cell.filled");
			if (!cell) return;
			const s = this.state;
			if (!s || s.over) return;
			const idx = Number(cell.dataset.index);
			// remove this jamo and everything typed after it
			if (idx < s.current.length) {
				s.current.length = idx;
				this.render();
			}
		});
	},

	getSelectedLength(){
		const active = document.querySelector(".word-size-chip.active");
		return active ? Number(active.dataset.size) : 5;
	},

	activate(){
		if (!this.state) this.startGame();
		else this.render();
	},

	// Decompose a word into jamos AND the role each jamo plays (cho/jung/jong)
	decompose(word){
		const jamos = [];
		const types = [];
		for (const ch of word) {
			const code = ch.charCodeAt(0) - 0xAC00;
			if (code >= 0 && code <= 11171) {
				const cho = Math.floor(code / (21 * 28));
				const jung = Math.floor((code % (21 * 28)) / 28);
				const jong = code % 28;
				jamos.push(this.CHO[cho]); types.push("cho");
				jamos.push(this.JUNG[jung]); types.push("jung");
				if (this.JONG[jong]) { jamos.push(this.JONG[jong]); types.push("jong"); }
			} else {
				jamos.push(ch); types.push("etc");
			}
		}
		return { jamos, types };
	},

	// Reassemble typed jamos (following the answer's cho/jung/jong pattern) into readable syllables
	compose(jamos, types){
		let result = "";
		let i = 0;
		while (i < types.length && jamos[i] !== undefined) {
			const cho = jamos[i]; i++;
			let jung, jong;
			if (i < types.length && types[i] === "jung" && jamos[i] !== undefined) { jung = jamos[i]; i++; }
			if (i < types.length && types[i] === "jong" && jamos[i] !== undefined) { jong = jamos[i]; i++; }
			if (cho !== undefined && jung !== undefined) {
				const cIdx = this.CHO.indexOf(cho);
				const vIdx = this.JUNG.indexOf(jung);
				const jIdx = jong !== undefined ? this.JONG.indexOf(jong) : 0;
				if (cIdx >= 0 && vIdx >= 0 && jIdx >= 0) {
					result += String.fromCharCode(0xAC00 + cIdx * 21 * 28 + vIdx * 28 + jIdx);
					continue;
				}
			}
			result += (cho || "") + (jung || "") + (jong || "");
		}
		return result;
	},

	startGame(){
		const length = this.getSelectedLength();
		const list = this.WORDS[length] || this.WORDS[5];
		const word = list[Math.floor(Math.random() * list.length)];
		const { jamos, types } = this.decompose(word);
		this.state = {
			length,
			word,
			answer: jamos,
			answerTypes: types,
			guesses: [],
			statuses: [],
			current: [],
			keyStatus: {},
			over: false,
			win: false
		};
		this.render();
	},

	inputJamo(jamo){
		const s = this.state;
		if (!s || s.over) return;
		if (s.current.length >= s.length) return;
		s.current.push(jamo);
		this.render();
	},

	backspace(){
		const s = this.state;
		if (!s || s.over) return;
		s.current.pop();
		this.render();
	},

	submitGuess(){
		const s = this.state;
		if (!s || s.over) return;
		if (s.current.length !== s.length) return;

		const guess = s.current.slice();
		const answer = s.answer.slice();
		const status = new Array(s.length).fill("absent");
		const remaining = {};

		answer.forEach((j, i) => {
			if (guess[i] === j) status[i] = "correct";
			else remaining[j] = (remaining[j] || 0) + 1;
		});
		guess.forEach((j, i) => {
			if (status[i] === "correct") return;
			if (remaining[j] > 0) {
				status[i] = "present";
				remaining[j]--;
			}
		});

		status.forEach((st, i) => {
			const j = guess[i];
			const rank = { absent: 0, present: 1, correct: 2 };
			if (!(j in s.keyStatus) || rank[st] > rank[s.keyStatus[j]]) s.keyStatus[j] = st;
		});

		s.guesses.push(guess);
		s.statuses.push(status);
		s.current = [];

		if (status.every(st => st === "correct")) {
			s.over = true;
			s.win = true;
		} else if (s.guesses.length >= this.MAX_TRIES) {
			s.over = true;
			s.win = false;
		}

		this.render();
	},

	render(){
		const s = this.state;
		if (!s) return;

		document.querySelectorAll(".word-size-chip").forEach(c => {
			c.classList.toggle("active", Number(c.dataset.size) === s.length);
		});

		const statusEl = document.getElementById("word-status");
		statusEl.textContent = s.over
			? (s.win ? "🎉 성공!" : `실패 · 정답 "${s.word}"`)
			: `남은 기회 ${this.MAX_TRIES - s.guesses.length}번 · 🟩정확 🟨포함 ⬜없음`;

		document.getElementById("word-result").textContent = s.over
			? (s.win ? `"${s.word}" 정답이에요!` : "")
			: "";

		// live preview of what the current row spells out so far
		const previewEl = document.getElementById("word-preview");
		if (previewEl) {
			if (s.over) {
				previewEl.textContent = "";
			} else {
				const composed = this.compose(s.current, s.answerTypes);
				previewEl.textContent = composed ? `입력 중: ${composed}` : "자음/모음을 눌러 단어를 채워보세요";
			}
		}

		const grid = document.getElementById("word-grid");
		grid.style.setProperty("--word-cols", s.length);
		const rows = [];
		for (let r = 0; r < this.MAX_TRIES; r++) {
			const cells = [];
			const isCurrentRow = r === s.guesses.length;
			for (let c = 0; c < s.length; c++) {
				let jamo = "";
				let cls = "word-cell " + s.answerTypes[c];
				if (r < s.guesses.length) {
					jamo = s.guesses[r][c];
					cls += " " + s.statuses[r][c];
				} else if (isCurrentRow && c < s.current.length) {
					jamo = s.current[c];
					cls += " filled";
				} else if (isCurrentRow && c === s.current.length && !s.over) {
					cls += " active";
				}
				// visually group jamos into syllables
				if (c === s.length - 1 || s.answerTypes[c + 1] === "cho") cls += " syl-end";
				cells.push(`<div class="${cls}" data-index="${c}">${this.escapeHtml(jamo)}</div>`);
			}
			rows.push(`<div class="word-row">${cells.join("")}</div>`);
		}
		grid.innerHTML = rows.join("");

		const kb = document.getElementById("word-keyboard");
		if (!kb.dataset.built) {
			const rowHtml = (arr) => arr.map(j => `<button type="button" data-jamo="${j}">${j}</button>`).join("");
			kb.innerHTML = `
				<div class="word-key-group" data-group-wrap="cho">
					<span class="word-key-label">자음</span>
					<div class="word-key-row" data-group="cho">${rowHtml(this.KEYBOARD_CONSONANTS)}</div>
				</div>
				<div class="word-key-group" data-group-wrap="jung">
					<span class="word-key-label">모음</span>
					<div class="word-key-row" data-group="jung">${rowHtml(this.KEYBOARD_VOWELS)}</div>
				</div>
				<div class="word-key-row word-key-actions">
					<button type="button" class="word-key-wide" data-key="back">⌫ 지우기</button>
					<button type="button" class="word-key-wide word-key-enter" data-key="enter">확인</button>
				</div>`;
			kb.dataset.built = "1";
		}

		// figure out which category (consonant/vowel) the next blank needs, and
		// show ONLY that key set — halves keyboard height and removes guesswork
		const nextType = s.current.length < s.length ? s.answerTypes[s.current.length] : null;
		const needsVowel = nextType === "jung";
		const needsConsonant = nextType === "cho" || nextType === "jong";

		kb.querySelectorAll("button[data-jamo]").forEach(btn => {
			btn.classList.remove("correct", "present", "absent");
			const st = s.keyStatus[btn.dataset.jamo];
			if (st) btn.classList.add(st);
		});
		kb.querySelector('[data-group-wrap="cho"]').classList.toggle("hidden", s.over || !needsConsonant);
		kb.querySelector('[data-group-wrap="jung"]').classList.toggle("hidden", s.over || !needsVowel);

		const enterBtn = kb.querySelector('[data-key="enter"]');
		if (enterBtn) enterBtn.disabled = s.over || s.current.length !== s.length;
		const backBtn = kb.querySelector('[data-key="back"]');
		if (backBtn) backBtn.disabled = s.over || s.current.length === 0;
		kb.classList.toggle("disabled", s.over);
	},

	escapeHtml(str){
		const div = document.createElement("div");
		div.textContent = str == null ? "" : str;
		return div.innerHTML;
	}

};
