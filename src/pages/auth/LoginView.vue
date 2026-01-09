<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logoSvg from '@/assets/logo.svg'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formData = ref({
  email: '',
  password: ''
})

const handleSubmit = async () => {
  userStore.error = null

  if (!formData.value.email || !formData.value.password) {
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

    // Rediriger vers la page demandée ou vers home
    const redirectTo = (route.query.redirect as string) || '/'
    router.push(redirectTo)
  } catch (e) {
    // L'erreur est déjà gérée dans le store
  }
}

</script>

<template>
  <!-- Rectangle 1: FOND DE PAGE avec dégradé animé professionnel -->
  <div class="fixed inset-0 w-full h-full overflow-hidden bg-gradient-animated">
    <!-- Effet de grille pour évoquer la comptabilité -->
    <div class="absolute inset-0 opacity-10">
      <div class="grid-pattern"></div>
    </div>

    <!-- Cercles flottants pour dynamisme -->
    <div class="floating-circles">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- Éléments de gestion animés -->
    <div class="management-elements">
      <!-- Graphiques à barres animés -->
      <div class="chart-bars chart-1">
        <div class="bar" style="--delay: 0s; --height: 60%;"></div>
        <div class="bar" style="--delay: 0.2s; --height: 80%;"></div>
        <div class="bar" style="--delay: 0.4s; --height: 45%;"></div>
        <div class="bar" style="--delay: 0.6s; --height: 90%;"></div>
        <div class="bar" style="--delay: 0.8s; --height: 70%;"></div>
      </div>

      <div class="chart-bars chart-2">
        <div class="bar" style="--delay: 0.3s; --height: 50%;"></div>
        <div class="bar" style="--delay: 0.5s; --height: 75%;"></div>
        <div class="bar" style="--delay: 0.7s; --height: 65%;"></div>
        <div class="bar" style="--delay: 0.9s; --height: 85%;"></div>
      </div>

      <!-- Courbes de tendance -->
      <svg class="trend-line trend-1" viewBox="0 0 200 100" preserveAspectRatio="none">
        <path class="trend-path" d="M 0,80 Q 50,20 100,40 T 200,30" fill="none" stroke="url(#gradient1)" stroke-width="2"/>
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(251,191,36,0.6);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(251,191,36,0);stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>

      <svg class="trend-line trend-2" viewBox="0 0 200 100" preserveAspectRatio="none">
        <path class="trend-path" d="M 0,60 Q 50,80 100,50 T 200,40" fill="none" stroke="url(#gradient2)" stroke-width="2"/>
        <defs>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(147,51,234,0.5);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(147,51,234,0);stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>

      <!-- Chiffres comptables défilants -->
      <div class="numbers-stream numbers-1">
        <div class="number">₣ 45,892</div>
        <div class="number">₣ 128,456</div>
        <div class="number">₣ 89,234</div>
      </div>

      <div class="numbers-stream numbers-2">
        <div class="number">+12.5%</div>
        <div class="number">+8.9%</div>
        <div class="number">+15.2%</div>
      </div>

      <!-- Icônes de gestion flottantes -->
      <div class="floating-icon icon-1">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.7)" stroke-width="2.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </div>

      <div class="floating-icon icon-2">
        <svg width="55" height="55" viewBox="0 0 24 24" fill="none" stroke="rgba(147,51,234,0.7)" stroke-width="2.5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </div>

      <div class="floating-icon icon-3">
        <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="rgba(236,72,153,0.7)" stroke-width="2.5">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
      </div>
    </div>
  </div>

  <!-- Rectangle 2: CONTENU de la page (au-dessus du dégradé) -->
  <div class="fixed inset-0 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
    <div class="flex flex-col lg:flex-row w-full max-w-[1400px] h-full max-h-[900px] lg:h-[85vh] rounded-2xl shadow-2xl overflow-hidden">
      <!-- COLONNE GAUCHE - Section de présentation -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <!-- Image de fond (bureau professionnel) -->
        <div
          class="absolute inset-0 opacity-40 mix-blend-overlay z-0"
          style="background-image: url('src/assets/Rectangle-1.png'); background-size: cover; background-position: center; filter: blur(2px);"
        ></div>

        <!-- Overlay semi-transparent -->
        <div class="absolute inset-0 bg-black/35 z-10"></div>

        <!-- Contenu -->
        <div class="relative z-20 flex flex-col p-12 xl:p-16 w-full">
          <!-- Logo SG-Stocks -->
          <div class="mb-auto flex justify-center">
            <img :src="logoSvg" alt="SG-Stocks" class="h-14 xl:h-16 w-auto" />
          </div>

          <!-- Bloc de texte centré verticalement -->
          <div class="flex-1 flex items-center justify-center">
            <div class="max-w-[85%] space-y-6">
              <!-- Titre principal -->
              <h1
                class="text-white text-3xl xl:text-4xl 2xl:text-[42px] font-bold leading-[1.25] tracking-tight"
              >
                Gérer votre entreprise comme un expert comptable grâce à notre logiciel.
              </h1>

              <!-- Sous-titre/Description -->
              <p
                class="text-white/90 text-base xl:text-lg 2xl:text-[19px] font-light leading-[1.7]"
              >
                Une gestion efficace commence par une responsabilité exemplaire : maîtrisez vos
                stocks et optimisez vos entrées et sorties comme un expert en comptabilité.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- COLONNE DROITE - Formulaire de connexion -->
      <div class="flex-1 bg-white flex items-center justify-center px-6 sm:px-8 lg:px-12 xl:px-16 py-8 overflow-y-auto">
        <div class="w-full max-w-[440px] my-auto">
          <!-- Logo mobile -->
          <div class="lg:hidden flex justify-center mb-8">
            <img :src="logoSvg" alt="SG-Stocks" class="h-10 w-auto" />
          </div>

          <!-- Icône d'application avec animation -->
          <div class="flex justify-center mb-6">
            <div
              class="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-xl transform transition-transform hover:scale-105"
              style="box-shadow: 0 10px 30px rgba(59, 130, 246, 0.25)"
            >
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
          </div>

          <!-- Titre -->
          <h2 class="text-center text-3xl sm:text-[32px] font-bold text-[#111827] tracking-tight mb-2">
            Bienvenue
          </h2>

          <!-- Sous-titre -->
          <p class="text-center text-sm sm:text-base text-[#6B7280] mb-8">
            Connectez-vous à votre compte
          </p>

          <!-- Message d'erreur avec animation -->
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="userStore.error"
              class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <p class="text-sm font-medium text-red-800">{{ userStore.error }}</p>
              </div>
            </div>
          </Transition>

          <!-- Formulaire -->
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- Champ Email -->
            <div class="space-y-2">
              <Label class="text-sm font-semibold text-[#374151]">Adresse e-mail</Label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </div>
                <Input
                  v-model="formData.email"
                  type="email"
                  placeholder="nom@entreprise.com"
                  class="w-full h-12 pl-12 pr-4 text-base text-[#111827] placeholder:text-[#D1D5DB] bg-white border-2 border-[#E5E7EB] rounded-xl transition-all duration-200 focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 focus:outline-none hover:border-[#D1D5DB]"
                  :disabled="userStore.loading"
                />
              </div>
            </div>

            <!-- Champ Password -->
            <div class="space-y-2">
              <Label class="text-sm font-semibold text-[#374151]">Mot de passe</Label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <Input
                  v-model="formData.password"
                  type="password"
                  placeholder="••••••••"
                  class="w-full h-12 pl-12 pr-4 text-base text-[#111827] placeholder:text-[#D1D5DB] bg-white border-2 border-[#E5E7EB] rounded-xl transition-all duration-200 focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 focus:outline-none hover:border-[#D1D5DB]"
                  :disabled="userStore.loading"
                />
              </div>
              <p class="text-xs text-[#6B7280] flex items-center gap-1.5 mt-2">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                Minimum 8 caractères requis
              </p>
            </div>

            <!-- Bouton Connexion -->
            <Button
              type="submit"
              class="w-full h-13 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white text-base font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style="box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3)"
              :disabled="userStore.loading"
            >
              <span v-if="!userStore.loading" class="flex items-center justify-center gap-2">
                Se connecter
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion en cours...
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Empêcher le scroll sur toute la page */
html, body {
  overflow: hidden;
  height: 100%;
}

