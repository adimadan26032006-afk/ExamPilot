import anime from "animejs";

export function animateStaggered(selector, options = {}) {
  const targets = typeof selector === "string" ? window.document.querySelectorAll(selector) : selector;
  if (!targets.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  const { stagger = 55, ...animeOptions } = options;
  return anime({
    targets,
    opacity: [0, 1],
    translateY: [12, 0],
    delay: anime.stagger(stagger),
    duration: 420,
    easing: "easeOutCubic",
    ...animeOptions,
  });
}

export function animateHero(selector = ".hero-motion") {
  const targets = window.document.querySelectorAll(selector);
  if (!targets.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  return anime({
    targets,
    opacity: [0, 1],
    translateY: [18, 0],
    delay: anime.stagger(90),
    duration: 620,
    easing: "easeOutQuart",
  });
}

export function observeReveal(selector = ".scroll-reveal") {
  const elements = window.document.querySelectorAll(selector);
  if (!elements.length) return () => { };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return () => { };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -32px" }
  );

  elements.forEach((element) => observer.observe(element));
  return () => observer.disconnect();
}
