import Link from "next/link";
import MyPostings from "./MyPostings";

export default function MyPostingsPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-sm font-serif font-normal text-paper">My postings</h1>
          <p className="mt-2 text-body-sm text-fog">Review and manage applicants for opportunities you&apos;ve posted.</p>
        </div>
        <Link
          href="/marketplace/post"
          className="rounded-buttons bg-acid-lime px-4 py-[10px] text-[14px] font-[510] tracking-[-0.011em] text-void transition-opacity hover:opacity-90"
        >
          Post an opportunity
        </Link>
      </div>
      <MyPostings />
    </main>
  );
}
