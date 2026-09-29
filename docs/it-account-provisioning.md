# IT Account Provisioning

## Intended flow

HR employee → account request → identity review → primary workspace → canonical role → approval where required → Backend provisioning → activation → employee sets their own password.

The current Web form is readiness-only because the available Identity contract requires a direct password field and has no employee reference or activation flow. The Web does not render, generate, store, or submit a password, token, secret, or raw identity ID.

Employee, account, workspace access, and privileged access are separate concepts. An employee existing in HR does not imply an account; an account does not imply activation; approval does not imply provisioning; and a workspace membership does not imply privileged access.

Required contract additions: employee reference, activation ownership, invitation/password setup, account/access state, role privilege metadata, request/approval relation, and conflict semantics.
