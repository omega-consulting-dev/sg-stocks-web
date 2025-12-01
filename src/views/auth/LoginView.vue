<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logoSvg from '@/assets/logo.svg'

const router = useRouter()
const userStore = useUserStore()

const formData = ref({
  name: '',
  email: '',
  password: ''
})

const handleSubmit = async () => {
  userStore.error = null

  if (!formData.value.name || !formData.value.email || !formData.value.password) {
    userStore.error = 'Tous les champs sont requis'
    return
  }

  if (formData.value.password.length < 8) {
    userStore.error = 'Le mot de passe doit contenir au moins 8 caractères'
    return
  }

  try {
    // Appel de login avec les credentials appropriés
    await userStore.login({
      email: formData.value.email,
      password: formData.value.password
    })
    router.push('/')
  } catch (e) {
    // L'erreur est déjà gérée dans le store
  }
}

</script>

<template>
  <!-- Rectangle 1: FOND DE PAGE avec uniquement le dégradé -->
  <div
    class="fixed inset-0 w-full h-full"
    style="background: linear-gradient(135deg, #3B4A7A 0%, #495178 15%, #4A5578 30%, #6B5B7B 60%, #7B5E7B 75%, #D4869C 90%, #E08B8B 100%)"
  ></div>

  <!-- Rectangle 2: CONTENU de la page (au-dessus du dégradé) -->
  <div class="relative z-10 flex flex-col lg:flex-row min-h-screen lg:min-h-[80vh] lg:max-h-[90vh] w-full px-4 sm:px-0 sm:max-w-[95vw] lg:max-w-[85vw] mx-auto lg:my-[5vh] rounded-none sm:rounded-2xl overflow-y-auto shadow-2xl">
    <!-- COLONNE GAUCHE - Section de présentation -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <!-- Image de fond (bureau professionnel) - optionnelle, peut être remplacée -->
      <div
        class="absolute inset-0 opacity-40 mix-blend-overlay z-0"
        style="background-image: url('src/assets/Rectangle-1.png'); background-size: cover; background-position: center; filter: blur(2px);"
      ></div>

      <!-- Overlay semi-transparent -->
      <div class="absolute inset-0 bg-black/35 z-10"></div>

      <!-- Contenu -->
      <div class="relative z-20 flex flex-col p-8 lg:p-14 w-full">
        <!-- Logo SG-Stocks centré horizontalement -->
        <div class="mb-auto flex justify-center">
          <img :src="logoSvg" alt="SG-Stocks" class="h-12 lg:h-16 w-auto" />
        </div>

        <!-- Bloc de texte centré verticalement -->
        <div class="flex-1 flex items-center justify-center">
          <div class="max-w-[90%] lg:max-w-[85%] space-y-4 lg:space-y-6">
            <!-- Titre principal -->
            <h1
              class="text-white text-2xl md:text-3xl lg:text-4xl xl:text-[38px] font-bold leading-[1.3] tracking-tight"
            >
              Gérer votre entreprise comme un expert comptable grâce à notre logiciel.
            </h1>

            <!-- Sous-titre/Description -->
            <p
              class="text-white/85 text-sm md:text-base lg:text-[17px] font-light leading-[1.65] max-w-[95%] lg:max-w-[90%]"
            >
              Une gestion efficace commence par une responsabilité exemplaire : maîtrisez vos
              stocks et optimisez vos entrées et sorties comme un expert en comptabilité.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- COLONNE DROITE - Formulaire de connexion -->
    <div class="flex-1 bg-white flex items-center justify-center px-4 sm:px-8 lg:px-12 py-8 lg:py-0">
      <div class="w-full max-w-[420px]">
        <!-- Icône d'application -->
        <div class="flex justify-center mb-4 sm:mb-5">
          <div
            class="w-12 h-12 sm:w-14 sm:h-14 bg-[#3B82F6] rounded-xl sm:rounded-[14px] flex items-center justify-center shadow-lg"
            style="box-shadow: 0 4px 6px rgba(59, 130, 246, 0.15)"
          >
          </div>
        </div>

        <!-- Titre -->
        <h2 class="text-center text-2xl sm:text-[28px] font-bold text-[#111827] tracking-tight mb-2">
          Connexion
        </h2>

        <!-- Sous-titre -->
        <p class="text-center text-xs sm:text-sm text-[#9CA3AF] mb-6 sm:mb-10">
          Start your 30-day free trial.
        </p>

        <!-- Message d'erreur -->
        <div
          v-if="userStore.error"
          class="mb-4 sm:mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
        >
          {{ userStore.error }}
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-5">
          <!-- Champ Name -->
          <div>
            <Label class="block text-sm font-semibold text-[#374151] mb-1.5 sm:mb-2">Name*</Label>
            <Input
              v-model="formData.name"
              type="text"
              placeholder="Enter your name"
              class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base text-[#111827] placeholder:text-[#D1D5DB] bg-white border border-[#D1D5DB] rounded-lg transition-all duration-200 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 focus:outline-none"
              :disabled="userStore.loading"
            />
          </div>

          <!-- Champ Email -->
          <div>
            <Label class="block text-sm font-semibold text-[#374151] mb-1.5 sm:mb-2">Email*</Label>
            <Input
              v-model="formData.email"
              type="email"
              placeholder="Enter your email"
              class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base text-[#111827] placeholder:text-[#D1D5DB] bg-white border border-[#D1D5DB] rounded-lg transition-all duration-200 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 focus:outline-none"
              :disabled="userStore.loading"
            />
          </div>

          <!-- Champ Password -->
          <div>
            <Label class="block text-sm font-semibold text-[#374151] mb-1.5 sm:mb-2">Password*</Label>
            <Input
              v-model="formData.password"
              type="password"
              placeholder="Create a password"
              class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base text-[#111827] placeholder:text-[#D1D5DB] bg-white border border-[#D1D5DB] rounded-lg transition-all duration-200 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 focus:outline-none"
              :disabled="userStore.loading"
            />
            <p class="mt-1.5 sm:mt-2 text-xs text-[#6B7280] italic">Must be at least 8 characters.</p>
          </div>

          <!-- Bouton Connexion -->
          <Button
            type="submit"
            class="w-full h-11 sm:h-12 bg-[#3B82F6] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 mt-5 sm:mt-7"
            style="box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2)"
            :disabled="userStore.loading"
          >
            {{ userStore.loading ? 'Chargement...' : 'Connexion' }}
          </Button>

        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
button:hover {
  transition: all 0.2s ease;
}
</style>
