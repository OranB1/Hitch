"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/Button";
import { submitContactForm, type ContactFormState } from "./actions";
import { CONTACT_TOPICS, type ContactTopic } from "./topics";

const INPUT_CLASS =
  "mt-1 w-full rounded-inputs border border-graphite bg-black/[0.025] px-[14px] py-[12px] text-[16px] text-mist focus:border-mist focus:outline-none";

const CHIP_CLASS =
  "inline-flex min-h-[44px] items-center rounded-pills border px-4 text-[14px] transition-colors";

const initialState: ContactFormState = { status: "idle" };

export default function ContactForm({ initialTopic }: { initialTopic: ContactTopic }) {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);
  const [topic, setTopic] = useState<ContactTopic>(initialTopic);
  const current = CONTACT_TOPICS.find((t) => t.value === topic) ?? CONTACT_TOPICS[0];

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
        <p id="contact-topic-label" className="block text-body-sm text-mist">What&apos;s this about?</p>
        <input type="hidden" name="topic" value={topic} />
        <div role="group" aria-labelledby="contact-topic-label" className="mt-2 flex flex-wrap gap-2">
          {CONTACT_TOPICS.map((t) => {
            const on = t.value === topic;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={on}
                onClick={() => setTopic(t.value)}
                className={`${CHIP_CLASS} ${
                  on ? "border-paper bg-paper text-void" : "border-smoke text-mist hover:border-fog"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label htmlFor="contact-name" className="block text-body-sm text-mist">Name</label>
        <input id="contact-name" name="name" required className={INPUT_CLASS} placeholder="Your name" />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-body-sm text-mist">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          className={INPUT_CLASS}
          placeholder="you@nhs.net"
          aria-describedby="contact-email-help"
        />
        <p id="contact-email-help" className="mt-1 text-[14px] text-ash">
          A work address is easiest for us to follow up on, but any address works.
        </p>
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-body-sm text-mist">Message</label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className={INPUT_CLASS}
          placeholder={current.placeholder}
          aria-describedby={current.help ? "contact-message-help" : undefined}
        />
        {current.help && (
          <p id="contact-message-help" className="mt-1 text-[14px] text-ash">{current.help}</p>
        )}
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
