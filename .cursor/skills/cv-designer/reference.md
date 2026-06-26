# Visual audit checklist (before redesign baseline)

## Layout — before

- [x] Hero: plain paragraphs, no hierarchy or CTA
- [x] Navigation: mat-expansion-panel headers (admin-like)
- [x] Work history: flat list, underline-only hover
- [x] Technologies: inconsistent chip shapes (rect vs pill)
- [x] Footer: heavy saturated purple bar
- [x] Scroll-up FAB overlaps footer

## After redesign — verified via Browser MCP (2026-06-26)

- [x] Hero with name, role, pitch, CTA buttons
- [x] Sticky anchor nav (О себе | Опыт | Стек | Образование)
- [x] Card-based sections with scroll-reveal
- [x] Work history vertical timeline with period badges
- [x] Unified pill chips with grayscale filter dimming
- [x] Inter typography, softened purple palette via CSS tokens
- [x] Glass header, compact muted footer
- [x] Browser MCP screenshots: light/dark full page, 375px mobile, contact dialog

## Screenshot artifacts

Captured during audit (local temp):

- `cv-light-1440-full.png` — light theme desktop full page
- `cv-light-375.png` — light theme mobile viewport
- `cv-dark-375.png` — dark theme mobile viewport
- `cv-dark-1440-full.png` — dark theme desktop full page
- `cv-dark-contact-modal.png` — contact dialog (dark)
- `cv-dark-drawer.png` — technology drawer (dark)
