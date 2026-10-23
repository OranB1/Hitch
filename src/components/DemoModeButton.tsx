"use client";

import { useSyncExternalStore } from "react";
import { isDemoMode, setDemoMode } from "@/lib/demoMode";

// localStorage is an external store, so it's read through useSyncExternalStore rather than an
// effect — the server snapshot is `false`, which is what SSR renders, so there's no mismatch.
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function DemoModeButton() {
  const active = useSyncExternalStore(subscribe, isDemoMode, () => false);

  function toggle() {
    setDemoMode(!active);
    window.location.reload();
  }

  return (
    <button
      onClick={toggle}
      className={`fixed right-4 top-1/2 z-50 -translate-y-1/2 rounded-buttons border px-3 py-2 text-[12px] font-[510] shadow-xl transition-colors ${
        active
          ? "border-acid-lime bg-acid-lime/10 text-acid-lime"
          : "border-graphite bg-carbon text-fog hover:border-smoke hover:text-mist"
      }`}
    >
      {active ? "Exit demo mode" : "Skip sign-in (demo)"}
    </button>
  );
}
