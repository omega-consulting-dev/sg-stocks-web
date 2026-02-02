<script setup lang="ts">
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input/Input.vue'
import Field from '@/components/forms/Fields.vue'
import { Download, Upload, Sheet, FileText, Plus, Search, Edit, Users, User, Phone, Mail, MapPin, Scale } from 'lucide-vue-next'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { UserServices, ProductServices } from '@/services'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'

const userStore = useUserStore()

const customers = [
    {
        name: 'INV001',
        phone: 'Paid',
        email: '$250.00',
        location: 'Credit Card',
        forme_juridique: 'SARL',
    },
    {
        name: 'INV002',
        phone: 'Pending',
        email: '$150.00',
        location: 'PayPal',
        forme_juridique: 'SAS',
    },
    {
        name: 'INV003',
        phone: 'Unpaid',
        email: '$350.00',
        location: 'Bank Transfer',
        forme_juridique: 'SA',
    },
    {
        name: 'INV004',
        phone: 'Paid',
        email: '$450.00',
        location: 'Credit Card',
        forme_juridique: 'EURL',
    },
    {
        name: 'INV005',
        phone: 'Paid',
        email: '$550.00',
        location: 'PayPal',
        forme_juridique: 'SASU',
    },
    {
        name: 'INV006',
        phone: 'Pending',
        email: '$200.00',
        location: 'Bank Transfer',
        forme_juridique: 'SCI',
    },
    {
        name: 'INV007',
        phone: 'Unpaid',
        email: '$300.00',
        location: 'Credit Card',
        forme_juridique: 'SNC',
    },
]

const search = ref<{ query: string; opened: boolean }>({
    query: '',
    opened: false,
})

const openModal = ref(false)

type CustomerForm = {
    name: string
    email: string
    phone: string
    location: string
    forme_juridique: string
}

const form = ref<CustomerForm>({
    name: '',
    email: '',
    phone: '',
    location: '',
    forme_juridique: '',
})

function open_search() {
    search.value.opened = true
    setTimeout(() => {
        const input = document.querySelector('#searchInput') as HTMLInputElement
        input?.focus()
    }, 100)
}

function edit_customer(customer: CustomerForm) {
    form.value = { ...customer }
    openModal.value = true
}

async function get_users() {
    // await UserServices.login({email: 'admin@client1.com', password: '123456789'}).then((res) => {
    //     userStore.user = res.data
    //     userStore.setAccessToken(res.data.access as string)
    //     userStore.setRefreshToken(res.data.refresh as string)
    // })

    await ProductServices.exportPdf().then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'produits.pdf')
            document.body.appendChild(link);
            link.click();
            link.remove();
        })
        .catch((error) => {
        })
}
</script>

<template>
    <div class="p-4 sm:p-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-primary">Clients</h1>
            <p class="opacity-60 text-xs sm:text-sm">Liste des client ajouter</p>
        </div>

        <div class="flex flex-wrap items-center gap-2 sm:gap-4">
            <!-- bare de recherche -->
            <div class="relative flex items-center gap-1 transition-all duration-500 w-11 overflow-hidden"
                :class="{ 'w-48 sm:w-64 overflow-visible': search.opened }">
                <Button variant="outline" class="absolutef top-0 left-0"
                    :class="{ 'absolute size-7 left-1 top-1/2 -translate-y-1/2 border-none': search.opened }"
                    @click="open_search">
                    <Search />
                </Button>
                <Input id="searchInput" placeholder="Rechercher un client"
                    @focusout="search.query.length == 0 ? (search.opened = false) : null" @focusin="open_search"
                    :class="{ 'pl-9': search.opened }" v-model="search.query" />
            </div>

            <!-- bouton d'importation -->
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="outline" class="px-2 sm:px-4">
                        <Upload />
                        <span class="hidden sm:inline">Importer</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width] rounded-lg" :side="'bottom'"
                    align="end" :side-offset="4">
                    <DropdownMenuItem>
                        <Sheet />
                        Document excel
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <!-- bouton d'exportation -->
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="outline" class="px-2 sm:px-4">
                        <Download />
                        <span class="hidden sm:inline">Exporter</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-[--reka-dropdown-menu-trigger-width] rounded-lg" :side="'bottom'"
                    align="end" :side-offset="4">
                    <DropdownMenuItem>
                        <FileText />
                        Document pdf
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Sheet />
                        Document excel
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <!-- bouton d'ajout -->
            <Dialog :open="openModal" @update:open="(v: boolean) => openModal = v">
                <DialogTrigger asChild>
                    <Button class="px-2 sm:px-4">
                        <Plus />
                        <span class="hidden sm:inline">Nouveau client</span>
                    </Button>
                </DialogTrigger>

                <DialogContent @interactOutside="(e) => e.preventDefault()">
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-3">
                            <div class="flex size-11 shrink-0 items-center justify-center rounded-full border"
                                aria-hidden="true">
                                <Users class="opacity-80" aria-hidden="true" />
                            </div>
                            <DialogTitle class="text-left">Fiche Client</DialogTitle>
                        </div>
                    </div>

                    <form @submit.prevent="" class="space-y-5">
                        <div class="space-y-4">
                            <Field label="Nom client/R_social :" :icon="User" v-model="form.name" required
                                placeholder="Ex : Nkadon Landry" />
                            <Field label="Telephone :" :icon="Phone" v-model="form.phone"
                                placeholder="+237 6xx xx xx xx" />
                            <Field label="email :" :icon="Mail" v-model="form.email" type="email"
                                placeholder="Ex : Nkado@gmail.com" />
                            <Field label="Localisation :" :icon="MapPin" v-model="form.location"
                                placeholder="Ex : douala akwa" />
                            <Field label="Forme Juridique :" :icon="Scale" v-model="form.forme_juridique"
                                placeholder="Ex: SARL, SA, SAS..." />
                        </div>
                        <Button type="submit" class="w-full">Sauvegader</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <Button @click="get_users" class="hidden lg:flex"> Compte clients </Button>
        </div>
    </header>

    <div class="mt-6 sm:mt-8 overflow-x-auto">
        <Table class="min-w-[600px]">
            <TableHeader>
                <TableRow class="bg-muted">
                    <TableHead class="w-[100px]"> Nom client </TableHead>
                    <TableHead>Telephone</TableHead>
                    <TableHead>email</TableHead>
                    <TableHead> localisation </TableHead>
                    <TableHead>Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow v-for="customer in customers" :key="customer.name">
                    <TableCell class="font-medium">
                        {{ customer.name }}
                    </TableCell>
                    <TableCell>{{ customer.phone }}</TableCell>
                    <TableCell>{{ customer.email }}</TableCell>
                    <TableCell class="text-rightf">
                        {{ customer.location }}
                    </TableCell>

                    <TableCell class="text-rightf">
                        <Button variant="outline" @click="edit_customer(customer)">
                            <Edit />
                            Modifier
                        </Button>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
    </div>
</template>
