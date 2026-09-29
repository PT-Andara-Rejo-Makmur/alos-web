# HR / GA Data Classification

Status: **NEEDS DECISION / NEEDS BACKEND**.

Classification vocabulary yang disiapkan: PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED. Frontend tidak menetapkan classification secara otomatis berdasarkan nama dokumen, jabatan, payroll, atau jenis kasus. Assignment final berasal dari source/governance.

Default minimization: jangan tampilkan nomor identitas pemerintah, rekening bank, detail pajak, payroll, kesehatan, kontak pribadi, atau dokumen sensitif pada tabel/list. Detail dan export memerlukan kewenangan terverifikasi. Masking dan audit trail perlu ditentukan dalam contract/backend.

Document extraction hanya menghasilkan kandidat yang harus ditelaah manusia. Kandidat, ringkasan AI, dan nilai confidence bukan employee state, payroll state, approval, atau keputusan ketenagakerjaan resmi.
