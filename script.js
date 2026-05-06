const fallbackProjects = [
  {
    title: "Visual Design for Tata Cliq",
    category: "visual",
    label: "Campaign visuals",
    size: "large",
    accent: "#f1b993",
    year: "Featured",
    displayCategory: "Visual design",
    description:
      "A retail-facing visual design project focused on polished brand communication and promotional storytelling.",
    link: "https://www.behance.net/gallery/209064377/Visual-Design-for-Tata-Cliq"
  },
  {
    title: "Visual Identity and Branding Design for Research Project",
    category: "branding",
    label: "Identity system",
    size: "medium",
    accent: "#d6a4a4",
    year: "Branding",
    displayCategory: "Branding",
    description:
      "Identity-led work exploring logo, color, and system thinking for a clearer and more cohesive brand presence.",
    link: "https://www.behance.net/gallery/182067115/Visual-Identity-and-Branding-Design-for-GLA-Project"
  },
  {
    title: "Feature Addition in Make My Trip App",
    category: "ux",
    label: "Product concept",
    size: "medium",
    accent: "#c2d5a8",
    year: "UX / Product",
    displayCategory: "UX / Product",
    description:
      "A product thinking exercise imagining a useful new feature inside an established travel experience.",
    link: "https://www.behance.net/gallery/92959377/Feature-Addition-in-Make-My-Trip-App"
  },
  {
    title: "Publication Design",
    category: "editorial",
    label: "Editorial layout",
    size: "small",
    accent: "#cdb8f0",
    year: "Editorial",
    displayCategory: "Editorial",
    description:
      "Layout-driven design balancing hierarchy, rhythm, and readability across publication pages.",
    link: "https://www.behance.net/gallery/174901151/Publication-Design"
  },
  {
    title: "Social Media Marketing Design",
    category: "visual",
    label: "Social campaigns",
    size: "small",
    accent: "#f2d37d",
    year: "Visual design",
    displayCategory: "Visual design",
    description:
      "Digital campaign assets designed to maintain consistency while staying flexible across multiple social touchpoints.",
    link: "https://www.behance.net/gallery/176669991/Social-Media-Marketing-Design"
  },
  {
    title: "Dailyhunt Brand Identity",
    category: "branding",
    label: "Brand identity",
    size: "small",
    accent: "#f0aa9d",
    year: "Identity",
    displayCategory: "Branding",
    description:
      "A branding exploration that builds recognition through thoughtful form, tone, and application choices.",
    link: "https://www.behance.net/gallery/109862931/Dailyhunt-Brand-Identity"
  },
  {
    title: "Brand Development",
    category: "branding",
    label: "Brand system",
    size: "medium",
    accent: "#a6d2d6",
    year: "Strategy",
    displayCategory: "Branding",
    description:
      "Work that connects visual character with strategic positioning to support long-term brand consistency.",
    link: "https://www.behance.net/gallery/100507857/Brand-Development"
  },
  {
    title: "Identity Branding",
    category: "branding",
    label: "Identity design",
    size: "small",
    accent: "#f3c6d5",
    year: "Logo + system",
    displayCategory: "Branding",
    description:
      "An identity project built around recognisable marks, consistent styling, and strong first impressions.",
    link: "https://www.behance.net/gallery/101267043/Identity-Branding"
  },
  {
    title: "Advertisement Campaign Design",
    category: "visual",
    label: "Ad campaign",
    size: "small",
    accent: "#c6c0a2",
    year: "Campaign",
    displayCategory: "Visual design",
    description:
      "Advertising concepts composed for visual recall, clear messaging, and strong campaign cohesion.",
    link: "https://www.behance.net/gallery/100813737/Advertisement-Campaign-Design"
  },
  {
    title: "Internship Works",
    category: "visual",
    label: "Studio work",
    size: "small",
    accent: "#b7c8f8",
    year: "Archive",
    displayCategory: "Visual design",
    description:
      "A snapshot of formative studio work that demonstrates range, adaptability, and craft across assignments.",
    link: "https://www.behance.net/gallery/95235423/Internship-Works"
  },
  {
    title: "Logofolio",
    category: "branding",
    label: "Logo collection",
    size: "medium",
    accent: "#f1b4c8",
    year: "Marks",
    displayCategory: "Branding",
    description:
      "A compact showcase of logo explorations revealing versatility across industries, tones, and visual styles.",
    link: "https://www.behance.net/gallery/102042799/Logofolio"
  }
];

function normalizeCategory(value) {
  const input = (value || "").toLowerCase();

  if (input.includes("brand") || input.includes("identity") || input.includes("logo")) {
    return "branding";
  }

  if (input.includes("ux") || input.includes("ui") || input.includes("app") || input.includes("product")) {
    return "ux";
  }

  if (input.includes("publication") || input.includes("editorial") || input.includes("book")) {
    return "editorial";
  }

  return "visual";
}

