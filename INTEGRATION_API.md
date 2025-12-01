# Guide d'Intégration API - Product Families & Products

## ✅ Travaux Réalisés

### 1. Services API Créés

#### **`src/services/api/productFamilies.api.ts`**
Service pour gérer les familles de produits avec les méthodes :
- `fetchAll()` - Récupérer toutes les familles
- `fetchById(id)` - Récupérer une famille par ID
- `create(data)` - Créer une nouvelle famille
- `update(id, data)` - Modifier une famille
- `remove(id)` - Supprimer une famille

#### **`src/services/api/products.api.ts`**
Service pour gérer les produits avec les méthodes :
- `fetchAll(filters?)` - Récupérer tous les produits (avec filtres optionnels)
- `fetchById(id)` - Récupérer un produit par ID
- `fetchByFamily(familleId)` - Récupérer les produits d'une famille
- `fetchLowStock()` - Récupérer les produits en rupture de stock
- `create(data)` - Créer un nouveau produit
- `update(id, data)` - Modifier un produit
- `updateStock(id, quantite)` - Mettre à jour le stock
- `remove(id)` - Supprimer un produit
- `uploadImage(id, file)` - Upload d'image pour un produit

### 2. Stores Pinia Refactorisés

#### **`src/stores/productFamilies.ts`**
- ✅ Remplacement des données mock par les appels API réels
- ✅ Utilisation de `productFamiliesApi`
- ✅ Gestion des erreurs améliorée
- ✅ Types TypeScript alignés avec l'API

#### **`src/stores/products.ts`**
- ✅ Remplacement des données mock par les appels API réels
- ✅ Utilisation de `productsApi`
- ✅ Support des filtres de recherche
- ✅ Gestion des erreurs améliorée
- ✅ Types TypeScript alignés avec l'API

### 3. Configuration des Variables d'Environnement

#### **`.env.example`** (template pour l'équipe)
```
VITE_API_BASE_URL=http://192.168.100.132:8000/api/v1
VITE_API_TIMEOUT=10000
VITE_TENANT_DOMAIN=
```

#### **`.env.local`** (configuration locale, ignoré par git)
Fichier créé pour le développement local avec les mêmes variables.

### 4. Service Axios Mis à Jour

Le fichier `src/services/axios.service.ts` utilise maintenant les variables d'environnement :
```typescript
baseURL: import.meta.env.VITE_API_BASE_URL || "http://192.168.100.132:8000/api/v1"
timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000
```

---

## 🎯 Endpoints Backend Attendus

### Product Families (Categories)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/products/categories/` | Liste toutes les familles |
| GET | `/products/categories/:id/` | Détail d'une famille |
| POST | `/products/categories/` | Créer une famille |
| PUT | `/products/categories/:id/` | Modifier une famille |
| DELETE | `/products/categories/:id/` | Supprimer une famille |

**Format de requête (POST/PUT) :**
```json
{
  "code": "ELEC",
  "libelle": "Électronique",
  "description": "Produits électroniques et accessoires"
}
```

**Format de réponse :**
```json
{
  "id": 1,
  "code": "ELEC",
  "libelle": "Électronique",
  "description": "Produits électroniques et accessoires",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Products

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/products/products/` | Liste tous les produits (avec filtres) |
| GET | `/products/products/:id/` | Détail d'un produit |
| GET | `/products/products/?category=:id` | Produits d'une famille (via filtrage) |
| GET | `/products/products/low-stock/` | Produits en rupture |
| POST | `/products/products/` | Créer un produit |
| PUT | `/products/products/:id/` | Modifier un produit |
| PATCH | `/products/products/:id/stock/` | Mettre à jour le stock |
| DELETE | `/products/products/:id/` | Supprimer un produit |
| POST | `/products/products/:id/image/` | Upload image |

**Filtres disponibles (query params) :**
- `familleId` - Filtrer par famille
- `minPrix` - Prix minimum
- `maxPrix` - Prix maximum
- `enStock` - Seulement les produits en stock
- `search` - Recherche textuelle

**Format de requête (POST/PUT) :**
```json
{
  "code": "PROD001",
  "designation": "MacBook Pro 16",
  "familleId": 1,
  "familleLibelle": "Électronique",
  "prixAchat": 2000,
  "prixVente": 2500,
  "quantiteStock": 15,
  "seuilAlerte": 5,
  "description": "MacBook Pro 16 pouces",
  "image": "https://example.com/image.jpg"
}
```

---

## 🧪 Comment Tester

### Étape 1 : Vérifier le Backend

