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

  /* ---- Copy email ---- */
  const copyBtn = document.querySelector(".copy-email");
  const copyStatus = document.getElementById("copy-status");

  if (copyBtn) {
    const label = copyBtn.textContent;
    let resetTimer = 0;

    const announce = (ok) => {
      copyBtn.textContent = ok ? "Copied" : "Copy failed";
      copyBtn.classList.toggle("is-copied", ok);
      if (copyStatus) copyStatus.textContent = ok ? "Email address copied to clipboard" : "Copy failed";
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        copyBtn.textContent = label;
        copyBtn.classList.remove("is-copied");
      }, 2000);
    };

    /* Older browsers and non-secure contexts: select a hidden field and use execCommand */
    const legacyCopy = (text) => {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(field);
      field.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (err) {
        ok = false;
      }
      field.remove();
      copyBtn.focus();
      return ok;
    };

    copyBtn.addEventListener("click", async () => {
      const text = copyBtn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        announce(true);
      } catch (err) {
        announce(legacyCopy(text));
      }
    });
  }

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

  /* --------------------------------------------------------------------------
     Augmented Practice — Living Stage Controls
     -------------------------------------------------------------------------- */

  /* Stage Tab Navigator (Realistic Workflows) */
  const stageTabs = Array.from(document.querySelectorAll(".stage-tab"));
  const stagePanels = Array.from(document.querySelectorAll(".stage-panel"));
  const stageTitle = document.getElementById("stageScreenTitle");

  const stageTitles = {
    theme: "LIVE DEMO // 01 · ACCESSIBLE COLOR TOKEN GENERATOR",
    synthesis: "LIVE DEMO // 02 · RESEARCH CLUSTERING & BLUEPRINTS",
    edge: "LIVE DEMO // 03 · UI/UX STATE MATRIX & EDGE-CASE ARCHITECTURE",
    metaphor: "LIVE DEMO // 04 · LATENT METAPHOR & CONCEPT PROBES"
  };

  if (stageTabs.length) {
    stageTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.dataset.stage;
        stageTabs.forEach((t) => t.classList.toggle("is-active", t === tab));
        stagePanels.forEach((p) => p.classList.toggle("is-active", p.id === `panel-${key}`));
        if (stageTitle && stageTitles[key]) {
          stageTitle.textContent = stageTitles[key];
        }
      });
    });
  }

  /* Demo 1: Accessible Theme Switcher */
  const demoChips = Array.from(document.querySelectorAll(".demo-chip"));
  const swatchPrimary = document.getElementById("swatchPrimary");
  const swatchPrimaryLabel = document.getElementById("swatchPrimaryLabel");
  const swatchSecondary = document.getElementById("swatchSecondary");
  const swatchSecondaryLabel = document.getElementById("swatchSecondaryLabel");
  const swatchGround = document.getElementById("swatchGround");
  const swatchGroundLabel = document.getElementById("swatchGroundLabel");
  const contrastBadge = document.getElementById("contrastBadge");
  const tokenPathLabel = document.getElementById("tokenPathLabel");
  const renderedCard = document.getElementById("renderedCard");
  const specimenTitle = document.getElementById("specimenTitle");
  const specimenBody = document.getElementById("specimenBody");

  const themePresets = {
    civic: {
      primary: "#bcd7db",
      secondary: "#1e4b52",
      ground: "#f4f2eb",
      badgeText: "WCAG AAA · 7.8:1 PASS",
      tokenPath: "tokens.theme.civic",
      title: "Community Pantry Network",
      body: "Prompt-assisted semantic cascades enforce legible contrast ratios across light and dark client surfaces."
    },
    tech: {
      primary: "#b9d6aa",
      secondary: "#2d4a22",
      ground: "#ecebe8",
      badgeText: "WCAG AAA · 8.4:1 PASS",
      tokenPath: "tokens.theme.industrial",
      title: "Precision Planetary Transmission",
      body: "Algorithmic token hierarchies structure 100+ technical variants with absolute typographic legibility."
    },
    culinary: {
      primary: "#d9aba2",
      secondary: "#8f463b",
      ground: "#fdfbf7",
      badgeText: "WCAG AAA · 9.1:1 PASS",
      tokenPath: "tokens.theme.heirloom",
      title: "Ancestral Culinary Archive",
      body: "Warm earthen harmonies calibrated for archival print publication grids and digital editorial layouts."
    }
  };

  if (demoChips.length) {
    demoChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const themeKey = chip.dataset.theme;
        const data = themePresets[themeKey];
        if (!data) return;

        demoChips.forEach((c) => c.classList.toggle("is-active", c === chip));

        if (swatchPrimary) swatchPrimary.style.background = data.primary;
        if (swatchPrimaryLabel) swatchPrimaryLabel.textContent = data.primary.toUpperCase();
        if (swatchSecondary) swatchSecondary.style.background = data.secondary;
        if (swatchSecondaryLabel) swatchSecondaryLabel.textContent = data.secondary.toUpperCase();
        if (swatchGround) swatchGround.style.background = data.ground;
        if (swatchGroundLabel) swatchGroundLabel.textContent = data.ground.toUpperCase();

        if (contrastBadge) {
          contrastBadge.style.background = data.secondary;
          contrastBadge.style.color = data.ground;
          contrastBadge.textContent = data.badgeText;
        }

        if (tokenPathLabel) tokenPathLabel.textContent = data.tokenPath;
        if (renderedCard) {
          renderedCard.style.background = data.ground;
          renderedCard.style.borderColor = data.primary;
        }
        if (specimenTitle) specimenTitle.textContent = data.title;
        if (specimenBody) {
          specimenBody.textContent = data.body;
          specimenBody.style.color = data.secondary;
        }
      });
    });
  }

  /* Demo 2: Qualitative Research Synthesis (Claude) */
  const synthChips = Array.from(document.querySelectorAll(".synth-chip"));
  const rawQuote1 = document.getElementById("rawQuote1");
  const rawQuote2 = document.getElementById("rawQuote2");
  const hmwTag = document.getElementById("hmwTag");
  const hmwHead = document.getElementById("hmwHead");
  const hmwBody = document.getElementById("hmwBody");

  const synthPresets = {
    isolation: {
      q1: "“I lived here 40 years, but when the high street market shut, I had nowhere to see neighbors.”",
      q2: "“Older residents feel excluded from modern digital ordering kiosks.”",
      tag: "OPPORTUNITY PILLAR 01 // SOCIAL FABRIC",
      head: "How might we turn vacant storefronts into intergenerational co-cooking hubs?",
      body: "Pairing physical community kitchen tables with offline chalkboard noticeboards to re-establish neighborhood connection without digital friction."
    },
    surplus: {
      q1: "“Local grocers throw away crates of perfectly fresh vegetables every evening.”",
      q2: "“Food banks feel stigmatizing for students and working families who just need a hand.”",
      tag: "OPPORTUNITY PILLAR 02 // CIRCULAR LOOP",
      head: "How might we transform surplus food collection into a celebratory community ritual?",
      body: "Designing decentralized pantry drop-boxes and collective recipe cards that celebrate shared meals rather than welfare handouts."
    },
    multilingual: {
      q1: "“The council leaflets are only in formal English, so half our Bengali elders couldn't attend.”",
      q2: "“We don't need translations of bureaucracy—we need visual recipes we all understand.”",
      tag: "OPPORTUNITY PILLAR 03 // INCLUSIVE ACCESS",
      head: "How might we craft universal visual symbology that bridges 12 spoken community tongues?",
      body: "Developing iconography-first recipe kits and color-coded public signage that welcome non-English speakers instantly."
    }
  };

  if (synthChips.length) {
    synthChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const key = chip.dataset.synth;
        const data = synthPresets[key];
        if (!data) return;

        synthChips.forEach((c) => c.classList.toggle("is-active", c === chip));
        if (rawQuote1) rawQuote1.textContent = data.q1;
        if (rawQuote2) rawQuote2.textContent = data.q2;
        if (hmwTag) hmwTag.textContent = data.tag;
        if (hmwHead) hmwHead.textContent = data.head;
        if (hmwBody) hmwBody.textContent = data.body;
      });
    });
  }

  /* Demo 3: UI/UX State Matrix & Edge-Case Architecture */
  const edgeChips = Array.from(document.querySelectorAll(".edge-chip"));
  const edgeNodeTag = document.getElementById("edgeNodeTag");
  const edgeFlowTitle = document.getElementById("edgeFlowTitle");
  const edgeFlowDesc = document.getElementById("edgeFlowDesc");
  const edgeAlertBadge = document.getElementById("edgeAlertBadge");
  const edgeAlertText = document.getElementById("edgeAlertText");
  const edgePulseDot = document.getElementById("edgePulseDot");
  const edgeStatusLabel = document.getElementById("edgeStatusLabel");
  const edgeHandoffTag = document.getElementById("edgeHandoffTag");
  const edgeUiTitle = document.getElementById("edgeUiTitle");
  const edgeUiDesc = document.getElementById("edgeUiDesc");
  const edgeBtnPrimary = document.getElementById("edgeBtnPrimary");
  const edgeMetaNote = document.getElementById("edgeMetaNote");
  const edgeSpecNote = document.getElementById("edgeSpecNote");

  const edgePresets = {
    mmt: {
      nodeTag: "JOURNEY STEP 03 // BOOKING & PERMIT CHECKOUT",
      flowTitle: "High-Altitude Trek Reservation",
      flowDesc: "User attempts to book a high-altitude Himalayan trek and verify permits while at remote mountain trailheads.",
      alertBadge: "EDGE CASE: NETWORK DROPOUT",
      alertText: "Spotty 2G/offline dropout mid-payment causes dropped booking and duplicate bank debits.",
      dotColor: "#e09f3e",
      statusLabel: "OFFLINE SYNC PENDING",
      handoffTag: "STATE: PERMIT_CACHED_LOCAL",
      uiTitle: "Trek Permit Cached Locally",
      uiDesc: "Your Himalayan trek slot is held offline for 6 hours. As soon as you re-enter signal range, payment token syncs automatically with zero duplicate charges.",
      btnText: "View Offline Permit Pass",
      metaNote: "Queue ID: #MMT-TREK-8921 · Auto-retry in background",
      specNote: "HANDOFF SPEC: Graceful degradation UI · SQLite local persistence · Clear manual recovery action"
    },
    cliq: {
      nodeTag: "JOURNEY STEP 04 // ONE-CLICK LUXURY CHECKOUT",
      flowTitle: "Limited Edition Runway Drop",
      flowDesc: "High-concurrency flash release where 4,000 users attempt to checkout 50 limited runway items simultaneously.",
      alertBadge: "EDGE CASE: INVENTORY RACE CONDITION",
      alertText: "Item sells out between cart addition and payment gateway handshake without clear user feedback.",
      dotColor: "#c2410c",
      statusLabel: "CART RECONCILIATION ACTIVE",
      handoffTag: "STATE: INVENTORY_REALLOCATED",
      uiTitle: "Reserved for 90 Seconds",
      uiDesc: "Another shopper began checkout simultaneously. We locked your size for 90 seconds while processing priority token or offering 1-click alternative boutique stock.",
      btnText: "Confirm Priority Checkout",
      metaNote: "Token: #CLIQ-LOCK-402 · 1-click fallback ready",
      specNote: "HANDOFF SPEC: Real-time countdown timer · Non-blocking toast banner · Zero cart dump rate"
    },
    pantry: {
      nodeTag: "JOURNEY STEP 01 // CIVIC SELF-SERVE KIOSK",
      flowTitle: "Student Co-op Pantry Access",
      flowDesc: "Students accessing confidential campus pantry locker stations with varying language and tech comfort.",
      alertBadge: "EDGE CASE: LANGUAGE & TIMEOUT BARRIER",
      alertText: "User hesitates at text-heavy English form; kiosk session times out, creating public embarrassment.",
      dotColor: "#1e4b52",
      statusLabel: "DIGNIFIED NO-RUSH MODE",
      handoffTag: "STATE: VISUAL_ASSIST_ACTIVE",
      uiTitle: "Pictographic Recipe Select",
      uiDesc: "Switching from bureaucratic text input to universal pictographic diet icons (halal, vegan, allergen-safe) with extended session pause.",
      btnText: "Select Visual Food Tiles",
      metaNote: "Touch Mode: High-contrast · 12 visual dialects",
      specNote: "HANDOFF SPEC: Zero session abrupt timeout · Pictogram-first navigation · Stigma-free interface"
    }
  };

  if (edgeChips.length) {
    edgeChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const key = chip.dataset.flow;
        const data = edgePresets[key];
        if (!data) return;

        edgeChips.forEach((c) => c.classList.toggle("is-active", c === chip));
        if (edgeNodeTag) edgeNodeTag.textContent = data.nodeTag;
        if (edgeFlowTitle) edgeFlowTitle.textContent = data.flowTitle;
        if (edgeFlowDesc) edgeFlowDesc.textContent = data.flowDesc;
        if (edgeAlertBadge) edgeAlertBadge.textContent = data.alertBadge;
        if (edgeAlertText) edgeAlertText.textContent = data.alertText;
        if (edgePulseDot) edgePulseDot.style.background = data.dotColor;
        if (edgeStatusLabel) edgeStatusLabel.textContent = data.statusLabel;
        if (edgeHandoffTag) edgeHandoffTag.textContent = data.handoffTag;
        if (edgeUiTitle) edgeUiTitle.textContent = data.uiTitle;
        if (edgeUiDesc) edgeUiDesc.textContent = data.uiDesc;
        if (edgeBtnPrimary) edgeBtnPrimary.textContent = data.btnText;
        if (edgeMetaNote) edgeMetaNote.textContent = data.metaNote;
        if (edgeSpecNote) edgeSpecNote.textContent = data.specNote;
      });
    });
  }

  /* Demo 4: Latent Metaphor Exploration */
  const metaChips = Array.from(document.querySelectorAll(".meta-chip"));
  const metaPrompt = document.getElementById("metaPrompt");
  const metaConcept = document.getElementById("metaConcept");
  const metaMark = document.getElementById("metaMark");

  const metaPresets = {
    food: {
      prompt: "“Communal stew pot, circular sustainable loop, human warmth, woodcut printing textures”",
      concept: "The bowl as an open hand; steam ribbons converging into circular civic community bonds.",
      vectorSvg: `<svg width="130" height="64" viewBox="0 0 130 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Food of Us Vector Mark">
        <circle cx="65" cy="30" r="26" stroke="#bcd7db" stroke-width="1.5" stroke-dasharray="3 2" opacity="0.8"/>
        <path d="M47 32 C49 44, 81 44, 83 32" stroke="#1e4b52" stroke-width="2.5" stroke-linecap="round" fill="color-mix(in oklab, #bcd7db 30%, transparent)"/>
        <path d="M55 28 C55 18, 63 16, 65 10 C67 16, 75 18, 75 28" stroke="#1e4b52" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M60 29 C60 22, 65 20, 65 15 C65 20, 70 22, 70 29" stroke="#bcd7db" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="65" cy="10" r="2.5" fill="#1e4b52"/>
        <circle cx="47" cy="32" r="2" fill="#1e4b52"/>
        <circle cx="83" cy="32" r="2" fill="#1e4b52"/>
        <text x="65" y="55" text-anchor="middle" font-family="Syne, Avenir Next, sans-serif" font-weight="700" font-size="8.5" fill="#16141f" letter-spacing="0.06em">food of us</text>
      </svg>`
    },
    gear: {
      prompt: "“Mechanical gear teeth, planetary orbit, mathematical ratio, kinetic interlocking energy”",
      concept: "Two intersecting torque radii forming an infinite rotation glyph, balancing technical precision with clean minimalism.",
      vectorSvg: `<svg width="130" height="64" viewBox="0 0 130 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Synnova Vector Gear Mark">
        <circle cx="48" cy="27" r="18" stroke="#b9d6aa" stroke-width="1.2" stroke-dasharray="2 2"/>
        <circle cx="48" cy="27" r="14" stroke="#2d4a22" stroke-width="2" fill="color-mix(in oklab, #b9d6aa 25%, transparent)"/>
        <circle cx="48" cy="27" r="4.5" fill="#2d4a22"/>
        <line x1="48" y1="7" x2="48" y2="12" stroke="#2d4a22" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="48" y1="42" x2="48" y2="47" stroke="#2d4a22" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="28" y1="27" x2="33" y2="27" stroke="#2d4a22" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="63" y1="27" x2="68" y2="27" stroke="#2d4a22" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="34" y1="13" x2="38" y2="17" stroke="#2d4a22" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="58" y1="37" x2="62" y2="41" stroke="#2d4a22" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="34" y1="41" x2="38" y2="37" stroke="#2d4a22" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="58" y1="17" x2="62" y2="13" stroke="#2d4a22" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="77" cy="23" r="13" stroke="#b9d6aa" stroke-width="1.2" stroke-dasharray="2 2"/>
        <circle cx="77" cy="23" r="10" stroke="#2d4a22" stroke-width="1.8" fill="color-mix(in oklab, #b9d6aa 40%, transparent)"/>
        <circle cx="77" cy="23" r="3.5" fill="#2d4a22"/>
        <line x1="77" y1="9" x2="77" y2="12" stroke="#2d4a22" stroke-width="2" stroke-linecap="round"/>
        <line x1="77" y1="34" x2="77" y2="37" stroke="#2d4a22" stroke-width="2" stroke-linecap="round"/>
        <line x1="63" y1="23" x2="66" y2="23" stroke="#2d4a22" stroke-width="2" stroke-linecap="round"/>
        <line x1="88" y1="23" x2="91" y2="23" stroke="#2d4a22" stroke-width="2" stroke-linecap="round"/>
        <line x1="67" y1="13" x2="70" y2="16" stroke="#2d4a22" stroke-width="2" stroke-linecap="round"/>
        <line x1="84" y1="30" x2="87" y2="33" stroke="#2d4a22" stroke-width="2" stroke-linecap="round"/>
        <path d="M48 9 C64 7, 80 11, 88 19" stroke="#b9d6aa" stroke-width="1.5" stroke-linecap="round"/>
        <text x="65" y="56" text-anchor="middle" font-family="Syne, Avenir Next, sans-serif" font-weight="800" font-size="8.5" fill="#16141f" letter-spacing="-0.02em">synnova</text>
      </svg>`
    },
    pantry: {
      prompt: "“Student cooperative food bank, wheat stalk, welcoming stamp, dignity, zero stigma”",
      concept: "Organic arch door opening into an ear of grain; designed as a tactile kraft rubber stamp.",
      vectorSvg: `<svg width="130" height="64" viewBox="0 0 130 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="KingsGate Pantry Vector Stamp Mark">
        <path d="M49 46 V25 C49 15, 56 9, 65 9 C74 9, 81 15, 81 25 V46 Z" stroke="#7c511e" stroke-width="1.8" fill="color-mix(in oklab, #efc697 30%, transparent)"/>
        <path d="M53 46 V26 C53 18, 58 13, 65 13 C72 13, 77 18, 77 26 V46" stroke="#efc697" stroke-width="1" stroke-dasharray="2 1.5"/>
        <line x1="65" y1="42" x2="65" y2="19" stroke="#7c511e" stroke-width="1.8" stroke-linecap="round"/>
        <ellipse cx="62" cy="22" rx="3.5" ry="2" transform="rotate(-30 62 22)" fill="#7c511e"/>
        <ellipse cx="68" cy="22" rx="3.5" ry="2" transform="rotate(30 68 22)" fill="#7c511e"/>
        <ellipse cx="61.5" cy="27" rx="4" ry="2" transform="rotate(-25 61.5 27)" fill="#7c511e"/>
        <ellipse cx="68.5" cy="27" rx="4" ry="2" transform="rotate(25 68.5 27)" fill="#7c511e"/>
        <ellipse cx="62" cy="32" rx="4" ry="2" transform="rotate(-20 62 32)" fill="#7c511e"/>
        <ellipse cx="68" cy="32" rx="4" ry="2" transform="rotate(20 68 32)" fill="#7c511e"/>
        <ellipse cx="65" cy="17" rx="2" ry="3.5" fill="#7c511e"/>
        <line x1="43" y1="19" x2="40" y2="17" stroke="#efc697" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="87" y1="19" x2="90" y2="17" stroke="#efc697" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="65" y1="5" x2="65" y2="2" stroke="#efc697" stroke-width="1.5" stroke-linecap="round"/>
        <text x="65" y="55" text-anchor="middle" font-family="Space Mono, monospace" font-weight="700" font-size="7" fill="#16141f" letter-spacing="0.08em">KINGSGATE</text>
      </svg>`
    },
    cooking: {
      prompt: "“Heirloom family recipes, simmer steam, cast-iron skillet, editorial woodblock craft”",
      concept: "Three rhythmic ascending heat curves anchored by a grounded geometric hearth block.",
      vectorSvg: `<svg width="130" height="64" viewBox="0 0 130 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stories of Cooking Vector Mark">
        <path d="M54 18 C59 12, 59 6, 54 2" stroke="#8f463b" stroke-width="2" stroke-linecap="round"/>
        <path d="M65 16 C71 10, 71 4, 65 0" stroke="#d9aba2" stroke-width="2" stroke-linecap="round"/>
        <path d="M76 18 C81 12, 81 6, 76 2" stroke="#8f463b" stroke-width="2" stroke-linecap="round"/>
        <rect x="44" y="21" width="42" height="26" rx="3" fill="#16141f"/>
        <text x="65" y="32" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="7" fill="#fdfbf7" letter-spacing="0.05em">STORIES</text>
        <text x="65" y="41" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="5.5" fill="#d9aba2" letter-spacing="0.05em">OF COOKING</text>
        <line x1="38" y1="51" x2="92" y2="51" stroke="#8f463b" stroke-width="1.5" stroke-linecap="round"/>
        <text x="65" y="59" text-anchor="middle" font-family="Space Mono, monospace" font-size="5.8" fill="#16141f" letter-spacing="0.08em">HEIRLOOM PRESS</text>
      </svg>`
    }
  };

  if (metaChips.length) {
    metaChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const brief = chip.dataset.brief;
        const data = metaPresets[brief];
        if (!data) return;

        metaChips.forEach((c) => c.classList.toggle("is-active", c === chip));
        if (metaPrompt) metaPrompt.textContent = data.prompt;
        if (metaConcept) metaConcept.textContent = data.concept;
        if (metaMark && data.vectorSvg) {
          metaMark.innerHTML = data.vectorSvg;
        }
      });
    });
  }
})();
