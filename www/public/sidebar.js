(() => {
  const sidebar = document.getElementById("sidebar");
  const sideBarToggles = document.querySelectorAll("[data-sidebar-toggle]");

  for (const sidebarCloseBtn of sideBarToggles) {
    sidebarCloseBtn.addEventListener("click", () => {
      sidebar.classList.toggle("pointer-events-none");
      sidebar.classList.toggle("opacity-0");
      sidebar.classList.toggle("opacity-1");
    });
  }
})();
