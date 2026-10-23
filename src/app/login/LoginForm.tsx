"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Matches Supabase's own per-user email rate limit. Resending sooner would just fail, so the
// button stays disabled until a retry can actually succeed.
const RESEND_COOLDOWN_SECONDS = 60;

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function sendLink() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }
    setStatus("sent");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    await sendLink();
  }

  async function handleResend() {
    if (resending || cooldown > 0) return;
    setResending(true);
    setErrorMessage("");
    await sendLink();
    setResending(false);
  }

  if (status === "sent") {
    return (
      <div className="mt-8 space-y-4">
        <div className="rounded-cards bg-pulse-green/10 p-4 text-body-sm text-pulse-green shadow-[0_0_0_0.5px_var(--color-pulse-green)_inset]">
          Check <span className="font-[510]">{email}</span> for a sign-in link.
        </div>
        <div className="rounded-cards bg-carbon p-4 shadow-subtle">
          <p className="text-body-sm text-fog">
            University and NHS email systems often scan and queue new messages before they reach
            your inbox, so this can take a few minutes. Check your spam/junk folder too.
          </p>
          {errorMessage && <p className="mt-2 text-body-sm text-coral-red">{errorMessage}</p>}
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="mt-3 rounded-buttons border border-graphite px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-mist transition-colors hover:border-smoke hover:text-paper disabled:opacity-50"
          >
            {resending
              ? "Sending…"
              : cooldown > 0
                ? `Didn't get it? Resend in ${cooldown}s`
                : "Didn't get it? Resend link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-cards bg-carbon p-6 shadow-subtle">
      <div>
        <label className="block text-body-sm text-mist">University or NHS email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@imperial.ac.uk or you@nhs.net"
          className="mt-1 w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[14px] text-mist focus:border-mist focus:outline-none"
        />
        <p className="mt-1 text-caption text-ash">
          Must end in .ac.uk, nhs.net, or nhs.uk. This is currently for UK medical students and doctors only.
        </p>
      </div>

      {status === "error" && (
        <div className="rounded-inputs bg-coral-red/10 p-3 text-body-sm text-coral-red shadow-[0_0_0_0.5px_var(--color-coral-red)_inset]">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
