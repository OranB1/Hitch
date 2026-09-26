"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { toastQueue } from "@/components/Toast";
import { TASK_TYPE_OPTIONS, QI_EXPERIENCE_OPTIONS, type Skill, type OpportunityStatus } from "@/lib/data/marketplace-options";
import { medSchoolYearLabel } from "@/lib/data/onboarding-options";
import { computeMatch, type MatchProfile } from "@/lib/marketplace";
import { notifyApplicantOfStatusChange } from "@/lib/notifications";
import type { Tables } from "@/lib/supabase/database.types";

type Opportunity = Tables<"opportunities">;
type ApplicantProfile = {
  full_name: string | null;
  about_motivation: string | null;
  about_experience: string | null;
  about_goals: string | null;
  avatar_url: string | null;
  cv_url: string | null;
  cv_filename: string | null;
  med_school: string | null;
  target_specialty: string | null;
  current_specialty: string | null;
  hospital_trust: string | null;
  preferred_region: string | null;
  year_of_study: string | null;
  grade: string | null;
  skills: string[] | null;
  qi_experience: string | null;
  research_experience: string | null;
  availability_hours: string | null;
};
type Application = Tables<"opportunity_applications"> & {
  applicantProfile?: ApplicantProfile;
};

function toMatchProfile(p: ApplicantProfile | undefined): MatchProfile {
  return {
    targetSpecialty: p?.target_specialty ?? null,
    currentSpecialty: p?.current_specialty ?? null,
    hospitalTrust: p?.hospital_trust ?? null,
    preferredRegion: p?.preferred_region ?? null,
    yearOfStudy: p?.year_of_study ?? null,
    grade: p?.grade ?? null,
    skills: (p?.skills as Skill[] | null) ?? null,
    qiExperience: p?.qi_experience as MatchProfile["qiExperience"],
    researchExperience: p?.research_experience as MatchProfile["researchExperience"],
    availabilityHours: p?.availability_hours as MatchProfile["availabilityHours"],
  };
}

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-black/[0.045] text-fog",
  shortlisted: "bg-iris-violet/15 text-iris-violet",
  accepted: "bg-pulse-green/15 text-pulse-green",
  rejected: "bg-coral-red/15 text-coral-red",
  withdrawn: "bg-black/[0.045] text-ash",
};

const POSTING_STATUS_STYLES: Record<OpportunityStatus, string> = {
  open: "bg-pulse-green/15 text-pulse-green",
  filled: "bg-iris-violet/15 text-iris-violet",
  closed: "bg-black/[0.045] text-ash",
};

const POSTING_STATUS_LABELS: Record<OpportunityStatus, string> = {
  open: "Open",
  filled: "Filled",
  closed: "Closed",
};

