FROM node:22-alpine AS dependencies
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=alos-web-pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm config set fetch-timeout 600000 && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-maxtimeout 120000 && \
    pnpm config set network-concurrency 4 && \
    pnpm fetch
RUN --mount=type=cache,id=alos-web-pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --offline

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
ARG NEXT_PUBLIC_ALOS_API_BASE_URL
ENV NEXT_PUBLIC_ALOS_API_BASE_URL=${NEXT_PUBLIC_ALOS_API_BASE_URL}
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
RUN addgroup --system --gid 1001 alos && adduser --system --uid 1001 --ingroup alos alos
COPY --from=builder --chown=alos:alos /app/package.json ./package.json
COPY --from=builder --chown=alos:alos /app/node_modules ./node_modules
COPY --from=builder --chown=alos:alos /app/.next ./.next
COPY --from=builder --chown=alos:alos /app/public ./public
USER alos
EXPOSE 3000
CMD ["./node_modules/.bin/next", "start"]
