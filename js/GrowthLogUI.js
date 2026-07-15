window.GrowthLogUI = {

	init(){
		document.getElementById("growth-open").onclick = () => this.open();
		document.getElementById("growth-close").onclick = () => this.close();
		document.querySelector("#growth-modal .history-modal-bg").onclick = () => this.close();
		document.getElementById("growth-submit").onclick = () => this.submit();

		const dateInput = document.getElementById("growth-date");
		dateInput.value = this.todayISO();
	},

	open(){
		this.render();
		document.getElementById("growth-modal").classList.remove("hidden");
	},

	close(){
		document.getElementById("growth-modal").classList.add("hidden");
	},

	todayISO(){
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
	},

	submit(){
		const date = document.getElementById("growth-date").value;
		const height = document.getElementById("growth-height").value;
		const weight = document.getElementById("growth-weight").value;
		const memo = document.getElementById("growth-memo").value;

		if (!date) { alert("날짜를 선택해주세요."); return; }
		if (!height && !weight) { alert("키 또는 몸무게 중 하나는 입력해주세요."); return; }

		Player.addGrowthLog(date, height, weight, memo);
		AchievementManager.checkAll();

		document.getElementById("growth-height").value = "";
		document.getElementById("growth-weight").value = "";
		document.getElementById("growth-memo").value = "";

		this.render();
	},

	render(){
		this.renderChart();
		this.renderList();
	},

	renderChart(){
		const box = document.getElementById("growth-chart");
		const logs = [...PlayerData.growthLogs]
			.filter(l => l.weightKg !== null)
			.sort((a, b) => a.date.localeCompare(b.date));

		if (logs.length < 2) {
			box.innerHTML = `<p class="history-empty">몸무게를 2번 이상 기록하면<br>변화 그래프가 나타나요.</p>`;
			return;
		}

		const width = 320, height = 140, pad = 24;
		const values = logs.map(l => l.weightKg);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const range = max - min || 1;

		const points = logs.map((log, i) => {
			const x = pad + (i / (logs.length - 1)) * (width - pad * 2);
			const y = height - pad - ((log.weightKg - min) / range) * (height - pad * 2);
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		});

		const dots = logs.map((log, i) => {
			const [x, y] = points[i].split(",");
			return `<circle cx="${x}" cy="${y}" r="3.5" fill="#c17058"></circle>`;
		}).join("");

		box.innerHTML = `
			<svg viewBox="0 0 ${width} ${height}" class="growth-chart-svg">
				<polyline points="${points.join(" ")}" fill="none" stroke="#c17058" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></polyline>
				${dots}
			</svg>
			<div class="growth-chart-range"><span>${min}kg</span><span>${max}kg</span></div>
		`;
	},

	renderList(){
		const list = document.getElementById("growth-list");
		const logs = [...PlayerData.growthLogs].sort((a, b) => b.date.localeCompare(a.date));

		if (!logs.length) {
			list.innerHTML = `<p class="history-empty">아직 남긴 성장 기록이 없어요.</p>`;
			return;
		}

		list.innerHTML = logs.map(log => `
			<div class="growth-row">
				<span class="growth-row-date">${log.date}</span>
				<span class="growth-row-values">
					${log.heightCm ? `📏 ${log.heightCm}cm` : ""}
					${log.weightKg ? `⚖️ ${log.weightKg}kg` : ""}
					${log.memo ? `<em>${this.escapeHtml(log.memo)}</em>` : ""}
				</span>
				<button class="growth-row-delete" data-log-id="${log.id}" type="button" aria-label="기록 삭제">×</button>
			</div>
		`).join("");

		list.querySelectorAll(".growth-row-delete").forEach(button => {
			button.onclick = () => {
				Player.removeGrowthLog(button.dataset.logId);
				this.render();
			};
		});
	},

	escapeHtml(text){
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

};
