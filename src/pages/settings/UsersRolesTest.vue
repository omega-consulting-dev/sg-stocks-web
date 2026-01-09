<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Users, Shield, KeyRound } from 'lucide-vue-next'

const router = useRouter()
const activeTab = ref<'users' | 'roles' | 'permissions'>('users')

const goBack = () => {
  router.push('/settings')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <button
        @click="goBack"
        class="p-2 hover:bg-blue-50 rounded-lg transition-colors"
        aria-label="Retour"
      >
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="text-3xl font-bold text-blue-900">
        Gestion des Utilisateurs & Rôles
      </h1>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow-sm mb-6">
      <div class="border-b border-gray-200">
        <nav class="flex gap-1 p-2">
          <button
            @click="activeTab = 'users'"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors',
              activeTab === 'users'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <Users class="w-4 h-4" />
            Utilisateurs
          </button>
          <button
            @click="activeTab = 'roles'"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors',
              activeTab === 'roles'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <Shield class="w-4 h-4" />
            Rôles
          </button>
          <button
            @click="activeTab = 'permissions'"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors',
              activeTab === 'permissions'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <KeyRound class="w-4 h-4" />
            Permissions
          </button>
        </nav>
      </div>
    </div>

    <!-- Content -->
    <div class="bg-white rounded-lg shadow-sm p-8">
      <!-- Users Tab -->
      <div v-if="activeTab === 'users'">
        <div class="text-center py-12">
          <Users class="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h2 class="text-2xl font-bold mb-2">Gestion des Utilisateurs</h2>
          <p class="text-gray-600 mb-6">
            Créez et gérez les utilisateurs de votre système
          </p>
          <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + Créer un utilisateur
          </button>
        </div>
      </div>

      <!-- Roles Tab -->
      <div v-else-if="activeTab === 'roles'">
        <div class="text-center py-12">
          <Shield class="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h2 class="text-2xl font-bold mb-2">Gestion des Rôles</h2>
          <p class="text-gray-600 mb-6">
            Définissez les rôles et leurs permissions
          </p>
          <button class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            + Créer un rôle
          </button>
        </div>
      </div>

      <!-- Permissions Tab -->
      <div v-else>
        <div class="text-center py-12">
          <KeyRound class="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h2 class="text-2xl font-bold mb-2">Gestion des Permissions</h2>
          <p class="text-gray-600 mb-6 max-w-md mx-auto">
            Les permissions sont gérées via les rôles.
            Pour modifier les permissions, éditez un rôle dans l'onglet "Rôles".
          </p>
          <button
            @click="activeTab = 'roles'"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Aller aux rôles
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
