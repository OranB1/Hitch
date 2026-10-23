"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const STATUS_COPY: Record<string, { subject: string; body: (opportunityTitle: string) => string }> = {
  shortlisted: {
    subject: "You've been shortlisted",
    body: (title) => `You've been shortlisted for "${title}" on Hitch. The poster may be in touch to arrange next steps.`,
  },
  accepted: {
    subject: "Your application was accepted",
    body: (title) => `Good news: your application for "${title}" was accepted on Hitch. The poster will be in touch.`,
  },
  rejected: {
    subject: "Update on your application",
    body: (title) => `The poster for "${title}" has moved forward with another applicant this time. Keep browsing Hitch for more opportunities.`,
  },
};

async function sendNotificationEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set. Skipping notification email:", subject);
    return;
  }
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "Hitch <onboarding@resend.dev>",
      to,
      subject,
      text,
    });
  } catch (err) {
    // Notifications are best-effort: a delivery failure shouldn't surface as an app error.
    console.error("Failed to send notification email:", err);
  }
}

export async function notifyPosterOfNewApplication(opportunityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const [{ data: opportunity }, { data: applicantProfile }] = await Promise.all([
    supabase.from("opportunities").select("title, poster_id").eq("id", opportunityId).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);
  if (!opportunity) return;

  const { data: posterProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", opportunity.poster_id)
    .maybeSingle();
  if (!posterProfile?.email) return;

  await sendNotificationEmail({
    to: posterProfile.email,
    subject: `New application: ${opportunity.title}`,
    text: `${applicantProfile?.full_name || "Someone"} applied to "${opportunity.title}" on Hitch.\n\nView applicants: https://hitch.health/marketplace/mine`,
  });
}

export async function notifyApplicantOfStatusChange(applicationId: string, status: string) {
  const copy = STATUS_COPY[status];
  if (!copy) return;

  const supabase = await createClient();
  const { data: application } = await supabase
    .from("opportunity_applications")
    .select("applicant_id, opportunity_id")
    .eq("id", applicationId)
    .maybeSingle();
  if (!application) return;

  const [{ data: opportunity }, { data: applicantProfile }] = await Promise.all([
    supabase.from("opportunities").select("title").eq("id", application.opportunity_id).maybeSingle(),
    supabase.from("profiles").select("email").eq("id", application.applicant_id).maybeSingle(),
  ]);
  if (!opportunity || !applicantProfile?.email) return;

  await sendNotificationEmail({
    to: applicantProfile.email,
    subject: copy.subject,
    text: `${copy.body(opportunity.title)}\n\nView it: https://hitch.health/marketplace/applications`,
  });
}
