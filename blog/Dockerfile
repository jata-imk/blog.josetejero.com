# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS builder
# NODE_ENV=production es CRÍTICO: sin él, el onInit de payload.config.ts corre el
# seed de desarrollo (seedDev) durante el build y contamina la BD a la que apunte
# DATABASE_URL — incluida producción si se construye contra ella (ISR prerender).
ENV NODE_ENV=production
# Build hermético (ADR 0033): el build NO toca ninguna base de datos. Los data
# helpers devuelven vacío con este flag y el warm-up post-deploy regenera el
# contenido vía /api/revalidate. DATABASE_URL y PAYLOAD_SECRET son placeholders
# sintácticamente válidos (Payload los exige al cargar config) y ya no llegan
# como build-args → no quedan secretos reales en `docker history`.
ENV BUILD_WITHOUT_DB=1
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV PAYLOAD_SECRET=build-time-placeholder-secret
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}
COPY . .
RUN pnpm generate:importmap && pnpm generate:types && pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Payload local uploads live outside the immutable image and are mounted as a volume.
RUN mkdir -p /app/media && chown -R nextjs:nodejs /app/media

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