function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapImportedProject(project) {
  const category = normalizeCategory(project.primaryCategory || project.displayCategory || "");
  const coverPath = project.coverLocalPath || "";
  /** Avoid `/behance/thumbs/` — thumbnails are often not bundled with this repo */
  const tagMap = {
    branding: ["Branding", "Visual Design"],
    visual: ["Visual Design", "Brand Systems"],
    ux: ["Service Design", "Design Research", "Participatory Design"],
    editorial: ["Editorial Design", "Layout Systems"]
  };

  const isResearchProject = project.id === "182067115";

  return {
    id: project.id,
    title: isResearchProject ? "Visual Identity and Branding Design for Research Project" : project.title,
    category,
    label: project.label || "Case study",
    size: project.size || "medium",
    accent: project.accent || "#e0c3ad",
    year: project.year || "Selected work",
    displayCategory: project.displayCategory || titleCase(category).replace("Ux", "UX"),
    description: project.description,
    link: project.url,
    image: coverPath,
    previewImage: "",
    homeImage: isResearchProject
      ? "./assets/Work/visual-identity-and-branding-design-for-research-project.png"
      : undefined,
    tags: tagMap[category] || [project.displayCategory || "Design"],
    views: project.views || "",
    appreciations: project.appreciations || "",
    sortYear: Number.parseInt(String(project.year || ""), 10) || Number.NEGATIVE_INFINITY,
    linkLabel: "Open case study"
  };
}

const importedProjects =
  window.__BEHANCE_PORTFOLIO__?.projects?.map(mapImportedProject).filter(Boolean) || [];

const featuredRailExcludedTitles = new Set(["Social Media Marketing Design"]);

function normalizeTitleKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const featuredRailOverrides = {
  "Logo Design for Kingsgate Student Pantry": {
    year: "2023",
    thumbPosition: "50% 50%",
    /** Scale > 1 zooms past `.project-image-wrap { overflow: hidden }` and clips */
    thumbScale: 1,
    homeImage: "./assets/Work/logo-design-for-kingsgate-student-pantry.png",
    thumbFit: "contain",
    thumbBackground: "#ffffff",
    thumbPadding: "24px"
  },
  "Visual Design for Tata Cliq": {
    year: "2021",
    thumbPosition: "50% 50%",
    thumbScale: 1,
    thumbFit: "contain",
    thumbBackground: "#ffffff",
    thumbPadding: "16px",
    homeImage: "./assets/Work/visual-design-for-tata-cliq-frame-1.png"
  },
  "Visual Identity and Branding Design for Research Project": {
    displayTitle: "Stories of cooking",
    thumbPosition: "50% 50%",
    thumbScale: 1,
    thumbFit: "cover",
    homeImage: "./assets/Work/visual-identity-and-branding-design-for-research-project.png",
    link: "https://www.behance.net/gallery/182067115/Stories-of-Cooking"
  },
  "Publication Design": {
    replaceWith: "synnova"
  }
};

const projects = (importedProjects.length > 0 ? importedProjects : fallbackProjects)
  .filter((project) => !featuredRailExcludedTitles.has(project.title))
  .slice()
  .sort((a, b) => (b.sortYear ?? Number.NEGATIVE_INFINITY) - (a.sortYear ?? Number.NEGATIVE_INFINITY))
  .slice(0, 5);

const featuredProjects = projects.map((project) => ({
  ...project,
  ...(featuredRailOverrides[project.title] || {})
}));

const foodOfUsProject = {
  title: "Food of Us",
  category: "service",
  label: "Service design",
  size: "medium",
  accent: "#d7cfb0",
  year: "2023 to 2024",
  displayCategory: "Service / Design Thinking",
  description: "A service design and design thinking project exploring community, food, and systems insight.",
  link: "https://www.notion.so/FOOD-OF-US-33d5cfa216a98108b39bd153c5d3afc7?source=copy_link",
  linkLabel: "Open project",
  image: "./assets/Work/food-of-us.png",
  homeImage: "./assets/Work/food-of-us.png"
};

const synnovaProject = {
  title: "Synnova Gears and Transmissions",
  category: "ux",
  label: "UXUI Design",
  size: "medium",
  accent: "#b9d6aa",
  year: "2025",
  displayCategory: "UXUI Design",
  description: "A UXUI design project focused on a clearer product and interface experience for Synnova Gears and Transmissions.",
  link: "https://www.notion.so/SYNNOVA-GEARS-TRANSMISSION-UXUI-Design-33d5cfa216a9818e9db2f4921ff4b6c8?source=copy_link",
  linkLabel: "Open project",
  image: "./assets/Work/synnova-gears-and-transmissions-logo.png",
  homeImage: "./assets/Work/synnova-gears-and-transmissions-logo.png",
  thumbPosition: "50% 50%",
  thumbScale: 1,
  thumbFit: "contain",
  thumbBackground: "#ffffff",
  thumbPadding: "24px"
};

