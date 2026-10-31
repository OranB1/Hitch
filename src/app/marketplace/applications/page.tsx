import Link from "next/link";
import MyApplications from "./MyApplications";

export default function MyApplicationsPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-sm font-serif font-normal text-paper">My applications</h1>
          <p className="mt-2 text-body-sm text-fog">Track what you&apos;ve applied to and whether you&apos;ve heard back.</p>
        </div>
        <Link
          href="/marketplace"
          className="rounded-buttons border border-graphite px-4 py-[10px] text-[14px] font-[510] text-mist transition-colors hover:border-smoke"
        >
          Browse opportunities
        </Link>
      </div>
      <MyApplications />
    </main>
  );
}
