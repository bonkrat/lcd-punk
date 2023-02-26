import { init } from "./src/scene";

init();

document.getElementById("show").addEventListener("click", () => {
  document.getElementById("controls").classList.toggle("hidden");
  document.getElementById("hide").classList.toggle("hidden");
  document.getElementById("show").classList.toggle("hidden");
});

document.getElementById("hide").addEventListener("click", () => {
  document.getElementById("controls").classList.toggle("hidden");
  document.getElementById("hide").classList.toggle("hidden");
  document.getElementById("show").classList.toggle("hidden");
});
