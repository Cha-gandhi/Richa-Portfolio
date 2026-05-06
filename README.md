# Richa Gandhi Portfolio

Static portfolio website for Richa Gandhi, an interdisciplinary designer creating brand identities, campaigns, layouts, service design work, and digital interfaces.

## Live Site

GitHub Pages URL:

```text
https://cha-gandhi.github.io/Richa-Portfolio/
```

## Project Structure

```text
.
├── index.html                  # Homepage
├── work.html                   # Work listing page
├── styles.css                  # Shared site styles
├── work.css                    # Work page styles
├── case-study.css              # Project detail page styles
├── script.js                   # Homepage project rail
├── work.js                     # Work page rendering
├── photos-carousel.js          # Homepage photos carousel
├── data/
│   └── behance-portfolio.js    # Curated portfolio data used by the site
├── assets/                     # Runtime images and visual assets
└── projects/                   # Case study pages
```

## Local Preview

This site does not need a build step. You can preview it by opening `index.html` in a browser.

For a more reliable local preview, use a simple static server from the project folder:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Deployment

The site is designed to deploy directly with GitHub Pages:

1. Push this repository to GitHub.
2. Open the repository on GitHub.
3. Go to **Settings** → **Pages**.
4. Set **Source** to **Deploy from a branch**.
5. Choose branch `main` and folder `/ (root)`.
6. Save and wait for GitHub Pages to publish.

## Privacy and Security Notes

- Raw third-party export files under `data/raw/` are intentionally excluded from Git because they may contain API-key-like metadata.
- Local browser profile artifacts, crash dumps, temporary files, and local source dumps are excluded via `.gitignore`.
- The public site includes an email contact link by design.
- Before publishing updates, review new files for secrets, personal local paths, and large unused assets.
