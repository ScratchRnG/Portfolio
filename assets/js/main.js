const buttons = document.querySelectorAll('.nav-btn');
const panelsContainer = document.querySelector('.panels');
const panels = document.querySelectorAll('.panel');
const viewport = document.querySelector('.panel-viewport');

function slideTo(index) {
  if (!viewport || !panelsContainer || !buttons.length || !panels.length) return;

  const viewportWidth = viewport.getBoundingClientRect().width;
  panelsContainer.style.transform = `translateX(-${index * viewportWidth}px)`;

  buttons.forEach(b => b.classList.remove('active'));
  if (buttons[index]) buttons[index].classList.add('active');

  panels.forEach(p => p.classList.remove('active'));
  if (panels[index]) panels[index].classList.add('active');
}

let activeIndex = 0;

buttons.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    activeIndex = i;
    slideTo(i);
  });
});

window.addEventListener('resize', () => {
  slideTo(activeIndex);
});

/* THEME TOGGLE */
const themeToggle = document.getElementById('theme-toggle');
const themeFlash = document.querySelector('.theme-flash');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
  document.body.classList.add('light-mode');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');

    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');

    /* star animation */
    themeToggle.classList.remove('animate');
    void themeToggle.offsetWidth;
    themeToggle.classList.add('animate');

    /* ripple / glow effect */
    if (themeFlash) {
      themeFlash.classList.remove('active');
      void themeFlash.offsetWidth;
      themeFlash.classList.add('active');
    }
  });
}

/* SCROLL RVEAL*/
function setupReveal() {
  const revealTargets = document.querySelectorAll(
    '.section-subtitle, .doing-card, .project-card, .experience-card, .skill-pill, .cert-card, .map-container, .contact-form'
  );

  if (!revealTargets.length) return;

  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');

    const staggerGroup =
      el.classList.contains('doing-card') ||
      el.classList.contains('project-card') ||
      el.classList.contains('cert-card') ||
      el.classList.contains('skill-pill');

    if (staggerGroup) {
      el.classList.add(`reveal-delay-${(index % 4) + 1}`);
    }
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealTargets.forEach(el => observer.observe(el));
}

/* PAGE LOAD*/
window.addEventListener('load', () => {
  slideTo(activeIndex);

  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 800);
  }

  setupReveal();
});
