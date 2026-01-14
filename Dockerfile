# Etap 1: Frontend
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RUN npm run build

# Etap 2: Backend
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etap 3: Production
FROM node:20-alpine AS production
WORKDIR /app

# Kopiujemy pliki produkcyjne
COPY package*.json ./
RUN npm ci --only=production

# Kopiujemy buildy
COPY --from=server-build /app/server/dist ./dist
COPY --from=client-build /app/client/dist ./client/dist

ENV NODE_ENV=production
# Cloud Run wymaga portu 8080
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main"]