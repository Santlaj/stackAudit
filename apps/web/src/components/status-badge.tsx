"use client";

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  PENDING: { label: "Pending", color: "text-warning", dot: "bg-warning" },
  PROCESSING: { label: "Processing", color: "text-processing", dot: "bg-processing" },
  COMPLETED: { label: "Completed", color: "text-success", dot: "bg-success" },
  FAILED: { label: "Failed", color: "text-error", dot: "bg-error" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const isAnimating = status === "PENDING" || status === "PROCESSING";

  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium ${config.color}`}>
      <span className="relative flex h-2.5 w-2.5">
        {isAnimating && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75 animate-ping`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dot}`} />
      </span>
      {config.label}
    </span>
  );
}
