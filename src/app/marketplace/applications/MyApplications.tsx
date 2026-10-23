"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { toastQueue } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TASK_TYPE_OPTIONS } from "@/lib/data/marketplace-options";
import type { Tables } from "@/lib/supabase/database.types";

type OpportunitySummary = Pick<
  Tables<"opportunities">,
  "title" | "hospital_trust" | "task_type" | "is_remote" | "deadline" | "status"
>;
type Application = Tables<"opportunity_applications"> & { opportunities: OpportunitySummary | null };

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-black/[0.045] text-fog",
  shortlisted: "bg-iris-violet/15 text-iris-violet",
  accepted: "bg-pulse-green/15 text-pulse-green",
  rejected: "bg-coral-red/15 text-coral-red",
  withdrawn: "bg-black/[0.045] text-ash",
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Applied, no response yet",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Not this time",
  withdrawn: "Withdrawn",
};

export default function MyApplications() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null);
  const [contactEmails, setContactEmails] = useState<Map<string, string | null>>(new Map());

  useEffect(() => {
    async function init() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      setUser(currentUser);

      const { data } = await supabase
        .from("opportunity_applications")
        .select("*, opportunities(title, hospital_trust, task_type, is_remote, deadline, status)")
        .eq("applicant_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (data) setApplications(data as Application[]);
      setLoading(false);
    }
    init();
  }, [supabase, router]);

  useEffect(() => {
    const accepted = applications.filter((a) => a.status === "accepted" && !contactEmails.has(a.id));
    if (accepted.length === 0) return;
    (async () => {
      for (const a of accepted) {
        const { data } = await supabase.rpc("get_accepted_contact_email", { p_application_id: a.id });
        setContactEmails((prev) => new Map(prev).set(a.id, data ?? null));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications]);

  async function withdraw(applicationId: string) {
    setWithdrawTarget(null);
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: "withdrawn" } : a)));
    const { error } = await supabase.from("opportunity_applications").update({ status: "withdrawn" }).eq("id", applicationId);
    if (error) {
      toastQueue.add({ title: "Couldn't withdraw application", description: error.message });
      return;
    }
    toastQueue.add({ title: "Application withdrawn" });
  }

  if (loading) {
    return <div className="mt-8 rounded-cards bg-carbon p-6 shadow-subtle text-body-sm text-fog">Loading…</div>;
  }

  if (!user) return null;

  if (applications.length === 0) {
    return (
      <div className="mt-8 rounded-cards bg-carbon p-6 shadow-subtle text-body-sm text-fog">
        You haven&apos;t applied to anything yet.{" "}
        <Link href="/marketplace" className="font-[510] text-mist underline hover:text-paper">
          Browse open opportunities
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      {applications.map((a) => (
        <div key={a.id} className="rounded-cards bg-carbon p-4 shadow-subtle">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-[510] text-paper">{a.opportunities?.title ?? "Opportunity no longer available"}</p>
              <p className="mt-1 text-body-sm text-fog">
                {[
                  a.opportunities?.is_remote ? "Remote / virtual" : a.opportunities?.hospital_trust,
                  a.opportunities?.task_type &&
                    (TASK_TYPE_OPTIONS.find((t) => t.value === a.opportunities?.task_type)?.label ?? a.opportunities.task_type),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-1 text-caption text-ash">
                Applied {new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <span className={`shrink-0 rounded-badges px-[6px] text-label ${STATUS_STYLES[a.status] ?? ""}`}>
              {STATUS_LABELS[a.status] ?? a.status}
            </span>
          </div>
          {a.cover_note && <p className="mt-3 text-body-sm text-mist">{a.cover_note}</p>}
          {a.status === "accepted" && (
            <div className="mt-3 rounded-inputs border border-pulse-green/40 bg-pulse-green/[0.06] p-3">
              {contactEmails.get(a.id) ? (
                <p className="text-body-sm text-mist">
                  Reach out to the poster directly:{" "}
                  <a href={`mailto:${contactEmails.get(a.id)}`} className="font-[510] underline hover:text-paper">
                    {contactEmails.get(a.id)}
                  </a>
                </p>
              ) : (
                <p className="text-caption text-ash">Loading contact details…</p>
              )}
            </div>
          )}
          {(a.status === "submitted" || a.status === "shortlisted") && (
            <button
              onClick={() => setWithdrawTarget(a.id)}
              className="mt-3 rounded-buttons border border-graphite px-3 py-1.5 text-[13px] text-mist hover:border-smoke"
            >
              Withdraw
            </button>
          )}
        </div>
      ))}

      <ConfirmDialog
        open={withdrawTarget !== null}
        title="Withdraw this application?"
        confirmLabel="Withdraw"
        destructive
        onConfirm={() => withdrawTarget && withdraw(withdrawTarget)}
        onCancel={() => setWithdrawTarget(null)}
      />
    </div>
  );
}
