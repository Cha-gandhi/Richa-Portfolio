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

## 4. Pending (agreed with the user, in the order planned)

1. Hero portrait: replace the large right-side photo with a smaller circular portrait, placed professionally. Includes the portrait crop tweak.
2. Process section: shorten and give the step numbers the accent colour.
3. Experience ledger: de-duplicate (one stat, one role, shorter summary, 3-4 tags, computed or removed duration).
4. AI demo section: rethink what it shows, then rebuild.
5. Small polish: animated numeral roll, pause the live dot under reduced motion, copy-email button, better contrast on the contact heading.
6. Optional items (approved): replace GSAP with CSS scroll-driven animation, Work page hover previews, colour swatches as live controls.
7. Other review items still open: 12px minimum font size, AI-stage header dots overlapping on mobile, "Between places" heading not matching its copy.

## 5. Open questions

- Add the employer's name to the Synnova card? Needs the name from Richa.
- "User Research for a hackathon" has no imagery.
- Medcycle and Make My Trip previews are crops of very tall Behance long-page images. Specific frames could replace them.

## 6. Housekeeping notes

- `.agents/` and `skills-lock.json` are untracked tooling files and are intentionally not committed.
- Temporary review helpers (`_review.html`, `_acc.html`, `_acc.css`, splice scripts) were deleted.
- Nothing has been pushed or merged yet.

## 7. Update log

Entries below are added as each pending item lands.

- (none yet)