/* Dégradé animé luxe/business - Or/Bleu évoquant succès et richesse */
.bg-gradient-animated {
  background: linear-gradient(-45deg,
    #1a1a2e,  /* Bleu nuit élégant */
    #16213e,  /* Bleu marine profond */
    #0f3460,  /* Bleu royal - autorité */
    #533483,  /* Violet royal - prestige */
    #7b2869,  /* Magenta profond - innovation */
    #b8405e   /* Rose doré - prospérité */
  );
  background-size: 400% 400%;
  animation: gradientShift 18s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Particules dorées flottantes évoquant la richesse */
.grid-pattern {
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle, rgba(251, 191, 36, 0.03) 1px, transparent 1px),
    radial-gradient(circle, rgba(251, 191, 36, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: 0 0, 20px 20px;
  animation: particleFloat 30s linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-40px);
  }
}

/* Cercles flottants avec effet de richesse */
.floating-circles {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  animation: float 25s ease-in-out infinite;
}

.circle-1 {
  width: 600px;
  height: 600px;
  top: -15%;
  left: -10%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.2), transparent 70%);
  animation-delay: 0s;
}

.circle-2 {
  width: 500px;
  height: 500px;
  bottom: -10%;
  right: -10%;
  background: radial-gradient(circle, rgba(147, 51, 234, 0.18), transparent 70%);
  animation-delay: 8s;
}

