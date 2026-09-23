/**
 * Centralized Compatibility Routes Map.
 * Preserves legacy entrypoints without breaking deep links.
 */
export const COMPATIBILITY_ROUTES = {
  business: "/business",
  businessProjects: "/business/projects",
  businessTasks: "/business/tasks",
  businessApprovals: "/business/approvals",
  businessDocuments: "/business/documents",
  businessReports: "/business/reports",
  businessFindings: "/business/findings",
  businessDivisions: "/business/divisions",
  businessSettings: "/business/settings",

  ara: "/ara",
  agents: "/agents",
  director: "/director",
  genesis: "/genesis",
  governance: "/governance",
  research: "/research",
  giivepro: "/giivepro",

  "/business/projects": "/workspace/projects",
  "/business/tasks": "/workspace/tasks",
  "/business/approvals": "/workspace/approvals",
  "/business/documents": "/workspace/documents",
  "/business/reports": "/workspace/reports",
  "/business/findings": "/workspace/findings",
  "/business/divisions": "/business/divisions",
  "/business/settings": "/business/settings",
  "/director": "/workspace/executive",
  "/ara": "/workspace/ara",
  "/agents": "/workspace/agents",
  "/genesis": "/genesis",
  "/governance": "/governance",
  "/research": "/research",
  "/giivepro": "/giivepro",
} as const;
