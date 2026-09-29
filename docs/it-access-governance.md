# IT Access Governance

Access is granted only by Backend-authorized workspace and role projections. Additional workspace access requires an explicit request and governed approval; the feature route never switches the active workspace and the UI never infers access from the URL.

Existing `identity.accounts.manage` and `identity.memberships.manage` may be used only where the Backend already authorizes the operation. No new permission string is invented. Privileged roles require canonical metadata and approval; until available, the action is unavailable.

`IT_ADMIN` bukan superuser bisnis. Role tersebut tidak otomatis memberi akses ke data atau tindakan terbatas Finance, HR, Legal, atau Executive.

Joiner, mover, leaver, suspension, expiry, and revocation semantics are NEEDS DECISION / NEEDS CONTRACT. A 409 access conflict is an unresolved conflict, not a successful mutation and never overwrites newer access state.

## Role MVP-2 and workspace context

Target role business MVP-2 terdiri dari:

- `EXECUTIVE` → Direktur;
- `DIVISION_LEAD` → Manajer / Kepala Divisi;
- `DIVISION_MEMBER` → Anggota Divisi;
- `IT_ADMIN` → Administrator IT.

Role selalu dibaca dalam konteks workspace. Tidak ada role gabungan seperti Finance Manager atau Sales Staff. Wakil, Staff, Admin, dan Inhouse menggunakan konteks `DIVISION_MEMBER` bila vocabulary tersebut sudah didukung sumber resmi. Role legacy tetap dapat dibaca sebagai source-honest read-only dan tidak diberi semantic baru oleh frontend.

Target MVP-2 menginginkan satu role utama per workspace, tetapi contract saat ini menyediakan `role_refs[]`. Frontend tidak mengambil role pertama, menggabungkan role, atau mengubah role lama secara diam-diam. Single-role-per-workspace adalah NEEDS CONTRACT / NEEDS DECISION.

Account detail readiness menyediakan Tambah Workspace, Edit Akses, dan Cabut Akses. Tambah/edit memerlukan Account, Workspace, Role, dan Effective Date; revoke memerlukan Account, Workspace, dan Reason, dengan Effective At/Evidence bila diwajibkan sumber. Additional workspace tidak dibuat otomatis saat pendaftaran akun, duplicate membership adalah conflict, dan revoke bukan hard delete.

Primary workspace belum memiliki marker authoritative. Membership pertama atau membership aktif tidak boleh disebut primary. Account, membership, role, activation, and session remain separate Identity concepts.