function findFeaturedProject(title) {
  return featuredProjects.find((project) => normalizeTitleKey(project.title) === normalizeTitleKey(title));
}

const orderedFeaturedRailProjects = [
  synnovaProject,
  foodOfUsProject,
  {
    ...findFeaturedProject("Visual Identity and Branding Design for Research Project"),
    ...(featuredRailOverrides["Visual Identity and Branding Design for Research Project"] || {})
  },
  {
    ...findFeaturedProject("Logo Design for Kingsgate Student Pantry"),
    ...(featuredRailOverrides["Logo Design for Kingsgate Student Pantry"] || {})
  },
  {
    ...findFeaturedProject("Visual Design for Tata Cliq"),
    ...(featuredRailOverrides["Visual Design for Tata Cliq"] || {})
  }
].filter(Boolean);

const featuredRailProjects = orderedFeaturedRailProjects.map((project) => ({
  ...project,
  title: project.displayTitle || project.title
}));

const rail = document.querySelector("#project-rail");

function applyImageFallbacks(container) {
  container.querySelectorAll(".project-image-wrap img").forEach((img) => {
    img.addEventListener("error", () => {
      const wrap = img.closest(".project-image-wrap");
      if (!wrap) return;
      const label = img.alt.replace(/\s+cover$/i, "") || "Project image unavailable";
      wrap.classList.add("project-image-placeholder");
      wrap.innerHTML = `<span>${label}</span>`;
    });
  });
}

function projectCardMarkup(project, className = "rail-card") {
  const imageMarkup = project.usePlaceholder
    ? `<div class="project-image-wrap project-image-placeholder" aria-hidden="true"><span>${project.title}</span></div>`
    : `<a class="project-image-wrap" href="${project.link}" target="_blank" rel="noreferrer" style="--thumb-position:${project.thumbPosition || "50% 50%"}; --thumb-scale:${project.thumbScale || 1}; --thumb-fit:${project.thumbFit || "cover"}; --thumb-padding:${project.thumbPadding || "0"};">
        <img src="${project.homeImage || project.previewImage || project.image || "./assets/behance/covers/visual-design-for-tata-cliq.png"}" alt="${project.title} cover" loading="lazy" decoding="async" width="1200" height="900" style="background:${project.thumbBackground || "transparent"};" />
      </a>`;

  return `
    <article class="project-card ${className}" style="--card-accent:${project.accent}">
      ${imageMarkup}
      <div class="project-content">
        <p class="project-meta">${project.year}</p>
        <h3>${project.title}</h3>
        <p class="project-category">${project.displayCategory}</p>
        <a class="project-link" href="${project.link}" target="_blank" rel="noreferrer">
          ${project.linkLabel}
        </a>
      </div>
    </article>
  `;
}

function renderProjects() {
  if (!rail) return;
  if (!featuredRailProjects.length) {
    rail.innerHTML = `<p class="project-category">Featured projects will be added soon.</p>`;
    return;
  }
  rail.innerHTML = featuredRailProjects.map((project) => projectCardMarkup(project)).join("");
  applyImageFallbacks(rail);
}

renderProjects();

(function () {
  const railViewport = document.querySelector(".project-rail");
  const btnPrev = document.getElementById("rail-prev");
  const btnNext = document.getElementById("rail-next");
  if (!railViewport || !btnPrev || !btnNext) return;

  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getCards() {
    return Array.from(railViewport.querySelectorAll(".rail-card"));
  }

  if (!getCards().length) {
    btnPrev.disabled = true;
    btnNext.disabled = true;
    return;
  }

  let currentIdx = 0;

  function updateButtons(cards) {
    btnPrev.disabled = currentIdx <= 0;
    btnNext.disabled = currentIdx >= cards.length - 1;
  }

  function scrollToCard(idx, instant) {
    const cards = getCards();
    const card = cards[idx];
    if (!card) return;
    card.scrollIntoView({
      behavior: instant || prefersReduced ? "instant" : "smooth",
      inline: "center",
      block: "nearest"
    });
  }

  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            currentIdx = getCards().indexOf(entry.target);
            updateButtons(getCards());
          }
        });
      },
      { root: railViewport, threshold: 0.6 }
    );
    requestAnimationFrame(() => {
      getCards().forEach((c) => observer.observe(c));
      updateButtons(getCards());
    });
  }

  btnPrev.addEventListener("click", () => {
    if (currentIdx > 0) {
      currentIdx--;
      updateButtons(getCards());
      scrollToCard(currentIdx);
    }
  });
  btnNext.addEventListener("click", () => {
    const cards = getCards();
    if (currentIdx < cards.length - 1) {
      currentIdx++;
      updateButtons(cards);
      scrollToCard(currentIdx);
    }
  });
})();
