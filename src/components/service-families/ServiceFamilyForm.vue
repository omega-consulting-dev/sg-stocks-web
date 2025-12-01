<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileText, Camera } from 'lucide-vue-next'
import type { ServiceFamily } from '@/stores/serviceFamilies'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  open: boolean
  family?: ServiceFamily | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: { name: string; description: string }]
}>()

const formData = ref({
  name: '',
  description: '',
})

const isEditing = ref(false)

watch(() => props.open, (newValue) => {
  if (newValue) {
    if (props.family) {
      isEditing.value = true
      formData.value = {
        name: props.family.name || '',
        description: props.family.description || '',
      }
    } else {
      isEditing.value = false
      formData.value = {
        name: '',
        description: '',
      }
    }
  }
})

const handleSubmit = () => {
  if (!formData.value.name) {
    return
  }
  emit('submit', { ...formData.value })
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="max-w-[457px] p-0 gap-0 border border-[#0072C1] rounded-[10px]">
      <div class="relative px-[46px] pt-[27px] pb-[20px]">
        <div class="flex items-center gap-5 mb-1">
          <div class="w-11 h-11 rounded-full bg-[#FBFBFB] border border-[#BABABA] flex items-center justify-center">
            <Camera class="w-[14px] h-[19px] text-gray-500" />
          </div>
          <h2 class="text-xl font-bold text-[#3D3D3D]">
            Fiche Famille de services
          </h2>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="px-[46px]">
        <div class="mb-4">
          <label for="name" class="block text-lg font-normal text-[#0E1420] mb-2">
            Nom :
          </label>
          <div class="relative">
            <FileText class="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-[#616161]" />
            <Input
              id="name"
              v-model="formData.name"
              placeholder="Ex : Maintenance"
              required
              :disabled="loading"
              class="h-10 pl-9 border-[#BEBEBE] rounded-lg"
              maxlength="100"
            />
          </div>
        </div>

        <div class="mb-8">
          <label for="description" class="block text-lg font-normal text-[#0E1420] mb-2">
            Description :
          </label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Entrez la description"
            :disabled="loading"
            class="h-40 border-[#BEBEBE] rounded-lg resize-none p-3"
            maxlength="500"
          />
        </div>

        <div class="pb-8">
          <Button
            type="submit"
            :disabled="loading || !formData.name"
            class="w-full h-10 bg-[#0769CF] hover:bg-[#0558b0] text-white rounded-lg font-bold uppercase"
          >
            {{ loading ? 'ENREGISTREMENT...' : 'ENREGISTRER' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
