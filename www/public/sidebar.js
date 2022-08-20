(() => {
  const sidebar = document.getElementById("sidebar");
  const sideBarToggles = document.querySelectorAll("[data-sidebar-toggle]");

  sidebar.addEventListener("click", (e) => {
    if (e.target !== sidebar) return;
    if (!sidebar.classList.contains("pointer-events-none")) {
      sidebar.classList.toggle("pointer-events-none");
      sidebar.classList.toggle("opacity-0");
    }
  });

  for (const sidebarCloseBtn of sideBarToggles) {
    sidebarCloseBtn.addEventListener("click", () => {
      sidebar.classList.toggle("pointer-events-none");
      sidebar.classList.toggle("opacity-0");
    });
  }
})();
