---
target: homepage
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:/Users/Oran/Hitch/src/app/page.tsx"
target_fingerprint: "sha256:cf1d7bd16af6e404eeedb0d3b87dbc95e483d8a6975e9c824e99800df6216954"
target_path: /Users/Oran/Hitch/src/app/page.tsx
timestamp: 2026-11-01T17-02-46Z
slug: src-app-page-tsx
---
Method: dual-agent (A: a170bb0818f2311c7 · B: abdbf05ec4831fa33)

# Critique: Hitch homepage (2026-11-01)

Score 23/32 (heuristics 7 and 10 n/a, landing page). Detector: 2 warnings on URL (Inter 83%, cream palette, both deliberate owner decisions), 0 on page.tsx and HeroAccordion.tsx. No overflow at 1440/375, 0 contrast failures, no console errors.

Specificity: hero accordion is authored for the product; sections below are category-interchangeable. The explainable match is never shown.

Priority issues
- [P1] Page never shows the matching (add labelled Example match card and example ranked shortlist). shape, layout.
- [P1] Weak case for posters/trusts (department-only posting, you decide, time to post). clarify, layout.
- [P2] Competing CTAs, no closing CTA, demo link too small. distill, clarify.
- [P2] Accordion: no pause control (owner declined a pause button), tap-to-open then tap-to-go on touch, all tiles link to /marketplace, mobile stack mostly below fold. adapt, animate.
- [P3] Targets under 44px: desktop nav links 37px, Post 36px, Sign in 32px, source links 36px, demo link 20px. audit, polish.

Minor: H1 five lines at 1440; footer empty right side; 19-students stat weakest; stats before How it works?; redundant Step labels; possible opacity-0 first paint from Reveal (unconfirmed).
