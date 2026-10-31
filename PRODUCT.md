# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two sides, both essential. The site is useless without posters, so the design serves them as much as applicants, and the team has told trusts it will be moulded to how each trust wants it (getting trusts on board is the priority).

- **Applicants:** medical students and foundation doctors (F1/F2) looking for QIPs, audits, research tasks and teaching opportunities, typically to build a portfolio for specialty applications. They need to find opportunities that are local and that they actually match.
- **Posters:** consultants, registrars and QI teams with projects that are stalling for lack of help. They need to list an opportunity quickly and get a ranked shortlist without screening everyone themselves.

## Product Purpose

Hitch (hitch.health) is an NHS marketplace connecting students and foundation doctors with real QIP, audit, research and teaching opportunities. It exists because projects stall before completion and opportunities are found mostly through who you know. Success is a project that gets finished, with the right person attached and local to the trust.

## Positioning

The user's stated position: the features are copyable; what is not is doing it in partnership with the actual trusts and hospitals, which the team says is the only legal way to operate. Trust partnership is the differentiator, and the site should be shaped around what trusts want.

Status to respect: the Chelsea and Westminster pilot is pending, not signed off. Never imply a partnership or pilot is running.

## Operating Context

Used by clinicians between shifts, often on a phone. Listings are local to a hospital or trust. Matching is explainable: a weighted score against a structured profile (specialty interest, skills, experience, availability, location), with visible reasons. The AI or score shortlists; the poster decides.

## Capabilities and Constraints

- Postings are attributed to a department and hospital only: never a name, photo or GMC number.
- The 12 database opportunities are fabricated demo data under real hospital names. The notices on `/marketplace` and `/demo` stay.
- No invented numbers, statistics, interview counts or pilot claims anywhere.
- Task types are fixed: QIP, audit, research, presentation, teaching, other. Skills come from one shared vocabulary on both sides.
- Henry Goldsmith's About bio is not to be invented.
- Stack: Next.js App Router, React 19, TypeScript, Tailwind v4 with the project's own tokens, Supabase, Motion.

## Brand Commitments

Name: Hitch. Warm-paper canvas, serif headings, one blue accent, task-type colour system (six hues, chip plus spine), peach for own specialty, green meaning every requirement met. Build on these; do not replace them. Text chroma stays at or below 10 (do not re-warm the ink).

## Evidence on Hand

- Cited statistics on the homepage, each with a named source (BJMP 2009, SMART study BMC Medical Education 2023, Kumar et al. Postgraduate Medical Journal 2021).
- A call with the Chelsea and Westminster QI team that framed the stall-before-completion problem.
- Absent, so never fabricate: testimonials, customer counts, pilot results, signed partnerships.

## Product Principles

1. Trusts must want to use it: design for posters as much as applicants.
2. Honest by default: illustrative content is labelled, and claims come from supplied truth.
3. Explain every match; the poster decides.
4. Local and anonymous: department and hospital, never a person.
5. Easy on a phone, between shifts.

## Accessibility & Inclusion

44px touch targets for buttons and controls, WCAG AA contrast (placeholders included), and honest handling of motion (autoplay stops under reduced motion).
