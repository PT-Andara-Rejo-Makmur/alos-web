# Experience Boundaries

## Business

Workspace operasional perusahaan. Bahasa dan hierarchy berfokus pada pekerjaan, status, dan
outcome bisnis. Permission tetap diproyeksikan dan ditegakkan Backend.

MVP-1 executive dashboard, portfolio, project, task, approval, document, finding, dan report
ditampilkan melalui `/business` dan `/business/[module]`.

## ARA

Human AI Workspace untuk pengguna bisnis. Context, evidence, dan output AI harus traceable.
Browser tidak menjalankan Agent, tool, connector, atau model.

Genesis chat/workspace MVP-1 diposisikan di ARA karena merupakan pengalaman human-AI, bukan
authority control plane.

## GENESIS

Control-plane UI untuk IT. View dapat menampilkan capability, scope, permission, skills, tools,
delegation, model policy, QA, evidence, risk, cost, dan AI review secara detail. IT decision tetap
dicatat Backend.

Governance dashboard, Agent Registry, source/evidence, runtime monitoring, dan release assurance
MVP-1 diposisikan di experience GENESIS untuk IT.

## Director

Workspace keputusan eksekutif. View berfokus pada apa yang diaktifkan, alasan, business impact,
authority, risk, QA summary, recommendation, cost cap, rollback, dan requested decision. Raw JSON
serta detail implementasi tidak menjadi default Director screen.

## GIIVEPRO

Tenant-facing product experience yang berjalan di atas identity, scope, policy, dan authority
ALOS. GIIVEPRO tidak membangun permission atau approval authority sendiri.
