import { BranchBadge } from "@/components/commits/BranchBadge";

type CommitCardProps = {
  message: string;
  branchName: string;
  timeAgo: string;
  isBranchEvent: boolean;
  href: string;
};

export function CommitCard({ message, branchName, timeAgo, isBranchEvent, href }: CommitCardProps) {
  return (
    <a className="timeline-card" href={href} target="_blank" rel="noreferrer">
      <div className="timeline-card-head">
        <strong>{message}</strong>
        {isBranchEvent && <BranchBadge variant="branch" label="branch" />}
      </div>
      <div className="timeline-card-meta">
        <BranchBadge label={branchName} />
        <span>·</span>
        <span className="timeline-time">{timeAgo}</span>
      </div>
    </a>
  );
}
