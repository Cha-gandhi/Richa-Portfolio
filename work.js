function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeCategory(project) {
  const label = `${project.displayCategory || ""} ${project.primaryCategory || ""} ${project.title || ""}`
    .toLowerCase();

  if (
    label.includes("ux") ||
    label.includes("ui") ||
    label.includes("app") ||
    label.includes("interface") ||
    label.includes("product")
  ) {
    return "uxui";
  }

  if (
    label.includes("brand") ||
    label.includes("identity") ||
    label.includes("logo") ||
    label.includes("strategy") ||
    label.includes("development")
  ) {
    return "service";
  }

  return "visual";
}

const yearOverrides = {
  "Synnova Gears and Transmissions": "2025",
  "Logo Design for Kingsgate Student Pantry": "2025",
  "Food of Us": "2023 to 2024",
  "Stories of Cooking": "2023",
  "User Research for a hackathon": "2023",
  "Visual Design for Tata Cliq": "2021",
  "Publication Design": "2021",
  "Social Media Marketing Design": "2021",
  "Feature Addition in Make My Trip App": "2019",
  "Feature Addition in Make My Trip App.": "2019",
  "Dailyhunt Brand Identity": "2019",
  "Brand Development": "2019",
  "Medcycle - Brand development": "2019"
};

const descriptionOverrides = {
  "Publication Design":
    "An editorial design project focused on publication layout, visual rhythm, and clear storytelling through designing images and collages from Goan traditional paintings for print-based communication.",
  "Social Media Marketing Design":
    "A visual design project creating social media assets with consistent hierarchy, brand tone, and campaign-ready communication.",
  "Stories of Cooking":
    "A visual identity and storytelling project exploring food, memory, community, and research-led brand expression with Kingston University and in collaboration with Mayor of London.",
  "Logo Design for Kingsgate Student Pantry":
    "A logo and identity direction created for a student pantry, balancing clarity, warmth, and community recognition.",
  "Visual Design for Tata Cliq":
    "Promotional blog and campaign visuals designed to support branded digital communication with clean hierarchy and consistency.",
  "Dailyhunt Brand Identity":
    "A brand identity exploration focused on form, recognition, and a flexible visual system for digital communication.",
  "Medcycle - Brand development":
    "A brand development project shaping a clearer identity, tone, and visual language for a reuse-led service concept.",
  "Food of Us":
    "A service design project using research, community engagement, and food stories to understand shared experiences and needs.",
  "Feature Addition in Make My Trip App":
    "A UX concept exploring a new travel-booking feature through user flow, hierarchy, and interface thinking.",
  "Feature Addition in Make My Trip App.":
    "A UX concept exploring a new travel-booking feature through user flow, hierarchy, and interface thinking.",
  "User Research for a hackathon":
    "A research-led project translating user insights into clearer problem framing, opportunity areas, and design direction.",
  "Synnova Gears and Transmissions":
    "A UXUI project for an industrial brand, focused on improving product communication, structure, and user understanding."
};

const WORK_ASSETS_DIR = "./assets/Work";

function workAsset(filename) {
  return `${WORK_ASSETS_DIR}/${encodeURIComponent(filename)}`;
}

/** Behance catalog `project.title` → curated file under `assets/Work` */
const workFolderImageByBehanceTitle = {
  "Publication Design": workAsset("publication-design-thumbnail-edited.png"),
  "Social Media Marketing Design": workAsset("social-media-marketing-design.png"),
  "Visual Design for Tata Cliq": workAsset("visual-design-for-tata-cliq-frame-1.png"),
  "Dailyhunt Brand Identity": workAsset("Dailyhunt Brand Identity - thumnail imgae 1.png"),
  "Brand Development": workAsset("medcycle-brand-development.png"),
  "Logo Design for Kingsgate Student Pantry": workAsset("logo-design-for-kingsgate-student-pantry.png")
};

/**
 * Behance raw titles that render as centered logo tiles (not full covers).
 */
const behanceLogoStyleTitles = new Set([
  "Dailyhunt Brand Identity",
  "Brand Development",
  "Logo Design for Kingsgate Student Pantry"
]);

const LOGO_CARD_STYLE = Object.freeze({
  imageFit: "contain",
  imageBackground: "#ffffff",
  imagePadding: "24px"
});

const COVER_CARD_STYLE = Object.freeze({
  imageFit: "cover",
  imageBackground: "transparent",
  imagePadding: "0"
});

function formatProject(project) {
  const coverPath = project.coverLocalPath || "";
  /** Prefer exported covers — generated `/thumbs/` paths may not exist locally */
  let image = workFolderImageByBehanceTitle[project.title] || coverPath;

  const titleOverrides = {
    "Brand Development": "Medcycle - Brand development"
  };

  const displayTitle = titleOverrides[project.title] || project.title;

  const useLogoTile = behanceLogoStyleTitles.has(project.title);
  const style = useLogoTile ? LOGO_CARD_STYLE : COVER_CARD_STYLE;

  return {
    title: displayTitle,
    year: yearOverrides[displayTitle] || yearOverrides[project.title] || project.year || project.publishedYear || "Selected work",
    category: normalizeCategory(project),
    categoryLabel:
      project.displayCategory ||
      titleCase(normalizeCategory(project)).replace("Uxui", "UXUI").replace("Service", "Service"),
    description:
      descriptionOverrides[displayTitle] ||
      descriptionOverrides[project.title] ||
      project.recruiterSummary ||
      project.description ||
      "A curated portfolio project with supporting visuals and concise metadata.",
    image,
    link: project.url,
    linkLabel: "Link to Work",
    imageFit: style.imageFit,
    imageBackground: style.imageBackground,
    imagePadding: style.imagePadding
  };
}

