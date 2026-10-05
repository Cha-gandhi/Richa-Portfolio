/*
  Chromatic Practice — shared color engine.
  Sets --project-accent on <html> from whichever project is active, so the
  ground, wash, and nav dot follow the work. Shared by index.html and work.html.
*/
window.Chroma = (function () {
  "use strict";

  const root = document.documentElement;
  const DEFAULT = "#efc697";

  /* Accents are drawn from the existing project data. Keys are normalized titles. */
  const ACCENTS = {
    synnovagearsandtransmissions: "#b9d6aa",
    foodofus: "#bcd7db",
    storiesofcooking: "#d9aba2",
    visualidentityandbrandingdesignforresearchproject: "#d9aba2",
    visualidentityandbrandingdesignforglaproject: "#d9aba2",
    logodesignforkingsgatestudentpantry: "#efc697",
    visualdesignfortatacliq: "#e8b7c4",
    publicationdesign: "#d3c0ef",
    socialmediamarketingdesign: "#f2d37d",
    dailyhuntbrandidentity: "#f0aa9d",
    medcyclebranddevelopment: "#a6d2d6",
    branddevelopment: "#a6d2d6",
    featureadditioninmakemytripapp: "#c2d5a8",
    userresearchforahackathon: "#cdd3e8",
    logofolio: "#f1b4c8",
    identitybranding: "#f3c6d5",
    advertisementcampaigndesign: "#c6c0a2",
    internshipworks: "#b7c8f8"
  };

  /*
    Lightweight marks (assets/marks) — SVG when possible (true alpha);
    PNG marks must be transparent so they sit on the stamp shape, not in a white box.
  */
  const MARKS = {
    synnovagearsandtransmissions: { src: "./assets/marks/synnova.svg", zoom: 1 },
    foodofus: { src: "./assets/marks/food-of-us.png", zoom: 1 },
    storiesofcooking: { src: "./assets/marks/stories.svg", zoom: 1 },
    logodesignforkingsgatestudentpantry: { src: "./assets/marks/kingsgate.svg", zoom: 1 },
    visualdesignfortatacliq: { src: "./assets/marks/tata-cliq.svg", zoom: 1 },
    dailyhuntbrandidentity: { src: "./assets/marks/dailyhunt.png", zoom: 1 },
    medcyclebranddevelopment: { src: "./assets/marks/medcycle.png", zoom: 1 },
    featureadditioninmakemytripapp: { src: "./assets/marks/mmt.png", zoom: 1 },
    userresearchforahackathon: { src: "./assets/marks/hackathon.png", zoom: 1 }
  };

  function key(title) {
    return String(title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  function accentFor(title) {
    return ACCENTS[key(title)] || null;
  }

  function markFor(title) {
    return MARKS[key(title)] || null;
  }

  let current = null;
  let pending = null;
  let raf = 0;

  /* Coalesce accent writes to one paint per frame — critical during filmstrip scrub. */
  function setAccent(hex) {
    if (!hex || hex === current) return;
    pending = hex;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!pending || pending === current) return;
      current = pending;
      root.style.setProperty("--project-accent", current);
    });
  }

  function reset() {
    setAccent(DEFAULT);
  }

  /* Nav gains a tinted backdrop once the hero scrolls away. */
  const nav = document.getElementById("site-nav");
  if (nav) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        nav.classList.toggle("is-scrolled", window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /*
    Watch elements carrying data-accent. The one occupying the center band of
    the viewport wins; hover/focus wins immediately on pointer devices.
  */
  function watch(elements, options) {
    const list = Array.from(elements || []);
    if (!list.length) return () => {};
    const opts = Object.assign({ rootMargin: "-40% 0px -40% 0px", threshold: 0 }, options || {});

    list.forEach((el) => {
      el.addEventListener("pointerenter", () => setAccent(el.dataset.accent));
      el.addEventListener("focusin", () => setAccent(el.dataset.accent));
    });

    if (typeof IntersectionObserver === "undefined") return () => {};

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setAccent(entry.target.dataset.accent);
      });
    }, opts);

    list.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }

  reset();

  return { setAccent, accentFor, markFor, reset, watch, DEFAULT, ACCENTS, MARKS, key };
})();
