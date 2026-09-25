"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const APPLICANT_ROLES = new Set(["medical_student", "doctor_applicant"]);

export default function ProfileForm() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [aboutMotivation, setAboutMotivation] = useState("");
  const [aboutExperience, setAboutExperience] = useState("");
  const [aboutGoals, setAboutGoals] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cvFilename, setCvFilename] = useState<string | null>(null);
  const [cvPath, setCvPath] = useState<string | null>(null);
  const [cvUploadedAt, setCvUploadedAt] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

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
        .select("full_name, role, about_motivation, about_experience, about_goals, avatar_url, cv_url, cv_filename, cv_uploaded_at")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profile) {
        setRole(profile.role);
        setFullName(profile.full_name ?? "");
        setAboutMotivation(profile.about_motivation ?? "");
        setAboutExperience(profile.about_experience ?? "");
        setAboutGoals(profile.about_goals ?? "");
        setAvatarUrl(profile.avatar_url);
        setCvPath(profile.cv_url);
        setCvFilename(profile.cv_filename);
        setCvUploadedAt(profile.cv_uploaded_at);
      }
      setLoading(false);
    }
    init();
  }, [supabase, router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setSaving(true);
    setMessage(null);

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage(uploadError.message);
      setSaving(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`; // bust cache on re-upload

    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    setAvatarUrl(publicUrl);
    setSaving(false);
    setMessage("Photo updated.");
  }

  async function handleCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== "application/pdf") {
      setMessage("CV must be a PDF.");
      return;
    }
    setSaving(true);
    setMessage(null);

    const path = `${user.id}/cv.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage(uploadError.message);
      setSaving(false);
      return;
    }

    const uploadedAt = new Date().toISOString();
    await supabase
      .from("profiles")
      .update({ cv_url: path, cv_filename: file.name, cv_uploaded_at: uploadedAt })
      .eq("id", user.id);

    setCvPath(path);
    setCvFilename(file.name);
    setCvUploadedAt(uploadedAt);
    setSaving(false);
    setMessage("CV uploaded.");
  }

  async function handleSaveAbout(field: "about_motivation" | "about_experience" | "about_goals", value: string) {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    const update =
      field === "about_motivation"
        ? { about_motivation: value }
        : field === "about_experience"
          ? { about_experience: value }
          : { about_goals: value };
    await supabase.from("profiles").update(update).eq("id", user.id);
    setSaving(false);
    setMessage("Saved.");
  }

  async function handleSaveName() {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    setSaving(false);
    setMessage("Name saved.");
  }

  async function handleViewCv() {
    if (!cvPath) return;
    const { data, error } = await supabase.storage.from("cvs").createSignedUrl(cvPath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    if (error) setMessage(error.message);
  }

  if (loading) {
    return <div className="mt-8 rounded-cards bg-carbon p-6 shadow-subtle text-body-sm text-fog">Loading…</div>;
  }

  const isApplicant = role ? APPLICANT_ROLES.has(role) : true;

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-cards bg-carbon p-6 shadow-subtle">
        <label className="block text-body-sm text-mist">Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={handleSaveName}
          placeholder="Shown to posters when you apply"
          className="mt-1 w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[14px] text-mist focus:border-mist focus:outline-none"
        />
      </div>

      <div className="rounded-cards bg-carbon p-6 shadow-subtle">
        <p className="text-body-sm text-mist">Photo</p>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-pills bg-black/[0.045]">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Profile photo" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-caption text-ash">No photo</div>
            )}
          </div>
          <div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={saving}
              className="rounded-buttons border border-graphite px-4 py-2 text-[13px] text-mist hover:border-smoke disabled:opacity-50"
            >
              {avatarUrl ? "Change photo" : "Upload photo"}
            </button>
          </div>
        </div>
      </div>

      {isApplicant ? (
        <>
          <div className="rounded-cards bg-carbon p-6 shadow-subtle space-y-4">
            <div>
              <p className="text-body-sm text-mist">About you</p>
              <p className="mt-0.5 text-caption text-ash">
                Posters see this when you apply — answering all three helps them compare applicants fairly.
              </p>
            </div>

            <div>
              <label className="block text-caption text-ash">What draws you to this specialty / type of work?</label>
              <textarea
                value={aboutMotivation}
                onChange={(e) => setAboutMotivation(e.target.value)}
                onBlur={() => handleSaveAbout("about_motivation", aboutMotivation)}
                rows={2}
                placeholder="e.g. what's pulling you toward this area, or why you want to build this skill"
                className="mt-1 w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[14px] text-mist focus:border-mist focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-caption text-ash">Relevant experience so far</label>
              <textarea
                value={aboutExperience}
                onChange={(e) => setAboutExperience(e.target.value)}
                onBlur={() => handleSaveAbout("about_experience", aboutExperience)}
                rows={2}
                placeholder="e.g. audits, QIPs, research, or anything else relevant — even if informal"
                className="mt-1 w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[14px] text-mist focus:border-mist focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-caption text-ash">What are you hoping to get out of it?</label>
              <textarea
                value={aboutGoals}
                onChange={(e) => setAboutGoals(e.target.value)}
                onBlur={() => handleSaveAbout("about_goals", aboutGoals)}
                rows={2}
                placeholder="e.g. a specific portfolio point, co-authorship, or just hands-on experience"
                className="mt-1 w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[14px] text-mist focus:border-mist focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-cards bg-carbon p-6 shadow-subtle">
            <p className="text-body-sm text-mist">CV</p>
            <p className="mt-1 text-caption text-ash">PDF only. Required before you can apply to an opportunity.</p>
            <div className="mt-3 flex items-center gap-3">
              <input ref={cvInputRef} type="file" accept="application/pdf" onChange={handleCvChange} className="hidden" />
              <button
                onClick={() => cvInputRef.current?.click()}
                disabled={saving}
                className="rounded-buttons border border-graphite px-4 py-2 text-[13px] text-mist hover:border-smoke disabled:opacity-50"
              >
                {cvFilename ? "Replace CV" : "Upload CV"}
              </button>
              {cvFilename && (
                <button onClick={handleViewCv} className="text-[13px] text-mist underline hover:text-paper">
                  {cvFilename}
                </button>
              )}
            </div>
            {cvUploadedAt && (
              <p className="mt-2 text-caption text-ash">
                Uploaded {new Date(cvUploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-cards bg-carbon p-6 shadow-subtle">
          <p className="text-body-sm text-mist">Posting as {fullName || "yourself"}</p>
          <p className="mt-1 text-caption text-ash">
            As a consultant or registrar, applicants see your name when you post an opportunity — no CV or applicant
            bio needed here.
          </p>
        </div>
      )}

      {message && <p className="text-caption text-fog">{message}</p>}
    </div>
  );
}
