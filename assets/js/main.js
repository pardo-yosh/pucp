/*=============== FUNCIONALIDAD PARA LISTAS DE CURSOS ===============*/

// Configuración y constantes
const COURSE_CONFIG = {
  selectors: {
    dropdownBtn: ".dropdown-btn",
    dropdownContent: ".dropdown-content",
    courseCard: ".course-card",
  },
  classes: {
    active: "active",
    expanded: "expanded",
  },
  attributes: {
    expanded: "aria-expanded",
  },
  animations: {
    duration: 300,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

// Estado del sistema de dropdowns
const DropdownState = {
  activeDropdown: null,
  isTransitioning: false,
};

/**
 * Inicializa el sistema de listas de cursos
 */
function setupCourseLists() {
  try {
    initializeDropdowns();
    initializeCourseCards();
    setupGlobalEventListeners();
  } catch (error) {
    console.error("Error al inicializar las listas de cursos:", error);
  }
}

/**
 * Inicializa los dropdowns con event delegation
 */
function initializeDropdowns() {
  const container = document.body;

  // Event delegation para mejor rendimiento
  container.addEventListener("click", handleDropdownClick);

  // Configurar ARIA attributes iniciales
  document
    .querySelectorAll(COURSE_CONFIG.selectors.dropdownBtn)
    .forEach((btn) => {
      if (!btn.hasAttribute(COURSE_CONFIG.attributes.expanded)) {
        btn.setAttribute(COURSE_CONFIG.attributes.expanded, "false");
      }
    });
}

/**
 * Maneja los clicks en dropdowns usando event delegation
 */
function handleDropdownClick(event) {
  const dropdownBtn = event.target.closest(COURSE_CONFIG.selectors.dropdownBtn);

  if (!dropdownBtn) return;

  event.stopPropagation();
  event.preventDefault();

  // Prevenir clicks durante transiciones
  if (DropdownState.isTransitioning) return;

  const dropdown = getDropdownContent(dropdownBtn);
  if (!dropdown) return;

  toggleDropdown(dropdownBtn, dropdown);
}

/**
 * Obtiene el contenido del dropdown asociado al botón
 */
function getDropdownContent(btn) {
  return btn.nextElementSibling?.matches(
    COURSE_CONFIG.selectors.dropdownContent
  )
    ? btn.nextElementSibling
    : null;
}

/**
 * Alterna el estado de un dropdown
 */
function toggleDropdown(btn, dropdown) {
  const isCurrentlyExpanded =
    btn.getAttribute(COURSE_CONFIG.attributes.expanded) === "true";

  if (isCurrentlyExpanded) {
    closeDropdown(btn, dropdown);
  } else {
    // Cerrar otros dropdowns primero
    closeAllDropdowns();
    openDropdown(btn, dropdown);
  }
}

/**
 * Abre un dropdown específico
 */
function openDropdown(btn, dropdown) {
  DropdownState.isTransitioning = true;
  DropdownState.activeDropdown = dropdown;

  // Animación de apertura
  requestAnimationFrame(() => {
    dropdown.classList.add(COURSE_CONFIG.classes.active);
    btn.setAttribute(COURSE_CONFIG.attributes.expanded, "true");
    btn.classList.add(COURSE_CONFIG.classes.expanded);

    // Completar transición
    setTimeout(() => {
      DropdownState.isTransitioning = false;
    }, COURSE_CONFIG.animations.duration);
  });
}

/**
 * Cierra un dropdown específico
 */
function closeDropdown(btn, dropdown) {
  DropdownState.isTransitioning = true;

  dropdown.classList.remove(COURSE_CONFIG.classes.active);
  btn.setAttribute(COURSE_CONFIG.attributes.expanded, "false");
  btn.classList.remove(COURSE_CONFIG.classes.expanded);

  if (DropdownState.activeDropdown === dropdown) {
    DropdownState.activeDropdown = null;
  }

  setTimeout(() => {
    DropdownState.isTransitioning = false;
  }, COURSE_CONFIG.animations.duration);
}

/**
 * Cierra todos los dropdowns abiertos
 */
function closeAllDropdowns() {
  const openDropdowns = document.querySelectorAll(
    `${COURSE_CONFIG.selectors.dropdownContent}.${COURSE_CONFIG.classes.active}`
  );

  openDropdowns.forEach((dropdown) => {
    const btn = dropdown.previousElementSibling;
    if (btn?.matches(COURSE_CONFIG.selectors.dropdownBtn)) {
      closeDropdown(btn, dropdown);
    }
  });
}

/**
 * Inicializa las tarjetas de curso con efectos optimizados
 */
function initializeCourseCards() {
  const courseCards = document.querySelectorAll(
    COURSE_CONFIG.selectors.courseCard
  );

  // Usar CSS custom properties para mejor rendimiento
  courseCards.forEach((card) => {
    // Configurar propiedades CSS iniciales si no existen
    if (!card.style.getPropertyValue("--hover-transform")) {
      card.style.setProperty("--hover-transform", "translateY(0)");
      card.style.setProperty(
        "--hover-shadow",
        "0 4px 20px var(--shadow-color)"
      );
    }

    // Event listeners optimizados
    card.addEventListener("mouseenter", () => handleCardHover(card, true), {
      passive: true,
    });
    card.addEventListener("mouseleave", () => handleCardHover(card, false), {
      passive: true,
    });

    // Soporte para dispositivos táctiles
    card.addEventListener("touchstart", () => handleCardTouch(card, true), {
      passive: true,
    });
    card.addEventListener("touchend", () => handleCardTouch(card, false), {
      passive: true,
    });
  });
}

/**
 * Maneja el efecto hover de las tarjetas
 */
function handleCardHover(card, isHovering) {
  // Usar requestAnimationFrame para mejor rendimiento
  requestAnimationFrame(() => {
    if (isHovering) {
      card.style.setProperty("--hover-transform", "translateY(-8px)");
      card.style.setProperty(
        "--hover-shadow",
        "0 12px 28px var(--shadow-color)"
      );
      card.classList.add("card-hover");
    } else {
      card.style.setProperty("--hover-transform", "translateY(0)");
      card.style.setProperty(
        "--hover-shadow",
        "0 4px 20px var(--shadow-color)"
      );
      card.classList.remove("card-hover");
    }
  });
}

/**
 * Maneja el efecto táctil de las tarjetas
 */
function handleCardTouch(card, isTouching) {
  if (isTouching) {
    card.classList.add("card-touch");
  } else {
    setTimeout(() => {
      card.classList.remove("card-touch");
    }, 150);
  }
}

/**
 * Configura los event listeners globales
 */
function setupGlobalEventListeners() {
  // Cerrar dropdowns al hacer click fuera
  document.addEventListener("click", closeAllDropdowns);

  // Cerrar dropdowns con Escape
  document.addEventListener("keydown", handleKeyboardNavigation);

  // Manejar redimensionamiento de ventana
  window.addEventListener("resize", debounce(handleWindowResize, 250));
}

/**
 * Maneja la navegación por teclado
 */
function handleKeyboardNavigation(event) {
  if (event.key === "Escape") {
    closeAllDropdowns();
  }

  // Navegación con Tab
  if (event.key === "Tab" && DropdownState.activeDropdown) {
    const focusableElements = DropdownState.activeDropdown.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      // Gestionar el foco dentro del dropdown
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}

/**
 * Maneja el redimensionamiento de ventana
 */
function handleWindowResize() {
  // Cerrar dropdowns en dispositivos móviles al cambiar orientación
  if (window.innerWidth < 768) {
    closeAllDropdowns();
  }
}

/**
 * Función debounce para optimizar eventos frecuentes
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

/**
 * API pública para control externo
 */
const CourseListAPI = {
  /**
   * Abre un dropdown específico por selector
   */
  openDropdown(selector) {
    const btn = document.querySelector(selector);
    const dropdown = btn ? getDropdownContent(btn) : null;
    if (btn && dropdown) {
      closeAllDropdowns();
      openDropdown(btn, dropdown);
    }
  },

  /**
   * Cierra un dropdown específico por selector
   */
  closeDropdown(selector) {
    const btn = document.querySelector(selector);
    const dropdown = btn ? getDropdownContent(btn) : null;
    if (btn && dropdown) {
      closeDropdown(btn, dropdown);
    }
  },

  /**
   * Cierra todos los dropdowns
   */
  closeAll() {
    closeAllDropdowns();
  },

  /**
   * Obtiene el estado actual
   */
  getState() {
    return {
      activeDropdown: DropdownState.activeDropdown,
      isTransitioning: DropdownState.isTransitioning,
    };
  },
};

// CSS optimizado para las animaciones (agregar a tu stylesheet)
const optimizedCSS = `
/* Animaciones optimizadas para dropdowns */
.dropdown-content {
  transition: all ${COURSE_CONFIG.animations.duration}ms ${COURSE_CONFIG.animations.easing};
  transform-origin: top;
  will-change: transform, opacity;
}

.dropdown-content:not(.active) {
  transform: scaleY(0.95) translateY(-10px);
  opacity: 0;
  pointer-events: none;
}

.dropdown-content.active {
  transform: scaleY(1) translateY(0);
  opacity: 1;
  pointer-events: all;
}

/* Animaciones optimizadas para tarjetas */
.course-card {
  transition: transform 0.3s ${COURSE_CONFIG.animations.easing}, 
              box-shadow 0.3s ${COURSE_CONFIG.animations.easing};
  transform: var(--hover-transform, translateY(0));
  box-shadow: var(--hover-shadow, 0 4px 20px var(--shadow-color));
  will-change: transform, box-shadow;
}

.course-card.card-hover {
  transform: var(--hover-transform);
  box-shadow: var(--hover-shadow);
}

.course-card.card-touch {
  transform: scale(0.98);
}

/* Mejoras de accesibilidad */
.dropdown-btn:focus-visible {
  outline: 2px solid var(--primary-color, #007bff);
  outline-offset: 2px;
}

.dropdown-btn.expanded {
  background-color: var(--active-bg, rgba(0, 123, 255, 0.1));
}

/* Optimización para dispositivos móviles */
@media (max-width: 768px) {
  .course-card {
    transition-duration: 0.2s;
  }
  
  .dropdown-content {
    transition-duration: 200ms;
  }
}

/* Reducir movimiento para usuarios que lo prefieren */
@media (prefers-reduced-motion: reduce) {
  .course-card,
  .dropdown-content {
    transition: none;
  }
}
`;

// Exponer API globalmente
window.CourseListAPI = CourseListAPI;

// Auto-inicialización
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupCourseLists);
} else {
  setupCourseLists();
}
