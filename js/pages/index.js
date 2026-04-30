import { setDisabled } from "../ui.js";

import { musics } from "../utils/audio.js";

const hasSaved = !!localStorage.getItem("STATE");

setDisabled("btn-load-game", !hasSaved);

const btnLoadGame = document.getElementById("btn-load-game");

btnLoadGame.addEventListener("click", (e) => {
    if (!hasSaved) return;

    const params = new URLSearchParams({
        action: "to-resume",
        next: "/pages/combat.html",
    });

    window.location.href = `/pages/error-loading.html?${params}`;
});

musics.mainMenu.play();