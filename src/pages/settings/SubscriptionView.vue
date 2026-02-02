<template>
  <div class="max-w-6xl mx-auto p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
        <CreditCard class="h-8 w-8 text-blue-600" />
        Gestion de l'Abonnement
      </h1>
      <p class="text-gray-600">Gérez votre plan d'abonnement et vos fonctionnalités</p>
    </div>

    <!-- Current Subscription Info -->
    <section class="mb-8">
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Abonnement Actuel</h2>
            <p class="text-sm text-gray-600">Informations sur votre plan actuel</p>
          </div>
          <div v-if="subscription" :class="[
            'px-4 py-2 rounded-full text-sm font-medium',
            subscription.is_expired ? 'bg-red-100 text-red-700' :
            subscription.days_remaining <= 7 ? 'bg-orange-100 text-orange-700' :
            'bg-green-100 text-green-700'
          ]">
            {{ subscription.is_expired ? 'Expiré' : subscription.is_trial ? 'Période d\'essai' : 'Actif' }}
          </div>
        </div>

        <div v-if="loadingSubscription" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="subscription" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Plan -->
          <div class="space-y-2">
            <p class="text-sm text-gray-600">Plan</p>
            <p class="text-2xl font-bold text-gray-900 capitalize">{{ subscription.plan }}</p>
            <p class="text-sm text-gray-500">{{ subscription.monthly_price }} XAF/mois</p>
          </div>

          <!-- Expiration -->
          <div class="space-y-2">
            <p class="text-sm text-gray-600">{{ subscription.is_trial ? 'Fin d\'essai' : 'Expire le' }}</p>
            <p class="text-xl font-semibold text-gray-900">
              {{ subscription.end_date ? formatDate(subscription.end_date) : 'Non défini' }}
            </p>
            <p v-if="subscription.end_date" :class="[
              'text-sm font-medium',
              subscription.days_remaining <= 7 ? 'text-orange-600' : 'text-green-600'
            ]">
              {{ subscription.days_remaining }} jours restants
            </p>
            <p v-else class="text-sm font-medium text-gray-500">
              Aucune date d'expiration
            </p>
          </div>

          <!-- Users -->
          <div class="space-y-2">
            <p class="text-sm text-gray-600">Utilisateurs</p>
            <p class="text-xl font-semibold text-gray-900">{{ subscription.current_users }} / {{ subscription.max_users }}</p>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div :style="{ width: `${(subscription.current_users / subscription.max_users) * 100}%` }"
                   class="bg-blue-600 h-2 rounded-full"></div>
            </div>
          </div>

          <!-- Storage -->
          <div class="space-y-2">
            <p class="text-sm text-gray-600">Stockage</p>
            <p class="text-xl font-semibold text-gray-900">{{ subscription.storage_used }} / {{ subscription.max_storage }} MB</p>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div :style="{ width: `${(subscription.storage_used / subscription.max_storage) * 100}%` }"
                   class="bg-green-600 h-2 rounded-full"></div>
            </div>
          </div>
        </div>

        <!-- Renewal Warning -->
        <div v-if="subscription && !subscription.is_expired && subscription.days_remaining <= 30"
             class="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
          <AlertTriangle class="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="font-semibold text-orange-900">Renouvellement proche</h3>
            <p class="text-sm text-orange-700 mt-1">
              Votre abonnement expire dans {{ subscription.days_remaining }} jours. Renouvelez dès maintenant pour éviter toute interruption de service.
            </p>
          </div>
        </div>

        <!-- Expiration Alert -->
        <div v-if="subscription && subscription.is_expired"
             class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <XCircle class="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="font-semibold text-red-900">Abonnement expiré</h3>
            <p class="text-sm text-red-700 mt-1">
              Votre abonnement a expiré. Renouvelez maintenant pour continuer à utiliser tous les services.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Available Plans - TEMPORAIREMENT COMMENTÉ EN ATTENDANT L'IMPLÉMENTATION DU CHANGEMENT DE PACK -->
    <!--
    <section class="mb-8">
      <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-900">Plans Disponibles</h2>
        <p class="text-sm text-gray-600">Choisissez le plan qui correspond à vos besoins</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div :class="[
          'bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all cursor-pointer',
          subscription?.plan === 'pack1' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
        ]" @click="selectedPlan = 'pack1'">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">PACK 1</h3>
            <div v-if="subscription?.plan === 'pack1'" class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Actuel
            </div>
          </div>
          <div class="mb-4">
            <div class="text-4xl font-bold text-gray-900">229 900</div>
            <div class="text-sm text-gray-600">XAF / 1ère année</div>
            <div class="text-xs text-green-600 mt-1">Puis 100 000 XAF/an</div>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p class="text-xs text-blue-800">
              Réduction de 43,67% après votre première recharge annuelle
            </p>
          </div>
          <ul class="space-y-2 mb-6 text-sm">
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Pour un seul point de vente</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Pour 10 utilisateurs</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>15 Go d'espace de stockage</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Gestion des stocks, produits et services</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Suivre les ventes et dépenses</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Gestion des emprunts, fournisseurs, clients</span>
            </li>
          </ul>
          <Button
            v-if="subscription?.plan !== 'pack1'"
            @click="confirmPlanChange('pack1')"
            class="w-full"
            variant="outline">
            Choisir ce plan
          </Button>
        </div>

        <div :class="[
          'bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all cursor-pointer',
          subscription?.plan === 'pack2' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
        ]" @click="selectedPlan = 'pack2'">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">PACK 2</h3>
            <div v-if="subscription?.plan === 'pack2'" class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Actuel
            </div>
          </div>
          <div class="mb-4">
            <div class="text-4xl font-bold text-gray-900">449 900</div>
            <div class="text-sm text-gray-600">XAF / 1ère année</div>
            <div class="text-xs text-green-600 mt-1">Puis 150 000 XAF/an</div>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p class="text-xs text-blue-800">
              Réduction de 33,41% après votre première recharge annuelle
            </p>
          </div>
          <ul class="space-y-2 mb-6 text-sm">
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>1 Point de vente + 1 Magasin</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Pour 15 utilisateurs</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>30 Go d'espace de stockage</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Gestion des stocks, produits et services</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Suivre les ventes et dépenses</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Gestion multi-magasins</span>
            </li>
          </ul>
          <Button
            v-if="subscription?.plan !== 'pack2'"
            @click="confirmPlanChange('pack2')"
            class="w-full"
            variant="default">
            Passer à PACK 2
          </Button>
        </div>

        <div :class="[
          'bg-white rounded-xl border-2 p-6 hover:shadow-lg transition-all cursor-pointer relative',
          subscription?.plan === 'pack3' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
        ]" @click="selectedPlan = 'pack3'">
          <div class="absolute -top-3 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold">
            RECOMMANDÉ
          </div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">PACK 3</h3>
            <div v-if="subscription?.plan === 'pack3'" class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Actuel
            </div>
          </div>
          <div class="mb-4">
            <div class="text-4xl font-bold text-gray-900">699 900</div>
            <div class="text-sm text-gray-600">XAF / 1ère année</div>
            <div class="text-xs text-green-600 mt-1">Puis 250 000 XAF/an</div>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p class="text-xs text-blue-800">
              Réduction de 35,7% après votre première recharge annuelle
            </p>
          </div>
          <ul class="space-y-2 mb-6 text-sm">
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Points de vente et magasins illimités</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Utilisateurs illimités</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>50 Go d'espace de stockage</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Toutes les fonctionnalités incluses</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Analytics avancés</span>
            </li>
            <li class="flex items-start gap-2 text-gray-700">
              <Check class="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Support prioritaire</span>
            </li>
          </ul>
          <Button
            v-if="subscription?.plan !== 'pack3'"
            @click="confirmPlanChange('pack3')"
            class="w-full"
            variant="default">
            Passer à PACK 3
          </Button>
        </div>
      </div>
    </section>
    -->

    <!-- Actions -->
    <section>
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            @click="handleRenewSubscription"
            :disabled="processingRenewal"
            size="lg"
            class="w-full"
            variant="default">
            <RefreshCw :class="['mr-2 h-5 w-5', processingRenewal ? 'animate-spin' : '']" />
            {{ processingRenewal ? 'Renouvellement en cours...' : 'Renouveler l\'abonnement' }}
          </Button>
          <Button
            @click="handleContactSupport"
            size="lg"
            class="w-full"
            variant="outline">
            <Mail class="mr-2 h-5 w-5" />
            Contacter le support
          </Button>
        </div>
      </div>
    </section>

    <!-- Contact Support Dialog (VERSION TEMPORAIRE - en attente d'intégration API de paiement) -->
    <Dialog :open="showRenewDialog" @update:open="showRenewDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Mail class="h-5 w-5 text-blue-600" />
            Renouvellement
          </DialogTitle>
          <DialogDescription>
            Contactez le support pour {{ subscriptionPrice?.is_first_payment ? 'activer' : 'renouveler' }} votre abonnement
          </DialogDescription>
        </DialogHeader>

        <div class="py-4 space-y-4">
          <!-- Price Summary - Compact -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div class="text-center">
              <p class="text-xs text-blue-600 font-medium uppercase">{{ subscriptionPrice?.plan_name }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-1">{{ formatPrice(subscriptionPrice?.current_price) }} <span class="text-lg font-normal text-gray-600">XAF</span></p>
              <p v-if="!subscriptionPrice?.is_first_payment" class="text-xs text-green-600 font-medium mt-1">
                🎉 -{{ subscriptionPrice?.reduction_percentage }}% (Prix normal : {{ formatPrice(subscriptionPrice?.first_payment_price) }} XAF)
              </p>
            </div>
          </div>

          <!-- Support Contact - Compact -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-gray-700 text-center">📞 Contactez le Support Client</p>

            <!-- WhatsApp -->
            <a
              href="https://wa.me/237652263517?text=Bonjour, je souhaite renouveler mon abonnement SG-Stocks"
              target="_blank"
              class="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all cursor-pointer group">
              <div class="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                📱
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-gray-900 group-hover:text-green-700">WhatsApp</p>
                <p class="text-xs text-gray-600">+237 652 263 517</p>
              </div>
            </a>

            <!-- Email -->
            <a
              href="mailto:supportclient@sgstocks.com?subject=Renouvellement abonnement&body=Bonjour,%0D%0A%0D%0AJe souhaite renouveler mon abonnement SG-Stocks.%0D%0APlan : {{ subscriptionPrice?.plan_name }}%0D%0AMontant : {{ formatPrice(subscriptionPrice?.current_price) }} XAF%0D%0A%0D%0AMerci"
              class="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all cursor-pointer group">
              <div class="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">
                ✉️
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-gray-900 group-hover:text-blue-700">Email</p>
                <p class="text-xs text-gray-600 truncate">supportclient@sgstocks.com</p>
              </div>
            </a>
          </div>

          <!-- Information Notice - Compact -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div class="flex items-start gap-2">
              <AlertTriangle class="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div class="text-xs text-yellow-800">
                <p class="font-semibold">À mentionner :</p>
                <p class="mt-1">Nom d'entreprise • Montant <strong>{{ formatPrice(subscriptionPrice?.current_price) }} XAF</strong> • Méthode (MTN/Orange Money)</p>
                <p class="mt-1 text-yellow-700">⏱️ Activation sous 24h</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="showRenewDialog = false"
            class="w-full">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!--
    ========================================
    FORMULAIRE DE PAIEMENT COMPLET (COMMENTÉ)
    ========================================
    À décommenter et activer lors de l'intégration de l'API de paiement Mobile Money

    <Dialog :open="showRenewDialog" @update:open="showRenewDialog = $event">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <CreditCard class="h-5 w-5 text-blue-600" />
            Renouvellement de l'abonnement
          </DialogTitle>
          <DialogDescription>
            {{ subscriptionPrice?.is_first_payment ? 'Activez' : 'Renouvelez' }} votre abonnement pour {{ subscriptionPrice?.subscription_duration_days }} jours
          </DialogDescription>
        </DialogHeader>

        <div class="py-6 space-y-6">

          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div class="text-center">
              <p class="text-sm text-blue-600 font-medium uppercase tracking-wide">{{ subscriptionPrice?.plan_name }}</p>
              <p class="text-4xl font-bold text-gray-900 mt-2">{{ formatPrice(subscriptionPrice?.current_price) }} <span class="text-xl font-normal text-gray-600">XAF</span></p>
              <p class="text-sm text-gray-600 mt-1">{{ subscriptionPrice?.subscription_duration_days }} jours</p>

              <div v-if="!subscriptionPrice?.is_first_payment" class="mt-4 pt-4 border-t border-blue-200">
                <div class="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full">
                  <span class="font-semibold">🎉 Réduction de {{ subscriptionPrice?.reduction_percentage }}%</span>
                </div>
                <p class="text-sm text-gray-600 mt-2">
                  Prix normal : <span class="line-through">{{ formatPrice(subscriptionPrice?.first_payment_price) }} XAF</span>
                </p>
              </div>
            </div>
          </div>


          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">Méthode de paiement</label>
            <div class="grid grid-cols-2 gap-3">

              <div
                @click="paymentMethod = 'mtn'"
                :class="[
                  'cursor-pointer border-2 rounded-lg p-4 transition-all',
                  paymentMethod === 'mtn'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-300'
                ]">
                <div class="flex flex-col items-center gap-2">
                  <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    M
                  </div>
                  <span class="text-sm font-medium">MTN Money</span>
                </div>
              </div>


              <div
                @click="paymentMethod = 'orange'"
                :class="[
                  'cursor-pointer border-2 rounded-lg p-4 transition-all',
                  paymentMethod === 'orange'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                ]">
                <div class="flex flex-col items-center gap-2">
                  <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    O
                  </div>
                  <span class="text-sm font-medium">Orange Money</span>
                </div>
              </div>
            </div>
          </div>


          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nom du titulaire <span class="text-red-500">*</span>
              </label>
              <input
                v-model="holderName"
                type="text"
                placeholder="Ex: Jean Dupont"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone <span class="text-red-500">*</span>
              </label>
              <input
                v-model="phoneNumber"
                type="tel"
                placeholder="6XXXXXXXX"
                pattern="[6][0-9]{8}"
                maxlength="9"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p class="mt-1 text-xs text-gray-500">Format: 6XXXXXXXX (9 chiffres commençant par 6)</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Référence de paiement
              </label>
              <input
                v-model="paymentReference"
                type="text"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                readonly
              />
              <p class="mt-1 text-xs text-gray-500">Cette référence sera utilisée pour identifier votre paiement</p>
            </div>
          </div>


          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <Info class="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div class="text-sm text-blue-800">
                <p class="font-semibold mb-1">Instructions de paiement :</p>
                <ol class="list-decimal list-inside space-y-1 text-xs">
                  <li>Composez le code USSD de votre opérateur</li>
                  <li>Sélectionnez "Payer un marchand"</li>
                  <li>Entrez le montant : <strong>{{ formatPrice(subscriptionPrice?.current_price) }} XAF</strong></li>
                  <li>Validez la transaction avec votre code PIN</li>
                  <li>Cliquez sur "Valider le paiement" ci-dessous</li>
                </ol>
              </div>
            </div>
          </div>


          <div class="flex items-start gap-2 pt-2">
            <input
              v-model="acceptTerms"
              type="checkbox"
              id="accept-terms"
              class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="accept-terms" class="text-sm text-gray-600">
              J'accepte que mon abonnement soit automatiquement renouvelé et je confirme avoir effectué le paiement de <strong>{{ formatPrice(subscriptionPrice?.current_price) }} XAF</strong>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="showRenewDialog = false">
            Annuler
          </Button>
          <Button
            type="button"
            :disabled="!acceptTerms || !paymentMethod || !holderName || !phoneNumber || phoneNumber.length !== 9"
            @click="confirmRenewal">
            <Check class="h-4 w-4 mr-2" />
            Valider le paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    -->

    <!-- Plan Change Confirmation Dialog -->
    <Dialog :open="showPlanChangeDialog" @update:open="showPlanChangeDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <CreditCard class="h-5 w-5 text-blue-600" />
            Changer de plan
          </DialogTitle>
          <DialogDescription>
            Voulez-vous changer votre plan d'abonnement ?
          </DialogDescription>
        </DialogHeader>
        <div class="py-4 space-y-4">
          <div v-if="isDowngrade()" class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <AlertTriangle class="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm text-orange-900 font-medium">⚠️ Attention : Rétrogradation</p>
                <p class="text-sm text-orange-700 mt-1">
                  Passer au plan {{ pendingPlanChange.toUpperCase() }} réduira vos fonctionnalités et limites.
                </p>
              </div>
            </div>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Plan actuel :</span>
                <span class="font-semibold text-gray-900">{{ subscription?.plan?.toUpperCase() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Nouveau plan :</span>
                <span class="font-semibold text-blue-600">{{ pendingPlanChange.toUpperCase() }}</span>
              </div>
              <div class="border-t border-blue-200 my-2"></div>
              <div class="flex justify-between">
                <span class="text-gray-600">Nouveau prix :</span>
                <span class="font-semibold text-gray-900">{{ getPlanPrice(pendingPlanChange).toLocaleString() }} XAF/mois</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter class="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            @click="showPlanChangeDialog = false">
            Annuler
          </Button>
          <Button
            type="button"
            @click="executePlanChange">
            Confirmer le changement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { CreditCard, Check, X, AlertTriangle, XCircle, RefreshCw, Mail } from 'lucide-vue-next'
import { useTenantStore } from '@/stores/tenant.store'
import { useToast } from '@/composables/useToast'
import Axios from '@/services/axios.service'

const tenantStore = useTenantStore()
const toast = useToast()

// State
const loadingSubscription = ref(false)
const processingRenewal = ref(false)
const selectedPlan = ref<string>('')
const showRenewDialog = ref(false)
const showPlanChangeDialog = ref(false)
const pendingPlanChange = ref<string>('')

// Payment form (variables communes)
const acceptTerms = ref(false)
const subscriptionPrice = ref<any>(null)

// Payment form variables - COMMENTÉES (pour utilisation future avec API Mobile Money)
// const paymentMethod = ref('mtn_money')
// const paymentReference = ref('')
// const paymentHolderName = ref('')
// const paymentPhoneNumber = ref('')

// Subscription data
const subscription = ref<{
  plan: string
  monthly_price: number
  end_date: string
  days_remaining: number
  is_expired: boolean
  is_trial: boolean
  max_users: number
  current_users: number
  max_storage: number
  storage_used: number
} | null>(null)

// Load subscription on mount
onMounted(async () => {
  await loadSubscription()
})

// Subscription management
async function loadSubscription() {
  loadingSubscription.value = true
  try {
    const tenant = await tenantStore.fetchCurrentTenant()
    if (tenant) {
      subscription.value = {
        plan: tenant.plan || 'pack1',
        monthly_price: tenant.monthly_price || 0,
        end_date: tenant.subscription_end_date || '',
        days_remaining: calculateDaysRemaining(tenant.subscription_end_date),
        is_expired: isExpired(tenant.subscription_end_date),
        is_trial: !!(tenant.trial_end_date && !tenant.subscription_end_date),
        max_users: tenant.max_users || 3,
        current_users: tenant.total_users_count || 0,
        max_storage: tenant.max_storage_mb || 1000,
        storage_used: tenant.storage_used_mb || 0
      }
    }
  } catch (error) {
    toast.error('Erreur lors du chargement des informations d\'abonnement', 'Erreur')
  } finally {
    loadingSubscription.value = false
  }
}

function calculateDaysRemaining(endDate: string | null): number {
  if (!endDate) return 0
  const end = new Date(endDate)
  const today = new Date()
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

function isExpired(endDate: string | null): boolean {
  if (!endDate) return false
  return new Date(endDate) < new Date()
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function handleRenewSubscription() {
  if (!subscription.value) return

  try {
    // Charger le prix de l'abonnement
    const response = await Axios.get('/tenants/subscription/price/')
    subscriptionPrice.value = response.data

    // VERSION TEMPORAIRE: Afficher le dialog de contact support
    // Pas besoin de générer une référence de paiement ni de préparer le formulaire

    // Réinitialiser uniquement les variables nécessaires
    acceptTerms.value = false

    // COMMENTÉ - Pour utilisation future avec API Mobile Money
    // const timestamp = new Date().getTime()
    // paymentReference.value = `PAY-${timestamp}`
    // paymentMethod.value = 'mtn_money'
    // paymentHolderName.value = ''
    // paymentPhoneNumber.value = ''

    showRenewDialog.value = true
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Erreur lors du chargement des informations de paiement'
    toast.error(errorMsg, 'Erreur')
  }
}

// FONCTION COMMENTÉE - À utiliser lors de l'intégration de l'API Mobile Money
/*
async function confirmRenewal() {
  if (!acceptTerms.value || !paymentReference.value) {
    toast.error('Veuillez accepter les conditions et fournir une référence de paiement', 'Erreur')
    return
  }

  if (!paymentHolderName.value || !paymentPhoneNumber.value) {
    toast.error('Veuillez renseigner votre nom et votre numéro de téléphone', 'Erreur')
    return
  }

  // Valider le format du numéro (Cameroun: 9 chiffres commençant par 6)
  const phoneRegex = /^6[0-9]{8}$/
  if (!phoneRegex.test(paymentPhoneNumber.value)) {
    toast.error('Numéro de téléphone invalide. Format attendu: 6XXXXXXXX', 'Erreur')
    return
  }

  processingRenewal.value = true

  try {
    const response = await Axios.post('/tenants/subscription/validate-payment/', {
      payment_reference: paymentReference.value,
      amount: subscriptionPrice.value?.current_price,
      payment_method: paymentMethod.value
    })

    showRenewDialog.value = false

    toast.success(
      `Paiement validé ! Votre abonnement est maintenant actif jusqu'au ${new Date(response.data.subscription_end_date).toLocaleDateString('fr-FR')}`,
      'Paiement réussi ✅',
      10000
    )

    await loadSubscription()
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la validation du paiement'

    // Afficher les détails si montant insuffisant
    if (error.response?.data?.expected_amount) {
      toast.error(
        `Montant insuffisant. Attendu: ${error.response.data.expected_amount} XAF, Reçu: ${error.response.data.received_amount} XAF`,
        'Erreur de paiement',
        10000
      )
    } else {
      toast.error(errorMsg, 'Erreur', 8000)
    }
  } finally {
    processingRenewal.value = false
  }
}
*/

function formatPrice(price: number | undefined): string {
  if (!price) return '0'
  return new Intl.NumberFormat('fr-FR').format(price)
}

// FONCTION COMMENTÉE - Utilisée pour afficher le label de méthode de paiement
/*
function getPaymentMethodLabel(): string {
  const labels: Record<string, string> = {
    'mtn_money': 'MTN Mobile Money',
    'orange_money': 'Orange Money'
  }
  return labels[paymentMethod.value] || paymentMethod.value
}
*/

function confirmPlanChange(newPlan: string) {
  if (!subscription.value) return
  pendingPlanChange.value = newPlan
  showPlanChangeDialog.value = true
}

function getPlanPrice(plan: string): number {
  const planPrices: Record<string, number> = {
    'pack1': 100000,  // Prix de renouvellement annuel PACK 1
    'pack2': 150000,  // Prix de renouvellement annuel PACK 2
    'pack3': 250000   // Prix de renouvellement annuel PACK 3
  }
  return planPrices[plan] || 0
}

function isDowngrade(): boolean {
  if (!subscription.value || !pendingPlanChange.value) return false
  const currentPrice = getPlanPrice(subscription.value.plan)
  const newPrice = getPlanPrice(pendingPlanChange.value)
  return newPrice < currentPrice
}

async function executePlanChange() {
  showPlanChangeDialog.value = false
  const newPlan = pendingPlanChange.value

  try {
    await Axios.post('/tenants/subscription/change-plan/', { plan: newPlan })
    toast.success(`Plan changé avec succès vers ${newPlan.toUpperCase()} !`, 'Succès')
    await loadSubscription()
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.response?.data?.detail || 'Erreur lors du changement de plan'
    toast.error(errorMsg, 'Erreur', 8000)
  } finally {
    pendingPlanChange.value = ''
  }
}

function handleContactSupport() {
  window.location.href = 'mailto:support@sg-stock.com?subject=Question sur l\'abonnement'
}
</script>
