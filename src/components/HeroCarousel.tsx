"use client";

import { useSyncExternalStore } from "react";
import CircularCarousel from "@/components/CircularCarousel";

// One worked example per task type, in the same hues the board uses. Each is a made-up project written
// the way a department would post it, baked into the image (public/hero): no hospital, figures, dates
// or people, and every tile carries an "Example" mark because Hitch isn't taking applications yet.
// `backColor` keeps the far side of the ring opaque so no mirrored text shows through. `title` is the accessible name, so it repeats what the picture says.
const TILES = [
  {
    src: "/hero/qip.webp",
    backColor: "#c9d3e8",
    title: "QIP example from Acute Medicine: fewer missed doses of time-critical medicines on an acute medical ward. Looking for data collection and audit/QI training.",
  },
  {
    src: "/hero/audit.webp",
    backColor: "#bfdcdf",
    title: "Audit example from General Surgery: re-audit of VTE risk assessment completed within a day of admission. Looking for data collection and Excel.",
  },
  {
    src: "/hero/research.webp",
    backColor: "#d3c8e6",
    title: "Research example from Anaesthetics and Critical Care: retrospective review of outcomes after emergency laparotomy in older adults. Looking for literature review and statistics.",
  },
  {
    src: "/hero/teaching.webp",
    backColor: "#bfdcc8",
    title: "Teaching example from Cardiology: peer-led ECG interpretation sessions for medical students on placement. Looking for poster and presentation skills.",
  },
];

// Edge fade has to match the page canvas (--color-void) or the ring's edges show as a halo.
const CANVAS = "#f7f2ea";

const QUERIES = ["(min-width: 1280px)", "(min-width: 1024px)"];

function subscribe(onChange: () => void) {
  const lists = QUERIES.map((q) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener("change", onChange));
  return () => lists.forEach((l) => l.removeEventListener("change", onChange));
}

type Size = "xl" | "lg" | "sm";

function getSize(): Size {
  if (window.matchMedia(QUERIES[0]).matches) return "xl";
  if (window.matchMedia(QUERIES[1]).matches) return "lg";
  return "sm";
}

// The ring's card width is a prop, not CSS, so it can't use a media query directly.
const SIZES: Record<Size, { box: string; card: number }> = {
  xl: { box: "h-[520px]", card: 300 },
  lg: { box: "h-[460px]", card: 250 },
  sm: { box: "h-[400px]", card: 200 },
};

export default function HeroCarousel() {
  // The server snapshot is "xl", so SSR renders the desktop size and narrower screens correct on hydration.
  const size = useSyncExternalStore(subscribe, getSize, () => "xl" as Size);
  const { box, card } = SIZES[size];

  return (
    <div className={box}>
      <CircularCarousel
        items={TILES}
        preset="cylinder"
        cardWidth={card}
        gap={70}
        aspectRatio={0.8}
        cornerRadius={16}
        fadeColor={CANVAS}
        depthFade={0.25}
        innerShade={0.85}
        ariaLabel="Example opportunities on Hitch"
        speed={8}
        className="h-full w-full"
      />
    </div>
  );
}
