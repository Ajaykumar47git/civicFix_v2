# ==============================================================================
# CivicFix Municipal Platform — Unified Full-Stack Dockerfile
# Production-ready single-container deployment (Frontend + Express API + Vite SPA)
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications for layer caching
COPY package.json package-lock.json* bun.lock* ./

# Install all dependencies (including devDependencies for esbuild & vite)
RUN npm ci --prefer-offline --no-audit

# Copy application source and build config
COPY tsconfig.json vite.config.ts index.html server.ts ./
COPY src/ ./src/
COPY public/ ./public/

# Build both static client assets and bundled server.cjs
RUN npm run build

# ------------------------------------------------------------------------------
# Production Runtime Stage
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install dumb-init and curl
RUN apk add --no-cache dumb-init curl

# Create unprivileged application user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 civicfix -G nodejs

# Copy package manifests for runtime production packages
COPY package.json package-lock.json* bun.lock* ./

RUN npm ci --only=production --prefer-offline --no-audit && \
    npm cache clean --force

# Copy compiled artifacts from builder stage
COPY --from=builder --chown=civicfix:nodejs /app/dist ./dist

USER civicfix

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.cjs"]
