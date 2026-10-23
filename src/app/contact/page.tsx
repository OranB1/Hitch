import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="text-center">
        <span className="text-label font-[510] text-acid-lime">Contact us</span>
        <h1 className="mt-3 text-heading-sm font-serif font-normal text-paper">Get in touch</h1>
        <p className="mt-4 text-body text-mist">
          Questions, feedback, or something not working? We&apos;d love to hear from you.
        </p>
      </div>
      <ContactForm />
    </main>
  );
}