Assure-toi que le backend est démarré et accessible à l'URL configurée :
```bash
# Tester l'accessibilité
curl http://192.168.100.132:8000/api/v1/product-families
```

### Étape 2 : Démarrer le Frontend

```bash
# Installer les dépendances (si nécessaire)
npm install

# Démarrer le serveur de développement
npm run dev
```

### Étape 3 : Tester les Fonctionnalités

#### **Test des Familles de Produits** (`/familles-produits`)

1. **Chargement de la liste**
   - Ouvrir la page des familles de produits
   - Vérifier que les données du backend s'affichent
   - Ouvrir la console (F12) pour voir les requêtes réseau

2. **Création d'une famille**
   - Cliquer sur "Ajouter"
   - Remplir le formulaire
   - Soumettre et vérifier que la famille apparaît dans la liste

3. **Modification d'une famille**
   - Cliquer sur "Modifier" sur une famille
   - Changer des valeurs
   - Soumettre et vérifier la mise à jour

4. **Suppression d'une famille**
   - Cliquer sur "Supprimer"
   - Confirmer et vérifier que la famille disparaît

#### **Test des Produits** (`/produits`)

Même processus que les familles de produits.

### Étape 4 : Vérifier les Erreurs

**Ouvrir la Console Développeur (F12) et vérifier :**

✅ **Cas de succès :**
- Requêtes HTTP retournent 200/201
- Les données s'affichent correctement
- Pas d'erreur dans la console

❌ **Cas d'erreur à tester :**
- Backend non accessible → Message d'erreur clair
- Erreur 401/403 → Vérifier l'authentification
- Erreur 404 → Vérifier les endpoints
- Erreur 500 → Vérifier les logs backend

---

## 🔧 Débogage

### Problème : "Network Error"

**Causes possibles :**
1. Backend non démarré
2. URL incorrecte dans `.env.local`
3. Problème CORS

**Solution :**
```bash
# Vérifier l'URL du backend
echo $VITE_API_BASE_URL

# Tester manuellement
curl http://192.168.100.132:8000/api/v1/product-families
```

### Problème : "404 Not Found"

**Causes possibles :**
1. Endpoints backend différents de ceux attendus
2. Mauvaise configuration de la baseURL

**Solution :**
Vérifier les endpoints dans le backend et adapter les fichiers API si nécessaire.

### Problème : "401 Unauthorized"

**Causes possibles :**
1. Token d'authentification manquant
2. Token expiré

**Solution :**
Vérifier que `userStore.access_token` est bien défini dans l'intercepteur Axios.

---

## 📝 Notes Importantes

### Points d'Attention

1. **Types de dates** : Le backend peut retourner des dates en format string ISO. Les stores acceptent maintenant `Date | string`.

2. **Gestion des images** : La fonction `uploadImage()` est prête mais nécessite un endpoint backend approprié.

3. **Filtres de recherche** : Les filtres dans `fetchProducts(filters)` sont optionnels et dépendent du support backend.

4. **Famille Libelle** : Le champ `familleLibelle` dans les produits peut être géré côté backend ou nécessiter une jointure.

### Prochaines Étapes Recommandées

1. ✅ Tester l'intégration complète
2. Adapter les endpoints si le backend utilise des URLs différentes
3. Gérer les cas d'erreur spécifiques (validation, contraintes, etc.)
4. Ajouter des notifications utilisateur (toast/snackbar) pour les succès/erreurs
5. Implémenter la pagination si les listes sont longues

---

## 🚀 Commandes Utiles

```bash
# Lancer le dev
npm run dev

# Type checking
npm run type-check

# Build production
npm run build

# Tester l'API manuellement
curl -X GET http://192.168.100.132:8000/api/v1/products
curl -X POST http://192.168.100.132:8000/api/v1/product-families \
  -H "Content-Type: application/json" \
  -d '{"code":"TEST","libelle":"Test","description":"Description test"}'
```

---

## ✨ Résumé

L'intégration API pour **Product Families** et **Products** est maintenant complète. Les stores Pinia sont connectés au backend via les services API, et l'application est prête pour les tests.

**Fichiers modifiés/créés :**
- ✅ `src/services/api/productFamilies.api.ts` (créé)
- ✅ `src/services/api/products.api.ts` (créé)
- ✅ `src/stores/productFamilies.ts` (modifié)
- ✅ `src/stores/products.ts` (modifié)
- ✅ `src/services/axios.service.ts` (modifié - variables d'env)
- ✅ `.env.example` (créé)
- ✅ `.env.local` (créé)

**Prêt pour les tests ! 🎉**
