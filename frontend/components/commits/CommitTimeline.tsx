import { Commit } from "@/lib/types";
import { CommitItem } from "@/components/commits/CommitItem";

type CommitTimelineProps = {
  commits: Commit[];
  branchName?: string;
};

function toRelativeTime(value: string): string {
  const target = new Date(value).getTime();
  const now = Date.now();
  const diffMs = Math.max(now - target, 0);
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function isBranchEvent(message: string): boolean {
  return /create feature branch|branch/i.test(message);
}

export function CommitTimeline({ commits, branchName = "main" }: CommitTimelineProps) {
  if (commits.length === 0) {
    return <p className="muted small">No recent commits.</p>;
  }

  return (
    <div className="commit-timeline">
      <div className="timeline-line" />
      <div className="timeline-list">
        {commits.map((commit) => {
          const message = commit.message.split("\n")[0] || "Commit update";
          return (
            <CommitItem
              key={commit.sha}
              message={message}
              branchName={branchName}
              timeAgo={toRelativeTime(commit.committed_at)}
              href={commit.html_url}
              isBranchEvent={isBranchEvent(message)}
            />
          );
        })}
      </div>
    </div>
  );
}
