FROM node:22-alpine AS dependencies
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 alos && adduser --system --uid 1001 --ingroup alos alos
COPY --from=builder --chown=alos:alos /app/package.json ./package.json
COPY --from=builder --chown=alos:alos /app/node_modules ./node_modules
COPY --from=builder --chown=alos:alos /app/.next ./.next
COPY --from=builder --chown=alos:alos /app/public ./public
USER alos
EXPOSE 3000
CMD ["pnpm", "start"]
