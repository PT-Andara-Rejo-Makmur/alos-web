# Boundary Contract Frontend

Folder ini adalah integration seam untuk generated TypeScript contract dari `alos-contracts`.
Saat package resmi tersedia, export type dilakukan dari package tersebut melalui satu entrypoint
di folder ini.

Baseline tidak mendefinisikan salinan permanen `AgentRunResult`, `ReviewPackage`,
`ReleaseState`, atau `Decision`. Model pada `features/reviews` hanyalah projection/view model
yang sudah disiapkan Backend untuk pengalaman IT dan Director, bukan canonical contract.

Temporary development path yang direkomendasikan adalah package workspace atau tarball hasil
build `alos-contracts`; jangan menggunakan copy-paste schema.
