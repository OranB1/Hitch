// Client-only "show this as a demo" flag. Purely cosmetic: it never touches real Supabase
// sessions or RLS-protected writes, it just lets the onboarding wizard render without a real
// signed-in user so it can be walked through in a demo/pitch setting.
const KEY = "shortlisted_demo_mode";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "true";
}

export function setDemoMode(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(KEY, "true");
  } else {
    window.localStorage.removeItem(KEY);
  }
}
