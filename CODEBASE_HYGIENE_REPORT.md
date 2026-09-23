# ALOS Web Domain Restructure and Authority Cleanup Report

## A. Baseline

- Repository: `PT-Andara-Rejo-Makmur/alos-web`
- Branch: `development`
- Starting commit: `8f3db7be445cccd02fd74cd6573cabec1c1e284c`
- Finishing commit: `8f3db7be445cccd02fd74cd6573cabec1c1e284c` (the completed migration is intentionally left as uncommitted working-tree changes; no commit or push was requested)
- Write boundary: only `alos-web` was modified. No sibling repository and no `main` branch was changed.

The pre-migration audit is recorded separately in `CODEBASE_HYGIENE_INVENTORY.md`.

## B. Inventory

- Legacy runtime tree: 36 files under the former milestone feature directory: 10 components, 21 library modules, four global stylesheets, and one migration-boundary component.
- Additional milestone-named production wrappers: four ARA, Business, Director, and GENESIS experience files.
- Legacy dependency surface: 52 production files and 28 test files imported the former milestone namespace.
- Authority fallback risks: fake actors and workspaces existed in Agent Workforce, ARA, Executive, Finance, HR, IT, Legal, Property, Sales, and shared-module entry pages.
- Active-scope risks: first-array workspace selection existed in Agent Workforce, ARA, Executive, Finance, Property operations, conversation, portfolio, and operational modules; first-array division selection existed in conversation, Executive, and operational modules.
- Session risks: protected browser pages mixed `/api/session` with direct backend-style whoami calls and inconsistent fallback behavior.

## C. Migration

### Permanent ownership

- Canonical session and workspace projections now belong to `features/session`; access checks belong to `features/access-control`.
- Governance UI, projections, actions, errors, source management, release governance, and readiness decisions now belong to `features/governance`.
- Conversation, uploads, follow-up, document analysis, and agent-designer helpers now belong to `features/genesis-workspace`.
- Document center/policy, project portfolio, notifications, agents, releases, executive projection, dashboard access, and workspace routing now have permanent semantic owners.
- Operational types were separated into `features/tasks`, `features/approvals`, `features/findings`, `features/reports`, and `features/notifications`. The shared operational dashboard remains one presentation orchestrator so its existing mutation and maker-checker behavior is not duplicated.

### Canonical session and active workspace

- Added `SessionActor`, `Workspace`, session-principal, and active-workspace projections under permanent owners.
- Added one protected-domain loader that obtains the principal through `/api/session`, obtains workspaces through `/api/backend/*`, verifies actor access and the requested domain, then supplies one active workspace to `WorkspaceShell` and its child feature.
- Query parameters remain navigation intent only. A requested workspace is rendered only after it appears in the authenticated workspace projection and the actor's allowed workspace set.
- Finance, HR, IT, Legal, Property, Sales, Executive, ARA, Agent Workforce, and shared-module entry pages now use the same-origin helpers and fail closed.
- Child operational modules and project creation consume the verified active workspace rather than selecting their own workspace.

### Naming and styles

- Renamed the experience symbols to `AraWorkspace`, `BusinessWorkspace`, `DirectorWorkspace`, and `GenesisWorkspace`.
- Renamed the reusable chat/orchestration surface to `ConversationWorkspace`.
- Relocated the four global stylesheets to semantic files under `src/styles` while preserving the existing Manrope/Cormorant typography, tokens, selectors, and visual behavior.
- Updated all application, barrel, route, and test imports to semantic domain paths.

### Empty projections

- Removed hard-coded protected actor/workspace fallbacks.
- Replaced fabricated Finance, Property, and Executive business facts with null-safe empty/not-connected projections.
- Moved representative business values needed by rendering tests into test-only fixtures.

## D. Deletion

- Removed the complete former milestone runtime directory after production imports, symbols, CSS imports, route dependencies, and test dependencies reached zero.
- Removed the four milestone-named experience wrapper files after their semantic replacements were wired.
- Removed the obsolete migration boundary and replaced its test with a permanent dependency-boundary test.
- Relocated milestone-named tests to `tests/domains` without dropping coverage.
- Preserved the historical migration note under `docs/history`; historical terminology is not used by production source.

## E. Authority

- Fake authenticated actors removed from protected production paths.
- Fake authority workspaces and organization identifiers removed from protected production paths.
- First-array `workspace_ids` and `division_codes` authority assumptions removed from production source.
- Backend/session unavailability now yields login redirection, forbidden, unavailable, or needs-information UI as appropriate; it never synthesizes an authenticated principal.
- Protected browser requests use `sessionApiRequest` or `authenticatedApiRequest`; the only backend whoami path is inside the server-side same-origin session boundary.
- HttpOnly-cookie architecture remains Browser -> `/api/session` -> `/api/backend/*` -> Backend. No browser token handling or second session system was added.

## F. Routing

