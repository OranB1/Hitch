import type { Metadata } from "next";
import Link from "next/link";
import MarketplaceBrowser from "./MarketplaceBrowser";
import { TASK_TYPE_OPTIONS, type TaskType } from "@/lib/data/marketplace-options";

export const metadata: Metadata = { title: "Opportunities" };

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  // ?type=audit pre-selects the type filter (the homepage example tiles link here). Anything that
  // isn't a known task type is ignored rather than trusted.
  const { type } = await searchParams;
  const initialTaskType = TASK_TYPE_OPTIONS.find((o) => o.value === type)?.value as TaskType | undefined;

  return (
    <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-10 md:py-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-heading-sm font-serif font-normal text-paper">Opportunities</h1>
          <p className="mt-2 text-body-sm text-fog">QIPs, audits, research, and presentations from doctors near you.</p>
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <Link
            href="/marketplace/mine"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center whitespace-nowrap rounded-buttons border border-graphite px-4 text-[13px] text-mist hover:border-smoke md:flex-none"
          >
            My postings
          </Link>
          <Link
            href="/marketplace/post"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center whitespace-nowrap rounded-buttons border border-graphite px-4 text-[14px] font-[510] tracking-[-0.011em] text-paper hover:border-smoke md:flex-none"
          >
            Post an opportunity
          </Link>
        </div>
      </div>
      <MarketplaceBrowser initialTaskType={initialTaskType} />
    </main>
  );
}
