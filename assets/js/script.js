/*=============== ESTADO GLOBAL ===============*/
let APP_STATE = {
  sidebarExpanded: true,
  activeLink: null,
  darkMode: false,
};

// Cargar estado al iniciar
function loadState() {
  const saved = localStorage.getItem("aetherisState");
  if (saved) APP_STATE = JSON.parse(saved);
}

// Guardar estado
function saveState() {
  localStorage.setItem("aetherisState", JSON.stringify(APP_STATE));
}

// Inicializar estado
loadState();

/*=============== SIDEBAR ===============*/
function setupSidebar() {
  const toggle = document.getElementById("header-toggle");
  const sidebar = document.getElementById("sidebar");
  const header = document.getElementById("header");
  const main = document.getElementById("main");

  if (!toggle || !sidebar || !header || !main) return;

  // Aplicar estado guardado
  if (APP_STATE.sidebarExpanded) {
    sidebar.classList.add("show-sidebar");
    header.classList.add("left-pd");
    main.classList.add("left-pd");
  }

  // Configurar click
  toggle.addEventListener("click", () => {
    const isExpanded = !sidebar.classList.contains("show-sidebar");

    sidebar.classList.toggle("show-sidebar");
    header.classList.toggle("left-pd");
    main.classList.toggle("left-pd");

    APP_STATE.sidebarExpanded = isExpanded;
    saveState();
  });
}

/*=============== ENLACES ACTIVOS - VERSIÓN FINAL ===============*/
function setupActiveLinks() {
  const links = document.querySelectorAll(".sidebar__list a");
  if (!links.length) return;

  // Función para normalizar rutas
  const normalizePath = (path) => {
    if (path) return "";
    return path.split("/").pop().toLowerCase().replace(".html", "");
  };

  // Ruta actual
  const currentPath = normalizePath(window.location.pathname);

  // Buscar coincidencia
  let foundMatch = false;
  links.forEach((link) => {
    const linkHref = link.getAttribute("href");
    const linkPath = normalizePath(linkHref);

    if (linkPath && linkPath === currentPath) {
      link.classList.add("active-link");
      APP_STATE.activeLink = linkHref;
      foundMatch = true;
    } else {
      link.classList.remove("active-link");
    }
  });

  // Usar estado guardado si no hay coincidencia
  if (!foundMatch && APP_STATE.activeLink) {
    const savedLink = document.querySelector(
      `.sidebar__list a[href="${APP_STATE.activeLink}"]`
    );
    if (savedLink) savedLink.classList.add("active-link");
  }

  // Manejo de clicks mejorado
  links.forEach((link) => {
    link.addEventListener("mousedown", () => {
      // Guardar el enlace activo justo antes de que el navegador cambie la página
      APP_STATE.activeLink = link.getAttribute("href");
      saveState();
    });
  });
}

/*=============== TEMA OSCURO ===============*/
function setupDarkMode() {
  const button = document.getElementById("theme-button");
  if (!button) return;

  const darkClass = "dark-theme";
  const iconClass = "ri-sun-fill";

  // Aplicar estado guardado
  if (APP_STATE.darkMode) {
    document.body.classList.add(darkClass);
    button.classList.add(iconClass);
  }

  // Configurar click
  button.addEventListener("click", () => {
    const isDark = !document.body.classList.contains(darkClass);

    document.body.classList.toggle(darkClass);
    button.classList.toggle(iconClass);

    APP_STATE.darkMode = isDark;
    saveState();
  });
}

/*=============== INICIAR TODO ===============*/
document.addEventListener("DOMContentLoaded", () => {
  const savedScroll = localStorage.getItem("scrollY");
  if (savedScroll) {
    window.scrollTo(0, parseInt(savedScroll, 10));
  }
  setupSidebar();
  setupActiveLinks();
  setupDarkMode();
  setupCourseLists();
  // Debug
  console.log("Estado cargado:", APP_STATE);
  console.log("Ruta actual:", window.location.pathname);
});

// Escucha cambios de localStorage desde otras pestañas
window.addEventListener("storage", (event) => {
  if (event.key === "aetherisState") {
    const newState = JSON.parse(event.newValue);
    if (!newState) return;

    // Actualizar visualmente solo si cambia algo importante
    if (APP_STATE.darkMode !== newState.darkMode) {
      document.body.classList.toggle("dark-theme", newState.darkMode);
      const button = document.getElementById("theme-button");
      if (button) {
        button.classList.toggle("ri-sun-fill", newState.darkMode);
      }
    }

    APP_STATE = newState;
  }
});

window.addEventListener("beforeunload", () => {
  localStorage.setItem("scrollY", window.scrollY);
});

document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname.split("/").pop(); // Ej: 'index.html'

  const menuLinks = document.querySelectorAll("aside a");

  menuLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href.includes(currentPath)) {
      link.classList.add("active-link"); // Cambia esto si usas otra clase de activación
    } else {
      link.classList.remove("active-link");
    }
  });
});
