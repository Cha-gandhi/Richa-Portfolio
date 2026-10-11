# UI review session log

Branch: `ui-review-fixes` (branched from `main` at `c580e95`, the merged redesign).
Purpose: a full UI, motion and interaction review of the portfolio, then the fixes.
Local check: `python -m http.server 8123`, verified at 1440px (desktop) and 390px (mobile).

This log is meant to be read at merge time: what changed, why, what was decided, and what is still open.

---

## 1. How the session started

- The first review was run against a stale checkout (the old portfolio). The repo was switched to the latest `main` (fast-forward to `c580e95`) and the review was redone on the merged redesign.
- The review covered UI issues, motion, and interaction. Findings drove everything below.

## 2. Completed work (in commit order)

| Commit | Area | What changed | Why |
| --- | --- | --- | --- |
| `b22d8bf` | Work page | Removed the big redrawn logos in boxes. Each project now shows real work imagery (`assets/previews/*.jpg`, 50-190 KB each). Projects with no imagery render as text rows with an accent rule. Removed `chroma.markFor` usage here. | The redrawn marks were inaccurate representations of the real logos and were not wanted. |
| `fc88080` | Homepage "Selected work" accordion | Rebuilt markup, CSS, JS. Real imagery. Spines are real `<button>`s in headings with `aria-expanded` / `aria-controls`, panels are `role="region"`. Arrow / Home / End keys move between spines. Hover opens a panel only after ~140 ms on fine pointers, desktop only. Open project's colour goes through `Chroma.setAccent`. Desktop uses flex-grow expand; at 1100px and below the panels stack and unfold with `grid-template-rows: 0fr -> 1fr`. Removed dead filmstrip JS and CSS (`featuredRail`, `.frame*`, `.film-track`). Added `.visually-hidden`. | Fixed the mobile blank-card bug, the inner scrollbar, no keyboard access, the hover flicker, and the inline-style colour hack. |
| `ed95f33` | Mobile nav / hero | All three nav links now fit at 390px (colour dot hidden, tighter tracking), 44px tap targets, hairline under the nav once scrolled, nav background 96% opaque. Hid the dangling hero "-" separator on small screens. | Contact was cut off on mobile; tap targets were too small. |
| `286a7ab` | Chroma safety | The two `window.Chroma` calls in `script.js` check the method is a function. | Hardening. The accent update itself was already verified working at runtime (`--project-accent` and the wash follow the clicked panel). |
| `b37d09c` | Synnova copy | Replaced invented copy ("CAD viewer", "design tokens") with what the Notion case study says: a website redesign for a tractor-gear manufacturer, desktop and mobile. | Copy must match the real case study. |
| `7f1c0fd` | Synnova image | Added `assets/previews/synnova.jpg`, a cropped hero capture of synnova.in. Used on the homepage and the Work page. Removed the text-only panel CSS (`.acc-inner-text`). | There was no project imagery for Synnova. |
| `d3be263` | Synnova credit | Card now says it is part of a team redesign and names the role (visual designer). Tags: Visual designer / Team project / Figma + Photoshop. | Richa worked on it as an employee and designed part of it. The card must not claim sole authorship. |

## 3. Decisions made

- No big logos in boxes anywhere. Real project imagery only.
- Synnova is credited as a team project with Richa as visual designer. The image is a capture of the live site. It can be swapped for Figma exports of her own screens by replacing `assets/previews/synnova.jpg` (same filename, nothing else changes).
- Process section must be shorter, and its step numbers get the accent colour.
- Experience ledger: one stat and one role per entry, shorter summaries, 3-4 tags, and either a computed duration or no figure.
- The "How I orchestrate AI" demo section is being rethought (see section 4). It must show a real, useful skill rather than a gimmick.
- Small polish items and the optional items are all approved.

## 4. Pending (agreed with the user)

Done items from the original list are in section 7. Still open:

1. ~~AI demo section~~ - done, see section 7 (removed).
2. Optional items (approved, not started): Work page hover previews, colour swatches as live controls.
3. Other review items still open: 12px minimum font size, AI-stage header dots overlapping on mobile, "Between places" heading not matching its copy, crossfade/scroll-into-view for AI tabs (folds into item 1).
## 5. Open questions

- Add the employer's name to the Synnova card? Needs the name from Richa.
- "User Research for a hackathon" has no imagery.
- Medcycle and Make My Trip previews are crops of very tall Behance long-page images. Specific frames could replace them.

## 6. Housekeeping notes

- `.agents/` and `skills-lock.json` are untracked tooling files and are intentionally not committed.
- Temporary review helpers (`_review.html`, `_acc.html`, `_acc.css`, splice scripts) were deleted.
- Nothing has been pushed or merged yet.

## 7. Update log

Entries are added as each item lands.

### Round 2 (after the user's follow-up requests)

