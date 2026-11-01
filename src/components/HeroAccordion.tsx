"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// One worked example per task type, in the same hues the board uses. Each is a made-up project written
// the way a department would post it, baked into the image (public/hero): no hospital, figures, dates
// or people, and every tile carries an "Example" mark because Hitch isn't taking applications yet.
// `label` is the link's accessible name, so it repeats what the picture says.
const TILES = [
  {
    src: "/hero/qip.webp",
    label:
      "QIP example from Acute Medicine: fewer missed doses of time-critical medicines on an acute medical ward. Looking for data collection and audit/QI training.",
  },
  {
    src: "/hero/audit.webp",
    label:
      "Audit example from General Surgery: re-audit of VTE risk assessment completed within a day of admission. Looking for Excel and statistics.",
  },
  {
    src: "/hero/research.webp",
    label:
      "Research example from Anaesthetics and Critical Care: retrospective review of outcomes after emergency laparotomy in older adults. Looking for literature review and manuscript writing.",
  },
  {
    src: "/hero/teaching.webp",
    label:
      "Teaching example from Cardiology: peer-led ECG interpretation sessions for medical students on placement. Looking for poster and presentation skills.",
  },
];

const STEP_MS = 4000;
// Tiles are 4:5, so the open panel is as wide as the container is tall times 0.8. Sliver width is
// whatever is left over, which sets how much grow the open panel needs (open width / sliver width).
const LAYOUTS = {
  xl: { box: "h-[460px] w-[640px]", grow: 4.6 },
  lg: { box: "h-[400px] w-[540px]", grow: 5 },
} as const;

const LG = "(min-width: 1024px)";
const XL = "(min-width: 1280px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const lists = [LG, XL, REDUCED].map((q) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener("change", onChange));
  return () => lists.forEach((l) => l.removeEventListener("change", onChange));
}

type Mode = "xl" | "lg" | "stack";

function getMode(): Mode {
  if (window.matchMedia(XL).matches) return "xl";
  return window.matchMedia(LG).matches ? "lg" : "stack";
}

export default function HeroAccordion() {
  // The server snapshot is "xl", so SSR renders the desktop layout and narrower screens correct on hydration.
  const mode = useSyncExternalStore(subscribe, getMode, () => "xl" as Mode);
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // A touch or key press means the visitor is choosing a panel: no panel should move under their finger.
  const [taken, setTaken] = useState(false);

  const rootRef = useRef<HTMLUListElement>(null);
  const [stackHeight, setStackHeight] = useState<number | null>(null);
  const stacked = mode === "stack";

  useEffect(() => {
    if (!stacked || !rootRef.current) return;
    const el = rootRef.current;
    const measure = () => setStackHeight(Math.round(el.getBoundingClientRect().width * 1.25));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stacked]);

  // A touch or key press holds the panel still for a few seconds, then autoplay carries on.
  useEffect(() => {
    if (!taken) return;
    const id = setTimeout(() => setTaken(false), 8000);
    return () => clearTimeout(id);
  }, [taken, active]);

  useEffect(() => {
    if (reduced || paused || taken) return;
    const id = setInterval(() => setActive((a) => (a + 1) % TILES.length), STEP_MS);
    return () => clearInterval(id);
  }, [reduced, paused, taken]);

  const layout = stacked ? null : LAYOUTS[mode];

  return (
    <ul
      ref={rootRef}
      aria-label="Example opportunities on Hitch"
      className={`flex ${stacked ? "mx-auto w-full max-w-[260px] flex-col gap-2" : `max-w-full gap-[10px] ${layout!.box}`}`}
      style={{ "--grow": layout?.grow ?? 1 } as React.CSSProperties}
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPaused(false)}
      onPointerDown={(e) => e.pointerType !== "mouse" && setTaken(true)}
      // Only keyboard focus pauses; a mouse click leaves focus behind and would stall autoplay.
      onFocus={(e) => e.target.matches(":focus-visible") && setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {TILES.map((tile, i) => {
        const open = i === active;
        return (
          <li
            key={tile.src}
            className="relative min-h-0 min-w-0 overflow-hidden rounded-cards transition-[flex-grow,height] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={
              stacked
                ? { height: open ? (stackHeight ?? 420) : 44, flex: "none" }
                : { flexGrow: open ? "var(--grow)" : 1, flexBasis: 0 }
            }
          >
            <Link
              href="/marketplace"
              aria-label={tile.label}
              aria-current={open ? "true" : undefined}
              className="block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ash"
              onMouseEnter={() => setActive(i)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && setActive(i)}
              onKeyDown={() => setTaken(true)}
              onClick={(e) => {
                // A closed panel opens first; only the open tile follows the link.
                if (!open) {
                  e.preventDefault();
                  setActive(i);
                }
              }}
            >
              {/* The tile keeps its full size and is anchored top-left, so a closed panel shows the chip and
                  first words like a tab. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tile.src}
                alt=""
                draggable={false}
                decoding="async"
                className={`absolute left-0 top-0 block max-w-none select-none ${stacked ? "w-full" : "h-full w-auto"}`}
              />
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 bg-void transition-opacity duration-[600ms] motion-reduce:transition-none ${
                  open ? "opacity-0" : "opacity-[0.28]"
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
