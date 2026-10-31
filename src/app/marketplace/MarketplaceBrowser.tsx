"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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

type SortKey = "match" | "newest" | "closing";

const SKILL_LABEL = new Map(SKILL_OPTIONS.map((s) => [s.value, s.label]));

// Whichever of hours, length and closing date a posting actually has. Anything missing is left
// out rather than shown as an empty or "not specified" field.
function cardFacts(o: Opportunity) {
  const facts: string[] = [];
  if (o.estimated_commitment) facts.push(o.estimated_commitment);
  if (o.project_duration) {
    facts.push(PROJECT_DURATION_OPTIONS.find((d) => d.value === o.project_duration)?.label ?? o.project_duration);
  }
  if (o.deadline) {
    facts.push(
      `Apply by ${new Date(o.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
    );
  }
  return facts;
}

// Searches the text a student would actually type: the title, the body, where it is, and the
// skills, matched on both the stored value ("literature_review") and the label a human sees.
function searchHaystack(o: Opportunity) {
  const skills = [...(o.required_skills ?? []), ...(o.preferred_skills ?? [])];
  return [
    o.title,
    o.description,
    o.hospital_trust,
    o.specialty,
    o.deanery_region,
    o.is_remote ? "remote virtual" : "",
    ...skills,
    ...skills.map((s) => SKILL_LABEL.get(s as Skill) ?? ""),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

// Mirrors the real two-column layout so the page doesn't jump when results arrive.
function ListingsSkeleton() {
  return (
    <div className="mt-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading opportunities</span>
      <div className="flex flex-wrap items-center gap-3">
        {[112, 128, 96].map((w) => (
          <div key={w} className="h-[42px] animate-pulse rounded-inputs bg-black/[0.045]" style={{ width: w }} />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-cards border border-graphite bg-carbon p-4">
              <div className="h-[15px] w-3/4 animate-pulse rounded-small bg-black/[0.055]" />
              <div className="mt-2 h-[13px] w-1/2 animate-pulse rounded-small bg-black/[0.035]" />
              <div className="mt-3 h-[18px] w-24 animate-pulse rounded-badges bg-black/[0.035]" />
            </div>
          ))}
        </div>
        <div className="h-fit rounded-cards bg-carbon p-6 shadow-subtle">
          <div className="h-[22px] w-2/3 animate-pulse rounded-small bg-black/[0.055]" />
          <div className="mt-3 h-[13px] w-1/3 animate-pulse rounded-small bg-black/[0.035]" />
          <div className="mt-6 space-y-2 border-t border-graphite pt-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[13px] animate-pulse rounded-small bg-black/[0.035]" style={{ width: `${90 - i * 12}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// Deliberately no name, photo or GMC number. A posting is attributed to a department and a
// hospital, not to an identifiable individual, so browsing the board does not expose who posted
// what. The poster's email is still revealed to an applicant once they are accepted.
type PosterProfile = {
  department: string | null;
  hospital_trust: string | null;
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
  "min-h-[44px] rounded-inputs border border-graphite bg-black/[0.025] px-3 py-2 text-[13px] text-mist focus:border-mist focus:outline-none";

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
  const reducedMotion = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [contactEmails, setContactEmails] = useState<Map<string, string | null>>(new Map());

  const [taskTypeFilter, setTaskTypeFilter] = useState<TaskType | "">("");
  const [restrictToPartners, setRestrictToPartners] = useState(true);
  const [beginnerFriendlyOnly, setBeginnerFriendlyOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState<"all" | "near_me" | "remote">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("match");
  const [listingState, setListingState] = useState<Map<string, "saved" | "hidden">>(new Map());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  // Resets to the broadest view rather than to initial state: restrictToPartners starts on, so
  // "clear" has to switch it off or the widest result set is still hidden.
  // Optimistic: the row is written in the background so the board reacts immediately. On failure
  // the previous state is put back rather than leaving the UI claiming something that isn't saved.
  async function setListing(opportunityId: string, next: "saved" | "hidden" | null) {
    if (!user) return;
    const previous = listingState.get(opportunityId) ?? null;
    setListingState((m) => {
      const copy = new Map(m);
      if (next) copy.set(opportunityId, next);
      else copy.delete(opportunityId);
      return copy;
    });

    const query = next
      ? supabase.from("saved_listings").upsert(
          { user_id: user.id, opportunity_id: opportunityId, state: next },
          { onConflict: "user_id,opportunity_id" }
        )
      : supabase.from("saved_listings").delete().eq("user_id", user.id).eq("opportunity_id", opportunityId);

    const { error } = await query;
    if (error) {
      setListingState((m) => {
        const copy = new Map(m);
        if (previous) copy.set(opportunityId, previous);
        else copy.delete(opportunityId);
        return copy;
      });
      toastQueue.add({ title: "Couldn't update that", description: "Please try again." });
    }
  }

  function clearFilters() {
    setTaskTypeFilter("");
    setLocationFilter("all");
    setBeginnerFriendlyOnly(false);
    setRestrictToPartners(false);
    setSearch("");
    setSortBy("match");
  }

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

        const { data: saved } = await supabase
          .from("saved_listings")
          .select("opportunity_id, state")
          .eq("user_id", currentUser.id);
        if (saved) {
          setListingState(new Map(saved.map((s) => [s.opportunity_id, s.state as "saved" | "hidden"])));
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

      const { data: opps, error: oppsError } = await supabase
        .from("opportunities")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (oppsError) throw oppsError;
      if (opps) {
        setOpportunities(opps);
        if (opps.length) setSelectedId(opps[0].id);

        const posterIds = [...new Set(opps.map((o) => o.poster_id))];
        if (posterIds.length) {
          const { data: posters } = await supabase
            .from("profiles")
            .select("id, department, hospital_trust")
            .in("id", posterIds);
          if (posters) {
            setPostersById(new Map(posters.map((p) => [p.id, p])));
          }
        }
      }
    }
    // Without this the listings query rejecting (dropped connection, cold start) would leave the
    // page on its loading state forever, with no way back.
    init()
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [supabase]);

  const partneredHospitals = useMemo(() => getPartneredHospitals(profile.medSchool), [profile.medSchool]);
  const hasPartnershipData = partneredHospitals.length > 0;

  // Every word must appear somewhere, so "remote paediatrics" narrows rather than widens.
  const searchTerms = useMemo(
    () => search.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [search]
  );

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (taskTypeFilter && o.task_type !== taskTypeFilter) return false;
      if (restrictToPartners && hasPartnershipData && o.hospital_trust) {
        const onList = partneredHospitals.some((h) => o.hospital_trust!.toLowerCase().includes(h.toLowerCase()));
        if (!onList) return false;
      }
      if (beginnerFriendlyOnly && o.experience_level !== "no_experience_needed") return false;
      if (searchTerms.length && !searchTerms.every((t) => searchHaystack(o).includes(t))) return false;
      const state = listingState.get(o.id);
      if (showSavedOnly && state !== "saved") return false;
      if (state === "hidden" && !showHidden) return false;
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
    searchTerms,
    listingState,
    showSavedOnly,
    showHidden,
  ]);

  const matchByOpportunity = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeMatch>>();
    for (const o of filtered) map.set(o.id, computeMatch(o, profile));
    return map;
  }, [filtered, profile]);

  // Match ranking needs a profile to rank against, so signed-out visitors get newest instead of
  // an order derived from an empty profile. The picker hides "best match" for them too.
  const effectiveSort: SortKey = !user && sortBy === "match" ? "newest" : sortBy;

  const savedCount = useMemo(() => [...listingState.values()].filter((s) => s === "saved").length, [listingState]);
  const hiddenCount = useMemo(() => [...listingState.values()].filter((s) => s === "hidden").length, [listingState]);

  const anyFilterActive =
    search.trim() !== "" ||
    taskTypeFilter !== "" ||
    locationFilter !== "all" ||
    beginnerFriendlyOnly ||
    (restrictToPartners && hasPartnershipData) ||
    effectiveSort !== (user ? "match" : "newest");

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (effectiveSort === "newest") {
      return list.sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0));
    }
    if (effectiveSort === "closing") {
      // Postings without a deadline aren't closing at all, so they sort to the bottom.
      return list.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline < b.deadline ? -1 : a.deadline > b.deadline ? 1 : 0;
      });
    }
    return list.sort(
      (a, b) => (matchByOpportunity.get(b.id)?.percent ?? 0) - (matchByOpportunity.get(a.id)?.percent ?? 0)
    );
  }, [filtered, matchByOpportunity, effectiveSort]);

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
    return <ListingsSkeleton />;
  }

  if (loadError) {
    return (
      <div className="mt-8 rounded-cards bg-carbon p-6 shadow-subtle">
        <p className="font-[510] text-paper">We couldn&apos;t load opportunities</p>
        <p className="mt-2 max-w-md text-body-sm text-fog">
          Something went wrong fetching the list. This is usually a connection problem rather than
          anything you did.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, description, hospital or skill"
          aria-label="Search opportunities"
          className={`${INPUT_CLASS} w-full min-w-0 sm:w-auto sm:flex-1 sm:max-w-[320px]`}
        />

        <select
          className={INPUT_CLASS}
          value={taskTypeFilter}
          aria-label="Filter by opportunity type"
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
          aria-label="Filter by location"
          onChange={(e) => setLocationFilter(e.target.value as "all" | "near_me" | "remote")}
        >
          <option value="all" className="bg-carbon">All locations</option>
          <option value="near_me" className="bg-carbon">Near me</option>
          <option value="remote" className="bg-carbon">Remote / virtual only</option>
        </select>

        {hasPartnershipData && (
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-[13px] text-mist">
            <input
              type="checkbox"
              checked={restrictToPartners}
              onChange={(e) => setRestrictToPartners(e.target.checked)}
              className="h-[18px] w-[18px] accent-acid-lime"
            />
            Only {profile.medSchool}&apos;s partner hospitals
          </label>
        )}

        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-[13px] text-mist">
          <input
            type="checkbox"
            checked={beginnerFriendlyOnly}
            onChange={(e) => setBeginnerFriendlyOnly(e.target.checked)}
            className="h-[18px] w-[18px] accent-acid-lime"
          />
          Beginner friendly only
        </label>

        <select
          className={INPUT_CLASS}
          value={effectiveSort}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          aria-label="Sort opportunities"
        >
          {user && <option value="match" className="bg-carbon">Best match</option>}
          <option value="newest" className="bg-carbon">Newest</option>
          <option value="closing" className="bg-carbon">Closing soonest</option>
        </select>
      </div>

      {opportunities.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-body-sm text-fog">
            {sorted.length === opportunities.length
              ? `${opportunities.length} open ${opportunities.length === 1 ? "opportunity" : "opportunities"}`
              : `${sorted.length} of ${opportunities.length} ${opportunities.length === 1 ? "opportunity" : "opportunities"}`}
          </p>
          {anyFilterActive && (
            <button
              onClick={clearFilters}
              className="text-[13px] font-[510] text-mist underline underline-offset-2 transition-colors hover:text-paper"
            >
              Clear filters
            </button>
          )}
          {user && savedCount > 0 && (
            <button
              onClick={() => setShowSavedOnly((v) => !v)}
              className={`rounded-badges px-[8px] py-[2px] text-[13px] font-[510] transition-colors ${
                showSavedOnly ? "bg-acid-lime/15 text-acid-lime" : "text-mist hover:text-paper"
              }`}
            >
              {showSavedOnly ? `Showing ${savedCount} saved` : `Saved (${savedCount})`}
            </button>
          )}
          {user && hiddenCount > 0 && (
            <button
              onClick={() => setShowHidden((v) => !v)}
              className="text-[13px] font-[510] text-ash underline underline-offset-2 transition-colors hover:text-fog"
            >
              {showHidden
                ? "Stop showing hidden"
                : `${hiddenCount} hidden · show`}
            </button>
          )}
        </div>
      )}

      {opportunities.length > 0 && (
        <div className="mt-6 rounded-cards border border-graphite bg-black/[0.02] px-5 py-3">
          <p className="max-w-[60ch] text-body-sm text-mist">
            <span className="font-[510] text-paper">These are example opportunities.</span>{" "}
            Hitch isn&apos;t open for applications yet. They&apos;re here to show how the board works
            once real projects are posted.
          </p>
        </div>
      )}

      {!user && opportunities.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-cards border border-graphite bg-black/[0.02] px-5 py-4">
          <div>
            <p className="text-body-sm font-[510] text-paper">Sign in to see how well each one matches you</p>
            <p className="mt-1 max-w-[64ch] text-caption text-fog">
              Hitch scores every opportunity against your year, specialty interest, skills and
              availability, and ranks the list by fit. You can browse everything without an account.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex min-h-[44px] shrink-0 items-center rounded-buttons bg-acid-lime px-4 text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
      )}

      {sorted.length === 0 ? (
        opportunities.length === 0 ? (
          <div className="mt-6 rounded-cards bg-carbon p-8 text-center shadow-subtle">
            <p className="font-[510] text-paper">No open opportunities yet</p>
            <p className="mx-auto mt-2 max-w-md text-body-sm text-fog">
              Nothing has been posted so far. Opportunities appear here as soon as a consultant,
              registrar or QI team posts one.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/marketplace/post"
                className="rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90"
              >
                Post an opportunity
              </Link>
              <Link
                href="/demo"
                className="rounded-buttons border border-graphite px-4 py-[10px] text-[14px] font-[510] text-mist transition-colors hover:border-smoke hover:text-paper"
              >
                Try the demo
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-cards bg-carbon p-8 text-center shadow-subtle">
            <p className="font-[510] text-paper">No opportunities match these filters</p>
            <p className="mx-auto mt-2 max-w-md text-body-sm text-fog">
              {opportunities.length === 1
                ? "There is 1 open opportunity, but it doesn't match what you've selected."
                : `There are ${opportunities.length} open opportunities, but none match what you've selected.`}
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90"
            >
              Clear filters
            </button>
          </div>
        )
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-2">
            {sorted.map((o) => {
              const application = applicationsByOpportunity.get(o.id);
              const isSelected = selected?.id === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setSelectedId(o.id)}
                  className={`relative w-full rounded-cards border bg-carbon p-4 text-left transition-colors ${
                    isSelected ? "border-transparent" : "border-graphite hover:border-smoke"
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="marketplace-selection"
                      className="absolute inset-0 rounded-cards border border-acid-lime bg-acid-lime/5"
                      transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <div className="relative">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-[510] text-paper">{o.title}</p>
                      {user && (
                        <span className="shrink-0 rounded-badges bg-acid-lime/15 px-[6px] text-label font-[510] text-acid-lime">
                          {matchByOpportunity.get(o.id)?.percent ?? 0}% match
                        </span>
                      )}
                    </div>
                    {(o.is_remote || o.hospital_trust) && (
                      <p className="mt-1 text-body-sm text-fog">
                        {o.is_remote ? "Remote / virtual" : o.hospital_trust}
                      </p>
                    )}
                    {cardFacts(o).length > 0 && (
                      <p className="mt-1 text-caption text-ash">{cardFacts(o).join(" · ")}</p>
                    )}
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
                  </div>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
              transition={{ duration: reducedMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="h-fit rounded-cards bg-carbon p-6 shadow-subtle"
            >
              <h2 className="text-[20px] font-[510] tracking-[-0.24px] text-paper">{selected.title}</h2>
              <p className="mt-1 text-body-sm text-fog">
                {selected.is_remote ? "Remote / virtual" : selected.hospital_trust ?? "Location not specified"}
              </p>

              {(() => {
                const poster = postersById.get(selected.poster_id);
                if (!poster) return null;
                const postedFrom = [poster.department, poster.hospital_trust].filter(Boolean).join(" · ");
                if (!postedFrom) return null;
                return (
                  <p className="mt-3 text-body-sm text-fog">
                    Posted from <span className="text-mist">{postedFrom}</span>
                  </p>
                );
              })()}

              {user && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setListing(selected.id, listingState.get(selected.id) === "saved" ? null : "saved")
                    }
                    className={`rounded-buttons border px-3 py-[6px] text-[13px] font-[510] transition-colors ${
                      listingState.get(selected.id) === "saved"
                        ? "border-acid-lime bg-acid-lime/10 text-acid-lime"
                        : "border-graphite text-mist hover:border-smoke hover:text-paper"
                    }`}
                  >
                    {listingState.get(selected.id) === "saved" ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={() =>
                      setListing(selected.id, listingState.get(selected.id) === "hidden" ? null : "hidden")
                    }
                    className="rounded-buttons border border-graphite px-3 py-[6px] text-[13px] font-[510] text-mist transition-colors hover:border-smoke hover:text-paper"
                  >
                    {listingState.get(selected.id) === "hidden" ? "Unhide" : "Hide"}
                  </button>
                </div>
              )}

              <p className="mt-4 max-w-[70ch] whitespace-pre-wrap text-body-sm text-mist">{selected.description}</p>

              {selectedMatch && selectedMatch.checks.length > 0 && (
                <div className="mt-6 border-t-[0.5px] border-graphite pt-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="text-caption font-[510] text-fog">How this lines up with your profile</p>
                        <span className="rounded-badges bg-acid-lime/15 px-[6px] text-label font-[510] text-acid-lime">
                          {selectedMatch.percent}% match
                        </span>
                      </div>
                      <p className="mt-1 text-caption text-ash">
                        Based on what the poster&apos;s looking for: a guide, not a gate. You can apply regardless of your score.
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
                    </>
                  ) : (
                    /* Signed out there is no profile to compare against, so scoring it would be
                       meaningless. Show the poster's criteria plainly instead. */
                    <>
                      <p className="text-caption font-[510] text-fog">What this poster is looking for</p>
                      <ul className="mt-2 space-y-1">
                        {selectedMatch.checks.map((c) => (
                          <li key={c.label} className="flex items-center gap-2 text-body-sm text-mist">
                            <span className="text-ash">·</span>
                            <span>
                              {c.label}
                              {c.required && <span className="ml-1 text-label text-ash">(required)</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 rounded-inputs border border-graphite bg-black/[0.02] p-3">
                        <p className="text-body-sm font-[510] text-paper">See how well you match</p>
                        <p className="mt-1 text-caption text-fog">
                          Sign in and Hitch scores every opportunity against your year, specialty
                          interest, skills and availability, so you can see where you fit before
                          you apply.
                        </p>
                        <Link
                          href="/login"
                          className="mt-3 inline-flex min-h-[44px] items-center rounded-buttons bg-acid-lime px-4 text-[13px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90"
                        >
                          Sign in to see your match
                        </Link>
                      </div>
                    </>
                  )}
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
                  <Link href="/login" className="inline-flex min-h-[44px] items-center text-[13px] font-[510] text-mist underline hover:text-paper">Sign in to apply</Link>
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
                        You&apos;re missing a required item for this opportunity. You can still apply, but the poster is looking for candidates who have it.
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
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
