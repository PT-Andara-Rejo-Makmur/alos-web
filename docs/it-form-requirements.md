# IT Form Requirements

Form state: UI FINAL / SOURCE UNAVAILABLE. No form below may report a successful save until the corresponding contract, permission, verification, and result entity exist.

| Form ID | Purpose | Required Fields | Optional Fields | Generated Fields | Permission | Evidence | Verification | Approval | Lifecycle | Submit | Result Entity | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| it.account.create | request account provisioning | Employee Ref, Login Identifier, Primary Workspace, Role, Effective Date | Expiration, additional access, notes | actor/account/access IDs, activation token | existing identity account permission, final scope NEEDS CONTRACT | HR employee reference | Identity/Backend | NEEDS DECISION | NEEDS DECISION | Disabled | Account + access | NEEDS CONTRACT |
| it.account.suspend | suspend account | Account, Reason, Effective At | Evidence | audit event | existing account permission if canonical | evidence when required | Backend | NEEDS DECISION | NEEDS DECISION | Disabled/readiness | Account state | NEEDS CONTRACT |
| it.access.request | request workspace access | User, Workspace/System, Requested Role/Access, Reason | Duration, Evidence | request/access IDs | NEEDS CONTRACT | request evidence | approver + Backend | required by governance | NEEDS DECISION | Disabled | Access Request | NEEDS CONTRACT |
| it.access.revoke | revoke access | User, Access, Reason, Effective At | Evidence | audit event | existing membership permission if canonical | evidence when required | Backend | NEEDS DECISION | NEEDS DECISION | Disabled/readiness | Access state | NEEDS CONTRACT |

User never enters password, activation token, tenant ID, organization ID, actor ID, generated ID, or raw internal catalog ID. Workspace and role are selected from authoritative sources. If the employee source is unavailable, the selector is disabled and shows `Pilihan karyawan belum tersedia.`

The current generated Identity contract still requires a password for direct provisioning. The Web therefore does not call that operation from the final UI; the discrepancy is NEEDS CONTRACT / NEEDS BACKEND. Conflict (409) is not success and must not overwrite newer data.
