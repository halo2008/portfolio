# Stage 1: Client Build (CV - Vite)
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY
# Build to /app/client/dist, expecting base='/cv/' in vite.config.ts
RUN npm run build

# Stage 2: Server Build (NestJS)
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 4: Production
FROM node:20-alpine AS production
WORKDIR /app

# Copy package.json for production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy Backend Build
COPY --from=server-build /app/server/dist ./dist

# Copy Frontend Build
COPY --from=client-build /app/client/dist ./dist/static

ENV NODE_ENV=production
# Cloud Run requires port 8080
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main"]