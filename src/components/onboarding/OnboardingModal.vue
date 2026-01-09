<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronRight, Check } from 'lucide-vue-next'

const open = ref(false)
const currentSlide = ref(0)

const slides = [
  {
    title: "Bienvenue sur SG-Stocks ! 🎉",
    description: "Votre solution complète de gestion de stock et de facturation. Découvrez les fonctionnalités principales en quelques étapes.",
    illustration: 'welcome',
    gradient: "from-blue-500 to-purple-600"
  },
  {
    title: "Gestion de Stock Simplifiée",
    description: "Suivez vos entrées, sorties et transferts de stock en temps réel. Gérez plusieurs points de vente avec facilité.",
    illustration: 'stock',
    gradient: "from-green-500 to-emerald-600"
  },
  {
    title: "Facturation Rapide",
    description: "Créez des factures professionnelles en quelques clics. Gérez vos ventes, devis et reçus efficacement.",
    illustration: 'invoice',
    gradient: "from-purple-500 to-pink-600"
  },
  {
    title: "Statistiques & Analyses",
    description: "Visualisez vos performances avec des statistiques détaillées sur vos ventes et charges mensuelles.",
    illustration: 'analytics',
    gradient: "from-orange-500 to-red-600"
  },
  {
    title: "Gestion des Clients & Fournisseurs",
    description: "Suivez vos clients, leurs dettes et paiements. Gérez vos fournisseurs et leurs comptes en un seul endroit.",
    illustration: 'people',
    gradient: "from-indigo-500 to-blue-600"
  }
]

const isLastSlide = computed(() => currentSlide.value === slides.length - 1)

const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
  }
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const finish = () => {
  localStorage.setItem('onboarding_completed', 'true')
  open.value = false
}

const skip = () => {
  localStorage.setItem('onboarding_completed', 'true')
  open.value = false
}

