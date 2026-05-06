(function () {
  "use strict";

  const viewport = document.querySelector(".photo-carousel-viewport");
  const track = document.getElementById("photo-track");
  const btnPrev = document.getElementById("photo-prev");
  const btnNext = document.getElementById("photo-next");

  if (!viewport || !track || !btnPrev || !btnNext) return;

  const slides = Array.from(track.querySelectorAll(".photo-carousel-slide"));
  if (!slides.length) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let currentIndex = 0;

  function updateButtons() {
    btnPrev.disabled = currentIndex <= 0;
    btnNext.disabled = currentIndex >= slides.length - 1;
  }

  /* Centre the target slide inside the scrollable viewport directly via scrollLeft.
     This avoids scrollIntoView fighting with scroll-snap on variable-width slides. */
  function scrollToSlide(index, instant) {
    const slide = slides[index];
    if (!slide) return;
    const targetLeft = slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;
    viewport.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: instant || prefersReduced ? "instant" : "smooth"
    });
  }

  /* Keep is-active class in sync via IntersectionObserver (visual dimming only).
     currentIndex is updated eagerly on click so buttons never freeze. */
  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-active", entry.isIntersecting);
        });
      },
      {
        root: viewport,
        threshold: 0.5
      }
    );
    slides.forEach((slide) => observer.observe(slide));
  } else {
    slides[0].classList.add("is-active");
  }

  /* --- prev / next controls --- */
  btnPrev.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateButtons();
      scrollToSlide(currentIndex);
    }
  });

  btnNext.addEventListener("click", () => {
    if (currentIndex < slides.length - 1) {
      currentIndex++;
      updateButtons();
      scrollToSlide(currentIndex);
    }
  });

  /* --- keyboard navigation when carousel is focused --- */
  document.getElementById("photo-carousel").addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && currentIndex > 0) {
      e.preventDefault();
      currentIndex--;
      updateButtons();
      scrollToSlide(currentIndex);
    } else if (e.key === "ArrowRight" && currentIndex < slides.length - 1) {
      e.preventDefault();
      currentIndex++;
      updateButtons();
      scrollToSlide(currentIndex);
    }
  });

  /* --- initial state --- */
  slides[0].classList.add("is-active");
  updateButtons();
  scrollToSlide(0, true);
})();
