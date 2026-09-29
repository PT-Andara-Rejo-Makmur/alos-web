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
