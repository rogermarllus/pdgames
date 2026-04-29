import { animate } from "../../libs/anime.esm.min.js";

export function hitFlash(type = "attack") {
  const el = document.getElementById("monster-art");
  if (!el) return;

  const isSpell = type === "spell";

  animate(el, {
    scale: isSpell
      ? [1, 0.85, 1.04, 1]
      : [1, 0.86, 1.02, 1],

    filter: isSpell
      ? ["brightness(1)", "brightness(5)", "brightness(1)"]
      : ["brightness(1)", "brightness(3)", "brightness(1)"],

    duration: isSpell ? 300 : 180,
    easing: "easeOutQuad"
  });
}