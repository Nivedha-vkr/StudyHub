

function openMenu() {
  document.getElementById("sideMenu").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}

function closeMenu() {
  document.getElementById("sideMenu").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

function menuAction(action) {
  closeMenu();
  alert(action + " clicked");
}
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const target = card.getAttribute("data-target");
    if(target) {
      window.location.href = target;
    }
  });
});
