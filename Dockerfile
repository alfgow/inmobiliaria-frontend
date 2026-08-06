FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG NEXT_PUBLIC_API_MAPBOX
ARG NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
ARG NEXT_PUBLIC_MAPBOX_STYLE_ID
ARG NEXT_PUBLIC_MAPBOX_STYLE_URL
ARG NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_ID
ARG NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_URL
ENV NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}
ENV NEXT_PUBLIC_API_MAPBOX=${NEXT_PUBLIC_API_MAPBOX}
ENV NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=${NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
ENV NEXT_PUBLIC_MAPBOX_STYLE_ID=${NEXT_PUBLIC_MAPBOX_STYLE_ID}
ENV NEXT_PUBLIC_MAPBOX_STYLE_URL=${NEXT_PUBLIC_MAPBOX_STYLE_URL}
ENV NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_ID=${NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_ID}
ENV NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_URL=${NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3004
ENV HOSTNAME=0.0.0.0
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN groupadd --system nextjs && useradd --system --gid nextjs nextjs
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
RUN mkdir -p /app/.next/cache && chown -R nextjs:nextjs /app
USER nextjs
EXPOSE 3004
CMD ["node", "server.js"]
