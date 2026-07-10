window.GameData = {
    version: "0.1.5",
	
	chapters: [
        {
            id: "CH-000",
            title: "Prologue",
            description: "새로운 생명의 시작",
            cards: ["MEM-0001","MEM-0002","MEM-0003","MEM-0004","MEM-0005",
					"MEM-0006","MEM-0007","MEM-0008","MEM-0009","MEM-0010",
					"MEM-0011","MEM-0012","MEM-0013","MEM-0014","MEM-0015",
					"MEM-0016","MEM-0017","MEM-0018","MEM-0019","MEM-0020",
					"MEM-0021","MEM-0022","MEM-0023","MEM-0024","MEM-0025",
					"MEM-0026","MEM-0027","MEM-0028","MEM-0029","MEM-0030",
					"MEM-0031","MEM-0032","MEM-0033","MEM-0034","MEM-0035",
					"MEM-0036","MEM-0037","MEM-0038","MEM-0039","MEM-0040",
					"MEM-0041","MEM-0042","MEM-0043","MEM-0044","MEM-0045",
					"MEM-0046","MEM-0047","MEM-0048","MEM-0049","MEM-0050",]
        },
        {
            id: "CH-001",
            title: "Before Birth",
            description: "엄마 뱃속에서의 시간",
            cards: ["MEM-0051","MEM-0052","MEM-0053"]
        }
    ],
};

window.DataLoader = {

    async load(){

        const cards = await fetch("./data/cards.json").then(r=>r.json());
        GameData.cards = cards;
    }

};
