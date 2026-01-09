<script setup lang="ts">
import { ref, defineAsyncComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import { Users, Shield, KeyRound, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const activeTab = ref<'users' | 'roles' | 'permissions'>('users')

interface Tab {
  key: 'users' | 'roles' | 'permissions'
  label: string
  icon: any
}

const tabs: Tab[] = [
  { key: 'users', label: 'Utilisateurs', icon: Users },
  { key: 'roles', label: 'Rôles', icon: Shield },
  { key: 'permissions', label: 'Permissions', icon: KeyRound },
]

// Composants de chargement et d'erreur
const LoadingComponent = {
  setup() {
    return () => h('div', { class: 'flex justify-center items-center py-12' },
      h(Loader2, { class: 'h-8 w-8 animate-spin text-[#0769CF]' })
    )
  }
}

const ErrorComponent = {
  setup() {
    return () => h('div', { class: 'bg-red-50 text-red-600 p-4 rounded-lg' },
      'Erreur lors du chargement du composant'
    )
  }
}

// Lazy load components
const UsersManagement = defineAsyncComponent({
  loader: () => import('@/components/users/UsersManagement.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 10000
})

const RolesManagement = defineAsyncComponent({
  loader: () => import('@/components/users/RolesManagement.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 10000
})
</script>

<template>
  <div class="flex flex-col gap-4 md:gap-6 p-4 md:p-8 min-h-screen bg-white dark:bg-slate-900">
    <!-- Header with back button -->
    <div class="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
      <button
        @click="router.push('/settings')"
        class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <svg class="w-5 h-5 text-[#0769CF]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="text-xl md:text-[28px] lg:text-[32px] font-bold text-[#003FD8] dark:text-slate-100 font-inter leading-tight tracking-[-0.01em]">
        <span class="hidden sm:inline">Gestion des utilisateurs & rôles</span>
        <span class="sm:hidden">Utilisateurs & rôles</span>
      </h1>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 md:gap-4 border-b border-gray-200 dark:border-slate-700 mb-4 md:mb-6 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 font-semibold text-sm md:text-base lg:text-lg transition-colors whitespace-nowrap',
          activeTab === tab.key
            ? 'text-[#0769CF] border-b-2 border-[#0769CF] bg-slate-50 dark:bg-slate-800'
            : 'text-gray-500 dark:text-slate-400 hover:text-[#0769CF]'
        ]"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" class="w-4 h-4 md:w-5 md:h-5" />
        <span class="hidden sm:inline">{{ tab.label }}</span>
        <span class="sm:hidden">{{ tab.label.substring(0, 4) }}</span>
      </button>
    </div>

    <!-- Content -->
    <Suspense>
      <template #default>
        <div v-if="activeTab === 'users'">
          <UsersManagement />
        </div>
        <div v-else-if="activeTab === 'roles'">
          <RolesManagement />
        </div>
        <div v-else>
          <div class="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-12 text-center">
            <KeyRound class="mx-auto mb-4 w-10 h-10 md:w-12 md:h-12 text-[#003FD8] dark:text-blue-400" />
            <h2 class="text-lg md:text-xl font-bold mb-2 text-[#292D32] dark:text-slate-100">Gestion des permissions</h2>
            <p class="text-sm md:text-base text-[#85878D] dark:text-slate-400 max-w-md mx-auto mb-4">
              Les permissions sont gérées via les rôles. Pour modifier les permissions d'un utilisateur,
              éditez son rôle dans l'onglet "Rôles".
            </p>
            <button
              @click="activeTab = 'roles'"
              class="mt-4 px-4 md:px-6 py-2 bg-[#0769CF] text-white text-sm md:text-base rounded-lg hover:bg-[#0769CF]/90 transition-colors"
            >
              Aller aux rôles
            </button>
          </div>
        </div>
      </template>
      <template #fallback>
        <div class="flex justify-center items-center py-12">
          <Loader2 class="h-8 w-8 animate-spin text-[#0769CF]" />
        </div>
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
button[aria-current] {
  border-bottom-width: 2px;
  color: #0769CF;
  background: #fff;
}
</style>
