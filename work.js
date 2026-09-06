/*
  Work index: renders discipline sections as asymmetric rows.
  Content comes from data/behance-portfolio.js plus a few externally hosted projects.
*/
(function () {
  "use strict";

  function titleCase(value) {
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function normalizeCategory(project) {
    const label = `${project.displayCategory || ""} ${project.primaryCategory || ""} ${project.title || ""}`.toLowerCase();

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

  /** Titles whose artwork is a mark on white — printed on an accent plate via multiply. */
  const markStyleTitles = new Set([
    "Dailyhunt Brand Identity",
    "Brand Development",
    "Medcycle - Brand development",
    "Logo Design for Kingsgate Student Pantry",
    "Visual Design for Tata Cliq",
    "Stories of Cooking",
    "Food of Us",
    "Feature Addition in Make My Trip App",
    "User Research for a hackathon",
    "Synnova Gears and Transmissions"
  ]);

  const chroma = window.Chroma;
  const accentFor = (title) => (chroma && chroma.accentFor(title)) || "#efc697";

  function formatProject(project) {
    const coverPath = project.coverLocalPath || "";
    const image = workFolderImageByBehanceTitle[project.title] || coverPath;

    const titleOverrides = {
      "Brand Development": "Medcycle - Brand development"
    };

    const displayTitle = titleOverrides[project.title] || project.title;

    return {
      title: displayTitle,
      year:
        yearOverrides[displayTitle] ||
        yearOverrides[project.title] ||
        project.year ||
        project.publishedYear ||
        "Selected work",
      category: normalizeCategory(project),
      categoryLabel:
        project.displayCategory || titleCase(normalizeCategory(project)).replace("Uxui", "UXUI"),
      description:
        descriptionOverrides[displayTitle] ||
        descriptionOverrides[project.title] ||
        project.recruiterSummary ||
        project.description ||
        "A curated portfolio project with supporting visuals and concise metadata.",
      image,
      link: project.url,
      isMark: markStyleTitles.has(project.title) || markStyleTitles.has(displayTitle),
      accent: accentFor(displayTitle) || accentFor(project.title)
    };
  }

  const excludedTitles = new Set([
    "Advertisement Campaign Design",
    "Internship Works",
    "Identity Branding",
    "Logofolio"
  ]);

  function external(entry) {
    return Object.assign(
      {
        description: descriptionOverrides[entry.title] || "",
        isMark: markStyleTitles.has(entry.title),
        accent: accentFor(entry.title)
      },
      entry
    );
  }

  const serviceProjects = [
    external({
      title: "Food of Us",
      year: "2023 to 2024",
      category: "service",
      categoryLabel: "Service / Design Thinking",
      image: workAsset("food-of-us.png"),
      link: "https://www.notion.so/FOOD-OF-US-33d5cfa216a98108b39bd153c5d3afc7?source=copy_link"
    })
  ];

  const uxProjects = [
    external({
      title: "Synnova Gears and Transmissions",
      year: "2025",
      category: "uxui",
      categoryLabel: "UXUI",
      image: workAsset("synnova-gears-and-transmissions-logo.png"),
      link: "https://www.notion.so/SYNNOVA-GEARS-TRANSMISSION-UXUI-Design-33d5cfa216a9818e9db2f4921ff4b6c8?source=copy_link"
    }),
    external({
      title: "User Research for a hackathon",
      year: "2023",
      category: "uxui",
      categoryLabel: "UXUI",
      image: workAsset("User Research for a hackathon.png"),
      link: "https://gandhir7070.wixsite.com/portfolio/portfolio"
    }),
    external({
      title: "Feature Addition in Make My Trip App",
      year: "2019",
      category: "uxui",
      categoryLabel: "UXUI",
      image: workAsset("book-your-trek-in-a-go.png.png"),
      link: "https://www.behance.net/gallery/92959377/Feature-Addition-in-Make-My-Trip-App"
    })
  ];

  const projects = (window.__BEHANCE_PORTFOLIO__?.projects || [])
    .filter((project) => !excludedTitles.has(project.title))
    .map(formatProject)
    .sort((a, b) => a.title.localeCompare(b.title));

  const projectByTitle = new Map(projects.map((project) => [project.title, project]));

  const visualLead = [
    external({
      title: "Stories of Cooking",
      year: "2023",
      category: "visual",
      categoryLabel: "Visual Design",
      image: workAsset("visual-identity-and-branding-design-for-research-project.png"),
      link: "https://www.behance.net/gallery/182067115/Stories-of-Cooking"
    }),
    projectByTitle.get("Logo Design for Kingsgate Student Pantry"),
    projectByTitle.get("Dailyhunt Brand Identity"),
    projectByTitle.get("Medcycle - Brand development")
  ].filter(Boolean);

  const visualRest = projects.filter(
    (project) =>
      project.category === "visual" &&
      !["Logo Design for Kingsgate Student Pantry", "Dailyhunt Brand Identity", "Medcycle - Brand development"].includes(
        project.title
      )
  );

  const groups = [
    { id: "visual", index: "01", title: "Visual Design", projects: [...visualLead, ...visualRest] },
    { id: "service", index: "02", title: "Service Design & Design Thinking", projects: serviceProjects },
    { id: "uxui", index: "03", title: "UXUI Design", projects: uxProjects }
  ];

  function mediaMarkup(project) {
    if (!project.image) {
      return `<a class="row-media is-placeholder" href="${project.link}" target="_blank" rel="noreferrer"><span>${project.title}</span></a>`;
    }
    const kind = project.isMark ? "is-mark" : "is-cover";
    const mark = project.isMark && chroma ? chroma.markFor(project.title) : null;
    const src = mark ? mark.src : project.image;
    const zoom = mark ? mark.zoom : 1;
    return `
      <a class="row-media ${kind}" href="${project.link}" target="_blank" rel="noreferrer" aria-label="${project.title} — open project">
        <img src="${src}" alt="${project.title} ${project.isMark ? "mark" : "cover"}" style="--zoom:${zoom}" loading="lazy" decoding="async" />
      </a>
    `;
  }

  function rowMarkup(project) {
    return `
      <li class="row" data-accent="${project.accent}" style="--accent:${project.accent}">
        ${mediaMarkup(project)}
        <div class="row-body">
          <p class="row-meta mono">${project.year} &middot; ${project.categoryLabel}</p>
          <h3 class="row-title">${project.title}</h3>
          <p class="row-desc">${project.description}</p>
          <a class="link-plain" href="${project.link}" target="_blank" rel="noreferrer">Open project</a>
        </div>
      </li>
    `;
  }

  function sectionMarkup(group) {
    const count = group.projects.length;
    return `
      <section class="discipline" id="${group.id}" aria-labelledby="${group.id}-title">
        <header class="discipline-head">
          <span class="mono">${group.index}</span>
          <h2 id="${group.id}-title">${group.title}</h2>
          <span class="mono count">${count} ${count === 1 ? "project" : "projects"}</span>
        </header>
        <ol class="rows">
          ${group.projects.map(rowMarkup).join("")}
        </ol>
      </section>
    `;
  }

  const target = document.getElementById("work-sections");

  if (target) {
    target.innerHTML = groups.map(sectionMarkup).join("");

    target.querySelectorAll(".row-media img").forEach((img) => {
      img.addEventListener("error", () => {
        const media = img.closest(".row-media");
        if (!media) return;
        media.classList.remove("is-mark", "is-cover");
        media.classList.add("is-placeholder");
        media.innerHTML = `<span>${img.alt.replace(/\s+(mark|cover)$/i, "")}</span>`;
      });
    });

    if (chroma) {
      chroma.watch(target.querySelectorAll(".row"), { rootMargin: "-38% 0px -38% 0px" });
    }
  }
})();
