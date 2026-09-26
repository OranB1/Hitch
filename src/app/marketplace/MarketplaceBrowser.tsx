"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { toastQueue } from "@/components/Toast";
import { TASK_TYPE_OPTIONS, SKILL_OPTIONS, PROJECT_DURATION_OPTIONS, type TaskType, type Skill } from "@/lib/data/marketplace-options";
import { stageLabel } from "@/lib/data/onboarding-options";
import { getPartneredHospitals, computeMatch, type MatchProfile } from "@/lib/marketplace";
import { notifyPosterOfNewApplication } from "@/lib/notifications";
import type { Tables } from "@/lib/supabase/database.types";

type Opportunity = Tables<"opportunities">;
type PosterProfile = {
  full_name: string | null;
  department: string | null;
  hospital_trust: string | null;
  avatar_url: string | null;
  gmc_number: string | null;
};
type MyApplication = { id: string; status: string };

const STATUS_PILL: Record<string, string> = {
  submitted: "bg-pulse-green/15 text-pulse-green",
  shortlisted: "bg-iris-violet/15 text-iris-violet",
  accepted: "bg-pulse-green/20 text-pulse-green",
  rejected: "bg-black/[0.045] text-ash",
};
const STATUS_LABEL: Record<string, string> = {
  submitted: "Applied",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Not this time",
};

const INPUT_CLASS =
  "rounded-inputs border border-graphite bg-black/[0.025] px-3 py-2 text-[13px] text-mist focus:border-mist focus:outline-none";

