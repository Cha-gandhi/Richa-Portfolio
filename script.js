/*
  Home page: featured five + process chapters + craft section.
  Motion: process sticky index, chromatic accent shift (hero scroll motion is pure CSS).
*/
(function () {
  "use strict";

  const hero = document.querySelector(".hero");

  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.Chroma && typeof window.Chroma.watch === "function" && hero) {
    window.Chroma.watch([hero]);
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---- Clipboard helper, shared by the email button and the palette swatches ---- */
  async function copyText(text, returnFocusTo) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      /* Older browsers and non-secure contexts: select a hidden field and use execCommand */
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(field);
      field.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      field.remove();
      if (returnFocusTo) returnFocusTo.focus();
      return ok;
    }
  }

  /* ---- Copy email ---- */
  const copyBtn = document.querySelector(".copy-email");
  const copyStatus = document.getElementById("copy-status");

  if (copyBtn) {
    const label = copyBtn.textContent;
    let resetTimer = 0;

    copyBtn.addEventListener("click", async () => {
      const ok = await copyText(copyBtn.dataset.copy, copyBtn);
      copyBtn.textContent = ok ? "Copied" : "Copy failed";
      copyBtn.classList.toggle("is-copied", ok);
      if (copyStatus) copyStatus.textContent = ok ? "Email address copied to clipboard" : "Copy failed";
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        copyBtn.textContent = label;
        copyBtn.classList.remove("is-copied");
      }, 2000);
    });
  }

  /* ---- Palette swatches: click to copy a colour ---- */
  document.querySelectorAll(".acc-swatch").forEach((swatch) => {
    const note = swatch.parentElement.querySelector(".acc-swatch-note");
    let hideTimer = 0;

    swatch.addEventListener("click", async () => {
      const hex = swatch.dataset.hex;
      const ok = await copyText(hex, swatch);
      if (!note) return;
      note.textContent = ok ? `Copied ${hex}` : "Copy failed";
      note.classList.add("is-visible");
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => note.classList.remove("is-visible"), 1800);
    });
  });

  /* ---- Current role: compute the running duration instead of hard-coding it ---- */
  document.querySelectorAll(".ledger-duration[data-since]").forEach((el) => {
    const [y, m] = el.dataset.since.split("-").map(Number);
    const now = new Date();
    const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m) + 1;
    if (!Number.isFinite(months) || months < 1) return;
    const years = Math.floor(months / 12);
    const rest = months % 12;
    const parts = [];
    if (years) parts.push(`${years} yr`);
    if (rest) parts.push(`${rest} mos`);
    el.textContent = `${parts.join(" ")} \u00b7 Active`;
  });

  /* ---- Process: numerals roll up once, as the row scrolls into view ---- */
  const processSteps = document.getElementById("process-steps");

  if (processSteps && !reduceMotion && typeof IntersectionObserver !== "undefined") {
    Array.from(processSteps.children).forEach((step, i) => step.style.setProperty("--i", i));
    processSteps.classList.add("is-ready");

    const processIo = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.2 }
    );
    processIo.observe(processSteps);
  }

  /* --------------------------------------------------------------------------
     Selected work accordion
     - the spine buttons are the controls (click, Enter and Space all work)
     - on a fine pointer, hovering only opens a panel after a short pause, so
       moving the cursor across the row does not make the layout flicker
     - the open project's colour is handed to the page through Chroma
     -------------------------------------------------------------------------- */
  const accPanels = Array.from(document.querySelectorAll(".acc-panel"));

  if (accPanels.length) {
    const finePointer =
      window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const wide = () => window.matchMedia("(min-width: 1101px)").matches;
    let intentTimer = 0;

    const open = (panel) => {
      accPanels.forEach((p) => {
        const on = p === panel;
        p.classList.toggle("is-expanded", on);
        const btn = p.querySelector(".acc-spine");
        if (btn) btn.setAttribute("aria-expanded", String(on));
      });
      const accent = panel.dataset.accent;
      if (accent && window.Chroma && typeof window.Chroma.setAccent === "function") {
        window.Chroma.setAccent(accent);
      }
    };

    accPanels.forEach((panel) => {
      const spine = panel.querySelector(".acc-spine");
      if (!spine) return;

      spine.addEventListener("click", () => {
        window.clearTimeout(intentTimer);
        open(panel);
      });

      if (finePointer) {
        panel.addEventListener("mouseenter", () => {
          if (!wide() || panel.classList.contains("is-expanded")) return;
          window.clearTimeout(intentTimer);
          intentTimer = window.setTimeout(() => open(panel), 140);
        });
        panel.addEventListener("mouseleave", () => window.clearTimeout(intentTimer));
      }
    });

    /* Arrow keys move between spines, like a tab list */
    accPanels.forEach((panel, i) => {
      const spine = panel.querySelector(".acc-spine");
      if (!spine) return;
      spine.addEventListener("keydown", (event) => {
        const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        let next = i;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (i + 1) % accPanels.length;
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (i - 1 + accPanels.length) % accPanels.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = accPanels.length - 1;
        accPanels[next].querySelector(".acc-spine").focus();
      });
    });
  }
})();