export default function MyPostings() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [postings, setPostings] = useState<Opportunity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);

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

      const { data: opps } = await supabase
        .from("opportunities")
        .select("*")
        .eq("poster_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (opps) {
        setPostings(opps);
        if (opps.length) setSelectedId(opps[0].id);
      }
      setLoading(false);
    }
    init();
  }, [supabase, router]);

  useEffect(() => {
    async function loadApplications() {
      if (!selectedId) {
        setApplications([]);
        return;
      }
      setLoadingApplications(true);

      const { data: apps } = await supabase
        .from("opportunity_applications")
        .select("*")
        .eq("opportunity_id", selectedId)
        .order("created_at", { ascending: true });

      if (!apps || apps.length === 0) {
        setApplications([]);
        setLoadingApplications(false);
        return;
      }

      const applicantIds = apps.map((a) => a.applicant_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select(
          "id, full_name, about_motivation, about_experience, about_goals, avatar_url, cv_url, cv_filename, med_school, target_specialty, current_specialty, hospital_trust, preferred_region, year_of_study, grade, skills, qi_experience, research_experience, availability_hours"
        )
        .in("id", applicantIds);

      const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
      setApplications(apps.map((a) => ({ ...a, applicantProfile: profileById.get(a.applicant_id) })));
      setLoadingApplications(false);
    }
    loadApplications();
  }, [selectedId, supabase]);

  async function updateStatus(applicationId: string, status: string) {
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status } : a)));
    await supabase.from("opportunity_applications").update({ status }).eq("id", applicationId);
    notifyApplicantOfStatusChange(applicationId, status);
  }

  async function updatePostingStatus(postingId: string, status: OpportunityStatus) {
    setPostings((prev) => prev.map((p) => (p.id === postingId ? { ...p, status } : p)));
    const { error } = await supabase.from("opportunities").update({ status }).eq("id", postingId);
    if (error) {
      toastQueue.add({ title: "Couldn't update posting", description: error.message });
      return;
    }
    toastQueue.add({ title: `Posting marked ${POSTING_STATUS_LABELS[status].toLowerCase()}` });
  }

  async function deletePosting(postingId: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    const { error } = await supabase.from("opportunities").delete().eq("id", postingId);
    if (error) {
      toastQueue.add({ title: "Couldn't delete posting", description: error.message });
      return;
    }
    setPostings((prev) => {
      const next = prev.filter((p) => p.id !== postingId);
      setSelectedId(next.length ? next[0].id : null);
      return next;
    });
    toastQueue.add({ title: "Posting deleted" });
  }

  async function viewCv(cvPath: string) {
    const { data } = await supabase.storage.from("cvs").createSignedUrl(cvPath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  const selected = postings.find((p) => p.id === selectedId) ?? null;

  const rankedApplications = useMemo(() => {
    if (!selected) return applications;
    return [...applications].sort(
      (a, b) =>
        computeMatch(selected, toMatchProfile(b.applicantProfile)).percent -
        computeMatch(selected, toMatchProfile(a.applicantProfile)).percent
    );
  }, [applications, selected]);

  if (loading) {
    return <div className="mt-8 rounded-cards bg-carbon p-6 shadow-subtle text-body-sm text-fog">Loading…</div>;
  }

  if (postings.length === 0) {
    return (
      <div className="mt-8 rounded-cards bg-carbon p-6 shadow-subtle text-body-sm text-fog">
        You haven&apos;t posted anything yet.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-2">
        {postings.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`w-full rounded-cards border p-4 text-left transition-colors ${
              selectedId === p.id ? "border-acid-lime bg-acid-lime/5" : "border-graphite bg-carbon hover:border-smoke"
            }`}
          >
            <div className="flex items-center gap-2">
              <p className="font-[510] text-paper">{p.title}</p>
              <span
                className={`shrink-0 rounded-badges px-[6px] text-label font-[510] ${
                  POSTING_STATUS_STYLES[(p.status as OpportunityStatus) ?? "open"]
                }`}
              >
                {POSTING_STATUS_LABELS[(p.status as OpportunityStatus) ?? "open"]}
              </span>
            </div>
            <p className="mt-1 text-caption text-fog">
              {TASK_TYPE_OPTIONS.find((t) => t.value === p.task_type)?.label ?? p.task_type}
              {p.is_remote && " · Remote"}
            </p>
          </button>
        ))}
      </div>

      <div>
        {selected && (
          <div className="rounded-cards bg-carbon p-6 shadow-subtle">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-[510] text-paper">{selected.title}</h2>
                <p className="mt-1 text-body-sm text-fog">
                  {applications.length} application{applications.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selected.status !== "open" && (
                  <button
                    onClick={() => updatePostingStatus(selected.id, "open")}
                    className="rounded-buttons border border-graphite px-3 py-1.5 text-[13px] text-mist hover:border-smoke"
                  >
                    Reopen
                  </button>
                )}
                {selected.status !== "filled" && (
                  <button
                    onClick={() => updatePostingStatus(selected.id, "filled")}
                    className="rounded-buttons border border-graphite px-3 py-1.5 text-[13px] text-mist hover:border-smoke"
                  >
                    Mark filled
                  </button>
                )}
                {selected.status !== "closed" && (
                  <button
                    onClick={() => updatePostingStatus(selected.id, "closed")}
                    className="rounded-buttons border border-graphite px-3 py-1.5 text-[13px] text-mist hover:border-smoke"
                  >
                    Close
                  </button>
                )}
                <button
                  onClick={() => deletePosting(selected.id, selected.title)}
                  className="rounded-buttons border border-coral-red/30 px-3 py-1.5 text-[13px] text-coral-red hover:border-coral-red/60"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {loadingApplications ? (
            <div className="rounded-cards bg-carbon p-6 shadow-subtle text-body-sm text-fog">Loading applicants…</div>
          ) : applications.length === 0 ? (
            <div className="rounded-cards bg-carbon p-6 shadow-subtle text-body-sm text-fog">No applications yet.</div>
          ) : (
            rankedApplications.map((a) => {
              const match = selected ? computeMatch(selected, toMatchProfile(a.applicantProfile)) : null;
              const qiLabel = QI_EXPERIENCE_OPTIONS.find((o) => o.value === a.applicantProfile?.qi_experience)?.label;
              return (
                <div key={a.id} className="rounded-cards bg-carbon p-4 shadow-subtle">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-pills bg-black/[0.045]">
                        {a.applicantProfile?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.applicantProfile.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-[510] text-paper">{a.applicantProfile?.full_name || "Unnamed applicant"}</p>
                          {match && (
                            <span className="rounded-badges bg-acid-lime/15 px-[6px] text-label font-[510] text-acid-lime">
                              {match.percent}% match
                            </span>
                          )}
                        </div>
                        <p className="text-caption text-fog">
                          {[a.applicantProfile?.med_school, a.applicantProfile?.year_of_study && medSchoolYearLabel(a.applicantProfile.year_of_study), a.applicantProfile?.target_specialty]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <p className="mt-0.5 text-caption text-fog">
                          {[qiLabel, a.applicantProfile?.availability_hours && `${a.applicantProfile.availability_hours}/week`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-badges px-[6px] text-label capitalize ${STATUS_STYLES[a.status] ?? ""}`}>
                      {a.status}
                    </span>
                  </div>

                  {(a.applicantProfile?.about_motivation || a.applicantProfile?.about_experience || a.applicantProfile?.about_goals) && (
                    <div className="mt-3 space-y-2 border-t-[0.5px] border-graphite pt-3">
                      {a.applicantProfile?.about_motivation && (
                        <div>
                          <p className="text-label text-ash">Why this interests them</p>
                          <p className="text-body-sm text-mist">{a.applicantProfile.about_motivation}</p>
                        </div>
                      )}
                      {a.applicantProfile?.about_experience && (
                        <div>
                          <p className="text-label text-ash">Relevant experience</p>
                          <p className="text-body-sm text-mist">{a.applicantProfile.about_experience}</p>
                        </div>
                      )}
                      {a.applicantProfile?.about_goals && (
                        <div>
                          <p className="text-label text-ash">What they&apos;re hoping to get out of it</p>
                          <p className="text-body-sm text-mist">{a.applicantProfile.about_goals}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {a.cover_note && (
                    <p className="mt-2 rounded-inputs bg-black/[0.02] p-3 text-body-sm text-mist">{a.cover_note}</p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {a.applicantProfile?.cv_url && (
                      <button
                        onClick={() => viewCv(a.applicantProfile!.cv_url!)}
                        className="rounded-buttons border border-graphite px-3 py-1.5 text-[13px] text-mist hover:border-smoke"
                      >
                        View CV
                      </button>
                    )}
                    {a.status !== "shortlisted" && a.status !== "accepted" && (
                      <button
                        onClick={() => updateStatus(a.id, "shortlisted")}
                        className="rounded-buttons border border-graphite px-3 py-1.5 text-[13px] text-mist hover:border-smoke"
                      >
                        Shortlist
                      </button>
                    )}
                    {a.status !== "accepted" && (
                      <button
                        onClick={() => updateStatus(a.id, "accepted")}
                        className="rounded-buttons bg-acid-lime px-3 py-1.5 text-[13px] font-[510] text-void hover:opacity-90"
                      >
                        Accept
                      </button>
                    )}
                    {a.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(a.id, "rejected")}
                        className="rounded-buttons border border-coral-red/30 px-3 py-1.5 text-[13px] text-coral-red hover:border-coral-red/60"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