| Item | What changed | Notes |
| --- | --- | --- |
| Hero portrait | The large right-hand photo is replaced by a small round portrait (`assets/photos/portrait-circle.jpg`, 480px, 34 KB) set beside the intro text under the name, ringed in the live page accent colour. Hero is now a single column; the name scales with the viewport. On phones the portrait stacks above the intro. | This is also the "portrait crop tweak": a dedicated square crop centred on the face. The original `homepage-portrait.jpeg` stays for social share images (`og:image`). |
| GSAP removed | GSAP and ScrollTrigger CDN scripts, the preconnect, and the hero parallax code are gone. The hero now drifts up and softens as it scrolls away using CSS scroll-driven animation (`animation-timeline: view()`), only where supported and not under reduced motion. | One fewer third-party request. Completes the "replace GSAP with CSS scroll animation" item. |
| Process section | From a tall sticky layout (about 4 x 62vh) to one compact row of four steps (two columns on tablet and mobile). Each step has an accent top rule, an accent-colour numeral, a shorter heading and a one-sentence description. The sticky index, its JS observer and unused CSS are removed. | Copy shortened. Step 3 renamed "Shape the system". |
| Numeral roll | The step numerals roll up out of a clipped line when the row first scrolls into view, staggered by 90 ms. Hidden state is only applied once JS is ready, and it is skipped under reduced motion. | |
| Experience ledger | Each role now has one title, one org, at most one stat, a one-sentence summary and exactly three tags. Removed the duplicated impact pill, the duplicate stat-as-tag, the vague "AI+ Next-Gen Strategy" stat on the consultant role, and the repeated "4+ years" header (now "Most recent first"). The current role's duration is computed in JS from `data-since="2026-01"` and counted inclusively like the others (shows "10 mos" today). | The remaining stats (12+ campaigns, 8 workshops, 200+ citizens) were already on the site; they should be confirmed as accurate by Richa. |
| Live dot | The pulsing live dot stops under `prefers-reduced-motion`. | |
| Copy email | New "Copy email" button in the contact section: Clipboard API, with a hidden-textarea fallback, a visible "Copied" state and a polite `aria-live` announcement. 44px tall. | The automated browser blocks the clipboard, so the success state was not observed in testing; the failure state was. |
| Contact contrast | Contact heading is now full paper colour on ink (was 78%). Footer text raised from 46% to 64%. | |
| AI demo section removed | The "How I orchestrate AI into systems, research & direction" block is deleted: its markup (four fake interactive demos plus a commented-out second direction), about 480 lines of CSS, about 350 lines of JS, and two responsive rule sets. Net effect: `index.html` about 1000 to 625 lines, `styles.css` about 2700 to 1816, `script.js` about 520 to 175. | Decision by the user: the demo did not prove a real skill, so it goes. The user also chose to keep AI as a headline theme, so AI stays in the experience heading ("civic systems & AI-native workflows"), the intro line, the section eyebrow, the consultant role and its tags. |
| AI in "How I work" | Added a fifth method, "AI-assisted workflows: Synthesis, prototyping and accessibility checks, with a designer's judgment in the loop." | New wording written by the assistant to keep AI visible without a fake demo. Richa should confirm or edit it. |
| Current role wording | "Design Consultant, advising emerging ventures..." implied a consultancy and clients that do not exist. Now: **Freelance Designer, Independent · Open to full-time roles**, with a first-person summary saying Richa is looking for her next full-time design role and takes freelance brand, campaign and interface projects in the meantime. Tags: Brand & Identity, Interface Design, Figma + AI. The availability chip now reads "Open to full-time roles & freelance projects · USA" (was "Available for Strategic Design & Consultations"). | Written from the user's own description of her situation. No client names, results or claims were invented. Note: the AI-as-headline-theme entry above refers to this role's tag "Figma + AI" and the section heading. |
| Make My Trip removed | Committed the user's removal: the project page, its Behance images, mark and preview, and its entries in work.js, chroma.js and the data files. No references remain in the site. | Done at the user's request. ssets/Work/Portfolio_cover_image.webp is still untracked and unused; left alone. |
| Verified at 1440 and 390 | Hero, process row, ledger, contact and nav checked at both widths. No layout bugs found. | The Places photo strip is meant to scroll sideways on mobile. |
| 12px minimum text | All 33 font sizes under 0.75rem were raised to at least 0.75rem (12px); the shared mono label style is now 0.78rem. Same fix in case-study.css. Verified in the browser: no text node under 12px; the mobile nav still fits. | |
| Places section heading | The heading promised 'India to the UK to the US' but all three photos are London community workshops. Eyebrow is now 'In the field' and the heading 'Out of the studio and into the room with the people I design for.' The caption is unchanged. | Wording by the assistant; easy to change. |
| Side effects of the removal | The AI-stage mobile header dots overlap, the AI tab crossfade and the "demo stage fill" items from the review no longer apply. | They were part of the removed section. |

### Not mine: uncommitted edits from the user in the working tree

While this round was in progress the working tree picked up edits that are not part of this log's commits: the Make My Trip project was removed (its `assets/behance/*`, `assets/marks/mmt.png`, `assets/previews/make-my-trip.jpg`, `projects/feature-addition-in-make-my-trip-app.html`, and its entries in `work.js`, `chroma.js`, `data/behance-portfolio.js` and `.json`), and `assets/Work/Portfolio_cover_image.webp` was added. These are left uncommitted on purpose. Commit them (or not) before merging.
