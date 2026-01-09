# Etap 1: Budowanie Frontendu (React)
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
# Vite build. Wynik w /app/client/dist
# Uwaga: Frontend korzysta teraz z API backendu (/api/chat), 
# więc nie potrzebuje kluczy API przy budowaniu (chyba że są inne).
RUN npm run build

# Etap 2: Budowanie Backendu (NestJS)
FROM node:20-alpine AS server-build
WORKDIR /app/src
COPY package*.json ./
RUN npm ci
COPY . .
# Kopiowanie zbudowanego frontendu do katalogu client/dist w kontekście backendu
# (NestJS będzie szukał ../client/dist relative to dist/main)
# Ale w Dockerze lepiej skopiować to do wynikowego obrazu.
RUN npm run build

# Etap 3: Obraz Produkcyjny
FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Kopiowanie zbudowanego backendu
COPY --from=server-build /app/src/dist ./dist

# Kopiowanie zbudowanego frontendu
# Struktura w kontenerze: /app/dist (backend) oraz /app/client/dist (frontend)
# App module szuka w join(__dirname, '..', 'client', 'dist')
# Skoro dirname to /app/dist, to .. to /app. Więc szuka w /app/client/dist.
COPY --from=client-build /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/main"]
