# Dependency security

Next.js and its ESLint configuration use 16.3.6, the patched release for
[GHSA-vcvr-r3jv-pc5j](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j).

The upstream `braces` advisory
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) has no published
patched npm release as verified on 4 October 2026. Registry audit metadata suggesting
3.0.4 does not mean that version can be installed. The pinned 3.0.3 transitive tooling
dependency has a tracked pnpm patch imposing a depth limit on parsing, compilation,
expansion and stringification. Normal repository glob patterns retain their behavior.

`pnpm security` first tests the actual installed transitive package, then runs the
registry audit. Only this exact advisory on the development dependency at version
3.0.3 can be accepted after the patch regression passes. Every other advisory or an
unavailable audit fails the command. The raw upstream advisory remains visible in the
report; it is recorded as locally mitigated, not represented as an upstream fix.
Replace the patch with an audited upstream release when one becomes available.

The Docker runtime prunes development dependencies after building. Docker and clean
installs apply the same checked-in patch and frozen lockfile.
