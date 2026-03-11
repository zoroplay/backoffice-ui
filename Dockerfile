FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_CLIENT_ID
ARG NEXT_PUBLIC_CLIENT_CODE
ARG NEXT_PUBLIC_SITE_KEY
ARG SBE_SITE_KEY

# Set as environment variables for build
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_CLIENT_ID=$NEXT_PUBLIC_CLIENT_ID
ENV NEXT_PUBLIC_CLIENT_CODE=$NEXT_PUBLIC_CLIENT_CODE
ENV NEXT_PUBLIC_SITE_KEY=$NEXT_PUBLIC_SITE_KEY
ENV SBE_SITE_KEY=$SBE_SITE_KEY

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:ci

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]