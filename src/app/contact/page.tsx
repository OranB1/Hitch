import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { isContactTopic, type ContactTopic } from "./topics";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const initialTopic: ContactTopic = isContactTopic(topic) ? topic : "qi";

  return (
    <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="text-center">
        <span className="text-label font-[510] text-acid-lime">Contact us</span>
        <h1 className="mt-3 text-heading-sm font-serif font-normal text-paper">Talk to us</h1>
        <p className="mt-4 text-body text-mist">
          Hitch hasn&apos;t launched yet, so every message goes straight to the founders.
        </p>
      </div>
      <ContactForm initialTopic={initialTopic} />
    </main>
  );
}
