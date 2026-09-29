# IT Security Boundaries

- Browser code calls same-origin BFF paths only.
- Backend authentication and authorization remain authoritative.
- HttpOnly session cookies contain the opaque Backend session boundary; browser code never receives or forwards a token.
- Passwords, activation tokens, refresh tokens, cookies, API keys, and secrets are never rendered.
- Account and access tables omit internal actor, tenant, organization, and scope identifiers from user-facing detail.
- Device/browser/session metadata is visible only when an authorized session source provides it; token material is never a session field.
- Classification values (`PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `RESTRICTED`) are source/governance values, not frontend defaults.
- 401, 403, 404, 409, 422, and 500 states remain distinct in the user experience.
- No frontend route, role label, workspace key, local storage value, or URL segment grants authority.
