type BranchBadgeProps = {
  variant?: "default" | "branch";
  label: string;
};

export function BranchBadge({ variant = "default", label }: BranchBadgeProps) {
  if (variant === "branch") {
    return <span className="timeline-branch-badge">{label}</span>;
  }
  return <span className="timeline-branch-chip">{label}</span>;
}
