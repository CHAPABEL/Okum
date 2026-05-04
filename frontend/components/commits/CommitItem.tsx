import { GitBranch } from "lucide-react";

import { CommitCard } from "@/components/commits/CommitCard";

type CommitItemProps = {
  message: string;
  branchName: string;
  timeAgo: string;
  href: string;
  isBranchEvent: boolean;
};

export function CommitItem({ message, branchName, timeAgo, href, isBranchEvent }: CommitItemProps) {
  return (
    <article className="timeline-item">
      <div className={`timeline-node ${isBranchEvent ? "branch-node" : ""}`}>
        {isBranchEvent ? <GitBranch size={14} /> : <span className="timeline-node-dot" />}
      </div>
      <CommitCard
        message={message}
        branchName={branchName}
        timeAgo={timeAgo}
        isBranchEvent={isBranchEvent}
        href={href}
      />
    </article>
  );
}
