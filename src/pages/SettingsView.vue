<template>
  <div class="flex h-[calc(100vh-4rem)] bg-gray-50">
    <!-- Sidebar Navigation -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <!-- Search -->
      <div class="p-4 border-b border-gray-200">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            :placeholder="t('settings.searchPlaceholder')"
            class="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <X class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer" />
        </div>
      </div>

      <!-- Navigation Items -->
      <nav class="flex-1 overflow-y-auto py-4">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="handleMenuClick(item)"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors',
            activeSection === item.id
              ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
              : 'text-gray-700 hover:bg-gray-50'
          ]"
        >
          <component :is="item.icon" class="h-5 w-5" />
          <div class="flex-1">
            <div class="font-medium">{{ item.title }}</div>
            <div class="text-xs text-gray-500">{{ item.subtitle }}</div>
          </div>
        </button>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <div class="max-w-4xl mx-auto p-8">
        <!-- Documentation Section -->
        <div v-if="activeSection === 'documentation'">
          <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <BookOpen class="h-8 w-8 text-blue-600" />
              Documentation de l'Application
            </h1>
            <p class="text-gray-600">Guide complet d'utilisation de SG-Stock</p>
          </div>

          <!-- Overview -->
          <section class="mb-8">
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
              <h2 class="text-xl font-bold">Présentation de SG-Stock</h2>
            </div>
            <div class="bg-white rounded-b-lg border border-gray-200 p-6 space-y-4">
              <p class="text-gray-700 leading-relaxed">
                <strong>SG-Stock</strong> est une solution complète de gestion d'entreprise conçue pour optimiser vos opérations commerciales,
                de la gestion des stocks à la facturation, en passant par le suivi des ventes et la gestion de caisse.
              </p>
              <div class="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <h3 class="font-semibold text-blue-900 mb-2">🎯 Pour qui ?</h3>
                <ul class="text-gray-700 space-y-1 ml-4">
                  <li>• Petites et moyennes entreprises</li>
                  <li>• Commerces de détail et de gros</li>
                  <li>• Entreprises de services</li>
                  <li>• Points de vente multiples</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Core Features -->
          <section class="mb-8">
            <div class="bg-gray-100 px-4 py-2 mb-4">
              <h2 class="text-lg font-semibold text-gray-800">✨ Fonctionnalités Principales</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Gestion des Produits -->
              <div class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span class="text-xl">📦</span>
                  </div>
                  <h3 class="font-bold text-gray-900">Gestion des Produits</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Catalogue produits complet avec catégories</li>
                  <li>• Suivi des prix d'achat et de vente</li>
                  <li>• Gestion des codes-barres</li>
                  <li>• Images et descriptions détaillées</li>
                  <li>• Variantes de produits</li>
                </ul>
              </div>

              <!-- Gestion des Stocks -->
              <div class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span class="text-xl">📊</span>
                  </div>
                  <h3 class="font-bold text-gray-900">Gestion des Stocks</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Suivi en temps réel des stocks</li>
                  <li>• Alertes de stock minimum</li>
                  <li>• Mouvements de stock détaillés</li>
                  <li>• Inventaire physique</li>
                  <li>• Multi-magasins</li>
                </ul>
              </div>

              <!-- Ventes & Caisse -->
              <div class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span class="text-xl">💰</span>
                  </div>
                  <h3 class="font-bold text-gray-900">Ventes & Caisse</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Interface de vente rapide (POS)</li>
                  <li>• Gestion de caisse complète</li>
                  <li>• Ouverture/fermeture de caisse</li>
                  <li>• Rapports journaliers automatiques</li>
                  <li>• Multiples modes de paiement</li>
                </ul>
              </div>

              <!-- Facturation -->
              <div class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <span class="text-xl">📄</span>
                  </div>
                  <h3 class="font-bold text-gray-900">Facturation</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Génération automatique de factures</li>
                  <li>• Personnalisation des modèles</li>
                  <li>• Envoi par email</li>
                  <li>• Suivi des paiements</li>
                  <li>• Gestion des devis</li>
                </ul>
              </div>

              <!-- Clients & Fournisseurs -->
              <div class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <span class="text-xl">👥</span>
                  </div>
                  <h3 class="font-bold text-gray-900">Clients & Fournisseurs</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Carnet d'adresses complet</li>
                  <li>• Historique des transactions</li>
                  <li>• Gestion des crédits clients</li>
                  <li>• Suivi des dettes</li>
                  <li>• Notes et commentaires</li>
                </ul>
              </div>

              <!-- Dépenses -->
              <div class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <span class="text-xl">💸</span>
                  </div>
                  <h3 class="font-bold text-gray-900">Gestion des Dépenses</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Enregistrement des dépenses</li>
                  <li>• Catégorisation des dépenses</li>
                  <li>• Pièces justificatives</li>
                  <li>• Rapports de dépenses</li>
                  <li>• Budget prévisionnel</li>
                </ul>
              </div>

              <!-- Analytique -->
              <div class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <span class="text-xl">📈</span>
                  </div>
                  <h3 class="font-bold text-gray-900">Analytique & Rapports</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Tableaux de bord personnalisés</li>
                  <li>• Statistiques de ventes</li>
                  <li>• Analyse des marges</li>
                  <li>• Rapports exportables (PDF, Excel)</li>
                  <li>• Graphiques interactifs</li>
                </ul>
              </div>

              <!-- Gestion des Utilisateurs -->
              <div class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
                    <span class="text-xl">🔐</span>
                  </div>
                  <h3 class="font-bold text-gray-900">Utilisateurs & Permissions</h3>
                </div>
                <ul class="text-sm text-gray-600 space-y-2">
                  <li>• Gestion des rôles (Admin, Caissier, etc.)</li>
                  <li>• Permissions granulaires</li>
                  <li>• Multi-utilisateurs</li>
                  <li>• Journaux d'activité</li>
                  <li>• Sécurité renforcée</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Roles & Permissions -->
          <section class="mb-8">
            <div class="bg-gray-100 px-4 py-2 mb-4">
              <h2 class="text-lg font-semibold text-gray-800">👤 Rôles et Autorisations</h2>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <p class="text-gray-700">L'application propose une gestion fine des permissions selon les rôles :</p>

              <div class="space-y-3">
                <div class="border-l-4 border-red-500 pl-4">
                  <h4 class="font-bold text-gray-900">🔴 Super Administrateur</h4>
                  <p class="text-sm text-gray-600">Accès complet à toutes les fonctionnalités et paramètres système</p>
                </div>

                <div class="border-l-4 border-blue-500 pl-4">
                  <h4 class="font-bold text-gray-900">🔵 Manager / Gestionnaire</h4>
                  <p class="text-sm text-gray-600">Gestion complète des opérations, rapports et supervision d'équipe</p>
                </div>

                <div class="border-l-4 border-green-500 pl-4">
                  <h4 class="font-bold text-gray-900">🟢 Caissier</h4>
                  <p class="text-sm text-gray-600">Accès aux ventes, encaissement et gestion de caisse uniquement</p>
                </div>

                <div class="border-l-4 border-yellow-500 pl-4">
                  <h4 class="font-bold text-gray-900">🟡 Magasinier</h4>
                  <p class="text-sm text-gray-600">Gestion des stocks, inventaire et mouvements de marchandises</p>
                </div>

                <div class="border-l-4 border-purple-500 pl-4">
                  <h4 class="font-bold text-gray-900">🟣 Commercial</h4>
                  <p class="text-sm text-gray-600">Gestion clients, devis et suivi des ventes</p>
                </div>

                 <div class="border-l-4 border-red-500 pl-4">
                    <p class="text-sm text-gray-600">NB : L’admin ou le superadmin peut configurer les rôles et les fonctionnalités comme il le souhaite. ✅</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Terms & Conditions -->
          <section class="mb-8">
            <div class="bg-gray-100 px-4 py-2 mb-4">
              <h2 class="text-lg font-semibold text-gray-800">📋 Conditions d'Utilisation</h2>
            </div>
            <div class="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div class="space-y-4 text-gray-700">
                <div>
                  <h3 class="font-bold text-gray-900 mb-2">1. Acceptation des conditions</h3>
                  <p class="text-sm">En utilisant SG-Stock, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.</p>
                </div>

                <div>
                  <h3 class="font-bold text-gray-900 mb-2">2. Utilisation appropriée</h3>
                  <ul class="text-sm space-y-1 ml-4">
                    <li>• Utilisez l'application uniquement pour des activités commerciales légales</li>
                    <li>• Ne partagez pas vos identifiants de connexion</li>
                    <li>• Respectez les droits des autres utilisateurs</li>
                    <li>• N'introduisez pas de contenu malveillant</li>
                  </ul>
                </div>

                <div>
                  <h3 class="font-bold text-gray-900 mb-2">3. Responsabilités de l'utilisateur</h3>
                  <ul class="text-sm space-y-1 ml-4">
                    <li>• Maintenir la confidentialité de vos informations de compte</li>
                    <li>• Effectuer des sauvegardes régulières de vos données</li>
                    <li>• Vérifier l'exactitude des informations saisies</li>
                    <li>• Signaler tout problème de sécurité immédiatement</li>
                  </ul>
                </div>

                <div>
                  <h3 class="font-bold text-gray-900 mb-2">4. Protection des données</h3>
                  <p class="text-sm">Nous nous engageons à protéger vos données conformément au RGPD. Vos informations sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement.</p>
                </div>

                <div>
                  <h3 class="font-bold text-gray-900 mb-2">5. Limitation de responsabilité</h3>
                  <p class="text-sm">L'application est fournie "en l'état". Nous ne garantissons pas que le service sera ininterrompu ou exempt d'erreurs. Vous êtes responsable de vos décisions commerciales basées sur les données de l'application.</p>
                </div>

                <div>
                  <h3 class="font-bold text-gray-900 mb-2">6. Support technique</h3>
                  <p class="text-sm">Un support technique est disponible pour vous aider. Contactez-nous par email ou via le système de tickets intégré pour toute assistance.</p>
                </div>

                <div class="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mt-4">
                  <p class="text-sm font-semibold text-blue-900">📧 Contact Support: support@sg-stock.com</p>
                  <p class="text-sm text-blue-800 mt-1">Délai de réponse moyen: 24-48 heures</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Getting Started -->
          <section class="mb-8">
            <div class="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-lg">
              <h2 class="text-xl font-bold">🚀 Démarrage Rapide</h2>
            </div>
            <div class="bg-white rounded-b-lg border border-gray-200 p-6">
              <ol class="space-y-3 text-gray-700">
                <li class="flex gap-3">
                  <span class="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <strong>Configuration initiale :</strong> Renseignez les informations de votre entreprise dans les paramètres généraux
                  </div>
                </li>
                <li class="flex gap-3">
                  <span class="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <strong>Créez vos magasins :</strong> Configurez vos points de vente ou entrepôts
                  </div>
                </li>
                <li class="flex gap-3">
                  <span class="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <strong>Ajoutez vos produits :</strong> Importez ou créez votre catalogue de produits
                  </div>
                </li>
                <li class="flex gap-3">
                  <span class="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-bold">4</span>
                  <div>
                    <strong>Créez les utilisateurs :</strong> Ajoutez votre équipe avec les rôles appropriés
                  </div>
                </li>
                <li class="flex gap-3">
                  <span class="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-bold">5</span>
                  <div>
                    <strong>Commencez à vendre :</strong> Ouvrez une caisse et effectuez votre première vente !
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 text-center">
            <h3 class="text-xl font-bold mb-2">Besoin d'aide ?</h3>
            <p class="mb-4">Notre équipe est là pour vous accompagner dans l'utilisation de SG-Stock</p>
            <button class="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Contacter le support
            </button>
          </div>
        </div>

        <!-- General Settings Section (existing) -->
        <div v-else>
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('settings.title') }}</h1>
            <p class="text-gray-600">{{ t('settings.subtitle') }}</p>
          </div>

        <!-- Sociétés Section -->
        <section class="mb-8">
          <div class="bg-gray-100 px-4 py-2 mb-4">
            <h2 class="text-sm font-semibold text-gray-700">{{ t('settings.company.title') }}</h2>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <!-- Company Name -->
            <div class="grid grid-cols-3 gap-4 items-center">
              <label class="text-sm text-gray-700">{{ t('settings.company.name') }} <span class="text-red-500">*</span></label>
              <input
                v-model="tenantSettings.name"
                type="text"
                :placeholder="t('settings.company.namePlaceholder')"
                class="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <!-- Email -->
            <div class="grid grid-cols-3 gap-4 items-center">
              <label class="text-sm text-gray-700">{{ t('settings.company.email') }} <span class="text-red-500">*</span></label>
              <input
                v-model="tenantSettings.email"
                type="email"
                :placeholder="t('settings.company.emailPlaceholder')"
                class="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <!-- Phone -->
            <div class="grid grid-cols-3 gap-4 items-center">
              <label class="text-sm text-gray-700">{{ t('settings.company.phone') }}</label>
              <input
                v-model="tenantSettings.phone"
                type="tel"
                :placeholder="t('settings.company.phonePlaceholder')"
                class="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Address -->
            <div class="grid grid-cols-3 gap-4 items-start">
              <label class="text-sm text-gray-700 pt-2">{{ t('settings.company.address') }}</label>
              <textarea
                v-model="tenantSettings.address"
                :placeholder="t('settings.company.addressPlaceholder')"
                rows="3"
                class="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <!-- Update Button -->
            <div class="flex justify-end pt-4 border-t">
              <button
                @click="updateTenantInfo"
                :disabled="loadingTenant"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span v-if="loadingTenant" class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ loadingTenant ? t('settings.company.updating') : t('settings.company.updateButton') }}
              </button>
            </div>


          </div>
        </section>

        <!-- Branding Section -->
        <section class="mb-8">
          <div class="bg-gray-100 px-4 py-2 mb-4">
            <h2 class="text-sm font-semibold text-gray-700">{{ t('settings.branding.title') }}</h2>
          </div>
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="grid grid-cols-3 gap-4 items-center">
              <label class="text-sm text-gray-700">{{ t('settings.branding.logo') }}</label>
              <div class="col-span-2">
                <div class="flex items-center gap-4">
                  <button class="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">{{ t('settings.branding.chooseFile') }}</button>
                  <span class="text-sm text-gray-500">{{ t('settings.branding.noFile') }}</span>
                </div>
                <p class="text-xs text-gray-400 mt-2">{{ t('settings.branding.logoInfo') }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Languages Section -->
        <section>
          <div class="bg-gray-100 px-4 py-2 mb-4">
            <h2 class="text-sm font-semibold text-gray-700">{{ t('settings.language.title') }}</h2>
          </div>
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="grid grid-cols-3 gap-4">
              <label class="text-sm text-gray-700 font-medium">{{ t('settings.language.current') }}</label>
              <div class="col-span-2 space-y-3">
                <!-- Current Language Display -->
                <div class="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <Globe class="h-5 w-5 text-blue-600" />
                  <div>
                    <p class="font-medium text-gray-900">{{ currentLanguageName }}</p>
                    <p class="text-xs text-gray-600">{{ t('settings.language.interface') }}</p>
                  </div>
                </div>

                <!-- Language Selection Buttons -->
                <div class="space-y-2">
                  <p class="text-sm text-gray-600 mb-2">{{ t('settings.language.select') }}</p>
                  <button
                    @click="changeLanguage('fr')"
                    :disabled="changingLanguage || currentLanguage === 'fr'"
                    :class="[
                      'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left',
                      currentLanguage === 'fr'
                        ? 'border-blue-600 bg-blue-50 cursor-default'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer'
                    ]"
                  >
                    <div class="flex items-center gap-3">
                      <Globe :class="[
                        'h-5 w-5',
                        currentLanguage === 'fr' ? 'text-blue-600' : 'text-gray-400'
                      ]" />
                      <div>
                        <p class="font-medium text-gray-900 text-sm">{{ t('settings.language.french') }}</p>
                        <p class="text-xs text-gray-500">FR</p>
                      </div>
                    </div>
                    <div v-if="currentLanguage === 'fr'" class="flex items-center gap-2 text-blue-600">
                      <Check class="h-5 w-5" />
                      <span class="text-sm font-medium">{{ t('common.active') }}</span>
                    </div>
                  </button>

                  <button
                    @click="changeLanguage('en')"
                    :disabled="changingLanguage || currentLanguage === 'en'"
                    :class="[
                      'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left',
                      currentLanguage === 'en'
                        ? 'border-blue-600 bg-blue-50 cursor-default'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer'
                    ]"
                  >
                    <div class="flex items-center gap-3">
                      <Globe :class="[
                        'h-5 w-5',
                        currentLanguage === 'en' ? 'text-blue-600' : 'text-gray-400'
                      ]" />
                      <div>
                        <p class="font-medium text-gray-900 text-sm">{{ t('settings.language.english') }}</p>
                        <p class="text-xs text-gray-500">EN</p>
                      </div>
                    </div>
                    <div v-if="currentLanguage === 'en'" class="flex items-center gap-2 text-blue-600">
                      <Check class="h-5 w-5" />
                      <span class="text-sm font-medium">{{ t('common.active') }}</span>
                    </div>
                  </button>
                </div>

                <p v-if="changingLanguage" class="text-sm text-gray-500 italic mt-2">
                  ⏳ {{ t('settings.language.changing') }}
                </p>
              </div>
            </div>
          </div>
        </section>
        </div>
      </div>
    </main>

    <!-- Dialogs -->
    <Dialog :open="showUsersDialog" @update:open="showUsersDialog = $event">
      <DialogContent class="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestion des collaborateurs</DialogTitle>
        </DialogHeader>
        <UsersManagement />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Management Components
