# Boundary Contract Frontend

Folder ini adalah frontend contract facade. Sumber contract canonical adalah generated TypeScript
export dari `alos-contracts`, yang diekspos melalui satu entrypoint frontend.

Frontend tidak membuat duplicated canonical schema dan tidak menemukan authority, permission, atau
canonical state sendiri. Perubahan contract harus dilakukan pada `alos-contracts`, lalu dikonsumsi
melalui facade ini.
