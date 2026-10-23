"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  TASK_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  SKILL_OPTIONS,
  AVAILABILITY_OPTIONS,
  PROJECT_DURATION_OPTIONS,
  type TaskType,
  type ExperienceLevel,
  type Skill,
  type AvailabilityHours,
  type ProjectDuration,
} from "@/lib/data/marketplace-options";
import { SPECIALTIES } from "@/lib/data/specialties";
import { UK_DEANERIES } from "@/lib/data/deaneries";
import { STAGE_OPTIONS } from "@/lib/data/onboarding-options";

const SPECIALTY_OPTIONS = [...SPECIALTIES, "Not specific"];

const INPUT_CLASS =
  "mt-1 w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[14px] text-mist focus:border-mist focus:outline-none";

export default function PostForm() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("qip");

  const [isRemote, setIsRemote] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [hospitalTrust, setHospitalTrust] = useState("");
  const [deaneryRegion, setDeaneryRegion] = useState("");
  const [minYearOfStudy, setMinYearOfStudy] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<Skill[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<Skill[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [estimatedCommitment, setEstimatedCommitment] = useState<AvailabilityHours | "">("");
  const [projectDuration, setProjectDuration] = useState<ProjectDuration | "">("");
  const [deadline, setDeadline] = useState("");

  function toggleSkill(list: Skill[], setList: (v: Skill[]) => void, skill: Skill) {
    setList(list.includes(skill) ? list.filter((s) => s !== skill) : [...list, skill]);
  }

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("hospital_trust, preferred_region")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profile?.hospital_trust) setHospitalTrust(profile.hospital_trust);
      if (profile?.preferred_region) setDeaneryRegion(profile.preferred_region);
      setLoading(false);
    }
    init();
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!isRemote && !hospitalTrust) {
      setError("Add a hospital / trust, or mark this as remote / virtual.");
      return;
    }
    if (requiredSkills.length === 0) {
      setError("Pick at least one required skill. This is what students are matched against.");
      return;
    }

    setSaving(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("opportunities")
      .insert({
        poster_id: user.id,
        title,
        description,
        task_type: taskType,
        is_remote: isRemote,
        specialty: specialty || null,
        hospital_trust: hospitalTrust || null,
        deanery_region: deaneryRegion || null,
        min_year_of_study: minYearOfStudy,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills.length ? preferredSkills : null,
        experience_level: experienceLevel,
        estimated_commitment: estimatedCommitment,
        project_duration: projectDuration || null,
        deadline: deadline || null,
      })
      .select("id")
      .single();

    setSaving(false);

    if (insertError || !data) {
      setError(insertError?.message ?? "Something went wrong.");
      return;
    }

    router.push(`/marketplace/mine`);
  }

  if (loading) {
    return <div className="mt-8 rounded-cards bg-carbon p-6 shadow-subtle text-body-sm text-fog">Loading…</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div className="rounded-cards bg-carbon p-6 shadow-subtle space-y-4">
        <div>
          <label className="block text-body-sm text-mist">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Help needed with a falls-prevention audit"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-body-sm text-mist">Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What the task involves, and what a student would get out of it."
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-body-sm text-mist">Type</label>
          <select className={INPUT_CLASS} value={taskType} onChange={(e) => setTaskType(e.target.value as TaskType)}>
            {TASK_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-carbon">
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-cards bg-carbon p-6 shadow-subtle space-y-4">
        <p className="text-caption text-ash">
          The more you specify here, the better a student can judge whether this is right for
          them, and the more accurately we can match them against it.
        </p>

        <div>
          <label className="block text-body-sm text-mist">Where will this be done?</label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setIsRemote(false)}
              className={`rounded-pills border px-3 py-[7px] text-[13px] transition-colors ${
                !isRemote ? "border-acid-lime bg-acid-lime/10 text-paper" : "border-graphite text-mist hover:border-smoke"
              }`}
            >
              In person
            </button>
            <button
              type="button"
              onClick={() => setIsRemote(true)}
              className={`rounded-pills border px-3 py-[7px] text-[13px] transition-colors ${
                isRemote ? "border-acid-lime bg-acid-lime/10 text-paper" : "border-graphite text-mist hover:border-smoke"
              }`}
            >
              Remote / virtual
            </button>
          </div>
        </div>

        <div>
          <label className="block text-body-sm text-mist">Specialty</label>
          <select className={INPUT_CLASS} value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
            <option value="" className="bg-carbon">
              Not specified
            </option>
            {SPECIALTY_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-carbon">
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-body-sm text-mist">
              Hospital / trust{!isRemote && <span className="text-coral-red"> *</span>}
            </label>
            <input
              type="text"
              required={!isRemote}
              value={hospitalTrust}
              onChange={(e) => setHospitalTrust(e.target.value)}
              placeholder={isRemote ? "Optional for remote work" : "e.g. St Mary's Hospital"}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className="block text-body-sm text-mist">Deanery / region</label>
            <select className={INPUT_CLASS} value={deaneryRegion} onChange={(e) => setDeaneryRegion(e.target.value)}>
              <option value="" className="bg-carbon">
                Not specified
              </option>
              {UK_DEANERIES.map((r) => (
                <option key={r} value={r} className="bg-carbon">
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-body-sm text-mist">Minimum year / stage *</label>
          <select
            required
            className={INPUT_CLASS}
            value={minYearOfStudy}
            onChange={(e) => setMinYearOfStudy(e.target.value)}
          >
            <option value="" className="bg-carbon" disabled>
              Select one
            </option>
            {STAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-carbon">
                {o.label}+
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-body-sm text-mist">Required skills *</label>
          <p className="mt-0.5 text-caption text-ash">
            Pick at least one: what a student truly can&apos;t do the task without.
          </p>
          <SkillChips selected={requiredSkills} onToggle={(s) => toggleSkill(requiredSkills, setRequiredSkills, s)} />
        </div>

        <div>
          <label className="block text-body-sm text-mist">Preferred skills</label>
          <p className="mt-0.5 text-caption text-ash">Nice-to-haves: these boost match ranking but don&apos;t exclude anyone.</p>
          <SkillChips selected={preferredSkills} onToggle={(s) => toggleSkill(preferredSkills, setPreferredSkills, s)} />
        </div>

        <div>
          <label className="block text-body-sm text-mist">Experience level *</label>
          <select
            required
            className={INPUT_CLASS}
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel | "")}
          >
            <option value="" className="bg-carbon" disabled>
              Select one
            </option>
            {EXPERIENCE_LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-carbon">
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-body-sm text-mist">Estimated commitment *</label>
            <select
              required
              className={INPUT_CLASS}
              value={estimatedCommitment}
              onChange={(e) => setEstimatedCommitment(e.target.value as AvailabilityHours | "")}
            >
              <option value="" className="bg-carbon" disabled>
                Select one
              </option>
              {AVAILABILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-carbon">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-body-sm text-mist">Total project duration</label>
            <select
              className={INPUT_CLASS}
              value={projectDuration}
              onChange={(e) => setProjectDuration(e.target.value as ProjectDuration | "")}
            >
              <option value="" className="bg-carbon">
                Not specified
              </option>
              {PROJECT_DURATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-carbon">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-body-sm text-mist">Deadline to apply</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-inputs bg-coral-red/10 p-3 text-body-sm text-coral-red shadow-[0_0_0_0.5px_var(--color-coral-red)_inset]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Posting…" : "Post opportunity"}
      </button>
    </form>
  );
}

function SkillChips({ selected, onToggle }: { selected: Skill[]; onToggle: (skill: Skill) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {SKILL_OPTIONS.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            className={`rounded-pills border px-3 py-[6px] text-[13px] transition-colors ${
              active ? "border-acid-lime bg-acid-lime/10 text-paper" : "border-graphite text-mist hover:border-smoke"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