import UsersManagement from '@/components/users/UsersManagement.vue'

// Icons
import { Settings, Users as UsersIcon, FileText, CreditCard, Search, X, BookOpen, Globe, Check, Sliders, DollarSign } from 'lucide-vue-next'

// Composables
import { usePermissions } from '@/composables/usePermissions'
import { useLanguage } from '@/composables/useLanguage'
import { useToast } from '@/composables/useToast'

const { hasPermission } = usePermissions()
const { t, currentLanguage, changeLanguage: changeAppLanguage } = useLanguage()
const toast = useToast()

// Menu Items
const allMenuItems = computed(() => [
  { id: 'general', title: t('settings.sections.general.title'), subtitle: t('settings.sections.general.subtitle'), icon: Settings },
  { id: 'facture', title: t('settings.sections.invoice.title'), subtitle: t('settings.sections.invoice.subtitle'), icon: FileText, route: '/settings/company' },
  { id: 'invoice-config', title: 'Configuration de la facturation', subtitle: 'Gérer le comportement des prix en facturation', icon: DollarSign, route: '/settings/invoice-config' },
  { id: 'users-roles', title: t('settings.sections.users.title'), subtitle: t('settings.sections.users.subtitle'), icon: UsersIcon, route: '/settings/users-roles', permission: 'can_manage_users' },
  { id: 'field-config', title: 'Configuration des formulaires', subtitle: 'Gérer la visibilité et l\'obligation des champs', icon: Sliders, route: '/settings/field-config' },
  { id: 'abonnement', title: t('settings.sections.subscription.title'), subtitle: t('settings.sections.subscription.subtitle'), icon: CreditCard, route: '/settings/subscription' },
  { id: 'documentation', title: t('settings.sections.documentation.title'), subtitle: t('settings.sections.documentation.subtitle'), icon: BookOpen }
])

