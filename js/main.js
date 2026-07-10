window.onload = function () {

    const boot = document.getElementById("boot");
    const main = document.getElementById("main");

    const bootBtn = document.getElementById("bootBtn");

	SaveManager.load();
	const isFirstPlay = PlayerData.ownedCards.length === 0;
    if(!isFirstPlay){
        boot.style.display = "none";
        main.style.display = "block";
        DrawUI.init();
		CardUI.init();
        CardUI.renderCards("CH-000");
        return;
    }


    bootBtn.onclick = async function () {
        bootBtn.disabled = true;
		boot.classList.add("album-opening");
		await wait(650);

		// 최초 실행
        if(PlayerData.ownedCards.length === 0){
			Player.addCard("MEM-0001");
            SaveManager.save();
        }

        boot.style.display = "none";
        main.style.display = "block";
		DrawUI.init();
		CardUI.init();
		CardUI.renderCards("CH-000");
    };
};

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