.circle-3 {
  width: 450px;
  height: 450px;
  top: 40%;
  left: 60%;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.15), transparent 70%);
  animation-delay: 16s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  25% {
    transform: translate(40px, -60px) scale(1.15) rotate(90deg);
  }
  50% {
    transform: translate(-30px, -40px) scale(0.9) rotate(180deg);
  }
  75% {
    transform: translate(20px, 30px) scale(1.05) rotate(270deg);
  }
}

/* Animation smooth pour les inputs */
input:focus {
  animation: inputFocus 0.3s ease;
}

@keyframes inputFocus {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.01);
  }
  100% {
    transform: scale(1);
  }
}

/* Animation du bouton */
button:not(:disabled):active {
  transform: scale(0.98);
}

/* Éléments de gestion animés */
.management-elements {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

/* Graphiques à barres animés */
.chart-bars {
  position: absolute;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 150px;
  opacity: 0.5;
}

.chart-1 {
  bottom: 8%;
  left: 3%;
  width: 200px;
}

.chart-2 {
  top: 10%;
  right: 3%;
  width: 180px;
}

.bar {
  flex: 1;
  background: linear-gradient(to top, rgba(251, 191, 36, 0.9), rgba(251, 191, 36, 0.4));
  border-radius: 6px 6px 0 0;
  animation: barGrow 3s ease-in-out infinite;
  animation-delay: var(--delay);
  height: var(--height);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}

@keyframes barGrow {
  0%, 100% {
    transform: scaleY(1);
    opacity: 0.8;
  }
  50% {
    transform: scaleY(1.3);
    opacity: 1;
  }
}

/* Courbes de tendance */
.trend-line {
  position: absolute;
  width: 300px;
  height: 150px;
  opacity: 0.6;
}

.trend-1 {
  top: 35%;
  left: 2%;
}

.trend-2 {
  bottom: 20%;
  right: 5%;
}

.trend-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 8s ease-in-out infinite;
  filter: drop-shadow(0 0 8px currentColor);
}

@keyframes drawLine {
  0%, 100% {
    stroke-dashoffset: 1000;
  }
  50% {
    stroke-dashoffset: 0;
  }
}

/* Chiffres comptables défilants */
.numbers-stream {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 25px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 18px;
  opacity: 0.5;
  animation: numbersScroll 10s linear infinite;
  text-shadow: 0 0 10px currentColor;
}

.numbers-1 {
  top: 8%;
  left: 20%;
  color: rgba(251, 191, 36, 1);
}

.numbers-2 {
  bottom: 15%;
  right: 18%;
  color: rgba(147, 51, 234, 1);
}

.number {
  animation: fadeInOut 3s ease-in-out infinite;
}

.number:nth-child(2) {
  animation-delay: 1s;
}

.number:nth-child(3) {
  animation-delay: 2s;
}

@keyframes numbersScroll {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-60px);
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

/* Icônes de gestion flottantes */
.floating-icon {
  position: absolute;
  animation: iconFloat 15s ease-in-out infinite;
  filter: drop-shadow(0 0 12px currentColor);
}

.icon-1 {
  top: 5%;
  right: 15%;
  animation-delay: 0s;
}

.icon-2 {
  bottom: 10%;
  left: 8%;
  animation-delay: 5s;
}

.icon-3 {
  top: 50%;
  right: 5%;
  animation-delay: 10s;
}

.floating-icon svg {
  width: 60px;
  height: 60px;
  stroke-width: 2.5;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 0.5;
  }
  25% {
    transform: translate(30px, -40px) rotate(10deg) scale(1.1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-20px, -30px) rotate(-10deg) scale(0.95);
    opacity: 0.6;
  }
  75% {
    transform: translate(15px, 20px) rotate(8deg) scale(1.05);
    opacity: 0.8;
  }
}
</style>
