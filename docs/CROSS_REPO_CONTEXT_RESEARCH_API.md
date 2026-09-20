# Context and Research API Dependencies

`alos-web` is a projection and request client. It must not infer tenant, workspace,
scope, permission, evidence provenance, or research-domain authorization from local
state. The following Backend endpoints are required to activate the corresponding UI
without weakening that boundary.

## Active context projection

`GET /api/v1/genesis/context-options`

The response must explicitly identify the context lifecycle state (`ACTIVE`,
`DENIED`, `NEEDS_INFORMATION`, or an equivalent canonical state), correlation ID,
and the context fields safe for frontend projection. Missing endpoints, missing state,
or unknown state are rendered as `UNAVAILABLE`; the frontend does not fall back to
`whoami` or fabricate an active context.

## Research-domain access projection

`GET /api/v1/research/domain-access`

The Backend must return one access record per canonical research domain. Each record
contains the domain, explicit status, allow/deny result, safe reason, and an optional
required-scope label. The frontend displays this decision but never evaluates raw
actor scopes or wildcard permissions.

## Governed research request

`POST /api/v1/research/requests`

The frontend sends the selected canonical domain, source mode, and question. The
Backend remains responsible for authorization, external-egress policy, audit,
correlation, and communication with GENESIS.

## Contract ownership

These request and response shapes are defined in the public OpenAPI in
`alos-contracts` and consumed through generated TypeScript. The matching Backend
routes are implemented in the aligned workspace revision. Deployments must promote
the aligned Contracts, Backend, GENESIS, and Web revisions together; older Backend
revisions intentionally produce an unavailable UI state. No Web-to-GENESIS fallback
is permitted.
