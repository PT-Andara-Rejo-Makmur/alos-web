/** Presentation-only projection. Canonical ReviewPackage remains owned by alos-contracts. */
export interface ReviewSectionProjection {
  readonly label: string;
  readonly state: "unavailable" | "pending" | "ready";
}

export type DecisionCommand = "APPROVE" | "RETURN" | "REJECT" | "HOLD";

export const itReviewSections = [
  "Purpose & capability",
  "Scope & permission",
  "Skills & tools",
  "Delegation & model policy",
  "Cost & automated QA",
  "Business & technical AI review",
  "Security & evidence",
  "Risk, findings & recommendation",
] as const;

export const directorReviewSections = [
  "What is being activated",
  "Why & business impact",
  "Allowed & prohibited authority",
  "Risk & QA summary",
  "AI review & IT recommendation",
  "Cost cap & rollback availability",
  "Requested decision",
] as const;
