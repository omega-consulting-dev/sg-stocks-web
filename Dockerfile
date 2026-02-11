# Dockerfile pour SG Stocks Web (Vue.js/TypeScript)
FROM node:20-alpine as build

WORKDIR /app

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

# Build de production avec mode explicite
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
