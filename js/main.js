window.onload = function () {

    const boot = document.getElementById("boot");
    const main = document.getElementById("main");

    const bootBtn = document.getElementById("bootBtn");

    const bootLog = document.getElementById("boot-log");
    const bootBar = document.getElementById("boot-bar");

	SaveManager.load();
	const isFirstPlay = PlayerData.ownedCards.length === 0;
    if(!isFirstPlay){
        boot.style.display = "none";
        main.style.display = "block";
        DrawUI.init();
        CardUI.renderCards("CH-000");
        return;
    }


    bootBtn.onclick = async function () {
        bootBtn.disabled = true;
        await showBootAnimation(bootLog, bootBar);
		await showFirstMemory(bootLog);
		
		// 최초 실행
        if(PlayerData.ownedCards.length === 0){
			Player.addCard("MEM-0001");
            SaveManager.save();
        }

        boot.style.display = "none";
        main.style.display = "block";
		DrawUI.init();
		CardUI.renderCards("CH-000");
    };
};

async function showBootAnimation(log, bar) {

    const messages = [
        "SYSTEM BOOTING...",
        "Loading AI Core...",
        "Connecting Archive...",
        "Checking Memory Database...",
        "Archive Ready."
    ];

    log.textContent = "";

    for (let i = 0; i < messages.length; i++) {
        log.textContent += messages[i] + "\n";
        bar.style.width = ((i + 1) / messages.length * 100) + "%";
        await wait(200);
    }
}

// 첫 기억 발견 연출
async function showFirstMemory(log) {
    const messages = [
        "",
        "Searching memory fragments...",
        "Unknown memory detected.",
        "",
        "MEM-0001 FOUND",
        "",
        "새로운 생명의 시작",
        "Memory restored."
    ];

    for (const msg of messages) {
        log.textContent += msg + "\n";
        await wait(100);

    }

}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}