onMounted(() => {
  // Vérifier si l'utilisateur a déjà vu l'onboarding
  const hasSeenOnboarding = localStorage.getItem('onboarding_completed')
  if (!hasSeenOnboarding) {
    // Afficher le modal après un court délai pour une meilleure UX
    setTimeout(() => {
      open.value = true
    }, 500)
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-2xl font-bold text-center">
          {{ slides[currentSlide].title }}
        </DialogTitle>
      </DialogHeader>

      <div class="py-6">
        <!-- Illustration SVG -->
        <div class="flex justify-center mb-6">
          <!-- Welcome Illustration -->
          <svg v-if="slides[currentSlide].illustration === 'welcome'" class="w-64 h-64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad-welcome" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#9333EA;stop-opacity:1" />
              </linearGradient>
            </defs>
            <!-- Fond cercle -->
            <circle cx="100" cy="100" r="90" fill="url(#grad-welcome)" opacity="0.1"/>
            <!-- Boîte de stock -->
            <rect x="60" y="70" width="80" height="70" rx="5" fill="url(#grad-welcome)" opacity="0.8"/>
            <rect x="65" y="75" width="70" height="30" fill="white" opacity="0.3"/>
            <!-- Lignes de détail -->
            <line x1="70" y1="115" x2="90" y2="115" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <line x1="70" y1="125" x2="130" y2="125" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <!-- Étoiles décoratives -->
            <circle cx="50" cy="50" r="4" fill="#FBBF24"/>
            <circle cx="150" cy="60" r="3" fill="#FBBF24"/>
            <circle cx="160" cy="140" r="5" fill="#FBBF24"/>
            <circle cx="40" cy="130" r="3" fill="#FBBF24"/>
          </svg>

          <!-- Stock Illustration -->
          <svg v-else-if="slides[currentSlide].illustration === 'stock'" class="w-64 h-64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad-stock" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
              </linearGradient>
            </defs>
            <!-- Fond -->
            <circle cx="100" cy="100" r="90" fill="url(#grad-stock)" opacity="0.1"/>
            <!-- Boîtes empilées -->
            <rect x="40" y="110" width="40" height="35" rx="3" fill="url(#grad-stock)" opacity="0.9"/>
            <rect x="85" y="110" width="40" height="35" rx="3" fill="url(#grad-stock)" opacity="0.7"/>
            <rect x="130" y="110" width="40" height="35" rx="3" fill="url(#grad-stock)" opacity="0.9"/>
            <rect x="62" y="75" width="40" height="35" rx="3" fill="url(#grad-stock)" opacity="0.8"/>
            <rect x="107" y="75" width="40" height="35" rx="3" fill="url(#grad-stock)" opacity="0.6"/>
            <rect x="85" y="40" width="40" height="35" rx="3" fill="url(#grad-stock)"/>
            <!-- Lignes sur les boîtes -->
            <line x1="45" y1="125" x2="75" y2="125" stroke="white" stroke-width="2" opacity="0.5"/>
            <line x1="90" y1="125" x2="120" y2="125" stroke="white" stroke-width="2" opacity="0.5"/>
            <line x1="135" y1="125" x2="165" y2="125" stroke="white" stroke-width="2" opacity="0.5"/>
            <!-- Flèches mouvement -->
            <path d="M 175 100 L 185 95 L 185 105 Z" fill="#FBBF24"/>
            <path d="M 25 100 L 15 95 L 15 105 Z" fill="#FBBF24"/>
          </svg>

          <!-- Invoice Illustration -->
          <svg v-else-if="slides[currentSlide].illustration === 'invoice'" class="w-64 h-64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad-invoice" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#A855F7;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
              </linearGradient>
            </defs>
            <!-- Fond -->
            <circle cx="100" cy="100" r="90" fill="url(#grad-invoice)" opacity="0.1"/>
            <!-- Document facture -->
            <rect x="50" y="40" width="100" height="130" rx="5" fill="url(#grad-invoice)" opacity="0.9"/>
            <rect x="55" y="45" width="90" height="120" rx="3" fill="white" opacity="0.95"/>
            <!-- En-tête facture -->
            <rect x="60" y="50" width="80" height="15" rx="2" fill="url(#grad-invoice)" opacity="0.3"/>
            <!-- Lignes de contenu -->
            <line x1="60" y1="75" x2="140" y2="75" stroke="#A855F7" stroke-width="2" opacity="0.5"/>
            <line x1="60" y1="85" x2="130" y2="85" stroke="#A855F7" stroke-width="2" opacity="0.3"/>
            <line x1="60" y1="95" x2="125" y2="95" stroke="#A855F7" stroke-width="2" opacity="0.3"/>
            <line x1="60" y1="110" x2="140" y2="110" stroke="#A855F7" stroke-width="2" opacity="0.5"/>
            <line x1="60" y1="120" x2="130" y2="120" stroke="#A855F7" stroke-width="2" opacity="0.3"/>
            <line x1="60" y1="130" x2="120" y2="130" stroke="#A855F7" stroke-width="2" opacity="0.3"/>
            <!-- Total -->
            <rect x="60" y="145" width="80" height="15" rx="2" fill="url(#grad-invoice)" opacity="0.6"/>
            <!-- Icône euro/dollar -->
            <circle cx="170" cy="60" r="15" fill="#FBBF24"/>
            <text x="165" y="67" font-size="20" font-weight="bold" fill="white">€</text>
          </svg>

          <!-- Analytics Illustration -->
          <svg v-else-if="slides[currentSlide].illustration === 'analytics'" class="w-64 h-64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad-analytics" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#F97316;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#DC2626;stop-opacity:1" />
              </linearGradient>
            </defs>
            <!-- Fond -->
            <circle cx="100" cy="100" r="90" fill="url(#grad-analytics)" opacity="0.1"/>
            <!-- Graphique à barres -->
            <rect x="40" y="100" width="25" height="50" rx="3" fill="url(#grad-analytics)" opacity="0.7"/>
            <rect x="70" y="75" width="25" height="75" rx="3" fill="url(#grad-analytics)" opacity="0.9"/>
            <rect x="100" y="90" width="25" height="60" rx="3" fill="url(#grad-analytics)" opacity="0.8"/>
            <rect x="130" y="60" width="25" height="90" rx="3" fill="url(#grad-analytics)"/>
            <!-- Ligne de tendance -->
            <polyline points="52,125 82,100 112,115 142,85" stroke="#FBBF24" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="52" cy="125" r="4" fill="#FBBF24"/>
            <circle cx="82" cy="100" r="4" fill="#FBBF24"/>
            <circle cx="112" cy="115" r="4" fill="#FBBF24"/>
            <circle cx="142" cy="85" r="4" fill="#FBBF24"/>
            <!-- Axes -->
            <line x1="30" y1="150" x2="170" y2="150" stroke="#374151" stroke-width="2"/>
            <line x1="30" y1="50" x2="30" y2="150" stroke="#374151" stroke-width="2"/>
            <!-- Flèche croissance -->
            <path d="M 160 70 L 170 60 L 180 70" stroke="#10B981" stroke-width="3" fill="none" stroke-linecap="round"/>
            <line x1="170" y1="60" x2="170" y2="80" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
          </svg>

          <!-- People/Customers Illustration -->
          <svg v-else-if="slides[currentSlide].illustration === 'people'" class="w-64 h-64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad-people" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
              </linearGradient>
            </defs>
            <!-- Fond -->
            <circle cx="100" cy="100" r="90" fill="url(#grad-people)" opacity="0.1"/>

            <!-- Carte Client (gauche) -->
            <rect x="30" y="60" width="60" height="80" rx="5" fill="url(#grad-people)" opacity="0.9"/>
            <circle cx="60" cy="85" r="12" fill="white" opacity="0.9"/>
            <rect x="40" y="105" width="40" height="4" rx="2" fill="white" opacity="0.7"/>
            <rect x="40" y="115" width="30" height="4" rx="2" fill="white" opacity="0.5"/>
            <rect x="40" y="125" width="35" height="4" rx="2" fill="white" opacity="0.5"/>
            <!-- Badge check client -->
            <circle cx="80" cy="70" r="8" fill="#10B981"/>
            <path d="M 77 70 L 79 72 L 83 68" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Carte Fournisseur (droite) -->
            <rect x="110" y="60" width="60" height="80" rx="5" fill="url(#grad-people)" opacity="0.85"/>
            <circle cx="140" cy="85" r="12" fill="white" opacity="0.9"/>
            <rect x="120" y="105" width="40" height="4" rx="2" fill="white" opacity="0.7"/>
            <rect x="120" y="115" width="35" height="4" rx="2" fill="white" opacity="0.5"/>
            <rect x="120" y="125" width="30" height="4" rx="2" fill="white" opacity="0.5"/>
            <!-- Badge box fournisseur -->
            <circle cx="160" cy="70" r="8" fill="#F97316"/>
            <rect x="157" y="67" width="6" height="6" rx="1" stroke="white" stroke-width="1.5" fill="none"/>

            <!-- Icône transaction/échange au centre -->
            <circle cx="100" cy="120" r="15" fill="#FBBF24"/>
            <path d="M 93 115 L 100 108 L 107 115" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M 107 125 L 100 132 L 93 125" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="100" y1="108" x2="100" y2="117" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <line x1="100" y1="123" x2="100" y2="132" stroke="white" stroke-width="2" stroke-linecap="round"/>

            <!-- Lignes de connexion -->
            <line x1="90" y1="100" x2="85" y2="120" stroke="#FBBF24" stroke-width="2" stroke-dasharray="3,3" opacity="0.6"/>
            <line x1="110" y1="100" x2="115" y2="120" stroke="#FBBF24" stroke-width="2" stroke-dasharray="3,3" opacity="0.6"/>

            <!-- Pièces décoratives -->
            <circle cx="45" cy="45" r="4" fill="#FBBF24" opacity="0.8"/>
            <circle cx="155" cy="150" r="5" fill="#FBBF24" opacity="0.8"/>
            <circle cx="165" cy="50" r="3" fill="#10B981" opacity="0.7"/>
          </svg>
        </div>

        <!-- Description -->
        <DialogDescription class="text-center text-base px-6 text-gray-600">
          {{ slides[currentSlide].description }}
        </DialogDescription>

        <!-- Indicateurs de progression -->
        <div class="flex justify-center gap-2 mt-8">
          <div
            v-for="(_, index) in slides"
            :key="index"
            :class="[
              'h-2 rounded-full transition-all duration-300',
              index === currentSlide
                ? 'w-8 bg-primary'
                : 'w-2 bg-gray-300'
            ]"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center pt-4 border-t">
        <Button
          variant="ghost"
          @click="skip"
          class="text-muted-foreground hover:text-foreground"
        >
          Passer
        </Button>

        <div class="flex gap-2">
          <Button
            v-if="currentSlide > 0"
            variant="outline"
            @click="prevSlide"
          >
            Précédent
          </Button>

          <Button
            v-if="!isLastSlide"
            @click="nextSlide"
            class="gap-2"
          >
            Suivant
            <ChevronRight class="w-4 h-4" />
          </Button>

          <Button
            v-else
            @click="finish"
            class="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Check class="w-4 h-4" />
            Commencer
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
