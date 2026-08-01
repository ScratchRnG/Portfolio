const buttons = document.querySelectorAll(".nav-btn");
const panelsContainer = document.querySelector(".panels");
const panels = document.querySelectorAll(".panel");
const viewport = document.querySelector(".panel-viewport");

let activeIndex = 0;

function isMobileLayout() {
  return window.innerWidth <= 768;
}

function slideTo(index, shouldScroll = false) {
  if (
    !viewport ||
    !panelsContainer ||
    !buttons.length ||
    !panels.length
  ) {
    return;
  }

  activeIndex = index;

  // Update navigation button
  buttons.forEach((button) => {
    button.classList.remove("active");
  });

  buttons[index]?.classList.add("active");

  // Update active panel
  panels.forEach((panel) => {
    panel.classList.remove("active");
  });

  panels[index]?.classList.add("active");

  if (isMobileLayout()) {
    /*
      Mobile uses a normal block layout.
      Do not move the entire panel container horizontally.
    */
    panelsContainer.style.transform = "none";

    if (shouldScroll) {
      document.querySelector(".content-card")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  } else {
    /*
      Desktop keeps the horizontal slider.
    */
    const viewportWidth =
      viewport.getBoundingClientRect().width;

    panelsContainer.style.transform =
      `translateX(-${index * viewportWidth}px)`;
  }
}

buttons.forEach((button, index) => {
  button.addEventListener("click", () => {
    slideTo(index, true);
  });
});

window.addEventListener("resize", () => {
  slideTo(activeIndex);
});

/* THEME TOGGLE */
const themeToggle = document.getElementById("theme-toggle");
const themeFlash = document.querySelector(".theme-flash");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light-mode");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    const isLight =
      document.body.classList.contains("light-mode");

    localStorage.setItem(
      "theme",
      isLight ? "light" : "dark"
    );

    // Star animation
    themeToggle.classList.remove("animate");
    void themeToggle.offsetWidth;
    themeToggle.classList.add("animate");

    // Ripple/glow effect
    if (themeFlash) {
      themeFlash.classList.remove("active");
      void themeFlash.offsetWidth;
      themeFlash.classList.add("active");
    }
  });
}

/* SCROLL REVEAL */
function setupReveal() {
  const revealTargets = document.querySelectorAll(
    ".section-subtitle, " +
    ".doing-card, " +
    ".project-card, " +
    ".experience-card, " +
    ".skill-pill, " +
    ".cert-card, " +
    ".map-container, " +
    ".contact-form"
  );

  if (!revealTargets.length) {
    return;
  }

  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");

    const staggerGroup =
      element.classList.contains("doing-card") ||
      element.classList.contains("project-card") ||
      element.classList.contains("cert-card") ||
      element.classList.contains("skill-pill");

    if (staggerGroup) {
      element.classList.add(
        `reveal-delay-${(index % 4) + 1}`
      );
    }
  });

  // Fallback for older browsers
  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => {
      element.classList.add("is-visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealTargets.forEach((element) => {
    observer.observe(element);
  });
}

/* PAGE LOAD */
window.addEventListener("load", () => {
  slideTo(activeIndex);

  const loader = document.getElementById("loader");

  if (loader) {
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 800);
  }

  setupReveal();
});
