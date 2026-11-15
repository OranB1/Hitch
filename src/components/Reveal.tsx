"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// Fade-and-rise, written so the content is never hidden by markup. The entrance is a CSS animation
// (globals.css, `.reveal`), so server-rendered HTML carries no inline `opacity: 0` and the page is
// readable as soon as the stylesheet arrives, with or without JavaScript. This used to be a Motion
// `initial={{ opacity: 0 }}`, which shipped every section, the hero H1 included, invisible until
// hydration finished.
//
// After hydration, anything still below the fold is parked (`data-reveal="pending"`) and released
// when it scrolls into view; removing the attribute restarts the same CSS animation. Anything already
// on screen is left alone, so nothing visible ever flickers out and back in.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        delete el.dataset.reveal;
        observer.disconnect();
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      delete el.dataset.reveal;
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `reveal ${className}` : "reveal"}
      style={{ "--reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}
