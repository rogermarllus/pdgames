import { updateMuteIcon } from "../ui.js";

function init() {
  Howler.mute(true);
  localStorage.setItem("muted", true);
}

/* MÚSICAS */
export const musics = {
  mainMenu: new Howl({
    src: ["/assets/audio/music/main-menu.mp3"],
    volume: 0.1,
    loop: true
  }),

  preparation: new Howl({
    src: ["/assets/audio/music/preparation.mp3"],
    volume: 0.1,
    loop: true
  }),

  combat: new Howl({
    src: ["/assets/audio/music/combat.mp3"],
    volume: 0.1,
    loop: true
  }),

  victory: new Howl({
    src: ["/assets/audio/music/victory.mp3"],
    volume: 0.9
  }),
  
  gameOver: new Howl({
    src: ["/assets/audio/music/game-over.mp3"],
    volume: 0.1
  }),
};

/* EFEITOS SONOROS */

export const sfx = {
  hit: new Howl({
    src: ["/assets/audio/sfx/hit.wav"],
    volume: 0.1
  }),

  miss: new Howl({
    src: ["/assets/audio/sfx/miss.wav"],
    volume: 0.1
  }),

  spell: new Howl({
    src: ["/assets/audio/sfx/spell.wav"],
    volume: 0.1
  }),

  heal: new Howl({
    src: ["/assets/audio/sfx/heal.wav"],
    volume: 0.1
  }),

  random: new Howl({
    src: ["/assets/audio/sfx/random.wav"],
    volume: 0.5
  }),
};

export function toggleMute() {
  const muted = isMuted();
  Howler.mute(!muted);
  localStorage.setItem("muted", !muted);
  updateMuteIcon(!muted);
}

export function isMuted() {
  return localStorage.getItem("muted") === "true";
}

document.getElementById("btn-mute")
  .addEventListener("click", toggleMute);

init();