# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SG-Stocks est une application web de gestion de stock développée avec Vue 3 + TypeScript. Elle utilise Vite comme outil de build et shadcn-vue (style New York) avec Tailwind CSS v4 pour le styling.

## Technology Stack

- **Framework**: Vue 3.5+ avec Composition API
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS v4 avec shadcn-vue
- **UI Components**: Reka UI (headless) + shadcn-vue
- **Icons**: lucide-vue-next
- **Build Tool**: Vite 7
- **Testing**: Vitest + Vue Test Utils
- **Type Checking**: vue-tsc

## Essential Commands

```bash
# Development
npm run dev                    # Start dev server with hot reload

# Building
npm run build                  # Type-check and build for production
npm run build-only            # Build without type checking
npm run type-check            # Run TypeScript type checking only
npm run preview               # Preview production build locally

# Testing
npm run test:unit             # Run all unit tests
npm run test:unit -- [path]   # Run specific test file

# Code Quality
npm run lint                  # Lint and auto-fix with ESLint
npm run format                # Format code with Prettier
```

## Architecture

### Directory Structure

```
src/
├── components/
│   ├── achats/              # Composants entrées de stock
│   ├── dashboard/           # Composants tableau de bord
│   ├── encaissements/       # Composants encaissements
│   ├── facturation/         # Composants facturation
│   ├── fournisseurs/        # Composants gestion fournisseurs
│   ├── forms/               # Composants formulaires génériques
│   ├── navigation/          # AppSidebar, AppNavbar, MenuMain, NavUser
│   ├── product-families/    # Composants familles de produits
│   ├── products/            # Composants produits
│   ├── service-families/    # Composants familles de services
│   ├── services/            # Composants services
│   └── ui/                  # shadcn-vue components
├── stores/
│   ├── achats.ts            # Store entrées de stock
│   ├── customers.ts         # Store clients
│   ├── dashboard.ts         # Store tableau de bord
│   ├── encaissements.ts     # Store encaissements
│   ├── facturations.ts      # Store facturations
│   ├── fournisseurs.ts      # Store fournisseurs & comptes
│   ├── productFamilies.ts   # Store familles produits
│   ├── products.ts          # Store produits
│   ├── serviceFamilies.ts   # Store familles services
│   ├── services.ts          # Store services
│   ├── stores.ts            # Store magasins
│   └── user.ts              # Store utilisateur
├── views/
│   ├── achats/              # Vues entrées de stock
│   ├── auth/                # Vues authentification
│   ├── encaissements/       # Vues encaissements
│   ├── facturation/         # Vues facturation
│   ├── fournisseurs/        # Vues gestion fournisseurs
│   ├── products/            # Vues produits et familles
│   ├── services/            # Vues services
│   └── users/               # Vues gestion utilisateurs
├── router/                  # Configuration Vue Router
├── lib/                     # Utilitaires (cn() pour classes)
└── assets/                  # Assets statiques et CSS global
```

### Application Modules

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/` | Tableau de bord principal |
| Produits | `/produits` | Gestion des produits |
| Services | `/services` | Gestion des services |
| Familles Produits | `/categories/produits` | Catégories de produits |
| Familles Services | `/categories/services` | Catégories de services |
| Entrée Stock | `/achats/entree-stock` | Gestion des entrées de stock |
| Facturation Produit | `/facturation/produit` | Facturation des produits |
| Facturation Service | `/facturation/service` | Facturation des services |
| Encaissements | `/encaissements` | Gestion des encaissements |
| Fournisseurs | `/fournisseurs` | Comptes fournisseurs et règlements |
| Comptes Fournisseurs | `/fournisseurs/comptes` | Liste des fournisseurs |
| Clients | `/users/customer` | Gestion des clients |
| Authentification | `/login` | Page de connexion |

### Layout Architecture

L'application utilise un layout basé sur une sidebar :
- `SidebarProvider` enveloppe le layout
- `AppSidebar` pour la navigation principale
- `SidebarInset` contient `AppNavbar` et le contenu principal
- Sidebar collapsible avec mode icônes

### Path Aliases

Configurés dans `vite.config.ts` et `components.json` :
- `@/` → `src/`
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/components/ui` → `src/components/ui`

### shadcn-vue Integration

Configuration shadcn-vue :
- Style: New York
- Base color: neutral
- CSS variables: enabled
- Icons: lucide-vue-next
- Pas de préfixe de composant

### Component Pattern

Chaque module suit ce pattern :
- `*SearchBar.vue` - Barre de recherche avec actions (export, import, nouveau)
- `*Table.vue` - Tableau avec pagination
- `*Form.vue` - Formulaire d'ajout/modification (Dialog)
- Vue principale dans `views/[module]/`

### Store Pattern

Les stores Pinia suivent ce pattern :
```typescript
// État
const items = ref<Item[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Actions CRUD
const fetchItems = async () => { ... }
const addItem = async (data) => { ... }
const updateItem = async (id, data) => { ... }
const deleteItem = async (id) => { ... }
```

## Styling Guidelines

- Utiliser `cn()` de `@/lib/utils` pour merger les classes Tailwind
- Couleur primaire : `#0769CF`
- Bordures arrondies : `rounded-xl` ou `rounded-2xl`
- Formulaires : Dialog avec gradient header pour les actions importantes

## Node Version Requirements

Node.js `^20.19.0 || >=22.12.0`

## Development Notes

- Tous les fichiers `.vue` utilisent TypeScript (`<script setup lang="ts">`)
- Vue DevTools activé en développement
- Les données mockées sont dans les stores (à remplacer par API)