export default function MarketplaceBrowser() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MatchProfile & { medSchool: string | null; cvUrl: string | null; role: string | null }>({
    targetSpecialty: null,
    currentSpecialty: null,
    hospitalTrust: null,
    preferredRegion: null,
    yearOfStudy: null,
    grade: null,
    skills: null,
    qiExperience: null,
    researchExperience: null,
    availabilityHours: null,
    medSchool: null,
    cvUrl: null,
    role: null,
  });
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [postersById, setPostersById] = useState<Map<string, PosterProfile>>(new Map());
  const [applicationsByOpportunity, setApplicationsByOpportunity] = useState<Map<string, MyApplication>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactEmails, setContactEmails] = useState<Map<string, string | null>>(new Map());

  const [taskTypeFilter, setTaskTypeFilter] = useState<TaskType | "">("");
  const [restrictToPartners, setRestrictToPartners] = useState(true);
  const [beginnerFriendlyOnly, setBeginnerFriendlyOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState<"all" | "near_me" | "remote">("all");

  const [coverNote, setCoverNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: p } = await supabase
          .from("profiles")
          .select(
            "target_specialty, current_specialty, hospital_trust, preferred_region, year_of_study, grade, skills, qi_experience, research_experience, availability_hours, med_school, cv_url, role"
          )
          .eq("id", currentUser.id)
          .maybeSingle();

        if (p) {
          setProfile({
            targetSpecialty: p.target_specialty,
            currentSpecialty: p.current_specialty,
            hospitalTrust: p.hospital_trust,
            preferredRegion: p.preferred_region,
            yearOfStudy: p.year_of_study,
            grade: p.grade,
            skills: p.skills as Skill[] | null,
            qiExperience: p.qi_experience as MatchProfile["qiExperience"],
            researchExperience: p.research_experience as MatchProfile["researchExperience"],
            availabilityHours: p.availability_hours as MatchProfile["availabilityHours"],
            medSchool: p.med_school,
            cvUrl: p.cv_url,
            role: p.role,
          });
        }

        const { data: myApplications } = await supabase
          .from("opportunity_applications")
          .select("id, opportunity_id, status")
          .eq("applicant_id", currentUser.id)
          .neq("status", "withdrawn");
        if (myApplications) {
          setApplicationsByOpportunity(
            new Map(myApplications.map((a) => [a.opportunity_id, { id: a.id, status: a.status }]))
          );
        }
      }

      const { data: opps } = await supabase
        .from("opportunities")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (opps) {
        setOpportunities(opps);
        if (opps.length) setSelectedId(opps[0].id);

        const posterIds = [...new Set(opps.map((o) => o.poster_id))];
        if (posterIds.length) {
          const { data: posters } = await supabase
            .from("profiles")
            .select("id, full_name, department, hospital_trust, avatar_url, gmc_number")
            .in("id", posterIds);
          if (posters) {
            setPostersById(new Map(posters.map((p) => [p.id, p])));
          }
        }
      }
      setLoading(false);
    }
    init();
  }, [supabase]);

  const partneredHospitals = useMemo(() => getPartneredHospitals(profile.medSchool), [profile.medSchool]);
  const hasPartnershipData = partneredHospitals.length > 0;

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (taskTypeFilter && o.task_type !== taskTypeFilter) return false;
      if (restrictToPartners && hasPartnershipData && o.hospital_trust) {
        const onList = partneredHospitals.some((h) => o.hospital_trust!.toLowerCase().includes(h.toLowerCase()));
        if (!onList) return false;
      }
      if (beginnerFriendlyOnly && o.experience_level !== "no_experience_needed") return false;
      if (locationFilter === "remote" && !o.is_remote) return false;
      if (locationFilter === "near_me") {
        if (o.is_remote) return false;
        const trustMatch =
          !!o.hospital_trust && !!profile.hospitalTrust && profile.hospitalTrust.toLowerCase().includes(o.hospital_trust.toLowerCase());
        const regionMatch = !!o.deanery_region && o.deanery_region === profile.preferredRegion;
        if (!trustMatch && !regionMatch) return false;
      }
      return true;
    });
  }, [
    opportunities,
    taskTypeFilter,
    restrictToPartners,
    hasPartnershipData,
    partneredHospitals,
    beginnerFriendlyOnly,
    locationFilter,
    profile.hospitalTrust,
    profile.preferredRegion,
  ]);

  const matchByOpportunity = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeMatch>>();
    for (const o of filtered) map.set(o.id, computeMatch(o, profile));
    return map;
  }, [filtered, profile]);

  // Ranked by match % descending, as advertised — filtering happens above, ordering happens here.
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => (matchByOpportunity.get(b.id)?.percent ?? 0) - (matchByOpportunity.get(a.id)?.percent ?? 0));
  }, [filtered, matchByOpportunity]);

  const selected = sorted.find((o) => o.id === selectedId) ?? sorted[0] ?? null;
  const selectedMatch = selected ? (matchByOpportunity.get(selected.id) ?? computeMatch(selected, profile)) : null;
  const hasUnmetRequired = selectedMatch?.checks.some((c) => c.required && !c.met) ?? false;
  const selectedApplication = selected ? applicationsByOpportunity.get(selected.id) : undefined;

  useEffect(() => {
    if (selectedApplication?.status !== "accepted" || contactEmails.has(selectedApplication.id)) return;
    const applicationId = selectedApplication.id;
    (async () => {
      const { data } = await supabase.rpc("get_accepted_contact_email", { p_application_id: applicationId });
      setContactEmails((prev) => new Map(prev).set(applicationId, data ?? null));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApplication?.id, selectedApplication?.status]);

  async function handleApply() {
    if (!user || !selected) return;
    setApplying(true);
    setApplyError(null);

    const { data, error } = await supabase
      .from("opportunity_applications")
      .insert({
        opportunity_id: selected.id,
        applicant_id: user.id,
        cover_note: coverNote || null,
      })
      .select("id, status")
      .single();

    setApplying(false);
    if (error || !data) {
      setApplyError(error?.message ?? "Something went wrong.");
      return;
    }
    notifyPosterOfNewApplication(selected.id);
    setApplicationsByOpportunity((prev) => new Map(prev).set(selected.id, { id: data.id, status: data.status }));
    setCoverNote("");
    toastQueue.add({
      title: "Application sent",
      description: `The poster for "${selected.title}" will be in touch if you're shortlisted.`,
    });
  }

  if (loading) {
    return <div className="mt-8 rounded-cards bg-carbon p-6 shadow-subtle text-body-sm text-fog">Loading…</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className={INPUT_CLASS}
          value={taskTypeFilter}
          onChange={(e) => setTaskTypeFilter(e.target.value as TaskType | "")}
        >
          <option value="" className="bg-carbon">All types</option>
          {TASK_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-carbon">{o.label}</option>
          ))}
        </select>

        <select
          className={INPUT_CLASS}
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value as "all" | "near_me" | "remote")}
        >
          <option value="all" className="bg-carbon">All locations</option>
          <option value="near_me" className="bg-carbon">Near me</option>
          <option value="remote" className="bg-carbon">Remote / virtual only</option>
        </select>

        {hasPartnershipData && (
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-mist">
            <input
              type="checkbox"
              checked={restrictToPartners}
              onChange={(e) => setRestrictToPartners(e.target.checked)}
              className="accent-acid-lime"
            />
            Only {profile.medSchool}&apos;s partner hospitals
          </label>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-mist">
          <input
            type="checkbox"
            checked={beginnerFriendlyOnly}
            onChange={(e) => setBeginnerFriendlyOnly(e.target.checked)}
            className="accent-acid-lime"
          />
          Beginner friendly only
        </label>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-6 rounded-cards bg-carbon p-6 shadow-subtle text-body-sm text-fog">
          No open opportunities match right now
          {restrictToPartners && hasPartnershipData ? " — try turning off the partner-hospital filter." : "."}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-2">
            {sorted.map((o) => {
              const application = applicationsByOpportunity.get(o.id);
              return (
                <button
                  key={o.id}
                  onClick={() => setSelectedId(o.id)}
                  className={`w-full rounded-cards border p-4 text-left transition-colors ${
                    selected?.id === o.id ? "border-acid-lime bg-acid-lime/5" : "border-graphite bg-carbon hover:border-smoke"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-[510] text-paper">{o.title}</p>
                    {user && (
                      <span className="shrink-0 rounded-badges bg-acid-lime/15 px-[6px] text-label font-[510] text-acid-lime">
                        {matchByOpportunity.get(o.id)?.percent ?? 0}% match
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-body-sm text-fog">
                    {o.is_remote ? "Remote / virtual" : o.hospital_trust ?? "Location not specified"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-badges bg-black/[0.045] px-[6px] text-label text-fog">
                      {TASK_TYPE_OPTIONS.find((t) => t.value === o.task_type)?.label ?? o.task_type}
                    </span>
                    {application && (
                      <span className={`rounded-badges px-[6px] text-label ${STATUS_PILL[application.status] ?? "bg-black/[0.045] text-fog"}`}>
                        {STATUS_LABEL[application.status] ?? application.status}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="h-fit rounded-cards bg-carbon p-6 shadow-subtle">
              <h2 className="text-[20px] font-[510] tracking-[-0.24px] text-paper">{selected.title}</h2>
              <p className="mt-1 text-body-sm text-fog">
                {selected.is_remote ? "Remote / virtual" : selected.hospital_trust ?? "Location not specified"}
              </p>

              {(() => {
                const poster = postersById.get(selected.poster_id);
                if (!poster) return null;
                return (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-7 w-7 shrink-0 overflow-hidden rounded-pills bg-black/[0.045]">
                      {poster.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={poster.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <p className="text-body-sm text-fog">
                      Posted by{" "}
                      <span className="text-mist">{poster.full_name || "a Hitch member"}</span>
                      {[poster.department, poster.hospital_trust].filter(Boolean).length > 0 &&
                        ` · ${[poster.department, poster.hospital_trust].filter(Boolean).join(", ")}`}
                      {poster.gmc_number && ` · GMC ${poster.gmc_number}`}
                    </p>
                  </div>
                );
              })()}

              <p className="mt-4 whitespace-pre-wrap text-body-sm text-mist">{selected.description}</p>

              {selectedMatch && selectedMatch.checks.length > 0 && (
                <div className="mt-6 border-t-[0.5px] border-graphite pt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-caption font-[510] text-fog">How this lines up with your profile</p>
                    <span className="rounded-badges bg-acid-lime/15 px-[6px] text-label font-[510] text-acid-lime">
                      {selectedMatch.percent}% match
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-ash">
                    Based on what the poster&apos;s looking for — a guide, not a gate. You can apply regardless of your score.
                  </p>
                  <ul className="mt-2 space-y-1">
                    {selectedMatch.checks.map((c) => {
                      const unmetRequired = c.required && !c.met;
                      return (
                        <li key={c.label} className="flex items-center gap-2 text-body-sm">
                          <span className={c.met ? "text-pulse-green" : unmetRequired ? "text-coral-red" : "text-ash"}>
                            {c.met ? "✓" : "○"}
                          </span>
                          <span className={c.met ? "text-mist" : unmetRequired ? "text-coral-red" : "text-ash"}>
                            {c.label}
                            {c.required && <span className="ml-1 text-label text-ash">(required)</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="mt-6 grid gap-3 border-t-[0.5px] border-graphite pt-4 text-body-sm sm:grid-cols-2">
                {selected.estimated_commitment && (
                  <div><span className="text-fog">Commitment: </span><span className="text-mist">{selected.estimated_commitment}</span></div>
                )}
                {selected.project_duration && (
                  <div><span className="text-fog">Duration: </span><span className="text-mist">{PROJECT_DURATION_OPTIONS.find((d) => d.value === selected.project_duration)?.label ?? selected.project_duration}</span></div>
                )}
                {selected.deadline && (
                  <div><span className="text-fog">Apply by: </span><span className="text-mist">{new Date(selected.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                )}
                {selected.min_year_of_study && (
                  <div><span className="text-fog">Minimum stage: </span><span className="text-mist">{stageLabel(selected.min_year_of_study)}+</span></div>
                )}
                {selected.experience_level && (
                  <div><span className="text-fog">Experience: </span><span className="text-mist">{selected.experience_level.replace(/_/g, " ")}</span></div>
                )}
              </div>

              {((selected.required_skills && selected.required_skills.length > 0) ||
                (selected.preferred_skills && selected.preferred_skills.length > 0)) && (
                <div className="mt-4 flex flex-wrap gap-1">
                  {selected.required_skills?.map((s) => (
                    <span key={s} className="rounded-badges bg-iris-violet/15 px-[6px] text-label text-iris-violet">
                      {SKILL_OPTIONS.find((o) => o.value === s)?.label ?? s}
                    </span>
                  ))}
                  {selected.preferred_skills?.map((s) => (
                    <span key={s} className="rounded-badges bg-black/[0.045] px-[6px] text-label text-fog">
                      {SKILL_OPTIONS.find((o) => o.value === s)?.label ?? s} (preferred)
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t-[0.5px] border-graphite pt-4">
                {!user ? (
                  <Link href="/login" className="text-[13px] font-[510] text-mist underline hover:text-paper">Sign in to apply</Link>
                ) : selectedApplication?.status === "accepted" ? (
                  <div className="rounded-inputs border border-pulse-green/40 bg-pulse-green/[0.06] p-4">
                    <p className="text-body-sm font-[510] text-paper">You&apos;ve been accepted 🎉</p>
                    {contactEmails.get(selectedApplication.id) ? (
                      <p className="mt-1 text-body-sm text-mist">
                        Reach out to the poster directly:{" "}
                        <a href={`mailto:${contactEmails.get(selectedApplication.id)}`} className="font-[510] underline hover:text-paper">
                          {contactEmails.get(selectedApplication.id)}
                        </a>
                      </p>
                    ) : (
                      <p className="mt-1 text-caption text-ash">Loading contact details…</p>
                    )}
                  </div>
                ) : selectedApplication ? (
                  <span className={`rounded-badges px-[6px] text-label ${STATUS_PILL[selectedApplication.status] ?? "bg-black/[0.045] text-fog"}`}>
                    {STATUS_LABEL[selectedApplication.status] ?? selectedApplication.status}
                  </span>
                ) : !profile.cvUrl ? (
                  <div className="text-body-sm text-fog">
                    <Link href="/profile" className="font-[510] text-mist underline hover:text-paper">Add a CV to your profile</Link>{" "}
                    before applying.
                  </div>
                ) : (
                  <div>
                    {hasUnmetRequired && (
                      <p className="mb-3 rounded-inputs bg-coral-red/10 p-3 text-body-sm text-coral-red shadow-[0_0_0_0.5px_var(--color-coral-red)_inset]">
                        You&apos;re missing a required item for this opportunity — you can still apply, but the poster is looking for candidates who have it.
                      </p>
                    )}
                    <textarea
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      rows={3}
                      placeholder="Optional note to the poster"
                      className="w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[14px] text-mist focus:border-mist focus:outline-none"
                    />
                    {applyError && <p className="mt-2 text-caption text-coral-red">{applyError}</p>}
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="mt-3 rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {applying ? "Applying…" : "Apply"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
