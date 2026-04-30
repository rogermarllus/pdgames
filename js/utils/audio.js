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