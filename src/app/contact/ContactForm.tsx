"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { submitContactForm, type ContactFormState } from "./actions";

const INPUT_CLASS =
  "mt-1 w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[14px] text-mist focus:border-mist focus:outline-none";

const initialState: ContactFormState = { status: "idle" };

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  if (state.status === "success") {
    return (
      <div className="mt-8 rounded-cards bg-pulse-green/10 p-4 text-body-sm text-pulse-green shadow-[0_0_0_0.5px_var(--color-pulse-green)_inset]">
        Thanks, we&apos;ve got your message and will get back to you soon.
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-4 rounded-cards bg-carbon p-6 shadow-subtle">
      <div>
        <label className="block text-body-sm text-mist">Name</label>
        <input name="name" required className={INPUT_CLASS} placeholder="Your name" />
      </div>
      <div>
        <label className="block text-body-sm text-mist">Email</label>
        <input name="email" type="email" required className={INPUT_CLASS} placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-body-sm text-mist">Message</label>
        <textarea name="message" required rows={5} className={INPUT_CLASS} placeholder="How can we help?" />
      </div>

      {state.status === "error" && (
        <div className="rounded-inputs bg-coral-red/10 p-3 text-body-sm text-coral-red shadow-[0_0_0_0.5px_var(--color-coral-red)_inset]">
          {state.message}
        </div>
      )}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
