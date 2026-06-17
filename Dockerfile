FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
ARG DATABASE_URL
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG NEXT_PUBLIC_MAPBOX_STYLE_ID
ARG NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_ID
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}
ENV NEXT_PUBLIC_MAPBOX_STYLE_ID=${NEXT_PUBLIC_MAPBOX_STYLE_ID}
ENV NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_ID=${NEXT_PUBLIC_MAPBOX_ADMIN_STYLE_ID}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3004
ENV HOSTNAME=0.0.0.0
RUN apk add --no-cache libc6-compat
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3004
CMD ["node", "server.js"]
