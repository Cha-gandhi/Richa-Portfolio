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
    "User Research for a hackathon":
      "A 10-day UX case study for a college club management app, from the UXUI Hackathon run by IIT Guwahati. I worked as UX researcher and UX designer in a team of three.",
    "Synnova Gears and Transmissions":
      "A website redesign for a tractor-gear manufacturer, done with the team at Cognito, India. I designed the desktop and mobile interface in Figma."
  };

  /*
    Real project imagery only. Web-sized frames live in assets/previews (cropped from the
    case-study boards); Food of Us uses a photo from the workshops. A project with no real
    imagery in the repo gets no image block — it renders as a text-led row instead of a
    redrawn logo on a coloured plate.
  */
  const imageByTitle = {
    "Stories of Cooking": {
      src: "./assets/previews/stories.jpg",
      alt: "Hands holding a Stories of Cooking recipe book with a doodle-covered cover",
      position: "50% 50%"
    },
    "Logo Design for Kingsgate Student Pantry": {
      src: "./assets/previews/kingsgate.jpg",
      alt: "Sketchbook pages exploring logo ideas for KingsGate Student Pantry",
      position: "50% 50%"
    },
    "Dailyhunt Brand Identity": {
      src: "./assets/previews/dailyhunt.jpg",
      alt: "Dailyhunt logo on a roadside billboard showing text in many Indian scripts",
      position: "50% 50%"
    },
    "Medcycle - Brand development": {
      src: "./assets/previews/medcycle.jpg",
      alt: "Medcycle stationery, phone and tablet screens on a terracotta surface",
      position: "50% 30%"
    },
    "Visual Design for Tata Cliq": {
      src: "./assets/previews/tata-cliq.jpg",
      alt: "Tata CLiQ promotional blog layouts shown on a phone screen",
      position: "50% 40%"
    },
    "Publication Design": {
      src: "./assets/previews/publication.jpg",
      alt: "Open book spread from the Goan traditional paintings publication",
      position: "50% 50%"
    },
    "Social Media Marketing Design": {
      src: "./assets/previews/social-media.jpg",
      alt: "Three social media cards with bold purple and yellow typography",
      position: "50% 50%"
    },
    "Synnova Gears and Transmissions": {
      src: "./assets/Work/Portfolio_cover_image.webp",
      alt: "Mockup of the redesigned Synnova website on a tilted screen, with the Synnova logo beside it",
      position: "50% 50%"
    },
    "User Research for a hackathon": {
      src: "./assets/previews/hackathon.jpg",
      alt: "Case study cover for a college club management app, with tablet screens showing chat, a dashboard and a task calendar",
      position: "50% 40%"
    },
    "Food of Us": {
      src: "./assets/photos/2.jpg",
      alt: "The Food of Us team in hi-vis vests in front of a green wall with bunting and project posters",
      position: "50% 30%"
    }
  };

  const chroma = window.Chroma;
  const accentFor = (title) => (chroma && chroma.accentFor(title)) || "#efc697";

  function formatProject(project) {
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
      image: imageByTitle[displayTitle] || imageByTitle[project.title] || null,
      link: project.url,
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
        image: imageByTitle[entry.title] || null,
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
      link: "https://www.notion.so/FOOD-OF-US-33d5cfa216a98108b39bd153c5d3afc7?source=copy_link"
    })
  ];

  const uxProjects = [
    external({
      title: "Synnova Gears and Transmissions",
      year: "2025",
      category: "uxui",
      categoryLabel: "UXUI",
      link: "https://www.notion.so/SYNNOVA-GEARS-TRANSMISSION-UXUI-Design-33d5cfa216a9818e9db2f4921ff4b6c8?source=copy_link"
    }),
    external({
      title: "User Research for a hackathon",
      year: "2023",
      category: "uxui",
      categoryLabel: "UXUI",
      link: "https://gandhir7070.wixsite.com/portfolio/portfolio"
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
    if (!project.image) return "";
    const { src, alt, position } = project.image;
    /* Mouse and touch shortcut to the project; keyboard users get the "Open project" link below. */
    return `
      <a class="row-media" href="${project.link}" target="_blank" rel="noreferrer" tabindex="-1">
        <img src="${src}" alt="${alt}" style="--pos:${position}" width="1400" height="933" loading="lazy" decoding="async" />
      </a>
    `;
  }

  function rowMarkup(project) {
    const hasMedia = Boolean(project.image);
    return `
      <li class="row${hasMedia ? "" : " row-text"}" data-accent="${project.accent}" style="--accent:${project.accent}">
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

    /* If an image fails to load, drop the block so the row reads as a text row. */
    target.querySelectorAll(".row-media img").forEach((img) => {
      img.addEventListener("error", () => {
        const media = img.closest(".row-media");
        const row = img.closest(".row");
        if (media) media.remove();
        if (row) row.classList.add("row-text");
      });
    });

    if (chroma) {
      chroma.watch(target.querySelectorAll(".row"), { rootMargin: "-38% 0px -38% 0px" });
    }
  }
})();
