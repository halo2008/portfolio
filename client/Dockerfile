# Etap 1: Budowanie aplikacji
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiowanie plików zależności
COPY package*.json ./

# Instalacja zależności
RUN npm ci

# Kopiowanie reszty plików źródłowych
COPY . .

# Argument budowania dla klucza API (wymagany przez Vite)
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# Budowanie aplikacji (wynik w folderze /dist)
RUN npm run build

# Etap 2: Serwowanie przez Nginx
FROM nginx:alpine

# Kopiowanie zbudowanych plików statycznych z etapu buildera
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiowanie konfiguracji Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Eksponowanie portu 80
EXPOSE 80

# Uruchomienie Nginx
CMD ["nginx", "-g", "daemon off;"]
