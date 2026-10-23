"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";

// Deliberately requires an explicit click before calling verifyOtp — the token is single-use,
// and email security scanners (e.g. Microsoft Defender "Safe Links" on most university/NHS
// Microsoft 365 tenants) auto-GET every link in an inbound email to check it for malware. If we
// verified on page load, the scanner's visit would consume the token before the real user ever
// sees the page. Requiring a click defeats that, since scanners don't click buttons.
export default function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "verifying" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "email") as EmailOtpType;

  async function handleConfirm() {
    if (!tokenHash) return;
    setStatus("verifying");

    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

    if (error || !data.user) {
      setStatus("error");
      setErrorMessage(error?.message ?? "That link didn't work.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", data.user.id)
      .maybeSingle();

    router.push(profile?.onboarding_completed_at ? "/" : "/onboarding");
    router.refresh();
  }

  if (!tokenHash) {
    return (
      <div className="mt-8 rounded-cards bg-coral-red/10 p-4 text-body-sm text-coral-red shadow-[0_0_0_0.5px_var(--color-coral-red)_inset]">
        This link is missing its sign-in token. Request a new one from the sign-in page.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-8 rounded-cards bg-coral-red/10 p-4 text-body-sm text-coral-red shadow-[0_0_0_0.5px_var(--color-coral-red)_inset]">
        {errorMessage} This can happen if the link expired, was already used, or was opened by
        your email provider&apos;s security scanner before you clicked it. Request a new one.
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-cards bg-carbon p-6 shadow-subtle">
      <p className="text-body-sm text-fog">
        Click below to finish signing in. We wait for this click on purpose — some university and
        NHS email systems auto-scan links for security, which would otherwise use up a one-time
        sign-in link before you ever saw it.
      </p>
      <button
        onClick={handleConfirm}
        disabled={status === "verifying"}
        className="mt-4 rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "verifying" ? "Confirming…" : "Confirm sign-in"}
      </button>
    </div>
  );
}