const excludedTitles = new Set([
  "Advertisement Campaign Design",
  "Internship Works",
  "Identity Branding",
  "Logofolio"
]);

const externalServiceLinks = [
  {
    title: "Food of Us",
    year: "2023 to 2024",
    category: "service",
    categoryLabel: "Service / Design Thinking",
    description: descriptionOverrides["Food of Us"],
    image: workAsset("food-of-us.png"),
    link: "https://www.notion.so/FOOD-OF-US-33d5cfa216a98108b39bd153c5d3afc7?source=copy_link",
    linkLabel: "Link to Work",
    imageFit: "cover",
    imageBackground: "transparent",
    imagePadding: "0"
  }
];

const externalUxLinks = [
  {
    title: "Feature Addition in Make My Trip App",
    year: "2019",
    category: "uxui",
    categoryLabel: "UXUI",
    description: descriptionOverrides["Feature Addition in Make My Trip App"],
    image: workAsset("book-your-trek-in-a-go.png.png"),
    link: "https://www.behance.net/gallery/92959377/Feature-Addition-in-Make-My-Trip-App",
    linkLabel: "Link to Work",
    ...LOGO_CARD_STYLE
  },
  {
    title: "User Research for a hackathon",
    year: "2023",
    category: "uxui",
    categoryLabel: "UXUI",
    description: descriptionOverrides["User Research for a hackathon"],
    image: workAsset("User Research for a hackathon.png"),
    link: "https://gandhir7070.wixsite.com/portfolio/portfolio",
    linkLabel: "Link to Work",
    ...LOGO_CARD_STYLE
  },
  {
    title: "Synnova Gears and Transmissions",
    year: "2025",
    category: "uxui",
    categoryLabel: "UXUI",
    description: descriptionOverrides["Synnova Gears and Transmissions"],
    image: workAsset("synnova-gears-and-transmissions-logo.png"),
    link: "https://www.notion.so/SYNNOVA-GEARS-TRANSMISSION-UXUI-Design-33d5cfa216a9818e9db2f4921ff4b6c8?source=copy_link",
    linkLabel: "Link to Work",
    ...LOGO_CARD_STYLE
  }
];

const projects = (window.__BEHANCE_PORTFOLIO__?.projects || [])
  .filter((project) => !excludedTitles.has(project.title))
  .map(formatProject)
  .sort((a, b) => a.title.localeCompare(b.title));

const projectByTitle = new Map(projects.map((project) => [project.title, project]));

const externalVisualLinks = [
  {
    title: "Stories of Cooking",
    year: "2023",
    category: "visual",
    categoryLabel: "Visual Design",
    description: descriptionOverrides["Stories of Cooking"],
    image: workAsset("visual-identity-and-branding-design-for-research-project.png"),
    link: "https://www.behance.net/gallery/182067115/Stories-of-Cooking",
    linkLabel: "Link to Work",
    ...COVER_CARD_STYLE
  }
];

const serviceProjects = externalServiceLinks;
const uxProjects = externalUxLinks;

const visualFeaturedProjects = [
  ...externalVisualLinks,
  projectByTitle.get("Logo Design for Kingsgate Student Pantry"),
  projectByTitle.get("Dailyhunt Brand Identity"),
  projectByTitle.get("Medcycle - Brand development")
].filter(Boolean);

const groups = {
  visual: {
    title: "Visual Design",
    note: "",
    projects: []
  },
  service: {
    title: "Service Design & Design Thinking",
    note: "",
    projects: serviceProjects
  },
  uxui: {
    title: "UXUI Design",
    note: "",
    projects: uxProjects
  }
};

projects.forEach((project) => {
  if (project.category === "visual") {
    groups.visual.projects.push(project);
  }
});

groups.visual.projects = [
  ...visualFeaturedProjects,
  ...groups.visual.projects.filter(
    (project) =>
      ![
        "Logo Design for Kingsgate Student Pantry",
        "Dailyhunt Brand Identity",
        "Brand Development",
        "Medcycle - Brand development"
      ].includes(project.title)
  )
];

const sectionOrder = ["visual", "service", "uxui"];
const target = document.querySelector("#work-sections");

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

function cardMarkup(project) {
  const imageMarkup = project.image
    ? `<img src="${project.image}" alt="${project.title} cover" loading="lazy" decoding="async" width="1200" height="900" style="object-fit:${project.imageFit || "cover"}; background:${project.imageBackground || "transparent"}; padding:${project.imagePadding || "0"}; box-sizing:border-box;" />`
    : `<div class="project-image-placeholder"><span>${project.title}</span></div>`;

  return `
    <article class="project-card work-card">
      <a class="project-image-wrap" href="${project.link}" target="_blank" rel="noreferrer">
        ${imageMarkup}
      </a>
      <div class="project-content">
        <p class="project-meta">${project.year}</p>
        <h3>${project.title}</h3>
        <p class="project-category">${project.categoryLabel}</p>
        <p>${project.description}</p>
        ${project.linkLabel ? `<a class="project-link" href="${project.link}" target="_blank" rel="noreferrer">${project.linkLabel}</a>` : ""}
      </div>
    </article>
  `;
}

function sectionMarkup(key) {
  const group = groups[key];

  return `
    <section class="work-section">
      <div class="work-section-head">
        <div>
          <p class="eyebrow">${group.title}</p>
        </div>
        ${group.note ? `<p class="work-section-note">${group.note}</p>` : ""}
      </div>
      <div class="work-grid">
        ${group.projects.map(cardMarkup).join("")}
      </div>
    </section>
  `;
}

if (target) {
  target.innerHTML = sectionOrder.map(sectionMarkup).join("");
  applyImageFallbacks(target);
}
