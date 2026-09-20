export const EVIDENCE_FEATURE_BOUNDARY = "Traceable evidence references supplied by Backend" as const;

export * from "./models";
export * from "./components/evidence-item-view";
export * from "./components/evidence-list-view";
export * from "./components/safe-error-view";

// Backward compatibility with MVP1 sources
export * from "@/features/mvp1/lib/sources";
