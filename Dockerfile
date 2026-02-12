# Dockerfile pour SG Stocks Web (Vue.js/TypeScript)
FROM node:20-alpine as build

WORKDIR /app

# Arguments de build pour les variables d'environnement Vite
ARG VITE_API_PORT
ARG VITE_API_BASE_DOMAIN
ARG VITE_USE_HTTPS

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Installer les dépendances
RUN npm ci --production=false

# Copier le code source
COPY . .

# Créer le fichier .env.production que Vite lira pendant le build
RUN echo "VITE_API_PORT=${VITE_API_PORT}" > .env.production && \
    echo "VITE_API_BASE_DOMAIN=${VITE_API_BASE_DOMAIN}" >> .env.production && \
    echo "VITE_USE_HTTPS=${VITE_USE_HTTPS}" >> .env.production

# Build de production - Vite lira .env.production automatiquement
RUN NODE_ENV=production npm run build -- --mode production

# Stage de production avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
