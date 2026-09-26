"use client";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-cards bg-carbon p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <p className="text-[16px] font-[510] text-paper">{title}</p>
        {description && <p className="mt-2 text-body-sm text-fog">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-buttons border border-graphite px-4 py-2 text-[13px] text-mist hover:border-smoke"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-buttons px-4 py-2 text-[13px] font-[510] ${
              destructive ? "bg-coral-red text-void hover:opacity-90" : "bg-acid-lime text-void hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
