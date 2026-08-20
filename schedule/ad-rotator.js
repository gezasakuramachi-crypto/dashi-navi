(function () {
  "use strict";

  const ROTATION_INTERVAL_MS = 5000;

  function initializeRotator(rotator) {
    const slides = Array.from(rotator.querySelectorAll("[data-ad-slide]"));
    let activeIndex = 0;
    let timerId = null;

    function showSlide(index) {
      activeIndex = index;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
        slide.tabIndex = isActive ? 0 : -1;
      });
    }

    function start() {
      if (slides.length < 2 || timerId !== null) return;
      timerId = window.setInterval(() => {
        showSlide((activeIndex + 1) % slides.length);
      }, ROTATION_INTERVAL_MS);
    }

    function stop() {
      if (timerId === null) return;
      window.clearInterval(timerId);
      timerId = null;
    }

    showSlide(0);
    start();

    return { start, stop };
  }

  function initializeAdvertisements() {
    const rotators = Array.from(document.querySelectorAll("[data-ad-rotator]"));
    const instances = rotators.map(initializeRotator);

    document.addEventListener("visibilitychange", () => {
      instances.forEach((instance) => {
        if (document.hidden) {
          instance.stop();
        } else {
          instance.start();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAdvertisements, {
      once: true
    });
  } else {
    initializeAdvertisements();
  }
})();
