# IT Business State Decisions

The frontend intentionally does not canonicalize these states. Each item is NEEDS DECISION, NEEDS CONTRACT, or NEEDS BACKEND:

- employee-to-actor/account relation;
- account lifecycle, activation, suspension, reset, and deletion;
- workspace access request, approval, expiry, and revocation;
- default role, privileged role, executive account, and multi-workspace access;
- joiner, mover, and leaver lifecycle;
- password, activation delivery, MFA, and recovery ownership;
- session metadata, revoke semantics, and audit retention;
- service, incident, change, release, asset, support, and security lifecycles;
- role catalog metadata, materiality, and approval requirements;
- employee source and HR-to-workspace mapping;
- classification and restricted identity search behavior.

Questions remain for business governance: Is IT identity a source or projection? Is email the login identifier? Who activates an account? Can an IT administrator assign a privileged role? How are access conflicts and 409 responses resolved? Which events are immutable audit records? The Web must not answer these questions.

## IT Stage 3 hardening decisions

The following remain explicitly `NEEDS DECISION`, `NEEDS CONTRACT`, or `NEEDS BACKEND`:

- employee ↔ actor/account mapping and the authoritative HR employee reference;
- primary workspace semantics; an active or first membership is not a primary marker;
- one role versus multiple `role_refs` per workspace membership;
- the four-role MVP-2 vocabulary: `EXECUTIVE`, `DIVISION_LEAD`, `DIVISION_MEMBER`, `IT_ADMIN`;
- compatibility and migration policy for legacy roles (`WORKSPACE_LEAD`, `WORKSPACE_MEMBER`, `BUSINESS_REVIEWER`, `TECHNICAL_REVIEWER`, `QA_ASSURANCE`, `AI_ADMIN`);
- account registration, edit, activation, resend, suspension, reactivation, and expiry;
- password setup, activation delivery, MFA, reset request, and recovery ownership;
- email/login identifier policy and company email generation;
- additional workspace membership, duplicate membership, role change, effective dates, and revocation;
- session metadata, session revocation, conflict handling, and audit retention;
- IT_ADMIN privilege metadata and the rule that it is not business superuser access;
- Settings self-service versus IT administration boundary;
- joiner, mover, leaver and technical access closure semantics.

Additional workspace access is not created automatically during account registration. Account detail is the intended UX location for add, edit, and revoke readiness, while the final authority remains Identity/Backend. Historical membership and administrative events must remain auditable; no hard delete semantics are assumed.
