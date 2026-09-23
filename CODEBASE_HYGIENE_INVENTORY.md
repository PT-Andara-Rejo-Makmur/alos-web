# ALOS Web Codebase Hygiene Inventory

Baseline: branch `development`, commit `8f3db7be445cccd02fd74cd6573cabec1c1e284c`.

This inventory was produced before production-code migration. It scopes all writes to `alos-web`; sibling repositories remain read-only.

## 1. Legacy files

`src/features/mvp1` contains 36 files: 10 components, 21 library modules, four global stylesheets, and one migration-boundary component. The largest production files are `components/governance-dashboard.tsx` (6,499 lines), `styles/governance.css` (3,926), `components/genesis-chat.tsx` (1,885), `styles/mvp1-base.css` (1,478), `components/document-center.tsx` (859), and `components/portfolio-dashboards.tsx` (621).

Milestone-named wrappers also exist in `src/experiences/{ara,business,director,genesis}/mvp1-workspace.tsx`. Tests include `tests/mvp1/` and `tests/mvp1-migration-boundary.test.tsx`.

## 2. Import graph

- 52 production files and 28 test files import `@/features/mvp1/*`.
- The dominant edge is `lib/governance` (37 imports), which currently mixes session actor/workspace projections with governance data types and utility functions.
- Other high-use edges are portfolio (11), release governance (6), agent registry (6), dashboard modules (6), governance errors (5), Genesis workspace (5), dashboard access (4), and executive-dashboard projections (4).
- `src/app/layout.tsx` globally imports all four legacy stylesheets.
- `workspace-shell` imports legacy session types, dashboard access, document/operational/project components, and notification UI.
- Existing permanent-domain barrel files (`approvals`, `agents`, `evidence`, `monitoring`, `releases`, and `research`) still re-export legacy implementations.

## 3. Domain ownership targets

| Current owner | Permanent owner |
| --- | --- |
| `lib/governance` session/workspace projections | `features/session` and `features/access-control` |
| governance components, actions, errors, data | `features/governance` |
| release governance | `features/releases` |
| agent registry | `features/agents` |
| Genesis conversation/upload/designer modules | `features/genesis-workspace` |
| document policy, UI, analysis handoff | `features/documents` with research integrations imported explicitly |
| portfolio types/helpers/UI | `features/projects` |
| tasks/approvals/findings/reports implementation | respective permanent feature directories |
| dashboard module/readiness/access configuration | `features/workspace-routing` and `features/access-control` |
| notification UI/types | `features/notifications` |
| executive projection/UI | `features/executive-dashboard` |
| migration boundary | remove once runtime dependencies are migrated; no permanent compatibility namespace |
| global legacy CSS | semantic global layout/domain styles under `src/styles` (visual-only move in this task) |

## 4. Duplicate logic

- Finance, HR, IT, Legal, Property, Sales, Executive, ARA, Agent Workforce, and shared-module pages independently load session actor/workspaces and reproduce error/fallback decisions.
- Multiple pages try `/api/session`, then directly call `/api/v1/whoami` or `/api/v1/auth/whoami` from browser code.
- Workspace selection is repeated in pages and child components instead of receiving one verified active workspace projection.
- Legacy `ExecutiveDashboard`, permanent dashboard pages, experience wrappers, and `WorkspaceShell` overlap shell/session responsibilities.
- Operational tasks, approvals, findings, and reports share one component and one data module, obscuring ownership.

## 5. Authority risks

- Active fake actors/workspaces exist in Agent Workforce, ARA, Executive, Finance, HR, IT, Legal, Property, Sales, and shared-module pages.
- Hard-coded authority identifiers include `org_andara_holding`, `ws_finance_holding`, `ws_property_holding`, `ws_sales_holding`, `ws_hr_holding`, `ws_legal_holding`, `ws_it_holding`, `ws_ara`, `ws_workforce`, and `ws_executive`.
- Several pages render protected experiences after backend/session failure by substituting fake authenticated principals.
- Query or first-array workspace selection can influence requests without a single verified-workspace boundary.

## 6. Session risks

- Browser pages directly call backend-style whoami paths even though the canonical HttpOnly-cookie boundary exists at `/api/session` and `/api/backend/*`.
- Fallback chains treat non-401 errors differently across features and sometimes turn unavailability into authenticated preview state.
- The resolver already uses `sessionApiRequest` and `authenticatedApiRequest`; protected pages should converge on those helpers without exposing tokens or creating a second session model.

## 7. Active workspace risks

- Production uses `actor.workspace_ids[0]` in Agent Workforce, ARA, Executive, Finance, Property operations, legacy Genesis chat, legacy portfolio, and operational modules.
- Production uses `actor.division_codes[0]` in legacy Genesis chat, Executive, and operational modules.
- Child modules sometimes choose their own scope even when an `activeWorkspace` prop exists.
- Multi-workspace actors can therefore leak the first array entry into an unrelated active workspace.

## 8. CSS legacy dependencies

`mvp1-base.css`, `genesis.css`, `governance.css`, and `portfolio.css` are imported globally by the root layout. They contain domain selectors and are coupled to legacy class names. The safe migration is a semantic relocation with unchanged contents first, followed by selector decomposition only where a component boundary is already clear. Large-scale visual redesign is out of scope.

## 9. Migration order

1. Establish canonical session/access-control/workspace types and migrate type imports.
2. Relocate library modules to permanent domain owners and update barrels/tests.
3. Standardize protected-page session loading on the same-origin session boundary and fail closed.
4. Require a verified active workspace in child features; remove first-array authority assumptions.
5. Extract shared document, project, operational, notification, governance, and Genesis UI into permanent domains.
6. Rename ARA, GENESIS, Business, and Director experience symbols/files.
7. Relocate legacy CSS without changing visual tokens.
8. Update routes and tests, remove the migration boundary and empty legacy tree.
9. Add architecture guards for milestone naming, imports, direct browser whoami calls, and forbidden authority fallbacks.
10. Run lint, typecheck, tests, build, and final grep gates.

## 10. Deletion candidates

- Entire `src/features/mvp1` directory after all import, runtime, test, and CSS edges reach zero.
- Milestone-named experience wrapper files after semantic replacements are wired.
- `tests/mvp1` directory name after tests move to domain-oriented paths.
- `Mvp1MigrationBoundary` after dependencies are represented by ordinary unavailable/error states.
- Empty compatibility barrels/wrappers that have no external route responsibility.

## CI and contract checkout

`.github/workflows/quality.yml` currently runs push CI only on `main`; it must include `development`. Pull requests already run without a branch filter. The workflow checks out `PT-Andara-Rejo-Makmur/alos-contracts` at `main`. This report records that fact but does not change the contracts ref because its integration-branch policy is a cross-repository decision.

## Initial blocking register

No cross-repository code change is yet required. If canonical backend or contract behavior cannot be established while removing a fallback, the item will be recorded as `BLOCKED_CROSS_REPO` rather than simulated in the frontend.
