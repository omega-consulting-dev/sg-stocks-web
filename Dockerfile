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

# Vérifier la présence de .env.production
RUN ls -la .env* || echo "Aucun fichier .env trouvé"

# Build de production avec variables d'environnement explicites
# Les passer directement à la commande build pour que Vite les voie
RUN VITE_API_PORT=${VITE_API_PORT} \
    VITE_API_BASE_DOMAIN=${VITE_API_BASE_DOMAIN} \
    VITE_USE_HTTPS=${VITE_USE_HTTPS} \
    NODE_ENV=production npm run build -- --mode production

# Stage de production avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
