"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const CONTACT_EMAIL_TO = "oran.barak9@gmail.com";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in every field." };
  }

  const supabase = await createClient();
  const { error: dbError } = await supabase.from("contact_messages").insert({ name, email, message });

  if (dbError) {
    return { status: "error", message: "Something went wrong saving your message. Please try again." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "Hitch <onboarding@resend.dev>",
        to: CONTACT_EMAIL_TO,
        replyTo: email,
        subject: `New contact message from ${name}`,
        text: `${message}\n\nFrom ${name} (${email})`,
      });
    } catch (err) {
      // The message is already saved in Supabase above. A delivery failure here shouldn't
      // fail the submission, it just means this one gets caught up on manually.
      console.error("Failed to send contact email:", err);
    }
  } else {
    console.warn("RESEND_API_KEY not set. Contact message saved to Supabase but no email was sent.");
  }

  return { status: "success" };
}
