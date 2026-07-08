window.Game = {
    getRecoverableMemories() {
        return GameData.cards.filter(memory => {

            // 이미 복원한 카드는 제외
            if (App.recovered.includes(memory.id))
                return false;

            // 선행 조건이 없으면 바로 복원 가능
            if (!memory.requires || memory.requires.length === 0)
                return true;

            // 선행 카드가 모두 복원되었는지 확인
            return memory.requires.every(id =>
                App.recovered.includes(id)
            );

        });

    },

    restoreMemory() {

        const list = this.getRecoverableMemories();

        if (list.length === 0)
            return null;

        // 현재는 첫 번째 카드 선택
        const memory = list[0];

        App.currentMemory = memory;
        App.recovered.push(memory.id);

        App.progress = this.getProgress();

        return memory;

    },

    getProgress() {

        return Math.floor(
            (App.recovered.length / GameData.cards.length) * 100
        );

    }

};