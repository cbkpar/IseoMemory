window.MiniGameUI = {

	activeTab: "match",

	init(){
		document.getElementById("minigame-open").onclick = () => this.open();
		document.getElementById("minigame-close").onclick = () => this.close();
		document.querySelector("#minigame-modal .history-modal-bg").onclick = () => this.close();

		document.querySelectorAll(".minigame-tab").forEach(tab => {
			tab.onclick = () => this.switchTab(tab.dataset.tab);
		});
	},

	open(){
		document.getElementById("minigame-modal").classList.remove("hidden");
		this.switchTab(this.activeTab);
	},

	close(){
		document.getElementById("minigame-modal").classList.add("hidden");
	},

	switchTab(tab){
		this.activeTab = tab;
		document.querySelectorAll(".minigame-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
		document.getElementById("minigame-panel-match").classList.toggle("hidden", tab !== "match");
		document.getElementById("minigame-panel-puzzle").classList.toggle("hidden", tab !== "puzzle");

		if (tab === "match") MemoryGameUI.activate();
		else PuzzleUI.activate();
	}

};
