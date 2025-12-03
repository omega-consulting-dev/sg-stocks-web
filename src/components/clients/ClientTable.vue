<script setup lang="ts">
import { MoreVertical, Edit, Trash2, UserCheck } from 'lucide-vue-next'
import type { Client } from '@/stores/clients'
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

defineProps<{
  clients: Client[]
  loading?: boolean
  currentPage: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  edit: [client: Client]
  delete: [client: Client]
  suiviClient: [client: Client]
  pageChange: [page: number]
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/50 hover:bg-muted/50">
            <TableHead class="font-medium text-muted-foreground">Nom client</TableHead>
            <TableHead class="font-medium text-muted-foreground">Telephone</TableHead>
            <TableHead class="font-medium text-muted-foreground">email</TableHead>
            <TableHead class="font-medium text-muted-foreground">localisation</TableHead>
            <TableHead class="font-medium text-muted-foreground text-center w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading state -->
          <template v-if="loading">
            <TableRow v-for="i in pageSize" :key="i">
              <TableCell><Skeleton class="h-4 w-32" /></TableCell>
              <TableCell><Skeleton class="h-4 w-28" /></TableCell>
              <TableCell><Skeleton class="h-4 w-36" /></TableCell>
              <TableCell><Skeleton class="h-4 w-28" /></TableCell>
              <TableCell class="text-center"><Skeleton class="h-8 w-8 mx-auto" /></TableCell>
            </TableRow>
          </template>

          <!-- Data rows -->
          <template v-else-if="clients.length > 0">
            <TableRow
              v-for="client in clients"
              :key="client.id"
              class="hover:bg-muted/30 transition-colors"
            >
              <TableCell class="font-medium">{{ client.name }}</TableCell>
              <TableCell>{{ client.phone }}</TableCell>
              <TableCell>{{ client.email }}</TableCell>
              <TableCell>{{ client.location }}</TableCell>
              <TableCell class="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8">
                      <MoreVertical class="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="rounded-lg">
                    <DropdownMenuItem @select="emit('edit', client)">
                      <Edit class="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @select="emit('delete', client)"
                      class="text-destructive focus:text-destructive"
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @select="emit('suiviClient', client)"
                      class="text-primary focus:text-primary"
                    >
                      <UserCheck class="mr-2 h-4 w-4" />
                      suivie client
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </template>

          <!-- Empty state -->
          <template v-else>
            <TableRow>
              <TableCell colspan="5" class="h-32 text-center text-muted-foreground">
                Aucun client trouvé
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div v-if="total > pageSize" class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Affichage {{ (currentPage - 1) * pageSize + 1 }} -
        {{ Math.min(currentPage * pageSize, total) }} sur {{ total }}
      </p>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="emit('pageChange', currentPage - 1)"
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage * pageSize >= total"
          @click="emit('pageChange', currentPage + 1)"
        >
          Suivant
        </Button>
      </div>
    </div>
  </div>
</template>
