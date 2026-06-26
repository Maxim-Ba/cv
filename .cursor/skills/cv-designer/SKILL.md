---
name: cv-designer
description: >-
  UI redesign and visual polish for balashov-cv-client Angular CV.
  Use when improving UI, redesigning sections, or polishing visuals.
---

# CV Designer Skill

## Stack

- Angular 17 standalone components
- Angular Material 17 + SCSS
- Design tokens: `src/styles/_design-tokens.scss`
- Design rules: `.cursor/rules/design.mdc`
- **Do not add Tailwind**

## Mandatory iteration loop

After every visual change:

1. Ensure dev server runs at `http://localhost:4200/`
2. Browser MCP: navigate and take screenshots at 1440px, 768px, 375px
3. Toggle dark mode and repeat screenshots
4. Open technology drawer and contact dialog — screenshot modals
5. Fix mismatches before moving to the next section

## Constraints

- Do not break API integrations (work-history, technologies, education, contact)
- Do not change `TechnologiesService`, drawer, or contact-me business logic
- Reuse existing widgets: header, technology-item, tag-filter, contact-me
- Use `--cv-*` tokens for colors, spacing, radius, shadows

## Component checklist

| Section | Files |
|---------|-------|
| Hero | `sections/main-info/*` |
| Nav | `widgets/section-nav/*` |
| Sections | `shared/ui-kit/section-wrapper/*` |
| Work | `sections/work-history/*` |
| Tech | `sections/technologies/**`, `widgets/technology-item/*` |
| Theme | `styles.scss`, `_design-tokens.scss`, `index.html` |

## Reference

See [reference.md](reference.md) for before/after audit checklist.
