import { TASK_TYPE_OPTIONS } from "@/lib/data/marketplace-options";
import { taskTone } from "@/lib/taskTone";

// The board's listing card (MarketplaceBrowser), reproduced for the demo so a poster previews
// exactly what students will see: task-type spine, location, facts, task-type chip, Example mark.
// Posts are attributed to a hospital only, never a person.
export function DemoCardBody({
  title,
  location,
  facts,
  taskType,
  percent,
  compact = false,
}: {
  title: string;
  location?: string | null;
  facts?: string[];
  taskType: string;
  percent?: number;
  compact?: boolean;
}) {
  const tone = taskTone(taskType);
  const label = TASK_TYPE_OPTIONS.find((t) => t.value === taskType)?.label ?? taskType;
  return (
    <>
      <span
        aria-hidden
        className="absolute bottom-[14px] left-0 top-[14px] w-[3px] rounded-r-small"
        style={{ backgroundColor: tone.stripe }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-[510] text-paper ${compact ? "text-[14px]" : ""}`}>{title}</p>
          {percent !== undefined && (
            <span className="shrink-0 rounded-badges bg-acid-lime/15 px-[6px] text-label font-[510] text-acid-lime">
              {percent}% match
            </span>
          )}
        </div>
        {location && <p className={`mt-1 text-fog ${compact ? "text-caption" : "text-body-sm"}`}>{location}</p>}
        {facts && facts.length > 0 && <p className="mt-1 text-caption text-ash">{facts.join(" · ")}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1">
          <span
            className={`inline-flex items-center gap-[6px] rounded-badges px-[8px] py-[2px] font-[510] leading-[1.3] ${
              compact ? "text-[13px]" : "text-[14px]"
            }`}
            style={{ color: tone.text, backgroundColor: tone.wash }}
          >
            <span className="h-[6px] w-[6px] shrink-0 rounded-pills bg-current" />
            {label}
          </span>
          <span className="ml-auto rounded-badges border border-smoke px-2 text-label font-[600] text-fog">Example</span>
        </div>
      </div>
    </>
  );
}

export const DEMO_CARD_CLASS = "relative w-full overflow-hidden rounded-cards border p-4 pl-[18px] text-left";
