const buttons = document.querySelectorAll('.nav-btn');
const panelsContainer = document.querySelector('.panels');
const panels = document.querySelectorAll('.panel');

buttons.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    // Nav button state
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Slide panels
    panelsContainer.style.transform = `translateX(-${i * 100}%)`;

    // Panel active state 
    panels.forEach(p => p.classList.remove('active'));
    panels[i].classList.add('active');
  });
});

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");

  setTimeout(() => {
    loader.classList.add("hidden");
  }, 800); //for SOH loading.
});
