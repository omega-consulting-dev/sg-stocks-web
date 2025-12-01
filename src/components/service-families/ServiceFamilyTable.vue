<script setup lang="ts">
import { computed } from 'vue'
import { Edit } from 'lucide-vue-next'
import type { ServiceFamily } from '@/stores/serviceFamilies'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  families: ServiceFamily[]
  loading?: boolean
  selectedFamilyId?: number
}>()

const emit = defineEmits<{
  edit: [family: ServiceFamily]
  delete: [family: ServiceFamily]
  select: [family: ServiceFamily]
}>()

const displayedFamilies = computed(() => props.families)

const handleSelect = (family: ServiceFamily) => {
  emit('select', family)
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const handleEdit = (family: ServiceFamily) => {
  emit('edit', family)
}
</script>

<template>
  <div class="rounded-md border bg-white">
    <Table>
      <TableHeader>
        <TableRow class="bg-muted/50">
          <TableHead>Nom</TableHead>
          <TableHead>Description</TableHead>
          <TableHead class="w-32">Nb Services</TableHead>
          <TableHead class="w-44">Date de creation</TableHead>
          <TableHead class="w-28">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="i in 5" :key="i">
            <TableCell><Skeleton class="h-4 w-32" /></TableCell>
            <TableCell><Skeleton class="h-4 w-48" /></TableCell>
            <TableCell><Skeleton class="h-4 w-16" /></TableCell>
            <TableCell><Skeleton class="h-4 w-28" /></TableCell>
            <TableCell><Skeleton class="h-8 w-20" /></TableCell>
          </TableRow>
        </template>
        <template v-else-if="displayedFamilies.length > 0">
          <TableRow
            v-for="family in displayedFamilies"
            :key="family.id"
            :class="[
              'cursor-pointer transition-colors',
              selectedFamilyId === family.id
                ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-[#003FD8]'
                : 'hover:bg-muted/30'
            ]"
            @click="handleSelect(family)"
          >
            <TableCell class="font-medium">{{ family.name }}</TableCell>
            <TableCell class="text-muted-foreground">{{ family.description }}</TableCell>
            <TableCell class="text-center">{{ family.services_count ?? 0 }}</TableCell>
            <TableCell class="text-muted-foreground text-sm">
              {{ formatDate(family.created_at) }}
            </TableCell>
            <TableCell @click.stop>
              <Button variant="outline" @click="handleEdit(family)">
                <Edit class="mr-1.5 h-4 w-4" />
                Modifier
              </Button>
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell colspan="5" class="text-center text-muted-foreground py-8">
              Aucune famille de services trouvee
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
