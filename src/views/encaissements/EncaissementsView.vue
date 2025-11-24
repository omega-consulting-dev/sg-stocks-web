<template>
  <div class="flex h-full w-full flex-col bg-white">
    <!-- Page Title and Green Card Row -->
    <div class="relative mb-6 flex items-start justify-between px-6 pt-6">
      <!-- Page Title -->
      <h1 class="text-[32px] font-bold leading-[38.73px] text-[#003FD8]">Encaissement</h1>

      <!-- Green Card - Caisse -->
      <div class="flex h-[182px] w-[341px] flex-col rounded-[5px] bg-[#41AB4F] p-10">
        <div class="text-[19.76px] leading-[26.21px] text-[#7D7D7D]">Montant actuel</div>
        <div class="text-[25.76px] leading-[34.16px] text-white">Caisse</div>
        <div class="mt-auto flex items-end gap-3">
          <div class="font-['Acme'] text-[30.76px] leading-[38.94px] text-white">
            {{ formatMontant(totalEncaisse) }}
          </div>
          <div class="text-[36.76px] leading-[48.76px] text-white">XAF</div>
        </div>
      </div>
    </div>

    <!-- Main Content Section -->
    <div class="flex-1 px-6">
      <!-- Header with Title, Subtitle, Search and Export -->
      <div class="mb-6 flex items-start justify-between">
        <!-- Title and Subtitle -->
        <div class="flex flex-col gap-0.5">
          <h2 class="text-[32px] font-bold leading-[38.73px] text-[#003FD8]">Caisse</h2>
          <p class="text-[20px] leading-[24.2px] text-[#85878D]">
            Liste représentant les différentes entrées en caisse
          </p>
        </div>

        <!-- Search and Export -->
        <div class="flex items-center gap-9">
          <!-- Search Box -->
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-[46.68px] w-[47.65px] items-center justify-center rounded-[11.67px] border border-[#E7EAE9] bg-white"
            >
              <span class="text-[19.71px] font-medium leading-[29.57px]">🔍</span>
            </div>
            <span class="text-[16px] leading-[19.36px] text-[#85878D]">Recherche</span>
          </div>

          <!-- Export Button -->
          <button
            class="relative flex items-center gap-[7.09px] rounded-[10px] border border-[rgba(7,105,207,0.23)] bg-white px-[10.64px] py-[7.09px] hover:bg-gray-50"
            @click="showExportMenu = !showExportMenu"
          >
            <img src="@/assets/icons/icon-plus.svg" alt="Plus" class="h-[14.19px] w-[14.19px]" />
            <span class="text-[18.41px] font-medium leading-[27.62px] text-[#0769CF]"
              >Exporter</span
            >
          </button>
        </div>
      </div>

      <!-- Period Filter Row -->
      <div class="mb-6 flex items-center gap-6">
        <span class="text-[18.76px] leading-[33.99px] text-[#0E1420]">Periode</span>

        <!-- Search Dropdown -->
        <div class="relative h-[38px] w-[356px] rounded-[10px] bg-[#F9FBFF]">
          <div class="absolute left-0 top-2 h-[18px] w-[18px] text-[#7E7E7E]">
            <!-- Chevron icon -->
          </div>
          <img
            src="@/assets/icons/icon-search.svg"
            alt="Search"
            class="absolute left-[148px] top-[7px] h-6 w-6"
          />
          <span
            class="absolute left-[180px] top-2.5 font-['Poppins'] text-[12px] leading-[18px] tracking-[-0.01em] text-[#B5B7C0]"
            >Search</span
          >
        </div>

        <!-- Date Inputs -->
        <input
          v-model="startDate"
          type="text"
          placeholder="01/04/2025"
          class="h-[30px] w-[138px] rounded border border-[#007ACE] bg-[#FFFEFF] px-2.5 font-['Times_New_Roman'] text-[14.76px] leading-[16.98px] text-[#696060]"
        />
        <input
          v-model="endDate"
          type="text"
          placeholder="31/04/2025"
          class="h-[30px] w-[138px] rounded border border-[#007ACE] bg-[#FFFEFF] px-2.5 font-['Times_New_Roman'] text-[14.76px] leading-[16.98px] text-[#696060]"
        />
      </div>

      <!-- Table Container -->
      <div class="overflow-hidden">
        <!-- Table Header -->
        <div
          class="grid grid-cols-5 rounded-t-[4.2px] border border-[#E4E4E4] bg-[#F9F9F9] p-[12.77px]"
        >
          <div class="text-center text-[14.9px] font-bold leading-[22.35px] text-[#727272]">
            Code
          </div>
          <div class="text-center text-[14.9px] font-bold leading-[22.35px] text-[#727272]">
            Date
          </div>
          <div class="text-center text-[14.9px] font-bold leading-[22.35px] text-[#727272]">
            Refference facture
          </div>
          <div class="text-center text-[14.9px] font-bold leading-[22.35px] text-[#727272]">
            Montant
          </div>
          <div class="text-center text-[14.9px] font-bold leading-[22.35px] text-[#727272]">
            Action
          </div>
        </div>

        <!-- Table Rows -->
        <div
          v-for="(encaissement, index) in encaissements"
          :key="encaissement.id"
          class="grid grid-cols-5 border-b border-l border-r border-[#E4E4E4] bg-white p-[12.77px] hover:bg-gray-50"
          :class="{ 'rounded-b-[4.2px]': index === encaissements.length - 1 }"
        >
          <div class="text-center text-[14.9px] leading-[22.21px] text-black">
            {{ encaissement.code }}
          </div>
          <div class="text-center text-[14.9px] leading-[22.35px] text-[#727272]">
            {{ formatDate(encaissement.date) }}
          </div>
          <div class="text-center text-[14.9px] leading-[22.35px] text-[#727272]">
            {{ encaissement.referenceFacture }}
          </div>
          <div class="text-center text-[14.9px] leading-[22.35px] text-[#727272]">
            {{ formatMontant(encaissement.montant) }}
          </div>
          <div class="flex items-center justify-center">
            <button class="text-[14.9px] text-[#727272] hover:text-[#003FD8]">•••</button>
          </div>
        </div>
      </div>

      <!-- Export Menu Popup -->
      <div
        v-if="showExportMenu"
        class="absolute right-6 top-40 z-50 flex h-[89px] w-[164px] flex-col overflow-hidden rounded-[10px] border border-[#E9E9E9] bg-white shadow-[0px_5px_10px_5px_rgba(0,0,0,0.05)]"
      >
        <button
          class="flex h-1/2 items-center gap-2 px-[37px] text-[14.9px] font-medium leading-[22.35px] text-[#3A3A3A] hover:bg-gray-50"
          @click="exportPDF"
        >
          <img src="@/assets/icons/icon-pdf.svg" alt="PDF" class="h-6 w-6" />
          <span>document pdf</span>
        </button>
        <button
          class="flex h-1/2 items-center gap-2 px-[37px] text-[14.9px] font-medium leading-[22.35px] text-[#3A3A3A] hover:bg-gray-50"
          @click="exportExcel"
        >
          <img src="@/assets/icons/icon-excel.svg" alt="Excel" class="h-6 w-6" />
          <span>document excel</span>
        </button>
      </div>
    </div>

    <!-- Bottom Section - Statut actuel -->
    <div class="mt-8 px-6 pb-6">
      <div class="flex flex-col gap-0.5">
        <h2 class="text-[32px] font-bold leading-[38.73px] text-[#003FD8]">Statut actuel</h2>
        <p class="text-[20px] leading-[24.2px] text-[#85878D]">Aujourd'huir</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEncaissementsStore } from '@/stores/encaissements'

const encaissementsStore = useEncaissementsStore()

const startDate = ref('')
const endDate = ref('')
const showExportMenu = ref(false)

const encaissements = computed(() => encaissementsStore.encaissements)
const totalEncaisse = computed(() => encaissementsStore.totalEncaisse)

onMounted(async () => {
  await encaissementsStore.fetchEncaissements()
})

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleDateString('fr-FR', { month: 'long' })
  const year = date.getFullYear()
  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`
}

function formatMontant(montant: number) {
  return montant.toLocaleString('fr-FR').replace(/\s/g, ' ')
}

function exportPDF() {
  console.log('Export PDF')
  showExportMenu.value = false
}

function exportExcel() {
  console.log('Export Excel')
  showExportMenu.value = false
}
</script>
