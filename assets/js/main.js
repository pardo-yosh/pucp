/*=============== FUNCIONALIDAD PARA LISTAS DE CURSOS ===============*/
function setupCourseLists() {
  // Seleccionar todos los botones de dropdown
  const dropdownBtns = document.querySelectorAll(".dropdown-btn");

  dropdownBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation(); // Evitar que el evento se propague

      // Obtener el dropdown correspondiente
      const dropdown = this.nextElementSibling;
      const isExpanded = this.getAttribute("aria-expanded") === "true";

      // Cerrar otros dropdowns abiertos
      document.querySelectorAll(".dropdown-content").forEach((d) => {
        if (d !== dropdown) {
          d.classList.remove("active");
          d.previousElementSibling.setAttribute("aria-expanded", "false");
        }
      });

      // Alternar el estado del dropdown actual
      dropdown.classList.toggle("active");
      this.setAttribute("aria-expanded", String(!isExpanded));
    });
  });

  // Cerrar dropdowns al hacer click fuera de ellos
  document.addEventListener("click", function () {
    document.querySelectorAll(".dropdown-content").forEach((dropdown) => {
      dropdown.classList.remove("active");
      dropdown.previousElementSibling.setAttribute("aria-expanded", "false");
    });
  });

  // Efectos hover para las tarjetas de curso
  const courseCards = document.querySelectorAll(".course-card");
  courseCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-8px)";
      card.style.boxShadow = "0 12px 28px var(--shadow-color)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.boxShadow = "0 4px 20px var(--shadow-color)";
    });
  });
}

/*=============== INICIAR TODO ===============*/
document.addEventListener("DOMContentLoaded", () => {
  setupSidebar();
  setupActiveLinks();
  setupDarkMode();
  setupCourseLists(); // <-- Añadir esta línea

  // Debug
  console.log("Estado cargado:", APP_STATE);
  console.log("Ruta actual:", window.location.pathname);
});
