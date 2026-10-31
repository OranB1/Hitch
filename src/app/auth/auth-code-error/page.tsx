import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <h1 className="text-heading-sm font-serif font-normal text-paper">Sign-in link didn&apos;t work</h1>
      <p className="mt-2 text-body-sm text-fog">
        The link may have expired or already been used. Request a new one below.
      </p>
      <Link
        href="/login"
        className="mt-4 inline-block rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90"
      >
        Back to sign in
      </Link>
    </main>
  );
}