Canonical routes remain available:

- `/workspace`
- `/workspace/executive`, `/workspace/finance`, `/workspace/hr`, `/workspace/legal`, `/workspace/property`, `/workspace/sales`, `/workspace/it`
- `/workspace/projects`, `/workspace/tasks`, `/workspace/approvals`, `/workspace/documents`, `/workspace/reports`, `/workspace/findings`, `/workspace/ara`, `/workspace/agents`

Compatibility routes remain available:

- `/business/*`, `/director`, `/ara`, `/agents`, `/genesis`, `/governance`, `/research`, `/giivepro`

The production build generated all of these route entries successfully.

## G. Readiness

Readiness policy and values were not broadened by this refactor.

- READY remains READY for shared modules (`projects`, `tasks`, `approvals`, `documents`, `reports`, `findings`, `ara`, `agents`), common overview/brief/divisions/governance surfaces, and the existing ready IT/control-plane modules.
- BLOCKED remains BLOCKED for source-dependent domain modules, including Property construction/K3/change orders/payment certificates/handover/land pipeline; Finance ledger modules; HR operational modules; Legal operational modules; Sales/CRM operational modules; and non-connected IT/Infra modules.
- HIDDEN remains controlled by existing visibility and access projections; hidden entries are not rendered.
- Unknown readiness keys remain fail-closed as BLOCKED.

## H. Cross-repository register

`BLOCKED_CROSS_REPO`

- Repository: `PT-Andara-Rejo-Makmur/alos-contracts`
- Contract/API needed: an explicit integration policy for which Contracts branch Web `development` CI should consume.
- Reason: Web CI currently checks out Contracts `main`; changing that ref is a cross-repository release/integration policy decision and must not be guessed in this frontend-only task.
- Frontend impact: Web quality CI continues validating against Contracts `main`. No frontend runtime behavior is simulated or unblocked with a fake contract.

No Backend, Contracts, GENESIS AI, or Infra code change was made.

## I. Production grep result

Commands were run against `src` after migration:

```text
rg -n -i 'mvp[-_ ]?1' src
(no output; exit 1 — zero matches)

rg -n -i 'features[/\\]mvp1|/mvp1/' src
(no output; exit 1 — zero matches)

rg -n 'workspace_ids\s*\[\s*0\s*\]|division_codes\s*\[\s*0\s*\]|FALLBACK_(ACTOR|WORKSPACE)|fallbackActor|fallbackWorkspace' src
(no output; exit 1 — zero matches)

rg -n '/api/v1/auth/whoami|auth/whoami' src
src/lib/api/server-boundary.ts:158: server-side forwarding to /api/v1/auth/whoami
```

The remaining whoami occurrence is the intended server boundary; it is not browser-side authentication or an authority fallback.

## J. Quality

- `pnpm lint`: PASS, zero warnings
- `pnpm typecheck`: PASS
- `pnpm test`: PASS, 54 files and 390 tests
- `pnpm build`: PASS, Next.js production compilation, type validation, page-data collection, and 37 static pages completed

Architecture tests now reject reintroduction of milestone namespace/symbols, forbidden first-array authority patterns, fake fallback authority, and direct browser whoami usage.

## K. CI

- `.github/workflows/quality.yml` now runs push quality checks for both `main` and `development`.
- Pull-request quality checks remain active.
- The Contracts checkout remains pinned to `main` pending the cross-repository integration policy above.

## L. Architecture summary

The codebase is now organized by product responsibility rather than delivery milestone. `session` owns the authenticated principal and workspace projection; `workspace-resolver` verifies navigation intent; `workspace-shell` is the single protected layout; `workspace-routing` owns navigation/readiness; domain dashboards receive one verified active workspace; governance and GENESIS retain their existing policy boundaries; shared business capabilities have semantic feature owners.

### File-size and responsibility audit

The following production files remain deliberately large and are recorded for later, policy-safe decomposition:

- `features/governance/governance-dashboard.tsx` (6,505 lines): combines several governance panels and mutation flows. Source and readiness panels are already extracted; further extraction would require coordinated state/mutation boundary design to avoid changing human authority and release policy.
- `features/genesis-workspace/conversation-workspace.tsx` (1,892 lines): combines governed thread rendering, uploads, follow-up, and orchestration state. Its data helpers are extracted, but the stateful presentation boundary remains coupled.
- `features/documents/document-center.tsx` (862 lines): combines governed document listing, actions, and follow-up UI; the policy/data helper has a separate owner.
- `features/workspace-shell/workspace-mobile-nav.tsx` and `workspace-navigation.ts` (664/652 lines): large navigation presentation/configuration files, but neither owns session authority or business mutation.

They were not mechanically split merely to reduce line count. The migration extracted canonical types, data helpers, access/session authority, and clear domain components while preserving maker-checker, approval, evidence, ARA, GENESIS, agent lifecycle, and role/access behavior.
