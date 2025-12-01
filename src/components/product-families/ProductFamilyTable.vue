<script setup lang="ts">
import { computed } from 'vue'
import { MoreVertical, Edit, Trash2 } from 'lucide-vue-next'
import type { ProductFamily } from '@/stores/productFamilies'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  families: ProductFamily[]
  loading?: boolean
  selectedFamilyId?: number
}>()

const emit = defineEmits<{
  edit: [family: ProductFamily]
  delete: [family: ProductFamily]
  select: [family: ProductFamily]
}>()

const displayedFamilies = computed(() => props.families)

const handleSelect = (family: ProductFamily) => {
  emit('select', family)
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const handleEdit = (family: ProductFamily) => {
  emit('edit', family)
}

const handleDelete = (family: ProductFamily) => {
  emit('delete', family)
}
</script>

<template>
  <div class="rounded-md border bg-white">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-[80px] font-semibold">Code</TableHead>
          <TableHead class="font-semibold">Désignation</TableHead>
          <TableHead class="font-semibold">Description</TableHead>
          <TableHead class="w-[180px] font-semibold">Date de création</TableHead>
          <TableHead class="w-[80px] text-right font-semibold">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow v-for="i in 5" :key="i">
            <TableCell><Skeleton class="h-4 w-20" /></TableCell>
            <TableCell><Skeleton class="h-4 w-32" /></TableCell>
            <TableCell><Skeleton class="h-4 w-64" /></TableCell>
            <TableCell><Skeleton class="h-4 w-28" /></TableCell>
            <TableCell><Skeleton class="h-8 w-8 ml-auto" /></TableCell>
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
                : 'hover:bg-gray-50'
            ]"
            @click="handleSelect(family)"
          >
            <TableCell class="font-medium">{{ family.id }}</TableCell>
            <TableCell>{{ family.name }}</TableCell>
            <TableCell class="text-muted-foreground">{{ family.description }}</TableCell>
            <TableCell class="text-muted-foreground text-sm">
              {{ formatDate(family.created_at) }}
            </TableCell>
            <TableCell class="text-right" @click.stop>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <MoreVertical class="h-4 w-4" />
                    <span class="sr-only">Ouvrir le menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-[130px]">
                  <DropdownMenuItem @click="handleEdit(family)" class="cursor-pointer">
                    <Edit class="mr-2 h-4 w-4" />
                    <span>Modifier</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    @click="handleDelete(family)"
                    class="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 class="mr-2 h-4 w-4" />
                    <span>Supprimer</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell colspan="5" class="text-center text-muted-foreground py-8">
              Aucune famille de produits trouvée
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