// Filtrer les items du menu selon les permissions
const menuItems = computed(() => {
  return allMenuItems.value.filter(item => {
    // Si l'item n'a pas de permission requise, l'afficher
    if (!item.permission) return true
    // Sinon vérifier si l'utilisateur a la permission
    return hasPermission(item.permission)
  })
})

// State
const activeSection = ref('general')
const showUsersDialog = ref(false)
const loadingTenant = ref(false)

// Tenant settings (informations de l'entreprise)
const tenantSettings = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

// Load tenant info on mount
import { onMounted } from 'vue'
import { useTenantStore } from '@/stores/tenant.store'
import { useRouter } from 'vue-router'

const tenantStore = useTenantStore()
const router = useRouter()

// Handle menu click - navigate if route exists, otherwise change section
function handleMenuClick(item: { id: string; route?: string }) {
  if (item.route) {
    router.push(item.route)
  } else {
    activeSection.value = item.id
  }
}

async function loadTenantInfo() {
  try {
    const tenant = await tenantStore.fetchCurrentTenant()
    if (tenant) {
      tenantSettings.value = {
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: tenant.address || ''
      }
    }
  } catch (error) {
  }
}

async function updateTenantInfo() {
  if (!tenantSettings.value.name || !tenantSettings.value.email) {
    alert(t('settings.company.requiredFields'))
    return
  }

  loadingTenant.value = true
  try {
    await tenantStore.updateTenant(tenantSettings.value)
    alert(t('settings.company.updateSuccess'))
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    alert(err.response?.data?.message || t('settings.company.updateError'))
  } finally {
    loadingTenant.value = false
  }
}

// Language management
import Axios from '@/services/axios.service'

const changingLanguage = ref(false)

const currentLanguageName = computed(() => {
  return currentLanguage.value === 'fr' ? t('settings.language.french') : t('settings.language.english')
})

// Load languages on mount
onMounted(async () => {
  await loadTenantInfo()
  await loadLanguages()
})

// Load languages on mount
onMounted(async () => {
  await loadTenantInfo()
  await loadLanguages()
})

async function loadLanguages() {
  try {
    const response = await Axios.get('/main/languages/')
    // La langue actuelle est déjà gérée par i18n
  } catch (error) {
  }
}

async function changeLanguage(languageCode: string) {
  if (languageCode === currentLanguage.value) {
    return
  }

  changingLanguage.value = true
  try {
    const success = await changeAppLanguage(languageCode)

    if (success) {
      alert(t('settings.language.changeSuccess'))
      // Reload page to apply new language
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      alert(t('settings.language.changeError'))
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    alert(`${t('settings.language.changeError')}: ${errorMessage}`)
  } finally {
    changingLanguage.value = false
  }
}
</script>
