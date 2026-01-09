<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search } from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
    <div class="max-w-2xl w-full">
      <!-- Card principale -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center space-y-8">
        <!-- Icône animée -->
        <div class="flex justify-center">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div class="relative bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-8">
              <Search class="w-20 h-20 text-white" />
            </div>
          </div>
        </div>

        <!-- Code erreur -->
        <div>
          <h1 class="text-9xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 class="text-3xl font-bold text-gray-800 mb-4">
            Page introuvable
          </h2>
          <p class="text-lg text-gray-600 max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <!-- Suggestions -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h3 class="font-semibold text-gray-700 mb-3">Que souhaitez-vous faire ?</h3>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-center justify-center gap-2">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Vérifier l'URL et réessayer
            </li>
            <li class="flex items-center justify-center gap-2">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Retourner à la page précédente
            </li>
            <li class="flex items-center justify-center gap-2">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Revenir à l'accueil
            </li>
          </ul>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            @click="goBack"
            variant="outline"
            size="lg"
            class="gap-2"
          >
            <ArrowLeft class="w-5 h-5" />
            Retour
          </Button>
          <Button
            @click="goHome"
            size="lg"
            class="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Home class="w-5 h-5" />
            Retour à l'accueil
          </Button>
        </div>
      </div>

      <!-- Liens rapides -->
      <div class="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          @click="router.push('/dashboard')"
          class="bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-lg group"
        >
          <div class="text-2xl mb-2">📊</div>
          <div class="text-sm font-medium text-gray-700 group-hover:text-blue-600">Dashboard</div>
        </button>
        <button
          @click="router.push('/ventes')"
          class="bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-lg group"
        >
          <div class="text-2xl mb-2">💰</div>
          <div class="text-sm font-medium text-gray-700 group-hover:text-blue-600">Ventes</div>
        </button>
        <button
          @click="router.push('/products')"
          class="bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-lg group"
        >
          <div class="text-2xl mb-2">📦</div>
          <div class="text-sm font-medium text-gray-700 group-hover:text-blue-600">Produits</div>
        </button>
        <button
          @click="router.push('/transfers')"
          class="bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-lg group"
        >
          <div class="text-2xl mb-2">🔄</div>
          <div class="text-sm font-medium text-gray-700 group-hover:text-blue-600">Transferts</div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
